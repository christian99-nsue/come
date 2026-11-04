import { db } from "../../config/db";
import { PLANES, esPlan } from "../../config/planes";

const METODOS = ["efectivo", "transferencia", "tarjeta"];

export const obtenerSuscripcion = async (restauranteId: number) => {
  const [rows]: any = await db.query(
    `SELECT s.id, s.plan, s.metodo_pago, s.fecha_inicio, s.fecha_renovacion,
            CASE WHEN s.estado = 'activa' AND s.fecha_renovacion < CURDATE() THEN 'vencida' ELSE s.estado END AS estado,
            r.nombre AS restaurante_nombre, r.logo AS restaurante_logo
     FROM suscripciones s
     JOIN restaurantes r ON r.id = s.restaurante_id
     WHERE s.restaurante_id = ?
     ORDER BY s.id DESC
     LIMIT 1`,
    [restauranteId],
  );

  if (rows.length === 0) {
    throw new Error(
      "Tu restaurante todavía no tiene una suscripción. Contacta con soporte para activarla.",
    );
  }

  // La última solicitud de pago: sirve para mostrar si está pendiente o fue rechazada
  const [sol]: any = await db.query(
    `SELECT id, plan, monto, metodo_pago, referencia, estado, motivo_rechazo, fecha_solicitud
     FROM pagos_suscripcion WHERE restaurante_id = ? ORDER BY id DESC LIMIT 1`,
    [restauranteId],
  );

  return {
    ...rows[0],
    solicitud:
      sol.length > 0 ? { ...sol[0], monto: Number(sol[0].monto) } : null,
  };
};

// Ya no activa nada: deja una solicitud pendiente que el equipo de la plataforma confirma al recibir el pago
export const solicitarPlan = async (
  restauranteId: number,
  plan: unknown,
  metodoPago: unknown,
  referencia: unknown,
) => {
  if (!esPlan(plan)) throw new Error("Elige un plan válido");
  if (typeof metodoPago !== "string" || !METODOS.includes(metodoPago)) {
    throw new Error("Debes seleccionar un método de pago");
  }
  if (
    referencia !== undefined &&
    referencia !== null &&
    typeof referencia !== "string"
  ) {
    throw new Error("La referencia no es válida");
  }
  const ref = String(referencia ?? "").trim();
  if (ref.length > 100)
    throw new Error("La referencia es demasiado larga (máximo 100 caracteres)");

  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    // Bloquea al restaurante: dos solicitudes a la vez no pueden crear dos pendientes
    await conexion.query(
      "SELECT id FROM restaurantes WHERE id = ? FOR UPDATE",
      [restauranteId],
    );

    const [pendiente]: any = await conexion.query(
      "SELECT id FROM pagos_suscripcion WHERE restaurante_id = ? AND estado = 'pendiente' LIMIT 1",
      [restauranteId],
    );
    if (pendiente.length > 0)
      throw new Error("Ya tienes una solicitud pendiente de confirmación");

    // El monto sale del servidor, nunca del navegador
    await conexion.query(
      `INSERT INTO pagos_suscripcion (restaurante_id, plan, monto, metodo_pago, referencia, origen)
       VALUES (?, ?, ?, ?, ?, 'solicitud')`,
      [restauranteId, plan, PLANES[plan].precio, metodoPago, ref || null],
    );

    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }

  return { ok: true, plan, monto: PLANES[plan].precio };
};

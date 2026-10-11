import { db } from "../../config/db";

type Plan = "semanal" | "mensual";
type MetodoPago = "efectivo" | "transferencia" | "tarjeta";

const DIAS_POR_PLAN: Record<Plan, number> = {
  semanal: 7,
  mensual: 30,
};

export const obtenerSuscripcion = async (restauranteId: number) => {
  const [rows]: any = await db.query(
    `SELECT s.id, s.plan, s.estado, s.metodo_pago, s.fecha_inicio, s.fecha_renovacion,
            r.nombre AS restaurante_nombre, r.logo AS restaurante_logo
     FROM suscripciones s
     JOIN restaurantes r ON r.id = s.restaurante_id
     WHERE s.restaurante_id = ?
     ORDER BY s.id DESC
     LIMIT 1`,
    [restauranteId],
  );

  if (rows.length === 0) {
    const [restaurantes]: any = await db.query(
      `SELECT nombre AS restaurante_nombre, logo AS restaurante_logo
       FROM restaurantes
       WHERE id = ?`,
      [restauranteId],
    );

    if (restaurantes.length === 0) {
      throw new Error("Restaurante no encontrado");
    }

    return {
      plan: null,
      estado: null,
      metodo_pago: null,
      fecha_inicio: null,
      fecha_renovacion: null,
      restaurante_nombre: restaurantes[0].restaurante_nombre,
      restaurante_logo: restaurantes[0].restaurante_logo,
    };
  }

  return rows[0];
};

export const cambiarPlan = async (
  restauranteId: number,
  nuevoPlan: Plan,
  metodoPago: MetodoPago,
) => {
  if (!metodoPago) {
    throw new Error("Debes seleccionar un método de pago");
  }

  if (!DIAS_POR_PLAN[nuevoPlan]) {
    throw new Error("Plan no válido");
  }

  const hoy = new Date();
  const fechaRenovacion = new Date(hoy);

  fechaRenovacion.setDate(fechaRenovacion.getDate() + DIAS_POR_PLAN[nuevoPlan]);

  const fechaInicio = hoy.toISOString().slice(0, 10);
  const fechaRenovacionStr = fechaRenovacion.toISOString().slice(0, 10);

  const [rows]: any = await db.query(
    `SELECT id
     FROM suscripciones
     WHERE restaurante_id = ?
     LIMIT 1`,
    [restauranteId],
  );

  if (rows.length === 0) {
    await db.query(
      `INSERT INTO suscripciones
       (restaurante_id, plan, estado, metodo_pago, fecha_inicio, fecha_renovacion)
       VALUES (?, ?, 'activa', ?, ?, ?)`,
      [restauranteId, nuevoPlan, metodoPago, fechaInicio, fechaRenovacionStr],
    );

    return {
      ok: true,
      nuevoPlan,
      fechaRenovacion: fechaRenovacionStr,
      creada: true,
    };
  }

  await db.query(
    `UPDATE suscripciones
     SET plan = ?,
         metodo_pago = ?,
         fecha_inicio = ?,
         fecha_renovacion = ?,
         estado = 'activa'
     WHERE restaurante_id = ?`,
    [nuevoPlan, metodoPago, fechaInicio, fechaRenovacionStr, restauranteId],
  );

  return {
    ok: true,
    nuevoPlan,
    fechaRenovacion: fechaRenovacionStr,
    creada: false,
  };
};

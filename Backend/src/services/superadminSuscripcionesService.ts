import type { PoolConnection } from "mysql2/promise";
import { db } from "../config/db";
import { PLANES, esPlan, type Plan } from "../config/planes";
import { ErrorSuperAdmin, avisarAdmin } from "./superadminRestaurantesService";

const METODOS = ["efectivo", "transferencia", "tarjeta"];
const POR_PAGINA = 20;

type SuperAdmin = { id: number; nombre: string };

const DESDE = `FROM restaurantes r
  LEFT JOIN usuarios u ON u.id = r.admin_id
  LEFT JOIN suscripciones s ON s.id = (SELECT MAX(x.id) FROM suscripciones x WHERE x.restaurante_id = r.id)`;

// El estado se calcula por fecha: nada cambia a "vencida" automáticamente
const ESTADO = `CASE
  WHEN s.id IS NULL THEN 'sin_suscripcion'
  WHEN s.estado = 'activa' AND s.fecha_renovacion < CURDATE() THEN 'vencida'
  ELSE s.estado END`;

// Los filtros salen de esta lista fija, nunca de lo que escribe el cliente
const FILTROS: Record<string, string> = {
  activas: "s.estado = 'activa' AND s.fecha_renovacion >= CURDATE()",
  por_vencer:
    "s.estado = 'activa' AND s.fecha_renovacion BETWEEN CURDATE() AND CURDATE() + INTERVAL 7 DAY",
  vencidas:
    "s.id IS NOT NULL AND (s.estado = 'vencida' OR (s.estado = 'activa' AND s.fecha_renovacion < CURDATE()))",
  sin_suscripcion: "s.id IS NULL",
};

const escaparLike = (t: string) => t.replace(/[\\%_]/g, "\\$&");
const texto = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export const listarPendientes = async () => {
  const [rows]: any = await db.query(
    `SELECT p.id, p.restaurante_id, r.nombre AS restaurante_nombre, r.logo AS restaurante_logo,
            p.plan, p.monto, p.metodo_pago, p.referencia, p.fecha_solicitud,
            u.nombre AS admin_nombre, u.email AS admin_email, u.telefono AS admin_telefono
     FROM pagos_suscripcion p
     JOIN restaurantes r ON r.id = p.restaurante_id
     LEFT JOIN usuarios u ON u.id = r.admin_id
     WHERE p.estado = 'pendiente'
     ORDER BY p.fecha_solicitud ASC
     LIMIT 100`,
  );

  return rows.map((p: any) => ({
    id: p.id,
    restaurante_id: p.restaurante_id,
    restaurante_nombre: p.restaurante_nombre,
    restaurante_logo: p.restaurante_logo,
    plan: p.plan as string,
    monto: Number(p.monto),
    metodo_pago: p.metodo_pago as string,
    referencia: p.referencia as string | null,
    fecha_solicitud: new Date(p.fecha_solicitud).toISOString(),
    admin_nombre: p.admin_nombre as string | null,
    admin_email: p.admin_email as string | null,
    admin_telefono: p.admin_telefono as string | null,
  }));
};

export const listarSuscripciones = async (filtros: {
  busqueda?: unknown;
  filtro?: unknown;
  pagina?: unknown;
}) => {
  const where: string[] = ["1 = 1"];
  const params: any[] = [];

  const busqueda = texto(filtros.busqueda, 100);
  if (busqueda) {
    const t = `%${escaparLike(busqueda)}%`;
    where.push("(r.nombre LIKE ? OR u.email LIKE ? OR u.nombre LIKE ?)");
    params.push(t, t, t);
  }

  const filtro = typeof filtros.filtro === "string" ? filtros.filtro : "";
  if (filtro && Object.prototype.hasOwnProperty.call(FILTROS, filtro))
    where.push(FILTROS[filtro]);

  const pagina = Math.min(
    10000,
    Math.max(1, Math.floor(Number(filtros.pagina)) || 1),
  );
  const condicion = where.join(" AND ");

  const [[conteo], [filas]]: any = await Promise.all([
    db.query(`SELECT COUNT(*) AS total ${DESDE} WHERE ${condicion}`, params),
    db.query(
      `SELECT r.id, r.nombre, r.logo, r.suspendido,
              u.nombre AS admin_nombre, u.email AS admin_email,
              ${ESTADO} AS estado, s.plan, s.metodo_pago,
              DATE_FORMAT(s.fecha_renovacion, '%Y-%m-%d') AS fecha_renovacion,
              DATEDIFF(s.fecha_renovacion, CURDATE()) AS dias_restantes,
              EXISTS (SELECT 1 FROM pagos_suscripcion p
                      WHERE p.restaurante_id = r.id AND p.estado = 'pendiente') AS tiene_pendiente
       ${DESDE}
       WHERE ${condicion}
       ORDER BY (s.id IS NULL) ASC, s.fecha_renovacion ASC, r.nombre ASC
       LIMIT ? OFFSET ?`,
      [...params, POR_PAGINA, (pagina - 1) * POR_PAGINA],
    ),
  ]);

  return {
    total: Number(conteo[0].total),
    pagina,
    por_pagina: POR_PAGINA,
    items: filas.map((r: any) => ({
      id: r.id,
      nombre: r.nombre,
      logo: r.logo,
      suspendido: !!r.suspendido,
      admin_nombre: r.admin_nombre as string | null,
      admin_email: r.admin_email as string | null,
      estado: r.estado as string,
      plan: r.plan as string | null,
      metodo_pago: r.metodo_pago as string | null,
      fecha_renovacion: r.fecha_renovacion as string | null,
      dias_restantes:
        r.dias_restantes === null ? null : Number(r.dias_restantes),
      tiene_pendiente: !!r.tiene_pendiente,
    })),
  };
};

export const obtenerDetalle = async (restauranteId: number) => {
  const [[principal], [pagos]]: any = await Promise.all([
    db.query(
      `SELECT r.id, r.nombre, r.logo, r.suspendido,
              u.nombre AS admin_nombre, u.email AS admin_email, u.telefono AS admin_telefono,
              ${ESTADO} AS estado, s.plan, s.metodo_pago,
              DATE_FORMAT(s.fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
              DATE_FORMAT(s.fecha_renovacion, '%Y-%m-%d') AS fecha_renovacion,
              DATEDIFF(s.fecha_renovacion, CURDATE()) AS dias_restantes
       ${DESDE}
       WHERE r.id = ?`,
      [restauranteId],
    ),
    db.query(
      `SELECT id, plan, monto, metodo_pago, referencia, origen, estado, motivo_rechazo,
              fecha_solicitud, fecha_resolucion, super_admin_nombre
       FROM pagos_suscripcion WHERE restaurante_id = ? ORDER BY id DESC LIMIT 15`,
      [restauranteId],
    ),
  ]);

  if (principal.length === 0)
    throw new ErrorSuperAdmin(404, "Restaurante no encontrado");
  const r = principal[0];

  return {
    restaurante: {
      id: r.id,
      nombre: r.nombre,
      logo: r.logo,
      suspendido: !!r.suspendido,
    },
    admin: {
      nombre: r.admin_nombre as string | null,
      email: r.admin_email as string | null,
      telefono: r.admin_telefono as string | null,
    },
    suscripcion: {
      estado: r.estado as string,
      plan: r.plan as string | null,
      metodo_pago: r.metodo_pago as string | null,
      fecha_inicio: r.fecha_inicio as string | null,
      fecha_renovacion: r.fecha_renovacion as string | null,
      dias_restantes:
        r.dias_restantes === null ? null : Number(r.dias_restantes),
    },
    planes: Object.entries(PLANES).map(([id, p]) => ({
      id,
      nombre: p.nombre,
      precio: p.precio,
      dias: p.dias,
    })),
    pendiente: pagos.some((p: any) => p.estado === "pendiente"),
    pagos: pagos.map((p: any) => ({
      id: p.id,
      plan: p.plan as string,
      monto: Number(p.monto),
      metodo_pago: p.metodo_pago as string,
      referencia: p.referencia as string | null,
      origen: p.origen as "solicitud" | "manual",
      estado: p.estado as "pendiente" | "confirmado" | "rechazado",
      motivo_rechazo: p.motivo_rechazo as string | null,
      fecha_solicitud: new Date(p.fecha_solicitud).toISOString(),
      fecha_resolucion: p.fecha_resolucion
        ? new Date(p.fecha_resolucion).toISOString()
        : null,
      super_admin_nombre: p.super_admin_nombre as string | null,
    })),
  };
};

// Activa o renueva la suscripción. Si sigue vigente, el periodo nuevo se suma al final del actual;
// si venció o no existe, empieza hoy. Debe llamarse dentro de una transacción.
async function aplicarPago(
  conexion: PoolConnection,
  restauranteId: number,
  plan: Plan,
  metodo: string,
) {
  const dias = PLANES[plan].dias;

  const [rows]: any = await conexion.query(
    `SELECT id, (estado = 'activa' AND fecha_renovacion >= CURDATE()) AS vigente
     FROM suscripciones WHERE restaurante_id = ? ORDER BY id DESC LIMIT 1 FOR UPDATE`,
    [restauranteId],
  );

  if (rows.length === 0) {
    await conexion.query(
      `INSERT INTO suscripciones (restaurante_id, plan, estado, metodo_pago, fecha_inicio, fecha_renovacion)
       VALUES (?, ?, 'activa', ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY))`,
      [restauranteId, plan, metodo, dias],
    );
  } else if (rows[0].vigente) {
    await conexion.query(
      `UPDATE suscripciones
       SET plan = ?, metodo_pago = ?, estado = 'activa', fecha_renovacion = DATE_ADD(fecha_renovacion, INTERVAL ? DAY)
       WHERE id = ?`,
      [plan, metodo, dias, rows[0].id],
    );
  } else {
    await conexion.query(
      `UPDATE suscripciones
       SET plan = ?, metodo_pago = ?, estado = 'activa', fecha_inicio = CURDATE(),
           fecha_renovacion = DATE_ADD(CURDATE(), INTERVAL ? DAY)
       WHERE id = ?`,
      [plan, metodo, dias, rows[0].id],
    );
  }
}

async function fechaRenovacion(restauranteId: number) {
  const [rows]: any = await db.query(
    `SELECT DATE_FORMAT(fecha_renovacion, '%d/%m/%Y') AS f
     FROM suscripciones WHERE restaurante_id = ? ORDER BY id DESC LIMIT 1`,
    [restauranteId],
  );
  return rows[0]?.f ?? "";
}

export const confirmarPago = async (pagoId: number, sa: SuperAdmin) => {
  const conexion = await db.getConnection();
  let restauranteId = 0;
  let plan: Plan = "mensual";

  try {
    await conexion.beginTransaction();

    const [rows]: any = await conexion.query(
      "SELECT id, restaurante_id, plan, metodo_pago, estado FROM pagos_suscripcion WHERE id = ? FOR UPDATE",
      [pagoId],
    );
    if (rows.length === 0)
      throw new ErrorSuperAdmin(404, "Solicitud no encontrada");
    if (rows[0].estado !== "pendiente")
      throw new ErrorSuperAdmin(409, "Esta solicitud ya fue resuelta");
    if (!esPlan(rows[0].plan))
      throw new ErrorSuperAdmin(400, "La solicitud tiene un plan no válido");

    restauranteId = rows[0].restaurante_id;
    plan = rows[0].plan;

    await aplicarPago(conexion, restauranteId, plan, rows[0].metodo_pago);
    await conexion.query(
      `UPDATE pagos_suscripcion
       SET estado = 'confirmado', fecha_resolucion = NOW(), super_admin_id = ?, super_admin_nombre = ?
       WHERE id = ?`,
      [sa.id, sa.nombre, pagoId],
    );

    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }

  const hasta = await fechaRenovacion(restauranteId);
  await avisarAdmin(
    restauranteId,
    "Pago confirmado",
    `Tu ${PLANES[plan].nombre.toLowerCase()} está activo hasta el ${hasta}.`,
  );
  return { ok: true };
};

export const rechazarPago = async (
  pagoId: number,
  motivo: unknown,
  sa: SuperAdmin,
) => {
  const razon = typeof motivo === "string" ? motivo.trim() : "";
  if (razon.length < 5 || razon.length > 255) {
    throw new ErrorSuperAdmin(
      400,
      "Escribe el motivo del rechazo (entre 5 y 255 caracteres)",
    );
  }

  const [pago]: any = await db.query(
    "SELECT restaurante_id FROM pagos_suscripcion WHERE id = ?",
    [pagoId],
  );
  if (pago.length === 0)
    throw new ErrorSuperAdmin(404, "Solicitud no encontrada");

  const [resultado]: any = await db.query(
    `UPDATE pagos_suscripcion
     SET estado = 'rechazado', motivo_rechazo = ?, fecha_resolucion = NOW(), super_admin_id = ?, super_admin_nombre = ?
     WHERE id = ? AND estado = 'pendiente'`,
    [razon, sa.id, sa.nombre, pagoId],
  );
  if (resultado.affectedRows === 0)
    throw new ErrorSuperAdmin(409, "Esta solicitud ya fue resuelta");

  await avisarAdmin(
    pago[0].restaurante_id,
    "Solicitud de suscripción rechazada",
    `No pudimos confirmar tu pago. Motivo: ${razon}`,
  );
  return { ok: true };
};

// Pago recibido por otra vía (efectivo, transferencia directa). También sirve para activar
// un restaurante que todavía no tiene suscripción.
export const registrarPagoManual = async (
  restauranteId: number,
  datos: { plan?: unknown; metodo_pago?: unknown; referencia?: unknown },
  sa: SuperAdmin,
) => {
  if (!esPlan(datos.plan))
    throw new ErrorSuperAdmin(400, "Elige un plan válido");
  const plan: Plan = datos.plan;

  if (
    typeof datos.metodo_pago !== "string" ||
    !METODOS.includes(datos.metodo_pago)
  ) {
    throw new ErrorSuperAdmin(400, "Elige un método de pago válido");
  }
  if (
    datos.referencia !== undefined &&
    datos.referencia !== null &&
    typeof datos.referencia !== "string"
  ) {
    throw new ErrorSuperAdmin(400, "La referencia no es válida");
  }
  const referencia = String(datos.referencia ?? "").trim();
  if (referencia.length > 100)
    throw new ErrorSuperAdmin(
      400,
      "La referencia es demasiado larga (máximo 100 caracteres)",
    );

  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    // Bloquea al restaurante para que nada se cruce con una solicitud que llegue a la vez
    const [rest]: any = await conexion.query(
      "SELECT id FROM restaurantes WHERE id = ? FOR UPDATE",
      [restauranteId],
    );
    if (rest.length === 0)
      throw new ErrorSuperAdmin(404, "Restaurante no encontrado");

    const [pendiente]: any = await conexion.query(
      "SELECT id FROM pagos_suscripcion WHERE restaurante_id = ? AND estado = 'pendiente' LIMIT 1",
      [restauranteId],
    );
    if (pendiente.length > 0) {
      throw new ErrorSuperAdmin(
        409,
        "Hay una solicitud pendiente: confírmala o recházala antes de registrar otro pago",
      );
    }

    await aplicarPago(conexion, restauranteId, plan, datos.metodo_pago);
    await conexion.query(
      `INSERT INTO pagos_suscripcion
         (restaurante_id, plan, monto, metodo_pago, referencia, origen, estado, fecha_resolucion, super_admin_id, super_admin_nombre)
       VALUES (?, ?, ?, ?, ?, 'manual', 'confirmado', NOW(), ?, ?)`,
      [
        restauranteId,
        plan,
        PLANES[plan].precio,
        datos.metodo_pago,
        referencia || null,
        sa.id,
        sa.nombre,
      ],
    );

    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }

  const hasta = await fechaRenovacion(restauranteId);
  await avisarAdmin(
    restauranteId,
    "Suscripción activada",
    `Tu ${PLANES[plan].nombre.toLowerCase()} está activo hasta el ${hasta}.`,
  );
  return obtenerDetalle(restauranteId);
};

import { db } from "../config/db";

export class ErrorSuperAdmin extends Error {
  estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.estado = estado;
  }
}

const POR_PAGINA = 20;
const ACTIVOS = "('nuevo','en_preparacion','listo_para_recoger','en_entrega')";

// Los filtros salen de esta lista fija, nunca de lo que escribe el cliente
const FILTROS: Record<string, string> = {
  abiertos: "r.suspendido = 0 AND r.estado = 'abierto'",
  cerrados: "r.suspendido = 0 AND r.estado = 'cerrado'",
  suspendidos: "r.suspendido = 1",
  sin_platos:
    "NOT EXISTS (SELECT 1 FROM platos p WHERE p.restaurante_id = r.id AND p.disponible = 1)",
};

const escaparLike = (t: string) => t.replace(/[\\%_]/g, "\\$&");

const DESDE = `FROM restaurantes r
  LEFT JOIN usuarios u ON u.id = r.admin_id
  LEFT JOIN suscripciones s ON s.id = (SELECT MAX(x.id) FROM suscripciones x WHERE x.restaurante_id = r.id)`;

// El estado se calcula por fecha: nada cambia a "vencida" automáticamente
const ESTADO_SUSCRIPCION = `CASE
  WHEN s.id IS NULL THEN 'sin_suscripcion'
  WHEN s.estado = 'activa' AND s.fecha_renovacion < CURDATE() THEN 'vencida'
  ELSE s.estado END`;

export const listarRestaurantes = async (filtros: {
  busqueda?: unknown;
  filtro?: unknown;
  pagina?: unknown;
}) => {
  const where: string[] = ["1 = 1"];
  const params: any[] = [];

  const busqueda =
    typeof filtros.busqueda === "string"
      ? filtros.busqueda.trim().slice(0, 100)
      : "";
  if (busqueda) {
    const t = `%${escaparLike(busqueda)}%`;
    where.push(
      "(r.nombre LIKE ? OR r.telefono LIKE ? OR u.email LIKE ? OR u.nombre LIKE ?)",
    );
    params.push(t, t, t, t);
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
      `SELECT r.id, r.nombre, r.logo, r.categorias_texto, r.estado, r.suspendido, r.rating, r.reviews_count,
              r.fecha_creacion,
              u.nombre AS admin_nombre, u.email AS admin_email,
              (SELECT COUNT(*) FROM platos p WHERE p.restaurante_id = r.id AND p.disponible = 1) AS platos_disponibles,
              (SELECT COUNT(*) FROM pedidos x WHERE x.restaurante_id = r.id AND x.estado IN ${ACTIVOS}) AS pedidos_activos,
              ${ESTADO_SUSCRIPCION} AS suscripcion_estado, s.plan AS suscripcion_plan
       ${DESDE}
       WHERE ${condicion}
       ORDER BY r.suspendido DESC, r.nombre ASC
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
      categorias_texto: r.categorias_texto,
      estado: r.estado as "abierto" | "cerrado",
      suspendido: !!r.suspendido,
      rating: Number(r.rating),
      reviews_count: Number(r.reviews_count),
      fecha_creacion: new Date(r.fecha_creacion).toISOString(),
      admin_nombre: r.admin_nombre,
      admin_email: r.admin_email,
      platos_disponibles: Number(r.platos_disponibles),
      pedidos_activos: Number(r.pedidos_activos),
      suscripcion_estado: r.suscripcion_estado as string,
      suscripcion_plan: r.suscripcion_plan as string | null,
    })),
  };
};

export const obtenerRestaurante = async (id: number) => {
  const [[principal], [platos], [pedidos], [historial]]: any =
    await Promise.all([
      db.query(
        `SELECT r.id, r.nombre, r.logo, r.telefono, r.direccion, r.categorias_texto, r.estado, r.suspendido,
              r.motivo_suspension, r.fecha_suspension, r.rating, r.reviews_count, r.costo_envio, r.pedido_minimo,
              r.tiempo_preparacion_min, r.aceptacion_pedidos, r.fecha_creacion,
              u.nombre AS admin_nombre, u.email AS admin_email, u.telefono AS admin_telefono,
              s.plan, s.metodo_pago, s.fecha_inicio, s.fecha_renovacion,
              ${ESTADO_SUSCRIPCION} AS suscripcion_estado
       ${DESDE}
       WHERE r.id = ?`,
        [id],
      ),
      db.query(
        "SELECT COUNT(*) AS total, COALESCE(SUM(disponible = 1), 0) AS disponibles FROM platos WHERE restaurante_id = ?",
        [id],
      ),
      db.query(
        `SELECT COUNT(*) AS total,
              COALESCE(SUM(estado IN ${ACTIVOS}), 0) AS activos,
              COALESCE(SUM(estado = 'entregado' AND fecha_creacion >= NOW() - INTERVAL 30 DAY), 0) AS entregados_30d,
              COALESCE(SUM(estado IN ('cancelado','rechazado') AND fecha_creacion >= NOW() - INTERVAL 30 DAY), 0) AS cancelados_30d,
              COALESCE(SUM(CASE WHEN estado = 'entregado' AND fecha_creacion >= NOW() - INTERVAL 30 DAY THEN total END), 0) AS ventas_30d
       FROM pedidos WHERE restaurante_id = ?`,
        [id],
      ),
      db.query(
        `SELECT accion, motivo, super_admin_nombre, fecha
       FROM restaurante_suspensiones WHERE restaurante_id = ? ORDER BY id DESC LIMIT 10`,
        [id],
      ),
    ]);

  if (principal.length === 0)
    throw new ErrorSuperAdmin(404, "Restaurante no encontrado");
  const r = principal[0];
  const p = pedidos[0];

  return {
    id: r.id,
    nombre: r.nombre,
    logo: r.logo,
    telefono: r.telefono,
    direccion: r.direccion,
    categorias_texto: r.categorias_texto,
    estado: r.estado as "abierto" | "cerrado",
    rating: Number(r.rating),
    reviews_count: Number(r.reviews_count),
    costo_envio: Number(r.costo_envio),
    pedido_minimo: Number(r.pedido_minimo),
    tiempo_preparacion_min: r.tiempo_preparacion_min,
    aceptacion_pedidos: r.aceptacion_pedidos as string,
    fecha_creacion: new Date(r.fecha_creacion).toISOString(),
    suspension: {
      suspendido: !!r.suspendido,
      motivo: r.motivo_suspension as string | null,
      fecha: r.fecha_suspension
        ? new Date(r.fecha_suspension).toISOString()
        : null,
    },
    admin: {
      nombre: r.admin_nombre as string | null,
      email: r.admin_email as string | null,
      telefono: r.admin_telefono as string | null,
    },
    suscripcion: {
      estado: r.suscripcion_estado as string,
      plan: r.plan as string | null,
      metodo_pago: r.metodo_pago as string | null,
      fecha_inicio: r.fecha_inicio
        ? new Date(r.fecha_inicio).toISOString()
        : null,
      fecha_renovacion: r.fecha_renovacion
        ? new Date(r.fecha_renovacion).toISOString()
        : null,
    },
    platos: {
      total: Number(platos[0].total),
      disponibles: Number(platos[0].disponibles),
    },
    pedidos: {
      total: Number(p.total),
      activos: Number(p.activos),
      entregados_30d: Number(p.entregados_30d),
      cancelados_30d: Number(p.cancelados_30d),
      ventas_30d: Number(p.ventas_30d),
    },
    historial: historial.map((h: any) => ({
      accion: h.accion as "suspender" | "reactivar",
      motivo: h.motivo as string | null,
      super_admin_nombre: h.super_admin_nombre as string,
      fecha: new Date(h.fecha).toISOString(),
    })),
  };
};

// Aviso en el panel del administrador. Si falla (por ejemplo, el tipo no existe en tu tabla), no rompe la acción:
// el aviso rojo del panel se muestra igual porque sale del estado del restaurante.
export async function avisarAdmin(
  restauranteId: number,
  titulo: string,
  mensaje: string,
) {
  try {
    await db.query(
      "INSERT INTO notificaciones_admin (restaurante_id, tipo, titulo, mensaje) VALUES (?, 'sistema', ?, ?)",
      [restauranteId, titulo, mensaje.slice(0, 255)],
    );
  } catch (error) {
    console.error(
      "No se pudo crear la notificación para el administrador:",
      error,
    );
  }
}

type SuperAdmin = { id: number; nombre: string };

export const suspenderRestaurante = async (
  id: number,
  motivo: unknown,
  sa: SuperAdmin,
) => {
  const texto = typeof motivo === "string" ? motivo.trim() : "";
  if (texto.length < 5 || texto.length > 255) {
    throw new ErrorSuperAdmin(
      400,
      "Escribe el motivo de la suspensión (entre 5 y 255 caracteres)",
    );
  }

  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    const [rows]: any = await conexion.query(
      "SELECT id, suspendido FROM restaurantes WHERE id = ? FOR UPDATE",
      [id],
    );
    if (rows.length === 0)
      throw new ErrorSuperAdmin(404, "Restaurante no encontrado");
    if (rows[0].suspendido)
      throw new ErrorSuperAdmin(409, "Este restaurante ya está suspendido");

    await conexion.query(
      `UPDATE restaurantes
       SET suspendido = 1, motivo_suspension = ?, fecha_suspension = NOW(), estado = 'cerrado'
       WHERE id = ?`,
      [texto, id],
    );
    await conexion.query(
      `INSERT INTO restaurante_suspensiones (restaurante_id, accion, motivo, super_admin_id, super_admin_nombre)
       VALUES (?, 'suspender', ?, ?, ?)`,
      [id, texto, sa.id, sa.nombre],
    );

    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }

  await avisarAdmin(
    id,
    "Restaurante suspendido",
    `La plataforma suspendió tu restaurante. Motivo: ${texto}`,
  );
  return obtenerRestaurante(id);
};

export const reactivarRestaurante = async (id: number, sa: SuperAdmin) => {
  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    const [rows]: any = await conexion.query(
      "SELECT id, suspendido FROM restaurantes WHERE id = ? FOR UPDATE",
      [id],
    );
    if (rows.length === 0)
      throw new ErrorSuperAdmin(404, "Restaurante no encontrado");
    if (!rows[0].suspendido)
      throw new ErrorSuperAdmin(409, "Este restaurante no está suspendido");

    // Queda cerrado: el administrador decide cuándo volver a abrirlo
    await conexion.query(
      "UPDATE restaurantes SET suspendido = 0, motivo_suspension = NULL, fecha_suspension = NULL WHERE id = ?",
      [id],
    );
    await conexion.query(
      `INSERT INTO restaurante_suspensiones (restaurante_id, accion, motivo, super_admin_id, super_admin_nombre)
       VALUES (?, 'reactivar', NULL, ?, ?)`,
      [id, sa.id, sa.nombre],
    );

    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }

  await avisarAdmin(
    id,
    "Restaurante reactivado",
    "Tu restaurante fue reactivado. Ábrelo cuando quieras volver a recibir pedidos.",
  );
  return obtenerRestaurante(id);
};

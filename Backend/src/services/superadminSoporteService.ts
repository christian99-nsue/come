import type { PoolConnection } from "mysql2/promise";
import { db } from "../config/db";
import { ErrorSuperAdmin, avisarAdmin } from "./superadminRestaurantesService";

type Estado = "abierto" | "en_revision" | "resuelto";

const ESTADOS: Estado[] = ["abierto", "en_revision", "resuelto"];
const CATEGORIAS = ["pedido", "app", "cuenta", "otro"];
const ROLES = ["cliente", "repartidor", "admin"];
const POR_PAGINA = 20;
const MAX_RESPUESTA = 255; // viaja en una notificación
const MAX_NOTA = 1000;
const ETIQUETA: Record<Estado, string> = {
  abierto: "Abierto",
  en_revision: "En revisión",
  resuelto: "Resuelto",
};

type SuperAdmin = { id: number; nombre: string };

// Los filtros salen de esta lista fija, nunca de lo que escribe el cliente
const FILTROS_ESTADO: Record<string, string> = {
  abiertos: "r.estado = 'abierto'",
  en_revision: "r.estado = 'en_revision'",
  resueltos: "r.estado = 'resuelto'",
};

const DESDE = `FROM reportes_soporte r
  JOIN usuarios u ON u.id = r.usuario_id
  LEFT JOIN pedidos p ON p.id = r.pedido_id`;

const escaparLike = (t: string) => t.replace(/[\\%_]/g, "\\$&");
const texto = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export const obtenerContadores = async () => {
  const [rows]: any = await db.query(
    `SELECT COALESCE(SUM(estado = 'abierto'), 0) AS abiertos,
            COALESCE(SUM(estado = 'en_revision'), 0) AS en_revision,
            COALESCE(SUM(estado = 'resuelto'), 0) AS resueltos
     FROM reportes_soporte`,
  );
  return {
    abiertos: Number(rows[0].abiertos),
    en_revision: Number(rows[0].en_revision),
    resueltos: Number(rows[0].resueltos),
  };
};

export const listarReportes = async (f: {
  busqueda?: unknown;
  estado?: unknown;
  categoria?: unknown;
  rol?: unknown;
  pagina?: unknown;
}) => {
  const where: string[] = ["1 = 1"];
  const params: any[] = [];

  const busqueda = texto(f.busqueda, 100);
  if (busqueda) {
    const t = `%${escaparLike(busqueda)}%`;
    where.push(
      "(r.asunto LIKE ? OR u.nombre LIKE ? OR u.telefono LIKE ? OR p.codigo LIKE ?)",
    );
    params.push(t, t, t, t);
  }

  if (
    typeof f.estado === "string" &&
    Object.prototype.hasOwnProperty.call(FILTROS_ESTADO, f.estado)
  ) {
    where.push(FILTROS_ESTADO[f.estado]);
  }
  if (typeof f.categoria === "string" && CATEGORIAS.includes(f.categoria)) {
    where.push("r.categoria = ?");
    params.push(f.categoria);
  }
  if (typeof f.rol === "string" && ROLES.includes(f.rol)) {
    where.push("u.rol = ?");
    params.push(f.rol);
  }

  const pagina = Math.min(
    10000,
    Math.max(1, Math.floor(Number(f.pagina)) || 1),
  );
  const condicion = where.join(" AND ");

  const [[conteo], [filas]]: any = await Promise.all([
    db.query(`SELECT COUNT(*) AS total ${DESDE} WHERE ${condicion}`, params),
    db.query(
      `SELECT r.id, r.categoria, r.asunto, r.estado, r.fecha_creacion,
              u.nombre AS usuario_nombre, u.rol AS usuario_rol,
              p.codigo AS pedido_codigo,
              EXISTS (SELECT 1 FROM reportes_respuestas x
                      WHERE x.reporte_id = r.id AND x.tipo = 'respuesta') AS tiene_respuesta,
                      (SELECT x.tipo FROM reportes_respuestas x WHERE x.reporte_id = r.id AND x.tipo IN ('respuesta', 'usuario')
               ORDER BY x.id DESC LIMIT 1) = 'usuario' AS ultimo_es_usuario,
              COALESCE((SELECT MAX(x.fecha) FROM reportes_respuestas x WHERE x.reporte_id = r.id AND x.tipo IN ('respuesta', 'usuario')),
                       r.fecha_creacion) AS ultima_actividad
       ${DESDE}
       WHERE ${condicion}
       ORDER BY (r.estado = 'resuelto') ASC,
                (CASE WHEN r.estado = 'resuelto' THEN NULL ELSE r.fecha_creacion END) ASC,
                r.fecha_creacion DESC
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
      categoria: r.categoria as string,
      asunto: r.asunto as string,
      estado: r.estado as Estado,
      fecha_creacion: new Date(r.fecha_creacion).toISOString(),
      usuario_nombre: r.usuario_nombre as string,
      usuario_rol: r.usuario_rol as string,
      pedido_codigo: r.pedido_codigo as string | null,
      tiene_respuesta: !!r.tiene_respuesta,
      ultimo_es_usuario: !!r.ultimo_es_usuario,
      ultima_actividad: new Date(r.ultima_actividad).toISOString(),
    })),
  };
};

export const obtenerReporte = async (id: number) => {
  const [[principal], [hilo]]: any = await Promise.all([
    db.query(
      `SELECT r.id, r.categoria, r.asunto, r.mensaje, r.estado, r.fecha_creacion, r.fecha_resolucion,
              r.atendido_por, r.usuario_id,
              u.nombre AS usuario_nombre, u.rol AS usuario_rol, u.telefono AS usuario_telefono,
              u.email AS usuario_email, u.fecha_registro AS usuario_registro,
              p.id AS pedido_id, p.codigo AS pedido_codigo, p.estado AS pedido_estado, p.total AS pedido_total,
              p.fecha_creacion AS pedido_fecha, rest.nombre AS restaurante_nombre
       FROM reportes_soporte r
       JOIN usuarios u ON u.id = r.usuario_id
       LEFT JOIN pedidos p ON p.id = r.pedido_id
       LEFT JOIN restaurantes rest ON rest.id = p.restaurante_id
       WHERE r.id = ?`,
      [id],
    ),
    db.query(
      `SELECT tipo, mensaje, super_admin_nombre, fecha
       FROM reportes_respuestas WHERE reporte_id = ? ORDER BY id ASC`,
      [id],
    ),
  ]);

  if (principal.length === 0)
    throw new ErrorSuperAdmin(404, "Reporte no encontrado");
  const r = principal[0];

  const [otros]: any = await db.query(
    `SELECT COUNT(*) AS total, COALESCE(SUM(estado <> 'resuelto'), 0) AS abiertos
     FROM reportes_soporte WHERE usuario_id = ? AND id <> ?`,
    [r.usuario_id, id],
  );

  return {
    id: r.id,
    categoria: r.categoria as string,
    asunto: r.asunto as string,
    mensaje: r.mensaje as string,
    estado: r.estado as Estado,
    fecha_creacion: new Date(r.fecha_creacion).toISOString(),
    fecha_resolucion: r.fecha_resolucion
      ? new Date(r.fecha_resolucion).toISOString()
      : null,
    atendido_por: r.atendido_por as string | null,
    usuario: {
      id: r.usuario_id as number,
      nombre: r.usuario_nombre as string,
      rol: r.usuario_rol as string,
      telefono: r.usuario_telefono as string | null,
      email: r.usuario_email as string | null,
      fecha_registro: r.usuario_registro
        ? new Date(r.usuario_registro).toISOString()
        : null,
      otros_reportes: Number(otros[0].total),
      otros_abiertos: Number(otros[0].abiertos),
    },
    pedido: r.pedido_id
      ? {
          id: r.pedido_id as number,
          codigo: r.pedido_codigo as string,
          estado: r.pedido_estado as string,
          total: Number(r.pedido_total),
          fecha_creacion: new Date(r.pedido_fecha).toISOString(),
          restaurante_nombre: r.restaurante_nombre as string | null,
        }
      : null,
    hilo: hilo.map((h: any) => ({
      tipo: h.tipo as "respuesta" | "nota" | "estado",
      mensaje: h.mensaje as string,
      super_admin_nombre: h.super_admin_nombre as string,
      fecha: new Date(h.fecha).toISOString(),
    })),
  };
};

// Cambia el estado y lo deja anotado en el hilo. Debe llamarse dentro de una transacción.
async function aplicarEstado(
  conexion: PoolConnection,
  id: number,
  actual: Estado,
  nuevo: Estado,
  sa: SuperAdmin,
) {
  await conexion.query(
    `UPDATE reportes_soporte
     SET estado = ?, atendido_por = ?, fecha_resolucion = ${nuevo === "resuelto" ? "NOW()" : "NULL"}
     WHERE id = ?`,
    [nuevo, nuevo === "abierto" ? null : sa.nombre, id],
  );
  await conexion.query(
    "INSERT INTO reportes_respuestas (reporte_id, tipo, mensaje, super_admin_id, super_admin_nombre) VALUES (?, 'estado', ?, ?, ?)",
    [id, `${ETIQUETA[actual]} → ${ETIQUETA[nuevo]}`, sa.id, sa.nombre],
  );
}

export const cambiarEstado = async (
  id: number,
  estado: unknown,
  sa: SuperAdmin,
) => {
  if (typeof estado !== "string" || !ESTADOS.includes(estado as Estado)) {
    throw new ErrorSuperAdmin(400, "Estado no válido");
  }
  const nuevo = estado as Estado;

  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    const [rows]: any = await conexion.query(
      "SELECT estado FROM reportes_soporte WHERE id = ? FOR UPDATE",
      [id],
    );
    if (rows.length === 0)
      throw new ErrorSuperAdmin(404, "Reporte no encontrado");
    if (rows[0].estado === nuevo)
      throw new ErrorSuperAdmin(409, "El reporte ya está en ese estado");

    await aplicarEstado(conexion, id, rows[0].estado, nuevo, sa);
    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }

  return obtenerReporte(id);
};

// La respuesta llega al usuario como notificación en su app, y al tocarla abre el reporte.
// Devuelve false si no se pudo avisar. Las respuestas de soporte se entregan siempre, aunque el usuario
// haya apagado los avisos de pedidos.
async function avisarUsuario(
  reporte: { id: number; usuario_id: number; asunto: string },
  mensaje: string,
) {
  const titulo = `Respuesta a: ${reporte.asunto}`.slice(0, 150);
  const cuerpo = mensaje.slice(0, 255);

  try {
    const [u]: any = await db.query("SELECT rol FROM usuarios WHERE id = ?", [
      reporte.usuario_id,
    ]);
    if (u.length === 0) return false;

    if (u[0].rol === "cliente") {
      await db.query(
        `INSERT INTO notificaciones_cliente (cliente_id, tipo, titulo, mensaje, reporte_id)
         VALUES (?, 'info', ?, ?, ?)`,
        [reporte.usuario_id, titulo, cuerpo, reporte.id],
      );
      return true;
    }

    if (u[0].rol === "repartidor") {
      await db.query(
        `INSERT INTO notificaciones_repartidor (repartidor_id, tipo, titulo, mensaje, reporte_id)
         VALUES (?, 'aviso', ?, ?, ?)`,
        [reporte.usuario_id, titulo, cuerpo, reporte.id],
      );
      return true;
    }

    if (u[0].rol === "admin") {
      const [rest]: any = await db.query(
        "SELECT id FROM restaurantes WHERE admin_id = ? LIMIT 1",
        [reporte.usuario_id],
      );
      if (rest.length === 0) return false;
      await avisarAdmin(rest[0].id, titulo, cuerpo);
      return true;
    }

    return false;
  } catch (error) {
    console.error(
      "No se pudo avisar al usuario de la respuesta de soporte:",
      error,
    );
    return false;
  }
}

export const responder = async (
  id: number,
  datos: { tipo?: unknown; mensaje?: unknown; resolver?: unknown },
  sa: SuperAdmin,
) => {
  if (datos.tipo !== "respuesta" && datos.tipo !== "nota")
    throw new ErrorSuperAdmin(400, "Tipo no válido");
  const tipo = datos.tipo;

  if (typeof datos.mensaje !== "string")
    throw new ErrorSuperAdmin(400, "Escribe un mensaje");
  const mensaje = datos.mensaje.trim();
  const max = tipo === "respuesta" ? MAX_RESPUESTA : MAX_NOTA;
  if (mensaje.length < 2 || mensaje.length > max) {
    throw new ErrorSuperAdmin(
      400,
      `El mensaje debe tener entre 2 y ${max} caracteres`,
    );
  }

  const resolver = tipo === "respuesta" && datos.resolver === true;
  let reporte: {
    id: number;
    usuario_id: number;
    asunto: string;
    pedido_id: number | null;
    estado: Estado;
  };

  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    const [rows]: any = await conexion.query(
      "SELECT id, estado, usuario_id, asunto, pedido_id FROM reportes_soporte WHERE id = ? FOR UPDATE",
      [id],
    );
    if (rows.length === 0)
      throw new ErrorSuperAdmin(404, "Reporte no encontrado");
    reporte = rows[0];

    await conexion.query(
      "INSERT INTO reportes_respuestas (reporte_id, tipo, mensaje, super_admin_id, super_admin_nombre) VALUES (?, ?, ?, ?, ?)",
      [id, tipo, mensaje, sa.id, sa.nombre],
    );

    // Responder pasa el reporte de "abierto" a "en revisión"; un reporte resuelto solo cambia si se pide
    if (tipo === "respuesta") {
      const destino: Estado = resolver
        ? "resuelto"
        : reporte.estado === "abierto"
          ? "en_revision"
          : reporte.estado;
      if (destino !== reporte.estado)
        await aplicarEstado(conexion, id, reporte.estado, destino, sa);
    }

    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }

  const notificado =
    tipo === "respuesta" ? await avisarUsuario(reporte, mensaje) : true;
  return { detalle: await obtenerReporte(id), notificado };
};

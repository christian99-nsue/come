import { db } from "../config/db";

// Los reportes que el propio usuario envió y lo que soporte le respondió.
// Sirve igual para clientes y repartidores: cada uno solo ve los suyos.

const MAX_MENSAJE = 500;
const MAX_SIN_RESPONDER = 3; // mensajes seguidos que puede enviar sin que soporte conteste
const DIAS_PARA_RESPONDER = 14; // pasado ese tiempo desde que se resolvió, hay que abrir una consulta nueva

const NOMBRE_ESTADO: Record<string, string> = {
  abierto: "Abierto",
  en_revision: "En revisión",
  resuelto: "Resuelto",
};

export class ErrorMiReporte extends Error {
  estado: number;
  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.estado = estado;
  }
}

type Consulta = { query: (sql: string, p?: any[]) => Promise<any> };

// Cuántos mensajes seguidos lleva el usuario desde la última respuesta de soporte
async function contarSinResponder(consulta: Consulta, reporteId: number) {
  const [rows]: any = await consulta.query(
    `SELECT COUNT(*) AS total FROM reportes_respuestas
     WHERE reporte_id = ? AND tipo = 'usuario'
       AND id > COALESCE((SELECT MAX(id) FROM reportes_respuestas WHERE reporte_id = ? AND tipo = 'respuesta'), 0)`,
    [reporteId, reporteId],
  );
  return Number(rows[0].total);
}

export const listarMisReportes = async (usuarioId: number) => {
  const [rows]: any = await db.query(
    `SELECT r.id, r.categoria, r.asunto, r.estado, r.fecha_creacion,
            p.codigo AS pedido_codigo,
            (SELECT COUNT(*) FROM reportes_respuestas x
              WHERE x.reporte_id = r.id AND x.tipo = 'respuesta') AS respuestas,
            EXISTS (SELECT 1 FROM reportes_respuestas x
                    WHERE x.reporte_id = r.id AND x.tipo = 'respuesta'
                      AND (r.visto_usuario_en IS NULL OR x.fecha > r.visto_usuario_en)) AS nueva_respuesta,
            COALESCE((SELECT MAX(x.fecha) FROM reportes_respuestas x
                      WHERE x.reporte_id = r.id AND x.tipo IN ('respuesta', 'estado', 'usuario')), r.fecha_creacion) AS ultima_actividad
     FROM reportes_soporte r
     LEFT JOIN pedidos p ON p.id = r.pedido_id
     WHERE r.usuario_id = ?
     ORDER BY nueva_respuesta DESC, ultima_actividad DESC
     LIMIT 50`,
    [usuarioId],
  );

  return rows.map((r: any) => ({
    id: r.id as number,
    categoria: r.categoria as string,
    asunto: r.asunto as string,
    estado: r.estado as "abierto" | "en_revision" | "resuelto",
    fecha_creacion: new Date(r.fecha_creacion).toISOString(),
    ultima_actividad: new Date(r.ultima_actividad).toISOString(),
    pedido_codigo: r.pedido_codigo as string | null,
    respuestas: Number(r.respuestas),
    nueva_respuesta: !!r.nueva_respuesta,
  }));
};

export const obtenerMiReporte = async (
  usuarioId: number,
  reporteId: number,
) => {
  if (!Number.isInteger(reporteId) || reporteId <= 0)
    throw new Error("Reporte no encontrado");

  // Solo si el reporte es de este usuario
  const [rows]: any = await db.query(
    `SELECT r.id, r.categoria, r.asunto, r.mensaje, r.estado, r.fecha_creacion, r.fecha_resolucion,
            p.codigo AS pedido_codigo,
            (r.estado = 'resuelto' AND r.fecha_resolucion IS NOT NULL
             AND r.fecha_resolucion < NOW() - INTERVAL ${DIAS_PARA_RESPONDER} DAY) AS cerrado_definitivo
     FROM reportes_soporte r
     LEFT JOIN pedidos p ON p.id = r.pedido_id
     WHERE r.id = ? AND r.usuario_id = ?`,
    [reporteId, usuarioId],
  );
  if (rows.length === 0) throw new Error("Reporte no encontrado");
  const r = rows[0];

  // Las notas internas del equipo y los nombres de quien atiende NUNCA salen de aquí
  const [hilo]: any = await db.query(
    `SELECT tipo, mensaje, fecha
     FROM reportes_respuestas
     WHERE reporte_id = ? AND tipo IN ('respuesta', 'estado', 'usuario')
     ORDER BY id ASC`,
    [reporteId],
  );

  // Al abrirlo se da por vista cualquier respuesta nueva
  await db.query(
    "UPDATE reportes_soporte SET visto_usuario_en = NOW() WHERE id = ? AND usuario_id = ?",
    [reporteId, usuarioId],
  );

  const sinResponder = await contarSinResponder(db, reporteId);
  const cerrado = !!r.cerrado_definitivo;
  const demasiados = sinResponder >= MAX_SIN_RESPONDER;

  return {
    id: r.id as number,
    categoria: r.categoria as string,
    asunto: r.asunto as string,
    mensaje: r.mensaje as string,
    estado: r.estado as "abierto" | "en_revision" | "resuelto",
    fecha_creacion: new Date(r.fecha_creacion).toISOString(),
    fecha_resolucion: r.fecha_resolucion
      ? new Date(r.fecha_resolucion).toISOString()
      : null,
    pedido_codigo: r.pedido_codigo as string | null,
    puede_responder: !cerrado && !demasiados,
    motivo_no_responder: cerrado
      ? `Este reporte se cerró hace más de ${DIAS_PARA_RESPONDER} días. Envía una consulta nueva.`
      : demasiados
        ? "Ya enviaste varios mensajes seguidos. Soporte te responderá pronto."
        : null,
    hilo: hilo.map((h: any) => ({
      tipo: h.tipo as "respuesta" | "estado" | "usuario",
      mensaje: h.mensaje as string,
      fecha: new Date(h.fecha).toISOString(),
    })),
  };
};

// El usuario escribe dentro de su reporte. Si estaba en revisión o resuelto, vuelve a "abierto" para que
// soporte lo vea otra vez.
export const enviarMensajeUsuario = async (
  usuarioId: number,
  reporteId: number,
  mensaje: unknown,
) => {
  const texto = typeof mensaje === "string" ? mensaje.trim() : "";
  if (texto.length < 2 || texto.length > MAX_MENSAJE) {
    throw new ErrorMiReporte(
      400,
      `El mensaje debe tener entre 2 y ${MAX_MENSAJE} caracteres`,
    );
  }
  if (/[\u0000-\u0009\u000B-\u001F\u007F]/.test(texto)) {
    throw new ErrorMiReporte(
      400,
      "El mensaje contiene caracteres no permitidos",
    );
  }
  if (!Number.isInteger(reporteId) || reporteId <= 0)
    throw new ErrorMiReporte(404, "Reporte no encontrado");

  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    // Se bloquea el reporte: dos mensajes a la vez no pueden saltarse el límite
    const [rows]: any = await conexion.query(
      `SELECT id, estado,
              (estado = 'resuelto' AND fecha_resolucion IS NOT NULL
               AND fecha_resolucion < NOW() - INTERVAL ${DIAS_PARA_RESPONDER} DAY) AS cerrado_definitivo
       FROM reportes_soporte WHERE id = ? AND usuario_id = ? FOR UPDATE`,
      [reporteId, usuarioId],
    );
    if (rows.length === 0)
      throw new ErrorMiReporte(404, "Reporte no encontrado");

    if (rows[0].cerrado_definitivo) {
      throw new ErrorMiReporte(
        409,
        `Este reporte se cerró hace más de ${DIAS_PARA_RESPONDER} días. Envía una consulta nueva.`,
      );
    }
    if ((await contarSinResponder(conexion, reporteId)) >= MAX_SIN_RESPONDER) {
      throw new ErrorMiReporte(
        409,
        "Ya enviaste varios mensajes seguidos. Soporte te responderá pronto.",
      );
    }

    await conexion.query(
      "INSERT INTO reportes_respuestas (reporte_id, tipo, mensaje) VALUES (?, 'usuario', ?)",
      [reporteId, texto],
    );

    if (rows[0].estado !== "abierto") {
      await conexion.query(
        "UPDATE reportes_soporte SET estado = 'abierto', fecha_resolucion = NULL WHERE id = ?",
        [reporteId],
      );
      await conexion.query(
        "INSERT INTO reportes_respuestas (reporte_id, tipo, mensaje) VALUES (?, 'estado', ?)",
        [reporteId, `${NOMBRE_ESTADO[rows[0].estado]} → Abierto`],
      );
    }

    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }

  return obtenerMiReporte(usuarioId, reporteId);
};

import { db } from "../config/db";
import {
  URL_APP,
  VALIDEZ_CODIGO_DIAS,
  VALIDEZ_ENLACE_HORAS,
} from "../config/registro";
import {
  generarCodigoInvitacion,
  generarTokenEnlace,
  hashCodigo,
  hashToken,
} from "../utils/registro";
import { ErrorSuperAdmin } from "./superadminRestaurantesService";

type SuperAdmin = { id: number; nombre: string };

const POR_PAGINA = 20;
const TELEFONO_EN_BD =
  "TRIM(LEADING '+' FROM REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(telefono, ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''))";

const paginaDe = (v: unknown) =>
  Math.min(10000, Math.max(1, Math.floor(Number(v)) || 1));
const iso = (v: unknown) => (v ? new Date(v as any).toISOString() : null);

// ===== Códigos de invitación =====

const ESTADO_CODIGO = `CASE WHEN c.revocado_en IS NOT NULL THEN 'revocado'
  WHEN c.usado_en IS NOT NULL THEN 'usado'
  WHEN c.expira_en <= NOW() THEN 'caducado'
  ELSE 'activo' END`;

// Los filtros salen de esta lista fija, nunca de lo que escribe el cliente
const FILTROS_CODIGO: Record<string, string> = {
  activos:
    "c.revocado_en IS NULL AND c.usado_en IS NULL AND c.expira_en > NOW()",
  usados: "c.usado_en IS NOT NULL",
  caducados:
    "c.revocado_en IS NULL AND c.usado_en IS NULL AND c.expira_en <= NOW()",
  revocados: "c.revocado_en IS NOT NULL",
};

const aCodigo = (r: any) => ({
  id: r.id as number,
  rol: r.rol as "repartidor" | "admin",
  // El código completo solo se ve al crearlo; después, solo sus últimas letras
  terminado_en: r.sufijo as string,
  nota: r.nota as string | null,
  estado: r.estado as "activo" | "usado" | "caducado" | "revocado",
  expira_en: iso(r.expira_en),
  usado_en: iso(r.usado_en),
  usado_por_nombre: (r.usado_por_nombre ?? null) as string | null,
  creado_por: r.creado_por as string,
  fecha_creacion: iso(r.fecha_creacion),
});

export const listarCodigos = async (f: {
  estado?: unknown;
  rol?: unknown;
  pagina?: unknown;
}) => {
  const where: string[] = ["1 = 1"];
  const params: any[] = [];

  if (
    typeof f.estado === "string" &&
    Object.prototype.hasOwnProperty.call(FILTROS_CODIGO, f.estado)
  )
    where.push(FILTROS_CODIGO[f.estado]);
  if (f.rol === "repartidor" || f.rol === "admin") {
    where.push("c.rol = ?");
    params.push(f.rol);
  }

  const pagina = paginaDe(f.pagina);
  const condicion = where.join(" AND ");

  const [[conteo], [filas]]: any = await Promise.all([
    db.query(
      `SELECT COUNT(*) AS total FROM codigos_invitacion c WHERE ${condicion}`,
      params,
    ),
    db.query(
      `SELECT c.id, c.rol, c.sufijo, c.nota, c.expira_en, c.usado_en, c.creado_por, c.fecha_creacion,
              ${ESTADO_CODIGO} AS estado, u.nombre AS usado_por_nombre
       FROM codigos_invitacion c LEFT JOIN usuarios u ON u.id = c.usado_por
       WHERE ${condicion}
       ORDER BY c.id DESC LIMIT ? OFFSET ?`,
      [...params, POR_PAGINA, (pagina - 1) * POR_PAGINA],
    ),
  ]);

  return {
    total: Number(conteo[0].total),
    pagina,
    por_pagina: POR_PAGINA,
    items: filas.map(aCodigo),
  };
};

export const crearCodigo = async (
  datos: { rol?: unknown; dias?: unknown; nota?: unknown },
  sa: SuperAdmin,
) => {
  if (datos.rol !== "repartidor" && datos.rol !== "admin")
    throw new ErrorSuperAdmin(
      400,
      "Elige para qué tipo de cuenta es el código",
    );
  const dias = Number(datos.dias);
  if (!(VALIDEZ_CODIGO_DIAS as readonly number[]).includes(dias))
    throw new ErrorSuperAdmin(400, "Elige cuánto tiempo será válido el código");

  let nota: string | null = null;
  if (datos.nota !== undefined && datos.nota !== null && datos.nota !== "") {
    if (
      typeof datos.nota !== "string" ||
      datos.nota.trim().length > 120 ||
      /[\u0000-\u001F\u007F]/.test(datos.nota)
    ) {
      throw new ErrorSuperAdmin(
        400,
        "La nota no es válida (máximo 120 caracteres)",
      );
    }
    nota = datos.nota.trim() || null;
  }

  // Si dos códigos al azar coincidieran (casi imposible), se genera otro
  for (let intento = 0; intento < 5; intento++) {
    const codigo = generarCodigoInvitacion();
    const normalizado = codigo.replace(/-/g, "");
    try {
      const [res]: any = await db.query(
        `INSERT INTO codigos_invitacion (rol, codigo_hash, sufijo, nota, expira_en, creado_por)
         VALUES (?, ?, ?, ?, NOW() + INTERVAL ? DAY, ?)`,
        [
          datos.rol,
          hashCodigo(normalizado),
          normalizado.slice(-4),
          nota,
          dias,
          sa.nombre,
        ],
      );
      const [filas]: any = await db.query(
        `SELECT c.id, c.rol, c.sufijo, c.nota, c.expira_en, c.usado_en, c.creado_por, c.fecha_creacion, ${ESTADO_CODIGO} AS estado
         FROM codigos_invitacion c WHERE c.id = ?`,
        [res.insertId],
      );
      // Esta es la única vez que el código existe en claro
      return { ...aCodigo(filas[0]), codigo };
    } catch (error: any) {
      if (error.code !== "ER_DUP_ENTRY") throw error;
    }
  }
  throw new ErrorSuperAdmin(
    500,
    "No se pudo generar el código. Inténtalo de nuevo.",
  );
};

export const revocarCodigo = async (id: number) => {
  const [res]: any = await db.query(
    "UPDATE codigos_invitacion SET revocado_en = NOW() WHERE id = ? AND revocado_en IS NULL AND usado_en IS NULL",
    [id],
  );
  if (res.affectedRows === 0) {
    const [existe]: any = await db.query(
      "SELECT id FROM codigos_invitacion WHERE id = ?",
      [id],
    );
    if (existe.length === 0)
      throw new ErrorSuperAdmin(404, "Código no encontrado");
    throw new ErrorSuperAdmin(
      409,
      "Solo se pueden anular los códigos que todavía no se han usado ni anulado",
    );
  }
  return { ok: true };
};

// ===== Solicitudes de acceso =====

const COLUMNAS_SOLICITUD = `id, rol, nombre, telefono, email, tipo_vehiculo, nombre_restaurante, direccion_restaurante,
  estado, motivo_rechazo, enlace_expira_en, (estado = 'aprobada' AND enlace_expira_en > NOW()) AS enlace_vigente,
  revisada_por, fecha_revision, fecha_completada, usuario_id, fecha_creacion`;

const aSolicitud = (r: any) => ({
  id: r.id as number,
  rol: r.rol as "repartidor" | "admin",
  nombre: r.nombre as string,
  telefono: r.telefono as string,
  email: r.email as string | null,
  tipo_vehiculo: r.tipo_vehiculo as string | null,
  nombre_restaurante: r.nombre_restaurante as string | null,
  direccion_restaurante: r.direccion_restaurante as string | null,
  estado: r.estado as "pendiente" | "aprobada" | "completada" | "rechazada",
  motivo_rechazo: r.motivo_rechazo as string | null,
  // aprobada pero el enlace ya caducó: hay que generar uno nuevo
  enlace_vigente: !!r.enlace_vigente,
  enlace_expira_en: iso(r.enlace_expira_en),
  revisada_por: r.revisada_por as string | null,
  fecha_revision: iso(r.fecha_revision),
  fecha_completada: iso(r.fecha_completada),
  fecha_creacion: iso(r.fecha_creacion),
});

const FILTROS_SOLICITUD: Record<string, string> = {
  pendientes: "estado = 'pendiente'",
  aprobadas: "estado = 'aprobada'",
  completadas: "estado = 'completada'",
  rechazadas: "estado = 'rechazada'",
};

export const contadoresAccesos = async () => {
  const [rows]: any = await db.query(
    `SELECT COALESCE(SUM(estado = 'pendiente'), 0) AS pendientes,
            COALESCE(SUM(estado = 'aprobada' AND enlace_expira_en <= NOW()), 0) AS enlaces_caducados
     FROM solicitudes_acceso`,
  );
  return {
    pendientes: Number(rows[0].pendientes),
    enlaces_caducados: Number(rows[0].enlaces_caducados),
  };
};

export const listarSolicitudes = async (f: {
  estado?: unknown;
  rol?: unknown;
  pagina?: unknown;
}) => {
  const where: string[] = ["1 = 1"];
  const params: any[] = [];

  if (
    typeof f.estado === "string" &&
    Object.prototype.hasOwnProperty.call(FILTROS_SOLICITUD, f.estado)
  )
    where.push(FILTROS_SOLICITUD[f.estado]);
  if (f.rol === "repartidor" || f.rol === "admin") {
    where.push("rol = ?");
    params.push(f.rol);
  }

  const pagina = paginaDe(f.pagina);
  const condicion = where.join(" AND ");

  const [[conteo], [filas]]: any = await Promise.all([
    db.query(
      `SELECT COUNT(*) AS total FROM solicitudes_acceso WHERE ${condicion}`,
      params,
    ),
    db.query(
      `SELECT ${COLUMNAS_SOLICITUD} FROM solicitudes_acceso WHERE ${condicion}
       ORDER BY FIELD(estado, 'pendiente', 'aprobada', 'completada', 'rechazada'),
                (CASE WHEN estado = 'pendiente' THEN fecha_creacion END) ASC, fecha_creacion DESC
       LIMIT ? OFFSET ?`,
      [...params, POR_PAGINA, (pagina - 1) * POR_PAGINA],
    ),
  ]);

  return {
    total: Number(conteo[0].total),
    pagina,
    por_pagina: POR_PAGINA,
    items: filas.map(aSolicitud),
  };
};

async function obtenerSolicitud(id: number) {
  const [rows]: any = await db.query(
    `SELECT ${COLUMNAS_SOLICITUD} FROM solicitudes_acceso WHERE id = ?`,
    [id],
  );
  if (rows.length === 0)
    throw new ErrorSuperAdmin(404, "Solicitud no encontrada");
  return aSolicitud(rows[0]);
}

const enlaceDe = (token: string) => `${URL_APP}/#/registro/enlace/${token}`;

// Aprobar o regenerar: se crea un enlace nuevo. El enlace solo se devuelve aquí, no se guarda (solo su resumen).
async function emitirEnlace(
  id: number,
  sa: SuperAdmin,
  accion: "aprobar" | "regenerar",
) {
  const conexion = await db.getConnection();
  const token = generarTokenEnlace();

  try {
    await conexion.beginTransaction();

    const [rows]: any = await conexion.query(
      "SELECT id, estado, telefono FROM solicitudes_acceso WHERE id = ? FOR UPDATE",
      [id],
    );
    if (rows.length === 0)
      throw new ErrorSuperAdmin(404, "Solicitud no encontrada");
    const estado = rows[0].estado;

    if (accion === "aprobar" && estado !== "pendiente") {
      throw new ErrorSuperAdmin(
        409,
        estado === "aprobada"
          ? "Esta solicitud ya está aprobada. Si hace falta, genera un enlace nuevo."
          : estado === "completada"
            ? "Esta persona ya completó su registro."
            : "Esta solicitud fue rechazada.",
      );
    }
    if (accion === "regenerar" && estado !== "aprobada") {
      throw new ErrorSuperAdmin(
        409,
        "Solo se puede generar un enlace nuevo para una solicitud aprobada que aún no ha completado su registro.",
      );
    }

    // Si en el ínterin esa persona ya tiene cuenta, no tiene sentido darle acceso otra vez
    const [yaTiene]: any = await conexion.query(
      `SELECT id FROM usuarios WHERE ${TELEFONO_EN_BD} = ? LIMIT 1`,
      [rows[0].telefono.replace(/^\+/, "")],
    );
    if (yaTiene.length > 0)
      throw new ErrorSuperAdmin(
        409,
        "Ya existe una cuenta con ese teléfono. Rechaza la solicitud.",
      );

    await conexion.query(
      `UPDATE solicitudes_acceso
       SET estado = 'aprobada', enlace_hash = ?, enlace_expira_en = NOW() + INTERVAL ? HOUR,
           revisada_por = ?, fecha_revision = NOW(), motivo_rechazo = NULL
       WHERE id = ?`,
      [hashToken(token), VALIDEZ_ENLACE_HORAS, sa.nombre, id],
    );
    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }

  return {
    solicitud: await obtenerSolicitud(id),
    enlace: enlaceDe(token),
    validez_horas: VALIDEZ_ENLACE_HORAS,
  };
}

export const aprobarSolicitud = (id: number, sa: SuperAdmin) =>
  emitirEnlace(id, sa, "aprobar");
export const regenerarEnlace = (id: number, sa: SuperAdmin) =>
  emitirEnlace(id, sa, "regenerar");

export const rechazarSolicitud = async (
  id: number,
  motivo: unknown,
  sa: SuperAdmin,
) => {
  const razon = typeof motivo === "string" ? motivo.trim() : "";
  if (razon.length < 5 || razon.length > 255)
    throw new ErrorSuperAdmin(
      400,
      "Escribe el motivo del rechazo (entre 5 y 255 caracteres)",
    );

  // Rechazar también invalida el enlace, si ya se había aprobado
  const [res]: any = await db.query(
    `UPDATE solicitudes_acceso
     SET estado = 'rechazada', motivo_rechazo = ?, enlace_hash = NULL, enlace_expira_en = NULL, revisada_por = ?, fecha_revision = NOW()
     WHERE id = ? AND estado IN ('pendiente', 'aprobada')`,
    [razon, sa.nombre, id],
  );
  if (res.affectedRows === 0) {
    await obtenerSolicitud(id); // 404 si no existe
    throw new ErrorSuperAdmin(
      409,
      "Esta solicitud ya está resuelta y no se puede rechazar.",
    );
  }
  return obtenerSolicitud(id);
};

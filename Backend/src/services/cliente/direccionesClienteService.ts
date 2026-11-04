import { db } from "../../config/db";
import { construirSet } from "../../utils/sql";

const MAX_DIRECCIONES = 10;

const aDireccion = (r: any) => ({
  id: r.id,
  etiqueta: r.etiqueta,
  direccion: r.direccion,
  referencia: r.referencia,
  latitud: r.latitud === null ? null : Number(r.latitud),
  longitud: r.longitud === null ? null : Number(r.longitud),
  es_principal: !!r.es_principal,
});

export const listarDirecciones = async (usuarioId: number) => {
  const [rows]: any = await db.query(
    `SELECT id, etiqueta, direccion, referencia, latitud, longitud, es_principal
     FROM direcciones_cliente WHERE usuario_id = ?
     ORDER BY es_principal DESC, id DESC`,
    [usuarioId],
  );
  return rows.map(aDireccion);
};

const coordenada = (valor: any, min: number, max: number, nombre: string) => {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  if (!Number.isFinite(n) || n < min || n > max)
    throw new Error(`${nombre} no válida`);
  return n;
};

export const crearDireccion = async (
  usuarioId: number,
  data: Record<string, any>,
) => {
  const etiqueta =
    String(data.etiqueta || "Casa")
      .trim()
      .slice(0, 40) || "Casa";
  const direccion = String(data.direccion || "").trim();
  const referencia = String(data.referencia || "").trim() || null;

  if (direccion.length < 5 || direccion.length > 255) {
    throw new Error("La dirección debe tener entre 5 y 255 caracteres");
  }
  if (referencia && referencia.length > 255)
    throw new Error("La referencia es demasiado larga");

  const latitud = coordenada(data.latitud, -90, 90, "Latitud");
  const longitud = coordenada(data.longitud, -180, 180, "Longitud");

  const [existentes]: any = await db.query(
    "SELECT COUNT(*) AS total FROM direcciones_cliente WHERE usuario_id = ?",
    [usuarioId],
  );
  const total = Number(existentes[0].total);
  if (total >= MAX_DIRECCIONES)
    throw new Error(`Puedes guardar hasta ${MAX_DIRECCIONES} direcciones`);

  // La primera dirección que se guarda queda como principal
  const [result]: any = await db.query(
    `INSERT INTO direcciones_cliente (usuario_id, etiqueta, direccion, referencia, latitud, longitud, es_principal)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      usuarioId,
      etiqueta,
      direccion,
      referencia,
      latitud,
      longitud,
      total === 0,
    ],
  );

  return aDireccion({
    id: result.insertId,
    etiqueta,
    direccion,
    referencia,
    latitud,
    longitud,
    es_principal: total === 0,
  });
};

export const eliminarDireccion = async (
  usuarioId: number,
  direccionId: number,
) => {
  const [rows]: any = await db.query(
    "SELECT es_principal FROM direcciones_cliente WHERE id = ? AND usuario_id = ?",
    [direccionId, usuarioId],
  );
  if (rows.length === 0) throw new Error("Dirección no encontrada");

  await db.query(
    "DELETE FROM direcciones_cliente WHERE id = ? AND usuario_id = ?",
    [direccionId, usuarioId],
  );

  // Si era la principal, la más reciente pasa a serlo
  if (rows[0].es_principal) {
    await db.query(
      `UPDATE direcciones_cliente SET es_principal = TRUE
       WHERE usuario_id = ? ORDER BY id DESC LIMIT 1`,
      [usuarioId],
    );
  }

  return { ok: true };
};

export const marcarPrincipal = async (
  usuarioId: number,
  direccionId: number,
) => {
  const [rows]: any = await db.query(
    "SELECT id FROM direcciones_cliente WHERE id = ? AND usuario_id = ?",
    [direccionId, usuarioId],
  );
  if (rows.length === 0) throw new Error("Dirección no encontrada");

  await db.query(
    "UPDATE direcciones_cliente SET es_principal = (id = ?) WHERE usuario_id = ?",
    [direccionId, usuarioId],
  );

  return { ok: true };
};

export const actualizarDireccion = async (
  usuarioId: number,
  direccionId: number,
  data: Record<string, any>,
) => {
  const cambios: Record<string, any> = {};

  if (data.etiqueta !== undefined) {
    const etiqueta = String(data.etiqueta).trim().slice(0, 40);
    if (!etiqueta) throw new Error("Pon un nombre a la dirección");
    cambios.etiqueta = etiqueta;
  }

  if (data.direccion !== undefined) {
    const direccion = String(data.direccion).trim();
    if (direccion.length < 5 || direccion.length > 255) {
      throw new Error("La dirección debe tener entre 5 y 255 caracteres");
    }
    cambios.direccion = direccion;
  }

  if (data.referencia !== undefined) {
    const referencia = String(data.referencia || "").trim();
    if (referencia.length > 255)
      throw new Error("La referencia es demasiado larga");
    cambios.referencia = referencia || null;
  }

  if (data.latitud !== undefined)
    cambios.latitud = coordenada(data.latitud, -90, 90, "Latitud");
  if (data.longitud !== undefined)
    cambios.longitud = coordenada(data.longitud, -180, 180, "Longitud");

  const { sql, valores } = construirSet(cambios, [
    "etiqueta",
    "direccion",
    "referencia",
    "latitud",
    "longitud",
  ]);
  if (!sql) throw new Error("No hay cambios para guardar");

  const [result]: any = await db.query(
    `UPDATE direcciones_cliente SET ${sql} WHERE id = ? AND usuario_id = ?`,
    [...valores, direccionId, usuarioId],
  );
  if (result.affectedRows === 0) throw new Error("Dirección no encontrada");

  const [rows]: any = await db.query(
    `SELECT id, etiqueta, direccion, referencia, latitud, longitud, es_principal
     FROM direcciones_cliente WHERE id = ? AND usuario_id = ?`,
    [direccionId, usuarioId],
  );
  return aDireccion(rows[0]);
};

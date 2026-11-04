import { db } from "../../config/db";
import { construirSet } from "../../utils/sql";

const IDIOMAS = ["es", "en", "fr"];
const TEMAS = ["claro", "oscuro"];
const NAVEGACIONES = ["google_maps", "maps"];

export const obtenerAjustes = async (repartidorId: number) => {
  const [rows]: any = await db.query(
    `SELECT idioma, tema, navegacion_externa, sonido_notificaciones
     FROM usuarios WHERE id = ? AND rol = 'repartidor'`,
    [repartidorId],
  );

  if (rows.length === 0) throw new Error("Repartidor no encontrado");

  const r = rows[0];
  return {
    idioma: r.idioma,
    tema: r.tema,
    navegacion_externa: r.navegacion_externa,
    sonido_notificaciones: !!r.sonido_notificaciones,
  };
};

export const actualizarAjustes = async (
  repartidorId: number,
  data: Record<string, any>,
) => {
  if (data.idioma !== undefined && !IDIOMAS.includes(data.idioma))
    throw new Error("Idioma no válido");
  if (data.tema !== undefined && !TEMAS.includes(data.tema))
    throw new Error("Tema no válido");
  if (
    data.navegacion_externa !== undefined &&
    !NAVEGACIONES.includes(data.navegacion_externa)
  ) {
    throw new Error("Aplicación de mapas no válida");
  }
  if (
    data.sonido_notificaciones !== undefined &&
    typeof data.sonido_notificaciones !== "boolean"
  ) {
    throw new Error("Valor no válido");
  }

  const { sql, valores } = construirSet(data, [
    "idioma",
    "tema",
    "navegacion_externa",
    "sonido_notificaciones",
  ]);
  if (!sql) throw new Error("No hay cambios para guardar");

  await db.query(
    `UPDATE usuarios SET ${sql} WHERE id = ? AND rol = 'repartidor'`,
    [...valores, repartidorId],
  );

  return obtenerAjustes(repartidorId);
};

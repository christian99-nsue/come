import { db } from "../../config/db";
import * as uploadService from "./uploadService";

export const listarFotos = async (restauranteId: number) => {
  const [rows]: any = await db.query(
    `SELECT id, url, fecha_creacion FROM restaurante_fotos WHERE restaurante_id = ? ORDER BY fecha_creacion DESC`,
    [restauranteId],
  );
  return rows;
};

export const agregarFoto = async (
  restauranteId: number,
  url: string,
  rutaStorage: string,
) => {
  const [result]: any = await db.query(
    `INSERT INTO restaurante_fotos (restaurante_id, url, ruta_storage) VALUES (?, ?, ?)`,
    [restauranteId, url, rutaStorage],
  );
  return { id: result.insertId, url };
};

export const eliminarFoto = async (fotoId: number, restauranteId: number) => {
  const [rows]: any = await db.query(
    `SELECT ruta_storage FROM restaurante_fotos WHERE id = ? AND restaurante_id = ?`,
    [fotoId, restauranteId],
  );
  if (rows.length === 0) throw new Error("Foto no encontrada");

  await uploadService.eliminarImagen(rows[0].ruta_storage);

  await db.query(
    `DELETE FROM restaurante_fotos WHERE id = ? AND restaurante_id = ?`,
    [fotoId, restauranteId],
  );
  return { ok: true };
};

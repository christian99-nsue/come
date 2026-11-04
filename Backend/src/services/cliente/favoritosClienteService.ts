import { db } from "../../config/db";
import {
  COLUMNAS_RESTAURANTE,
  aRestauranteLista,
} from "./restaurantesClienteService";

export const listarFavoritos = async (clienteId: number) => {
  const [rows]: any = await db.query(
    `SELECT ${COLUMNAS_RESTAURANTE}, TRUE AS es_favorito
     FROM restaurantes_favoritos fav
     JOIN restaurantes r ON r.id = fav.restaurante_id
     WHERE fav.usuario_id = ? AND r.suspendido = 0
     ORDER BY fav.fecha_creacion DESC`,
    [clienteId],
  );

  return rows.map(aRestauranteLista);
};

export const agregarFavorito = async (
  clienteId: number,
  restauranteId: number,
) => {
  if (!Number.isInteger(restauranteId) || restauranteId <= 0)
    throw new Error("Restaurante no válido");

  const [existe]: any = await db.query(
    "SELECT id FROM restaurantes WHERE id = ?",
    [restauranteId],
  );
  if (existe.length === 0) throw new Error("Restaurante no encontrado");

  // Si ya era favorito, no pasa nada
  await db.query(
    "INSERT IGNORE INTO restaurantes_favoritos (usuario_id, restaurante_id) VALUES (?, ?)",
    [clienteId, restauranteId],
  );

  return { ok: true };
};

export const quitarFavorito = async (
  clienteId: number,
  restauranteId: number,
) => {
  if (!Number.isInteger(restauranteId) || restauranteId <= 0)
    throw new Error("Restaurante no válido");

  await db.query(
    "DELETE FROM restaurantes_favoritos WHERE usuario_id = ? AND restaurante_id = ?",
    [clienteId, restauranteId],
  );

  return { ok: true };
};

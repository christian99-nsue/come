import { db } from "../../config/db";
import { construirSet } from "../../utils/sql";

export const obtenerRestaurante = async (restauranteId: number) => {
  const [rows]: any = await db.query(
    `SELECT id, nombre, logo, telefono, direccion, categorias_texto,
            estado, tiempo_preparacion_min, costo_envio, rating, reviews_count
     FROM restaurantes
     WHERE id = ?`,
    [restauranteId],
  );

  if (rows.length === 0) throw new Error("Restaurante no encontrado");
  return rows[0];
};

export const actualizarRestaurante = async (
  restauranteId: number,
  data: Partial<{
    nombre: string;
    telefono: string;
    direccion: string;
    logo: string;
    estado: "abierto" | "cerrado";
  }>,
) => {
  // restauranteAdminService.ts → actualizarRestaurante
  const { sql, valores } = construirSet(data, [
    "nombre",
    "telefono",
    "direccion",
    "logo",
    "estado",
    "tiempo_preparacion_min",
    "aceptacion_pedidos",
    "metodos_pago_aceptados",
  ]);
  if (!sql) throw new Error("No hay campos para actualizar");

  await db.query(`UPDATE restaurantes SET ${sql} WHERE id = ?`, [
    ...valores,
    restauranteId,
  ]);
  return { ok: true };
};

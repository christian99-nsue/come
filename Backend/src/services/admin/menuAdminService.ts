import { db } from "../../config/db";
import { construirSet } from "../../utils/sql";

// ===== Categorías =====
export const listarCategorias = async (restauranteId: number) => {
  const [rows]: any = await db.query(
    `SELECT id, nombre, descripcion, imagen, orden
     FROM categorias_menu
     WHERE restaurante_id = ?
     ORDER BY orden ASC, nombre ASC`,
    [restauranteId],
  );
  return rows;
};

export const obtenerCategoria = async (
  categoriaId: number,
  restauranteId: number,
) => {
  const [rows]: any = await db.query(
    `SELECT id, nombre, descripcion, imagen FROM categorias_menu WHERE id = ? AND restaurante_id = ?`,
    [categoriaId, restauranteId],
  );
  if (rows.length === 0) throw new Error("Categoría no encontrada");
  return rows[0];
};

export const actualizarCategoria = async (
  categoriaId: number,
  restauranteId: number,
  data: Partial<{ nombre: string; descripcion: string; imagen: string }>,
) => {
  // menuAdminService.ts → actualizarCategoria
  const { sql, valores } = construirSet(data, [
    "nombre",
    "descripcion",
    "imagen",
  ]);
  if (!sql) throw new Error("No hay campos para actualizar");

  const [result]: any = await db.query(
    `UPDATE categorias_menu SET ${sql} WHERE id = ? AND restaurante_id = ?`,
    [...valores, categoriaId, restauranteId],
  );
  if (result.affectedRows === 0) throw new Error("Categoría no encontrada");

  return { ok: true };
};

export const eliminarCategoria = async (
  categoriaId: number,
  restauranteId: number,
) => {
  const [result]: any = await db.query(
    `DELETE FROM categorias_menu WHERE id = ? AND restaurante_id = ?`,
    [categoriaId, restauranteId],
  );
  if (result.affectedRows === 0) throw new Error("Categoría no encontrada");
  return { ok: true };
};

export const crearCategoria = async (
  restauranteId: number,
  data: { nombre: string; descripcion?: string; imagen?: string },
) => {
  if (!data.nombre?.trim())
    throw new Error("El nombre de la categoría es obligatorio");

  const [result]: any = await db.query(
    `INSERT INTO categorias_menu (restaurante_id, nombre, descripcion, imagen)
     VALUES (?, ?, ?, ?)`,
    [
      restauranteId,
      data.nombre.trim(),
      data.descripcion || null,
      data.imagen || null,
    ],
  );

  return { id: result.insertId, ...data };
};

// ===== Platos =====
export const listarPlatos = async (
  restauranteId: number,
  categoriaId?: number,
) => {
  let sql = `
    SELECT p.id, p.nombre, p.descripcion, p.imagen, p.precio,
           p.tiempo_preparacion_min, p.disponible, p.categoria_id,
           c.nombre AS categoria_nombre
    FROM platos p
    LEFT JOIN categorias_menu c ON c.id = p.categoria_id
    WHERE p.restaurante_id = ?
  `;
  const params: any[] = [restauranteId];

  if (categoriaId) {
    sql += " AND p.categoria_id = ?";
    params.push(categoriaId);
  }

  sql += " ORDER BY p.nombre ASC";

  const [rows]: any = await db.query(sql, params);
  return rows;
};

export const obtenerPlato = async (platoId: number, restauranteId: number) => {
  const [rows]: any = await db.query(
    `SELECT id, nombre, descripcion, imagen, precio, categoria_id, tiempo_preparacion_min, disponible
     FROM platos
     WHERE id = ? AND restaurante_id = ?`,
    [platoId, restauranteId],
  );
  if (rows.length === 0) throw new Error("Plato no encontrado");
  return rows[0];
};

export const crearPlato = async (
  restauranteId: number,
  data: {
    nombre: string;
    descripcion?: string;
    imagen?: string;
    categoria_id?: number;
    precio: number;
    tiempo_preparacion_min?: number;
    disponible?: boolean;
  },
) => {
  if (!data.nombre?.trim())
    throw new Error("El nombre del plato es obligatorio");
  if (!data.precio || data.precio <= 0)
    throw new Error("El precio debe ser mayor a 0");

  const [result]: any = await db.query(
    `INSERT INTO platos
      (restaurante_id, categoria_id, nombre, descripcion, imagen, precio, tiempo_preparacion_min, disponible)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      restauranteId,
      data.categoria_id || null,
      data.nombre.trim(),
      data.descripcion || null,
      data.imagen || null,
      data.precio,
      data.tiempo_preparacion_min || 15,
      data.disponible ?? true,
    ],
  );

  return { id: result.insertId, ...data };
};

export const actualizarPlato = async (
  platoId: number,
  restauranteId: number,
  data: Partial<{
    nombre: string;
    descripcion: string;
    imagen: string;
    categoria_id: number;
    precio: number;
    tiempo_preparacion_min: number;
  }>,
) => {
  // menuAdminService.ts → actualizarPlato
  const { sql, valores } = construirSet(data, [
    "nombre",
    "descripcion",
    "imagen",
    "categoria_id",
    "precio",
    "tiempo_preparacion_min",
  ]);
  if (!sql) throw new Error("No hay campos para actualizar");

  const [result]: any = await db.query(
    `UPDATE platos SET ${sql} WHERE id = ? AND restaurante_id = ?`,
    [...valores, platoId, restauranteId],
  );
  if (result.affectedRows === 0) throw new Error("Plato no encontrado");
  return { ok: true };
};

export const cambiarDisponibilidad = async (
  platoId: number,
  restauranteId: number,
  disponible: boolean,
) => {
  const [result]: any = await db.query(
    `UPDATE platos SET disponible = ? WHERE id = ? AND restaurante_id = ?`,
    [disponible, platoId, restauranteId],
  );

  if (result.affectedRows === 0) throw new Error("Plato no encontrado");
  return { ok: true };
};

export const eliminarPlato = async (platoId: number, restauranteId: number) => {
  const [result]: any = await db.query(
    `DELETE FROM platos WHERE id = ? AND restaurante_id = ?`,
    [platoId, restauranteId],
  );

  if (result.affectedRows === 0) throw new Error("Plato no encontrado");
  return { ok: true };
};

import { db } from "../../config/db";
import bcrypt from "bcrypt";
import { construirSet } from "../../utils/sql";

export const obtenerCuenta = async (usuarioId: number) => {
  const [rows]: any = await db.query(
    `SELECT id, nombre, email, telefono, foto_perfil FROM usuarios WHERE id = ?`,
    [usuarioId],
  );
  if (rows.length === 0) throw new Error("Usuario no encontrado");
  return rows[0];
};

export const actualizarCuenta = async (
  usuarioId: number,
  data: Record<string, any>,
) => {
  const { sql, valores } = construirSet(data, [
    "nombre",
    "email",
    "telefono",
    "foto_perfil",
  ]);
  if (!sql) throw new Error("No hay campos para actualizar");

  await db.query(`UPDATE usuarios SET ${sql} WHERE id = ?`, [
    ...valores,
    usuarioId,
  ]);
  return { ok: true };
};

export const cambiarContrasena = async (
  usuarioId: number,
  contrasenaActual: string,
  contrasenaNueva: string,
) => {
  const [rows]: any = await db.query(
    `SELECT password FROM usuarios WHERE id = ?`,
    [usuarioId],
  );
  if (rows.length === 0) throw new Error("Usuario no encontrado");

  const coincide = await bcrypt.compare(contrasenaActual, rows[0].password);
  if (!coincide) throw new Error("La contraseña actual es incorrecta");

  const hashNueva = await bcrypt.hash(contrasenaNueva, 10);
  await db.query(`UPDATE usuarios SET password = ? WHERE id = ?`, [
    hashNueva,
    usuarioId,
  ]);
  return { ok: true };
};

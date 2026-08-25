import { db } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (telefono: string, password: string) => {
  const cleanTelefono = telefono?.trim();

  if (!cleanTelefono || !password) {
    throw new Error("Telefono y contraseña requeridos");
  }

  const sql = `
    SELECT * FROM usuarios
    WHERE telefono = ?
  `;

  const [rows]: any = await db.query(sql, [cleanTelefono]);

  if (rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  const user = rows[0];

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Contraseña incorrecta");
  }

  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" },
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      telefono: user.telefono,
      rol: user.rol,
    },
    token,
  };
};

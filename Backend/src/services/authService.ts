import { db } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { normalizarTelefono } from "../utils/registro";

// Se comparan los teléfonos sin espacios, guiones ni el "+" inicial: "+240 222-111-222" y "240222111222" son el mismo
const TELEFONO_EN_BD =
  "TRIM(LEADING '+' FROM REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(telefono, ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''))";

// Si el teléfono no existe se compara contra esto, para que tarde lo mismo que con un usuario real
const HASH_FALSO = bcrypt.hashSync("contrasena-que-nadie-usa", 10);

// Un solo mensaje para todo: no se revela si el teléfono existe o si lo que falló fue la contraseña
const MENSAJE_LOGIN = "Teléfono o contraseña incorrectos";

export const loginUser = async (telefono: string, password: string) => {
  if (
    typeof telefono !== "string" ||
    typeof password !== "string" ||
    !telefono.trim() ||
    !password
  ) {
    throw new Error("Telefono y contraseña requeridos");
  }

  let buscado: string;
  try {
    buscado = normalizarTelefono(telefono).replace(/^\+/, "");
  } catch {
    throw new Error(MENSAJE_LOGIN);
  }

  const [rows]: any = await db.query(
    `SELECT * FROM usuarios WHERE ${TELEFONO_EN_BD} = ? LIMIT 1`,
    [buscado],
  );
  const user = rows[0];

  const match = await bcrypt.compare(
    password,
    user ? user.password : HASH_FALSO,
  );
  if (!user || !match) throw new Error(MENSAJE_LOGIN);

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

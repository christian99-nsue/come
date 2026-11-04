import { db } from "../../config/db";
import { construirSet } from "../../utils/sql";
import bcrypt from "bcrypt";

const TIPOS_CONTACTO = ["Llamada", "Whatsapp", "Mensaje"];
const METODOS_PAGO = ["efectivo", "transferencia", "tarjeta"];
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const obtenerPerfil = async (clienteId: number) => {
  const [rows]: any = await db.query(
    `SELECT u.id, u.nombre, u.email, u.telefono, u.foto_perfil, u.lugar_trabajo, u.tipo_contacto,
            u.metodo_pago_preferido, u.notificaciones_activas, u.fecha_registro,
            (SELECT COUNT(*) FROM pedidos p
              WHERE p.cliente_id = u.id AND p.estado = 'entregado') AS pedidos_entregados,
            (SELECT COUNT(*) FROM direcciones_cliente d
              WHERE d.usuario_id = u.id) AS direcciones_count
     FROM usuarios u
     WHERE u.id = ? AND u.rol = 'cliente'`,
    [clienteId],
  );

  if (rows.length === 0) throw new Error("Usuario no encontrado");

  const r = rows[0];
  return {
    id: r.id,
    nombre: r.nombre,
    email: r.email,
    telefono: r.telefono,
    foto_perfil: r.foto_perfil,
    lugar_trabajo: r.lugar_trabajo,
    tipo_contacto: r.tipo_contacto,
    metodo_pago_preferido: r.metodo_pago_preferido,
    notificaciones_activas: !!r.notificaciones_activas,
    fecha_registro: r.fecha_registro
      ? new Date(r.fecha_registro).toISOString()
      : null,
    pedidos_entregados: Number(r.pedidos_entregados),
    direcciones_count: Number(r.direcciones_count),
  };
};

export const actualizarPerfil = async (
  clienteId: number,
  data: Record<string, any>,
) => {
  const limpio: Record<string, any> = { ...data };

  // Todo lo que llega como texto debe ser texto
  for (const campo of [
    "nombre",
    "telefono",
    "email",
    "lugar_trabajo",
    "foto_perfil",
  ]) {
    const v = limpio[campo];
    if (v !== undefined && v !== null && typeof v !== "string")
      throw new Error("Datos no válidos");
    if (typeof v === "string") limpio[campo] = v.trim();
  }

  // Los opcionales vacíos se guardan como null (el correo es UNIQUE: dos '' chocarían)
  for (const campo of ["email", "lugar_trabajo", "foto_perfil"]) {
    if (limpio[campo] === "") limpio[campo] = null;
  }

  if (
    limpio.nombre !== undefined &&
    (!limpio.nombre || limpio.nombre.length > 120)
  ) {
    throw new Error("El nombre es obligatorio (máximo 120 caracteres)");
  }
  if (
    limpio.telefono !== undefined &&
    (!limpio.telefono || limpio.telefono.length > 20)
  ) {
    throw new Error("El teléfono es obligatorio (máximo 20 caracteres)");
  }
  if (
    limpio.email &&
    (limpio.email.length > 150 || !EMAIL_VALIDO.test(limpio.email))
  ) {
    throw new Error("El correo no es válido");
  }
  if (limpio.lugar_trabajo && limpio.lugar_trabajo.length > 150) {
    throw new Error("El lugar de trabajo es demasiado largo");
  }
  if (
    limpio.tipo_contacto !== undefined &&
    !TIPOS_CONTACTO.includes(limpio.tipo_contacto)
  ) {
    throw new Error("Tipo de contacto no válido");
  }
  if (
    limpio.metodo_pago_preferido !== undefined &&
    !METODOS_PAGO.includes(limpio.metodo_pago_preferido)
  ) {
    throw new Error("Método de pago no válido");
  }

  // La foto solo puede venir de nuestro almacenamiento, no de una dirección cualquiera
  const base = process.env.SUPABASE_URL;
  if (
    limpio.foto_perfil &&
    base &&
    !limpio.foto_perfil.startsWith(`${base}/storage/v1/object/public/`)
  ) {
    throw new Error("La foto no es válida");
  }

  // El teléfono es el usuario de inicio de sesión: no puede repetirse
  if (limpio.telefono !== undefined) {
    const [duplicado]: any = await db.query(
      "SELECT id FROM usuarios WHERE telefono = ? AND id <> ?",
      [limpio.telefono, clienteId],
    );
    if (duplicado.length > 0)
      throw new Error("Ese teléfono ya está registrado en otra cuenta");
  }

  const { sql, valores } = construirSet(limpio, [
    "nombre",
    "email",
    "telefono",
    "foto_perfil",
    "lugar_trabajo",
    "tipo_contacto",
    "metodo_pago_preferido",
  ]);
  if (!sql) throw new Error("No hay cambios para guardar");

  try {
    await db.query(
      `UPDATE usuarios SET ${sql} WHERE id = ? AND rol = 'cliente'`,
      [...valores, clienteId],
    );
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY")
      throw new Error("Ese correo ya está registrado en otra cuenta");
    throw error;
  }

  return obtenerPerfil(clienteId);
};

export const cambiarContrasena = async (
  clienteId: number,
  actual: unknown,
  nueva: unknown,
) => {
  if (
    typeof actual !== "string" ||
    typeof nueva !== "string" ||
    !actual ||
    !nueva
  ) {
    throw new Error("Completa todos los campos");
  }

  // bcrypt solo lee los primeros 72 bytes: se rechaza lo que pase de ahí en vez de cortarlo en silencio
  if (
    nueva.length < 8 ||
    Buffer.byteLength(nueva, "utf8") > 72 ||
    !/[A-Z]/.test(nueva) ||
    !/[a-z]/.test(nueva) ||
    !/\d/.test(nueva)
  ) {
    throw new Error(
      "La nueva contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número",
    );
  }

  const [rows]: any = await db.query(
    "SELECT password FROM usuarios WHERE id = ? AND rol = 'cliente'",
    [clienteId],
  );
  if (rows.length === 0) throw new Error("Usuario no encontrado");

  if (!(await bcrypt.compare(actual, rows[0].password))) {
    throw new Error("La contraseña actual es incorrecta");
  }
  if (await bcrypt.compare(nueva, rows[0].password)) {
    throw new Error("La nueva contraseña debe ser distinta de la actual");
  }

  const hash = await bcrypt.hash(nueva, 10);
  await db.query("UPDATE usuarios SET password = ? WHERE id = ?", [
    hash,
    clienteId,
  ]);

  return { ok: true };
};

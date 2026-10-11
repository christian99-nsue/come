import bcrypt from "bcrypt";
import { db } from "../../config/db";
import { construirSet } from "../../utils/sql";

const TIPOS_DOCUMENTO = ["DNI", "Pasaporte", "Carnet de conducir"];
const TIPOS_VEHICULO = ["moto", "bicicleta", "coche"];

export const obtenerPerfil = async (repartidorId: number) => {
  const [rows]: any = await db.query(
    `SELECT id, nombre, email, telefono, foto_perfil, tipo_documento, numero_documento,
            vehiculo_tipo, matricula, disponible, fecha_registro
     FROM usuarios
     WHERE id = ? AND rol = 'repartidor'`,
    [repartidorId],
  );

  if (rows.length === 0) throw new Error("Repartidor no encontrado");

  return { ...rows[0], disponible: !!rows[0].disponible };
};

export const actualizarPerfil = async (
  repartidorId: number,
  data: Record<string, any>,
) => {
  const limpio: Record<string, any> = { ...data };

  // Los opcionales vacíos se guardan como null (el correo es UNIQUE: dos '' chocarían)
  for (const campo of [
    "email",
    "numero_documento",
    "matricula",
    "tipo_documento",
    "vehiculo_tipo",
    "foto_perfil",
  ]) {
    if (typeof limpio[campo] === "string") {
      limpio[campo] = limpio[campo].trim() || null;
    }
  }
  if (typeof limpio.nombre === "string") limpio.nombre = limpio.nombre.trim();
  if (typeof limpio.telefono === "string")
    limpio.telefono = limpio.telefono.trim();

  if (limpio.nombre !== undefined && !limpio.nombre)
    throw new Error("El nombre es obligatorio");
  if (limpio.telefono !== undefined && !limpio.telefono)
    throw new Error("El teléfono es obligatorio");
  if (
    limpio.tipo_documento &&
    !TIPOS_DOCUMENTO.includes(limpio.tipo_documento)
  ) {
    throw new Error("Tipo de documento no válido");
  }
  if (limpio.vehiculo_tipo && !TIPOS_VEHICULO.includes(limpio.vehiculo_tipo)) {
    throw new Error("Tipo de vehículo no válido");
  }

  // El teléfono es el usuario de inicio de sesión: no puede repetirse
  if (limpio.telefono !== undefined) {
    const [duplicado]: any = await db.query(
      "SELECT id FROM usuarios WHERE telefono = ? AND id <> ?",
      [limpio.telefono, repartidorId],
    );
    if (duplicado.length > 0)
      throw new Error("Ese teléfono ya está registrado en otra cuenta");
  }

  const { sql, valores } = construirSet(limpio, [
    "nombre",
    "email",
    "telefono",
    "foto_perfil",
    "tipo_documento",
    "numero_documento",
    "vehiculo_tipo",
    "matricula",
  ]);
  if (!sql) throw new Error("No hay cambios para guardar");

  try {
    await db.query(
      `UPDATE usuarios SET ${sql} WHERE id = ? AND rol = 'repartidor'`,
      [...valores, repartidorId],
    );
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      const campo = String(error.sqlMessage || "").includes("telefono")
        ? "teléfono"
        : "correo";
      throw new Error(`Ese ${campo} ya está registrado en otra cuenta`);
    }
    throw error;
  }

  return obtenerPerfil(repartidorId);
};

export const cambiarContrasena = async (
  repartidorId: number,
  actual: string,
  nueva: string,
) => {
  if (!actual || !nueva) throw new Error("Completa todos los campos");

  if (
    nueva.length < 8 ||
    !/[A-Z]/.test(nueva) ||
    !/[a-z]/.test(nueva) ||
    !/\d/.test(nueva)
  ) {
    throw new Error(
      "La nueva contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número",
    );
  }

  const [rows]: any = await db.query(
    "SELECT password FROM usuarios WHERE id = ? AND rol = 'repartidor'",
    [repartidorId],
  );
  if (rows.length === 0) throw new Error("Repartidor no encontrado");

  const coincide = await bcrypt.compare(actual, rows[0].password);
  if (!coincide) throw new Error("La contraseña actual es incorrecta");

  const hash = await bcrypt.hash(nueva, 10);
  await db.query("UPDATE usuarios SET password = ? WHERE id = ?", [
    hash,
    repartidorId,
  ]);

  return { ok: true };
};

// Datos de la pantalla "Información de la cuenta": perfil + actividad total
export const obtenerCuenta = async (repartidorId: number) => {
  const [rows]: any = await db.query(
    `SELECT u.id, u.nombre, u.email, u.telefono, u.foto_perfil,
            u.tipo_documento, u.numero_documento, u.vehiculo_tipo, u.matricula,
            u.disponible, u.notificaciones_activas, u.fecha_registro,
            (SELECT COUNT(*) FROM pedidos p
              WHERE p.repartidor_id = u.id AND p.estado = 'entregado') AS entregas_totales,
            (SELECT COALESCE(SUM(p.costo_envio), 0) FROM pedidos p
              WHERE p.repartidor_id = u.id AND p.estado = 'entregado') AS ganancias_totales
     FROM usuarios u
     WHERE u.id = ? AND u.rol = 'repartidor'`,
    [repartidorId],
  );

  if (rows.length === 0) throw new Error("Repartidor no encontrado");

  const r = rows[0];
  return {
    ...r,
    disponible: !!r.disponible,
    notificaciones_activas: !!r.notificaciones_activas,
    entregas_totales: Number(r.entregas_totales),
    ganancias_totales: Number(r.ganancias_totales),
  };
};

export const actualizarPreferencias = async (
  repartidorId: number,
  notificacionesActivas: unknown,
) => {
  if (typeof notificacionesActivas !== "boolean") {
    throw new Error("Valor no válido");
  }

  await db.query(
    "UPDATE usuarios SET notificaciones_activas = ? WHERE id = ? AND rol = 'repartidor'",
    [notificacionesActivas, repartidorId],
  );

  return { ok: true, notificaciones_activas: notificacionesActivas };
};

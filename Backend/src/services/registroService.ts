import { createHash } from "node:crypto";
import bcrypt from "bcrypt";
import type { PoolConnection } from "mysql2/promise";
import { db } from "../config/db";
import {
  ErrorRegistro,
  formatoTokenValido,
  hashCodigo,
  hashToken,
  leerCodigo,
  leerEmailOpcional,
  leerNombre,
  leerPassword,
  leerTexto,
  leerTextoOpcional,
  normalizarTelefono,
  telefonoEnmascarado,
  formatearSeguimiento,
  generarSeguimiento,
  leerSeguimiento,
} from "../utils/registro";

export type RolAcceso = "repartidor" | "admin";

const TIPOS_CONTACTO = ["Llamada", "Whatsapp", "Mensaje"];

// Se comparan los teléfonos sin espacios, guiones ni el "+" inicial, para que "+240 222-111" y "240222111" sean el mismo
const TELEFONO_EN_BD =
  "TRIM(LEADING '+' FROM REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(telefono, ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''))";
const sinMas = (telefono: string) => telefono.replace(/^\+/, "");

// Qué columnas opcionales tiene tu tabla de usuarios (lugar de trabajo, tipo de contacto, vehículo...)
let columnas: Set<string> | null = null;
async function columnasUsuarios() {
  if (!columnas) {
    const [rows]: any = await db.query(
      "SELECT COLUMN_NAME AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios'",
    );
    columnas = new Set(rows.map((r: any) => r.c));
  }
  return columnas;
}
export const reiniciarCacheColumnas = () => {
  columnas = null;
};

const huella = (texto: string) =>
  createHash("sha1").update(texto).digest("hex");

// Dos registros a la vez con el mismo teléfono (o correo) no pueden crear dos cuentas: se reserva el dato
// con un candado mientras dura el registro. Todo lo que se haga dentro usa SOLO la conexión recibida.
async function conRegistro<T>(
  telefono: string,
  email: string | null,
  trabajo: (c: PoolConnection) => Promise<T>,
): Promise<T> {
  const conexion = await db.getConnection();
  const candados: string[] = [];

  try {
    const nombres = [
      `r:t:${huella(sinMas(telefono))}`,
      ...(email ? [`r:e:${huella(email)}`] : []),
    ];
    for (const nombre of nombres) {
      const [r]: any = await conexion.query("SELECT GET_LOCK(?, 8) AS ok", [
        nombre,
      ]);
      if (r[0].ok !== 1)
        throw new ErrorRegistro(
          409,
          "Estamos procesando otro registro con esos datos. Inténtalo de nuevo en unos segundos.",
        );
      candados.push(nombre);
    }

    await conexion.beginTransaction();
    try {
      const resultado = await trabajo(conexion);
      await conexion.commit();
      return resultado;
    } catch (error) {
      await conexion.rollback();
      throw error;
    }
  } finally {
    for (const nombre of candados) {
      try {
        await conexion.query("SELECT RELEASE_LOCK(?)", [nombre]);
      } catch {
        /* si falla, el candado se libera al cerrar la conexión */
      }
    }
    conexion.release();
  }
}

async function comprobarLibres(
  c: PoolConnection,
  telefono: string,
  email: string | null,
) {
  const [t]: any = await c.query(
    `SELECT id FROM usuarios WHERE ${TELEFONO_EN_BD} = ? LIMIT 1`,
    [sinMas(telefono)],
  );
  if (t.length > 0)
    throw new ErrorRegistro(
      409,
      "Ya existe una cuenta con ese teléfono. Inicia sesión.",
      "telefono",
    );

  if (email) {
    const [e]: any = await c.query(
      "SELECT id FROM usuarios WHERE LOWER(email) = ? LIMIT 1",
      [email],
    );
    if (e.length > 0)
      throw new ErrorRegistro(
        409,
        "Ya existe una cuenta con ese correo.",
        "email",
      );
  }
}

interface NuevoUsuario {
  rol: "cliente" | "repartidor" | "admin";
  nombre: string;
  telefono: string;
  email: string | null;
  passwordHash: string;
  extra?: Record<string, string | null>;
}

async function crearUsuario(
  c: PoolConnection,
  u: NuevoUsuario,
): Promise<number> {
  const disponibles = await columnasUsuarios();
  const campos: Record<string, string | null> = {
    nombre: u.nombre,
    email: u.email,
    telefono: u.telefono,
    password: u.passwordHash,
    rol: u.rol,
  };
  // Solo los opcionales que de verdad existen en tu tabla (las claves salen de este código, nunca del usuario)
  for (const [clave, valor] of Object.entries(u.extra ?? {})) {
    if (valor !== null && disponibles.has(clave)) campos[clave] = valor;
  }

  const claves = Object.keys(campos);
  const [res]: any = await c.query(
    `INSERT INTO usuarios (${claves.join(", ")}) VALUES (${claves.map(() => "?").join(", ")})`,
    claves.map((k) => campos[k]),
  );
  return res.insertId;
}

// Un restaurante nuevo empieza cerrado: el administrador lo abre cuando tenga sus platos listos
async function crearRestaurante(
  c: PoolConnection,
  adminId: number,
  nombre: string,
  direccion: string,
  telefono: string,
) {
  await c.query(
    "INSERT INTO restaurantes (nombre, direccion, telefono, admin_id, estado) VALUES (?, ?, ?, ?, 'cerrado')",
    [nombre, direccion, telefono, adminId],
  );
}

const hashPassword = (password: string) => bcrypt.hash(password, 10);

// Lo que llega de la red puede ser cualquier cosa: nunca se asume que es un objeto
const objeto = (x: unknown): Record<string, unknown> =>
  x && typeof x === "object" ? (x as Record<string, unknown>) : {};

// ===== Cliente: se registra directamente =====

export async function registrarCliente(entrada: unknown) {
  const datos = objeto(entrada);
  const nombre = leerNombre(datos.nombre);
  const telefono = normalizarTelefono(datos.telefono);
  const email = leerEmailOpcional(datos.email);
  const password = leerPassword(datos.password);
  const lugarTrabajo = leerTextoOpcional(
    datos.lugar_trabajo,
    150,
    "lugar_trabajo",
    "El lugar de trabajo no es válido",
  );
  const tipoContacto = leerTextoOpcional(
    datos.tipo_contacto,
    20,
    "tipo_contacto",
    "El tipo de contacto no es válido",
  );
  if (tipoContacto && !TIPOS_CONTACTO.includes(tipoContacto)) {
    throw new ErrorRegistro(
      400,
      "El tipo de contacto no es válido",
      "tipo_contacto",
    );
  }

  const passwordHash = await hashPassword(password);

  return conRegistro(telefono, email, async (c) => {
    await comprobarLibres(c, telefono, email);
    const id = await crearUsuario(c, {
      rol: "cliente",
      nombre,
      telefono,
      email,
      passwordHash,
      extra: { lugar_trabajo: lugarTrabajo, tipo_contacto: tipoContacto },
    });
    return { ok: true as const, usuario_id: id, rol: "cliente" as const };
  });
}

// ===== Códigos de invitación =====

function leerRol(valor: unknown): RolAcceso {
  if (valor === "repartidor") return "repartidor";
  if (valor === "admin" || valor === "administrador") return "admin";
  throw new ErrorRegistro(400, "Elige un tipo de cuenta válido", "rol");
}

const nombreRol = (rol: RolAcceso) =>
  rol === "repartidor" ? "repartidor" : "administrador de restaurante";

interface FilaCodigo {
  id: number;
  rol: RolAcceso;
  usado_en: unknown;
  revocado_en: unknown;
  expira_en: unknown;
  caducado: number;
}

// Busca el código y comprueba que sirve para este tipo de cuenta. Con bloqueo, para que dos registros no lo usen a la vez.
async function buscarCodigo(
  c: { query: PoolConnection["query"] },
  rol: RolAcceso,
  codigoNormalizado: string,
  bloquear: boolean,
): Promise<FilaCodigo> {
  const [rows]: any = await c.query(
    `SELECT id, rol, usado_en, revocado_en, expira_en, (expira_en <= NOW()) AS caducado
     FROM codigos_invitacion WHERE codigo_hash = ?${bloquear ? " FOR UPDATE" : ""}`,
    [hashCodigo(codigoNormalizado)],
  );

  if (rows.length === 0)
    throw new ErrorRegistro(
      404,
      "Ese código no existe. Revisa que esté bien escrito.",
      "codigo",
    );
  const fila: FilaCodigo = rows[0];

  if (fila.rol !== rol)
    throw new ErrorRegistro(
      400,
      `Este código no sirve para una cuenta de ${nombreRol(rol)}.`,
      "codigo",
    );
  if (fila.revocado_en)
    throw new ErrorRegistro(
      410,
      "Este código fue anulado. Pide uno nuevo.",
      "codigo",
    );
  if (fila.usado_en)
    throw new ErrorRegistro(
      410,
      "Este código ya se usó. Cada código sirve una sola vez.",
      "codigo",
    );
  if (fila.caducado)
    throw new ErrorRegistro(
      410,
      "Este código caducó. Pide uno nuevo.",
      "codigo",
    );
  return fila;
}

// Para decirle al usuario, antes de rellenar nada, si su código vale
export async function verificarCodigo(rol: unknown, codigo: unknown) {
  await buscarCodigo(db, leerRol(rol), leerCodigo(codigo), false);
  return { valido: true as const };
}

interface DatosAcceso {
  nombre: string;
  telefono: string;
  email: string | null;
  tipoVehiculo: string | null;
  nombreRestaurante: string | null;
  direccionRestaurante: string | null;
}

// Lo que se pide según el tipo de cuenta (en el alta con código y en la solicitud es lo mismo)
function leerDatosAcceso(
  rol: RolAcceso,
  datos: Record<string, unknown>,
): DatosAcceso {
  const base = {
    nombre: leerNombre(datos.nombre),
    telefono: normalizarTelefono(datos.telefono),
    email: leerEmailOpcional(datos.email),
  };

  if (rol === "repartidor") {
    return {
      ...base,
      tipoVehiculo: leerTextoOpcional(
        datos.tipo_vehiculo,
        60,
        "tipo_vehiculo",
        "El tipo de vehículo no es válido",
      ),
      nombreRestaurante: null,
      direccionRestaurante: null,
    };
  }
  return {
    ...base,
    tipoVehiculo: null,
    nombreRestaurante: leerTexto(
      datos.nombre_restaurante,
      2,
      150,
      "nombre_restaurante",
      "Escribe el nombre del restaurante",
    ),
    direccionRestaurante: leerTexto(
      datos.direccion_restaurante,
      5,
      255,
      "direccion_restaurante",
      "Escribe la dirección del restaurante",
    ),
  };
}

// Crea la cuenta (y el restaurante, si es administrador)
async function crearCuentaDeAcceso(
  c: PoolConnection,
  rol: RolAcceso,
  d: DatosAcceso,
  passwordHash: string,
) {
  const id = await crearUsuario(c, {
    rol,
    nombre: d.nombre,
    telefono: d.telefono,
    email: d.email,
    passwordHash,
    extra: { vehiculo: d.tipoVehiculo },
  });
  if (rol === "admin")
    await crearRestaurante(
      c,
      id,
      d.nombreRestaurante!,
      d.direccionRestaurante!,
      d.telefono,
    );
  return id;
}

// ===== Con código de invitación: la cuenta queda activa, sin aprobación =====

export async function registrarConCodigo(
  rolEntrada: unknown,
  entrada: unknown,
) {
  const datos = objeto(entrada);
  const rol = leerRol(rolEntrada);
  const codigo = leerCodigo(datos.codigo);
  const d = leerDatosAcceso(rol, datos);
  const passwordHash = await hashPassword(leerPassword(datos.password));

  return conRegistro(d.telefono, d.email, async (c) => {
    const fila = await buscarCodigo(c, rol, codigo, true);
    await comprobarLibres(c, d.telefono, d.email);
    const id = await crearCuentaDeAcceso(c, rol, d, passwordHash);

    // El código se gasta en el mismo paso que se crea la cuenta: o pasan las dos cosas, o ninguna
    const [uso]: any = await c.query(
      `UPDATE codigos_invitacion SET usado_en = NOW(), usado_por = ?
       WHERE id = ? AND usado_en IS NULL AND revocado_en IS NULL AND expira_en > NOW()`,
      [id, fila.id],
    );
    if (uso.affectedRows !== 1)
      throw new ErrorRegistro(410, "Este código ya no es válido.", "codigo");

    return { ok: true as const, usuario_id: id, rol };
  });
}

// 2) Reemplaza la función crearSolicitud completa
export async function crearSolicitud(rolEntrada: unknown, entrada: unknown) {
  const datos = objeto(entrada);
  const rol = leerRol(rolEntrada);
  const d = leerDatosAcceso(rol, datos);

  return conRegistro(d.telefono, d.email, async (c) => {
    const [usuario]: any = await c.query(
      `SELECT id FROM usuarios WHERE ${TELEFONO_EN_BD} = ? LIMIT 1`,
      [sinMas(d.telefono)],
    );
    if (usuario.length > 0)
      throw new ErrorRegistro(
        409,
        "Ya existe una cuenta con ese teléfono. Inicia sesión.",
        "telefono",
      );

    const [enCurso]: any = await c.query(
      `SELECT estado FROM solicitudes_acceso
       WHERE rol = ? AND TRIM(LEADING '+' FROM telefono) = ? AND estado IN ('pendiente', 'aprobada') LIMIT 1`,
      [rol, sinMas(d.telefono)],
    );
    if (enCurso.length > 0) {
      throw new ErrorRegistro(
        409,
        enCurso[0].estado === "aprobada"
          ? "Tu solicitud ya fue aprobada. Si perdiste el enlace, pídele uno nuevo al equipo."
          : "Ya tienes una solicitud en revisión. Te avisaremos cuando se resuelva.",
        "telefono",
      );
    }

    const seguimiento = generarSeguimiento();
    try {
      await c.query(
        `INSERT INTO solicitudes_acceso (rol, nombre, telefono, email, tipo_vehiculo, nombre_restaurante, direccion_restaurante, seguimiento)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rol,
          d.nombre,
          d.telefono,
          d.email,
          d.tipoVehiculo,
          d.nombreRestaurante,
          d.direccionRestaurante,
          seguimiento,
        ],
      );
    } catch (error: any) {
      // Red de seguridad: la base de datos tampoco admite dos solicitudes en curso del mismo teléfono
      if (error.code === "ER_DUP_ENTRY")
        throw new ErrorRegistro(
          409,
          "Ya tienes una solicitud en curso.",
          "telefono",
        );
      throw error;
    }
    return {
      ok: true as const,
      rol,
      seguimiento: formatearSeguimiento(seguimiento),
    };
  });
}

// ===== Enlace personal que recibe quien fue aprobado =====

const ENLACE_INVALIDO =
  "Este enlace no es válido o ya caducó. Pide uno nuevo al equipo.";

interface FilaSolicitud {
  id: number;
  rol: RolAcceso;
  nombre: string;
  telefono: string;
  email: string | null;
  tipo_vehiculo: string | null;
  nombre_restaurante: string | null;
  direccion_restaurante: string | null;
}

async function solicitudDelEnlace(
  c: { query: PoolConnection["query"] },
  token: unknown,
  bloquear: boolean,
): Promise<FilaSolicitud> {
  // Mismo mensaje para todo lo que falle (enlace inventado, caducado, ya usado...): no se da pistas
  if (!formatoTokenValido(token)) throw new ErrorRegistro(404, ENLACE_INVALIDO);

  const [rows]: any = await c.query(
    `SELECT id, rol, nombre, telefono, email, tipo_vehiculo, nombre_restaurante, direccion_restaurante
     FROM solicitudes_acceso
     WHERE enlace_hash = ? AND estado = 'aprobada' AND enlace_expira_en > NOW()${bloquear ? " FOR UPDATE" : ""}`,
    [hashToken(token)],
  );
  if (rows.length === 0) throw new ErrorRegistro(404, ENLACE_INVALIDO);
  return rows[0];
}

// Lo que se enseña al abrir el enlace: sus datos, para que los confirme
export async function consultarEnlace(token: unknown) {
  const s = await solicitudDelEnlace(db, token, false);
  return {
    rol: s.rol,
    nombre: s.nombre,
    telefono: telefonoEnmascarado(s.telefono),
    email: s.email,
    tipo_vehiculo: s.tipo_vehiculo,
    nombre_restaurante: s.nombre_restaurante,
    direccion_restaurante: s.direccion_restaurante,
  };
}

export async function completarConEnlace(token: unknown, entrada: unknown) {
  const datos = objeto(entrada);
  const previa = await solicitudDelEnlace(db, token, false);
  const rol = previa.rol;

  // Los datos de la solicitud son la base: solo cambia lo que la persona corrija
  const base: Record<string, unknown> = {
    nombre: previa.nombre,
    email: previa.email,
    tipo_vehiculo: previa.tipo_vehiculo,
    nombre_restaurante: previa.nombre_restaurante,
    direccion_restaurante: previa.direccion_restaurante,
  };
  for (const clave of Object.keys(base))
    if (datos[clave] !== undefined) base[clave] = datos[clave];

  // El teléfono no se puede cambiar: es el que aprobó el equipo
  const d = leerDatosAcceso(rol, { ...base, telefono: previa.telefono });
  const passwordHash = await hashPassword(leerPassword(datos.password));

  return conRegistro(d.telefono, d.email, async (c) => {
    const s = await solicitudDelEnlace(c, token, true); // se vuelve a comprobar ya con bloqueo
    await comprobarLibres(c, d.telefono, d.email);
    const id = await crearCuentaDeAcceso(c, rol, d, passwordHash);

    // El enlace se gasta aquí: no puede usarse una segunda vez
    const [fin]: any = await c.query(
      `UPDATE solicitudes_acceso SET estado = 'completada', usuario_id = ?, enlace_hash = NULL, fecha_completada = NOW()
       WHERE id = ? AND estado = 'aprobada'`,
      [id, s.id],
    );
    if (fin.affectedRows !== 1) throw new ErrorRegistro(404, ENLACE_INVALIDO);

    return { ok: true as const, usuario_id: id, rol };
  });
}

// 3) Función nueva, al final del archivo
// ===== Consultar cómo va mi solicitud (la persona aún no tiene cuenta) =====

export async function consultarSolicitud(
  telefonoEntrada: unknown,
  seguimientoEntrada: unknown,
) {
  const telefono = normalizarTelefono(telefonoEntrada);
  const seguimiento = leerSeguimiento(seguimientoEntrada);

  const [rows]: any = await db.query(
    `SELECT rol, estado, motivo_rechazo, fecha_creacion, fecha_revision,
            (estado = 'aprobada' AND enlace_expira_en <= NOW()) AS enlace_caducado
     FROM solicitudes_acceso
     WHERE seguimiento = ? AND TRIM(LEADING '+' FROM telefono) = ? LIMIT 1`,
    [seguimiento, sinMas(telefono)],
  );

  // Si el teléfono o el código no coinciden, el mismo mensaje: no se revela cuál de los dos falló
  if (rows.length === 0) {
    throw new ErrorRegistro(
      404,
      "No encontramos ninguna solicitud con esos datos. Revisa el teléfono y el código de seguimiento.",
    );
  }

  const r = rows[0];
  // Solo lo necesario para que la persona sepa cómo va: nada de su nombre, correo ni enlace
  return {
    rol: r.rol as RolAcceso,
    estado: r.estado as "pendiente" | "aprobada" | "completada" | "rechazada",
    enlace_caducado: !!r.enlace_caducado,
    motivo_rechazo:
      r.estado === "rechazada" ? (r.motivo_rechazo as string | null) : null,
    fecha_creacion: new Date(r.fecha_creacion).toISOString(),
    fecha_revision: r.fecha_revision
      ? new Date(r.fecha_revision).toISOString()
      : null,
  };
}

import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";

// Sin caracteres que se confunden al leerlos o dictarlos (0/O, 1/I)
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TIENE_CONTROL = /[\u0000-\u001F\u007F]/;

export class ErrorRegistro extends Error {
  estado: number;
  campo?: string;

  constructor(estado: number, mensaje: string, campo?: string) {
    super(mensaje);
    this.estado = estado;
    this.campo = campo;
  }
}

// ===== Validación de lo que escribe el usuario =====

export function leerTexto(
  valor: unknown,
  min: number,
  max: number,
  campo: string,
  mensaje: string,
): string {
  const texto = typeof valor === "string" ? valor.trim() : "";
  if (texto.length < min || texto.length > max || TIENE_CONTROL.test(texto))
    throw new ErrorRegistro(400, mensaje, campo);
  return texto;
}

export function leerTextoOpcional(
  valor: unknown,
  max: number,
  campo: string,
  mensaje: string,
): string | null {
  if (valor === undefined || valor === null || valor === "") return null;
  if (typeof valor !== "string") throw new ErrorRegistro(400, mensaje, campo);
  const texto = valor.trim();
  if (texto === "") return null;
  if (texto.length > max || TIENE_CONTROL.test(texto))
    throw new ErrorRegistro(400, mensaje, campo);
  return texto;
}

export const leerNombre = (valor: unknown) =>
  leerTexto(
    valor,
    2,
    120,
    "nombre",
    "Escribe tu nombre completo (entre 2 y 120 caracteres)",
  );

// Sin espacios ni guiones ni paréntesis; con "+" opcional al principio y entre 7 y 15 cifras
export function normalizarTelefono(valor: unknown): string {
  if (typeof valor !== "string")
    throw new ErrorRegistro(400, "Introduce tu teléfono móvil", "telefono");
  const limpio = valor.replace(/[\s\-().]/g, "");
  if (!/^\+?\d{7,15}$/.test(limpio)) {
    throw new ErrorRegistro(
      400,
      "El teléfono no es válido. Usa solo números, con el prefijo del país si lo tienes (por ejemplo +240...)",
      "telefono",
    );
  }
  return limpio;
}

export function leerEmailOpcional(valor: unknown): string | null {
  if (valor === undefined || valor === null || valor === "") return null;
  if (typeof valor !== "string")
    throw new ErrorRegistro(400, "El correo no es válido", "email");
  const email = valor.trim().toLowerCase();
  if (email === "") return null;
  if (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ErrorRegistro(400, "El correo no es válido", "email");
  return email;
}

export function leerPassword(valor: unknown): string {
  if (typeof valor !== "string" || valor.length < 8) {
    throw new ErrorRegistro(
      400,
      "La contraseña debe tener al menos 8 caracteres",
      "password",
    );
  }
  // bcrypt solo lee los primeros 72 bytes: más allá, dos contraseñas distintas valdrían lo mismo
  if (Buffer.byteLength(valor, "utf8") > 72)
    throw new ErrorRegistro(
      400,
      "La contraseña es demasiado larga",
      "password",
    );
  return valor;
}

// ===== Códigos de invitación y enlaces =====

function secreto() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("Falta JWT_SECRET en el .env");
  return s;
}

// XXXX-XXXX-XXXX: 12 caracteres de un alfabeto de 32 símbolos, 60 bits al azar
export function generarCodigoInvitacion(): string {
  let c = "";
  for (let i = 0; i < 12; i++) c += ALFABETO[randomInt(ALFABETO.length)];
  return `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8)}`;
}

export const normalizarCodigo = (texto: string) =>
  texto.toUpperCase().replace(/[^A-Z0-9]/g, "");

export function leerCodigo(valor: unknown): string {
  const c = typeof valor === "string" ? normalizarCodigo(valor) : "";
  if (c.length !== 12)
    throw new ErrorRegistro(
      400,
      "El código no es válido. Revisa que esté bien escrito.",
      "codigo",
    );
  return c;
}

// El código no se guarda: solo este resumen. Si se filtrara la base de datos, no serviría para registrarse.
export const hashCodigo = (codigoNormalizado: string) =>
  createHmac("sha256", secreto())
    .update(`invitacion:${codigoNormalizado}`)
    .digest("hex");

// 32 bytes al azar: imposible de adivinar. Tampoco se guarda: solo su resumen.
export const generarTokenEnlace = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const formatoTokenValido = (token: unknown): token is string =>
  typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);

// Para confirmar la identidad sin enseñar el número entero: ***456
export const telefonoEnmascarado = (telefono: string) =>
  `***${telefono.slice(-3)}`;

// ===== Código de seguimiento de una solicitud =====
// Se le da a la persona al enviar su solicitud: con su teléfono y este código puede ver cómo va, sin cuenta.
// Así, saber un teléfono no basta para husmear el estado de la solicitud de otra persona.

export function generarSeguimiento(): string {
  let c = "";
  for (let i = 0; i < 8; i++) c += ALFABETO[randomInt(ALFABETO.length)];
  return c;
}

export const formatearSeguimiento = (c: string) =>
  `${c.slice(0, 4)}-${c.slice(4)}`;

export function leerSeguimiento(valor: unknown): string {
  const c = typeof valor === "string" ? normalizarCodigo(valor) : "";
  if (!/^[A-HJ-NP-Z2-9]{8}$/.test(c))
    throw new ErrorRegistro(
      400,
      "El código de seguimiento no es válido. Revisa que esté bien escrito.",
      "seguimiento",
    );
  return c;
}

// Única fuente de verdad de los planes: el servidor decide cuánto cuesta cada uno
export const PLANES = {
  semanal: { nombre: "Plan semanal", precio: 5000, dias: 7 },
  mensual: { nombre: "Plan mensual", precio: 20000, dias: 30 },
} as const;

export type Plan = keyof typeof PLANES;

export const esPlan = (valor: unknown): valor is Plan =>
  typeof valor === "string" &&
  Object.prototype.hasOwnProperty.call(PLANES, valor);

export const BLOQUEAR_SIN_SUSCRIPCION = true;

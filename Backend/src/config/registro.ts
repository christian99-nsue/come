// Cuánto dura cada cosa
export const VALIDEZ_ENLACE_HORAS = 72;
export const VALIDEZ_CODIGO_DIAS = [1, 3, 7, 30] as const;

// Dónde está la app: el enlace personal apunta aquí. La app usa HashRouter, así que el enlace lleva "/#/".
export const URL_APP = (
  process.env.CLIENT_APP_URL || "http://localhost:5173"
).replace(/\/+$/, "");

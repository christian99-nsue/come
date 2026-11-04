export type RolUrl = "repartidor" | "administrador";

export const rolDeUrl = (valor: string | undefined): RolUrl | null =>
  valor === "repartidor" || valor === "administrador" ? valor : null;

// En la dirección de la app el rol es "administrador"; el servidor lo llama "admin"
export const rolApi = (rol: RolUrl) =>
  rol === "administrador" ? "admin" : "repartidor";
export const rolDesdeApi = (rol: string): RolUrl =>
  rol === "admin" ? "administrador" : "repartidor";

export const nombreRol: Record<RolUrl, string> = {
  repartidor: "repartidor",
  administrador: "administrador de restaurante",
};

// Las mismas reglas que el servidor (el servidor es quien manda; esto solo evita viajes inútiles)
export const telefonoValido = (v: string) =>
  /^\+?\d{7,15}$/.test(v.replace(/[\s\-().]/g, ""));
export const emailValido = (v: string) =>
  v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const passwordValida = (v: string) =>
  v.length >= 8 && new TextEncoder().encode(v).length <= 72;

// Lo que el servidor contesta cuando algo falla: un mensaje, y a veces el campo al que se refiere
export function errorDeApi(err: unknown): {
  mensaje: string;
  campo?: string;
  estado?: number;
} {
  const e = err as {
    response?: { status?: number; data?: { message?: string; campo?: string } };
    request?: unknown;
  };
  if (e?.response?.data?.message)
    return {
      mensaje: e.response.data.message,
      campo: e.response.data.campo,
      estado: e.response.status,
    };
  if (e?.request && !e.response)
    return {
      mensaje:
        "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
    };
  return {
    mensaje: "No se pudo completar la operación. Inténtalo de nuevo.",
    estado: e?.response?.status,
  };
}

// La solicitud enviada se recuerda en este dispositivo, para poder consultarla sin volver a escribir los datos
export interface SolicitudGuardada {
  telefono: string;
  seguimiento: string;
  rol: RolUrl;
}

const CLAVE = "solicitud_acceso";

export function guardarSolicitud(s: SolicitudGuardada) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(s));
  } catch {
    /* si el navegador no deja guardar, no pasa nada: la persona tiene su código en pantalla */
  }
}

export function leerSolicitudGuardada(): SolicitudGuardada | null {
  try {
    const crudo = JSON.parse(localStorage.getItem(CLAVE) || "null");
    if (
      crudo &&
      typeof crudo.telefono === "string" &&
      typeof crudo.seguimiento === "string" &&
      rolDeUrl(crudo.rol)
    )
      return crudo;
  } catch {
    /* dato dañado: se ignora */
  }
  return null;
}

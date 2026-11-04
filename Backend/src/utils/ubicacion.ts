// Un error con el código HTTP que le corresponde y un mensaje que se puede enseñar tal cual
export class ErrorCarga extends Error {
  estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.estado = estado;
  }
}

export interface Punto {
  lat: number;
  lng: number;
}

const esNumero = (v: unknown) =>
  typeof v === "number"
    ? Number.isFinite(v)
    : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v));

const vacio = (v: unknown) => v === undefined || v === null || v === "";

// Una ubicación (latitud y longitud) que llega de fuera. Sin ubicación → null. A medias o inventada → error.
export function leerUbicacion(lat: unknown, lng: unknown): Punto | null {
  if (vacio(lat) && vacio(lng)) return null;
  if (!esNumero(lat) || !esNumero(lng))
    throw new ErrorCarga(400, "La ubicación no es válida");

  const a = Number(lat);
  const b = Number(lng);
  if (a < -90 || a > 90 || b < -180 || b > 180)
    throw new ErrorCarga(400, "La ubicación no es válida");
  // (0, 0) es lo que devuelven muchos teléfonos cuando no saben dónde están: no es un lugar real
  if (a === 0 && b === 0)
    throw new ErrorCarga(400, "La ubicación no es válida");

  return { lat: Math.round(a * 1e6) / 1e6, lng: Math.round(b * 1e6) / 1e6 };
}

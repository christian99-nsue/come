export interface Ubicacion {
  lat: number;
  lng: number;
  precision?: number; // metros de margen de error que dice el teléfono
}

export type MotivoError = "denegado" | "tiempo" | "no_disponible";

export class ErrorUbicacion extends Error {
  motivo: MotivoError;
  constructor(motivo: MotivoError) {
    super(motivo);
    this.motivo = motivo;
  }
}

export const mensajeDeError: Record<MotivoError, string> = {
  denegado:
    "No tenemos permiso para ver tu ubicación. Actívalo en los ajustes del navegador y vuelve a intentarlo.",
  tiempo:
    "No se pudo obtener tu ubicación a tiempo. Comprueba que el GPS esté activado y vuelve a intentarlo.",
  no_disponible: "Tu dispositivo o navegador no permite obtener la ubicación.",
};

// Pide al teléfono dónde está. Solo funciona con la página en https (o en localhost) y si la persona da permiso.
export function pedirPosicion(): Promise<Ubicacion> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation)
      return reject(new ErrorUbicacion("no_disponible"));

    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          precision: Math.round(p.coords.accuracy),
        }),
      (e) =>
        reject(
          new ErrorUbicacion(
            e.code === 1
              ? "denegado"
              : e.code === 3
                ? "tiempo"
                : "no_disponible",
          ),
        ),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  });
}

export const enlaceMapa = (u: { lat: number; lng: number }) =>
  `https://www.google.com/maps?q=${u.lat},${u.lng}`;
export const textoCoordenadas = (u: { lat: number; lng: number }) =>
  `${u.lat.toFixed(6)}, ${u.lng.toFixed(6)}`;

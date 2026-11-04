// Lo que el servidor manda por cada ventana a la que todavía se puede pedir
export interface VentanaOpcion {
  ventana_id: number;
  fecha: string; // AAAA-MM-DD
  inicio: string; // HH:MM
  fin: string;
  cierre: string; // AAAA-MM-DD HH:MM:SS: hasta cuándo se aceptan pedidos
  cierre_hora: string; // HH:MM
  cierra_en_min: number;
  etiqueta_dia: string; // "Hoy", "Mañana", "jue, 23 oct"
}

const numeroDeDia = (fecha: string) => {
  const [a, m, d] = fecha.split("-").map(Number);
  return Math.floor(Date.UTC(a, m - 1, d) / 86400000);
};

// "hoy", "mañana" o "el 23/10", comparando con el día de la plataforma (no el del teléfono)
export function diaRelativo(fecha: string, hoy: string | null): string {
  if (!hoy) return `el ${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`;
  const diferencia = numeroDeDia(fecha) - numeroDeDia(hoy);
  if (diferencia === 0) return "hoy";
  if (diferencia === 1) return "mañana";
  if (diferencia === -1) return "ayer";
  return `el ${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`;
}

// Hasta cuándo se puede pedir para esa ventana, dicho de forma que no deje dudas
export function textoCierre(v: VentanaOpcion, hoy: string | null) {
  const dia = diaRelativo(v.cierre.slice(0, 10), hoy);
  return dia === "hoy"
    ? `Pide antes de las ${v.cierre_hora}`
    : `Puedes pedir hasta las ${v.cierre_hora} (${dia})`;
}

export const cierraPronto = (v: VentanaOpcion) => v.cierra_en_min <= 60;
export const textoCierraEn = (v: VentanaOpcion) =>
  `cierra en ${Math.max(v.cierra_en_min, 1)} min`;

export type TipoBanner = "sin_ventanas" | "hoy" | "otro_dia";

// El mensaje principal de la franja que se muestra antes de pedir
export function mensajeBanner(
  ventanas: VentanaOpcion[],
  hoy: string | null,
): { tipo: TipoBanner; titulo: string; detalle: string } {
  if (ventanas.length === 0) {
    return {
      tipo: "sin_ventanas",
      titulo: "Por ahora no hay ventanas de entrega",
      detalle:
        "No se pueden hacer pedidos en este momento. Vuelve a intentarlo más tarde.",
    };
  }

  const v = ventanas[0];
  const rango = `${v.inicio}–${v.fin}`;

  if (v.etiqueta_dia === "Hoy") {
    return {
      tipo: "hoy",
      titulo: `Próxima entrega: hoy, ${rango}`,
      detalle:
        textoCierre(v, hoy) + (cierraPronto(v) ? ` · ${textoCierraEn(v)}` : ""),
    };
  }

  return {
    tipo: "otro_dia",
    titulo: "Las entregas de hoy ya cerraron",
    detalle: `Próxima entrega: ${v.etiqueta_dia.toLowerCase()}, ${rango}. ${textoCierre(v, hoy)}.`,
  };
}

export const nombreCategoria: Record<string, string> = {
  pedido: "Un pedido o una entrega",
  app: "La aplicación",
  cuenta: "Mi cuenta",
  otro: "Otro",
};

// Cómo se le llama a cada estado al usuario
export const etiquetaEstado: Record<string, { texto: string; clase: string }> =
  {
    abierto: { texto: "Recibido", clase: "recibido" },
    en_revision: { texto: "En revisión", clase: "revision" },
    resuelto: { texto: "Resuelto", clase: "resuelto" },
  };

export function tiempoRelativo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "Ahora mismo";
  if (min < 60) return `Hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? "Hace 1 día" : `Hace ${dias} días`;
}

export const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

// Los cambios de estado se guardan como "Abierto → En revisión": al usuario le interesa a dónde pasó
const nombreDestino: Record<string, string> = {
  Abierto: "Recibido",
  "En revisión": "En revisión",
  Resuelto: "Resuelto",
};

export function destinoEstado(mensaje: string) {
  const destino = mensaje.split("→").pop()?.trim() ?? mensaje;
  return nombreDestino[destino] ?? destino;
}

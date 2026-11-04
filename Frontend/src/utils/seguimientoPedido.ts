export type EstadoPedido =
  | "nuevo"
  | "en_preparacion"
  | "listo_para_recoger"
  | "en_entrega"
  | "entregado"
  | "cancelado"
  | "rechazado";

export const ESTADOS_ACTIVOS: EstadoPedido[] = [
  "nuevo",
  "en_preparacion",
  "listo_para_recoger",
  "en_entrega",
];

// ===== Barra compacta de las tarjetas de la lista =====
export const pasosCompactos = [
  "Confirmado",
  "Preparando",
  "En camino",
  "Entregado",
];

// Cuántos pasos ya están cumplidos. El siguiente es el que está en curso.
export function completadosCompacto(estado: EstadoPedido) {
  switch (estado) {
    case "en_preparacion":
      return 1;
    case "listo_para_recoger":
    case "en_entrega":
      return 2;
    case "entregado":
      return 4;
    default:
      return 0;
  }
}

export function mensajeEstado(
  estado: EstadoPedido,
  repartidorNombre?: string | null,
) {
  switch (estado) {
    case "nuevo":
      return "Esperando que el restaurante confirme tu pedido";
    case "en_preparacion":
      return "El restaurante está preparando tu pedido";
    case "listo_para_recoger":
      return repartidorNombre
        ? `${repartidorNombre} va a recoger tu pedido`
        : "Tu pedido está listo. Buscando un repartidor";
    case "en_entrega":
      return repartidorNombre
        ? `${repartidorNombre} lleva tu pedido`
        : "Tu pedido va en camino";
    case "entregado":
      return "Pedido entregado";
    case "rechazado":
      return "El restaurante no pudo aceptar este pedido";
    default:
      return "Pedido cancelado";
  }
}

// ===== Línea de tiempo de la pantalla de seguimiento =====
export const pasosDetalle = [
  { clave: "creado", hecho: "Pedido enviado", pendiente: "Pedido enviado" },
  {
    clave: "aceptado",
    hecho: "El restaurante confirmó tu pedido",
    pendiente: "Confirmación del restaurante",
  },
  {
    clave: "listo",
    hecho: "Tu pedido está preparado",
    pendiente: "Preparación del pedido",
  },
  {
    clave: "asignado",
    hecho: "Repartidor asignado",
    pendiente: "Asignación de un repartidor",
  },
  {
    clave: "recogido",
    hecho: "Tu pedido salió hacia tu dirección",
    pendiente: "Recogida por el repartidor",
  },
  {
    clave: "entregado",
    hecho: "Pedido entregado",
    pendiente: "Entrega en tu dirección",
  },
];

// Último paso cumplido. Se deduce del estado y de los eventos guardados, así un
// pedido anterior al registro de eventos también se dibuja bien (solo sin hora).
export function ultimoPasoDetalle(
  estado: EstadoPedido,
  tieneRepartidor: boolean,
  eventos: Record<string, string>,
) {
  let ultimo = 0;
  if (estado === "en_preparacion") ultimo = 1;
  else if (estado === "listo_para_recoger") ultimo = tieneRepartidor ? 3 : 2;
  else if (estado === "en_entrega") ultimo = 4;
  else if (estado === "entregado") ultimo = 5;

  pasosDetalle.forEach((paso, i) => {
    if (eventos[paso.clave] && i > ultimo) ultimo = i;
  });
  return ultimo;
}

// "Hoy, 10:30" · "Ayer, 20:15" · "15 jul, 20:15"
export function formatFechaHora(iso: string) {
  const fecha = new Date(iso);
  const hora = fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dia = new Date(fecha);
  dia.setHours(0, 0, 0, 0);

  const diff = Math.round((hoy.getTime() - dia.getTime()) / 86400000);
  if (diff === 0) return `Hoy, ${hora}`;
  if (diff === 1) return `Ayer, ${hora}`;
  return `${fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}, ${hora}`;
}

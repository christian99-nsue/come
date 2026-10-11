import { db } from "../../config/db";

export type EventoPedido =
  | "aceptado"
  | "listo"
  | "asignado"
  | "recogido"
  | "entregado"
  | "rechazado"
  | "cancelado";

// Una falla al guardar el evento no debe romper el cambio de estado ya hecho
export const registrarEvento = async (
  pedidoId: number,
  evento: EventoPedido,
) => {
  try {
    await db.query(
      "INSERT INTO pedido_eventos (pedido_id, evento) VALUES (?, ?)",
      [pedidoId, evento],
    );
  } catch (error) {
    console.error(
      `No se pudo registrar el evento "${evento}" del pedido ${pedidoId}:`,
      error,
    );
  }
};

import { db } from "../../config/db";
import { notificarNuevoPedido } from "../repartidor/notificacionesRepartidorService";
import { registrarEvento } from "../repartidor/eventosPedidoService";

// ===== Listar pedidos de un restaurante, con filtro opcional por estado =====
export const listarPedidos = async (
  restauranteId: number,
  filtro?:
    | "nuevo"
    | "en_preparacion"
    | "listo_para_recoger"
    | "en_entrega"
    | "entregado"
    | "cancelado",
) => {
  let sql = `
    SELECT p.id, p.codigo, p.estado, p.total, p.fecha_creacion,
           u.nombre AS cliente_nombre
    FROM pedidos p
    JOIN usuarios u ON u.id = p.cliente_id
    WHERE p.restaurante_id = ?
  `;
  const params: any[] = [restauranteId];

  if (filtro) {
    sql += " AND p.estado = ?";
    params.push(filtro);
  }

  sql += " ORDER BY p.fecha_creacion DESC";

  const [rows]: any = await db.query(sql, params);
  return rows;
};

// ===== Detalle completo de un pedido (con sus productos) =====
export const obtenerDetallePedido = async (
  pedidoId: number,
  restauranteId: number,
) => {
  const [pedidoRows]: any = await db.query(
    `
    SELECT p.*, u.nombre AS cliente_nombre, u.telefono AS cliente_telefono
    FROM pedidos p
    JOIN usuarios u ON u.id = p.cliente_id
    WHERE p.id = ? AND p.restaurante_id = ?
    `,
    [pedidoId, restauranteId],
  );

  if (pedidoRows.length === 0) {
    throw new Error("Pedido no encontrado");
  }

  const [itemsRows]: any = await db.query(
    `SELECT nombre_plato, cantidad, precio_unitario FROM pedido_items WHERE pedido_id = ?`,
    [pedidoId],
  );

  return { ...pedidoRows[0], items: itemsRows };
};

export const aceptarPedido = async (
  pedidoId: number,
  restauranteId: number,
) => {
  const [result]: any = await db.query(
    `UPDATE pedidos SET estado = 'en_preparacion'
     WHERE id = ? AND restaurante_id = ? AND estado = 'nuevo'`,
    [pedidoId, restauranteId],
  );

  if (result.affectedRows === 0) {
    throw new Error(
      "No se pudo aceptar el pedido (ya fue procesado o no existe)",
    );
  }

  await registrarEvento(pedidoId, "aceptado");
  return { ok: true };
};

export const rechazarPedido = async (
  pedidoId: number,
  restauranteId: number,
  motivo: string,
) => {
  const [result]: any = await db.query(
    `UPDATE pedidos SET estado = 'rechazado', motivo_rechazo = ?
     WHERE id = ? AND restaurante_id = ? AND estado = 'nuevo'`,
    [motivo, pedidoId, restauranteId],
  );

  if (result.affectedRows === 0) {
    throw new Error("No se pudo rechazar el pedido");
  }

  await registrarEvento(pedidoId, "rechazado");
  return { ok: true };
};

export const cambiarEstadoPedido = async (
  pedidoId: number,
  restauranteId: number,
  nuevoEstado: string,
) => {
  // El restaurante solo puede pasar un pedido de "en preparación" a "listo para recoger"
  if (nuevoEstado !== "listo_para_recoger") {
    throw new Error("Estado no permitido");
  }

  const [result]: any = await db.query(
    `UPDATE pedidos SET estado = 'listo_para_recoger'
     WHERE id = ? AND restaurante_id = ? AND estado = 'en_preparacion'`,
    [pedidoId, restauranteId],
  );

  if (result.affectedRows === 0) {
    throw new Error("No se pudo actualizar el estado del pedido");
  }

  await registrarEvento(pedidoId, "listo");

  // Avisa a los repartidores disponibles; si falla, el cambio de estado ya está hecho
  try {
    await notificarNuevoPedido(pedidoId);
  } catch (error) {
    console.error("No se pudo notificar a los repartidores:", error);
  }

  return { ok: true };
};

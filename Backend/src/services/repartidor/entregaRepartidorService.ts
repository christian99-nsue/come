import { db } from "../../config/db";
import { notificarEntregaRegistrada } from "./notificacionesRepartidorService";
import { registrarEvento } from "./eventosPedidoService";

const num = (v: any) => (v === null || v === undefined ? null : Number(v));

export const obtenerEntregaActual = async (repartidorId: number) => {
  const [rows]: any = await db.query(
    `SELECT p.id, p.codigo, p.estado, p.direccion_entrega,
            p.latitud_entrega, p.longitud_entrega,
            r.nombre AS restaurante_nombre, r.direccion AS restaurante_direccion,
            r.latitud AS restaurante_lat, r.longitud AS restaurante_lng,
            u.nombre AS cliente_nombre, u.telefono AS cliente_telefono
     FROM pedidos p
     JOIN restaurantes r ON r.id = p.restaurante_id
     JOIN usuarios u ON u.id = p.cliente_id
     WHERE p.repartidor_id = ?
       AND p.estado IN ('listo_para_recoger', 'en_entrega')
     ORDER BY p.fecha_actualizacion DESC
     LIMIT 1`,
    [repartidorId],
  );

  // null = el repartidor no tiene ninguna entrega activa
  if (rows.length === 0) return null;

  const p = rows[0];

  return {
    id: p.id,
    codigo: p.codigo,
    estado: p.estado as "listo_para_recoger" | "en_entrega",
    restaurante_nombre: p.restaurante_nombre,
    restaurante_direccion: p.restaurante_direccion,
    restaurante_lat: num(p.restaurante_lat),
    restaurante_lng: num(p.restaurante_lng),
    cliente_nombre: p.cliente_nombre,
    cliente_telefono: p.cliente_telefono,
    direccion_entrega: p.direccion_entrega,
    entrega_lat: num(p.latitud_entrega),
    entrega_lng: num(p.longitud_entrega),
  };
};
export const marcarRecogido = async (
  pedidoId: number,
  repartidorId: number,
) => {
  const [result]: any = await db.query(
    `UPDATE pedidos SET estado = 'en_entrega'
     WHERE id = ? AND repartidor_id = ? AND estado = 'listo_para_recoger'`,
    [pedidoId, repartidorId],
  );

  if (result.affectedRows === 0) {
    throw new Error("No se pudo marcar el pedido como recogido");
  }

  await registrarEvento(pedidoId, "recogido");
  return { ok: true };
};

export const marcarEntregado = async (
  pedidoId: number,
  repartidorId: number,
) => {
  // Solo si el pedido es de este repartidor y sigue en camino
  const [result]: any = await db.query(
    `UPDATE pedidos SET estado = 'entregado', fecha_entrega = NOW()
     WHERE id = ? AND repartidor_id = ? AND estado = 'en_entrega'`,
    [pedidoId, repartidorId],
  );

  if (result.affectedRows === 0) {
    throw new Error("No se pudo confirmar la entrega");
  }

  await registrarEvento(pedidoId, "entregado");

  // Una falla al notificar no debe romper la entrega ya confirmada
  try {
    await notificarEntregaRegistrada(repartidorId, pedidoId);
  } catch (error) {
    console.error("No se pudo crear la notificación de entrega:", error);
  }

  return { ok: true };
};

export const obtenerEntregaCompletada = async (
  pedidoId: number,
  repartidorId: number,
) => {
  const [rows]: any = await db.query(
    `SELECT p.id, p.codigo, p.costo_envio, r.nombre AS restaurante_nombre
     FROM pedidos p
     JOIN restaurantes r ON r.id = p.restaurante_id
     WHERE p.id = ? AND p.repartidor_id = ? AND p.estado = 'entregado'`,
    [pedidoId, repartidorId],
  );

  if (rows.length === 0) throw new Error("Entrega no encontrada");

  return {
    id: rows[0].id,
    codigo: rows[0].codigo,
    pago: Number(rows[0].costo_envio),
    restaurante_nombre: rows[0].restaurante_nombre,
  };
};

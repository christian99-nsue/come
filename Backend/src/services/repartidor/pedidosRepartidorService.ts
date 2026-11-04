import { db } from "../../config/db";
import { distanciaKm } from "../../utils/geo";
import { registrarEvento } from "./eventosPedidoService";
import { condicionLiberado, ventanaDePedido } from "../ventanasService";

export const obtenerPedido = async (pedidoId: number, repartidorId: number) => {
  const [rows]: any = await db.query(
    `SELECT
       p.id,
       p.codigo,
       p.estado,
       p.repartidor_id,
       p.costo_envio,
       p.direccion_entrega,
       p.latitud_entrega,
       p.longitud_entrega,
       DATE_FORMAT(p.ventana_entrega_inicio, '%Y-%m-%d %H:%i:%s') AS ventana_inicio,
       DATE_FORMAT(p.ventana_entrega_fin, '%Y-%m-%d %H:%i:%s') AS ventana_fin,
       r.nombre AS restaurante_nombre,
       r.logo AS restaurante_logo,
       r.direccion AS restaurante_direccion,
       r.latitud AS restaurante_lat,
       r.longitud AS restaurante_lng,
       u.nombre AS cliente_nombre,
       u.telefono AS cliente_telefono
     FROM pedidos p
     JOIN restaurantes r ON r.id = p.restaurante_id
     JOIN usuarios u ON u.id = p.cliente_id
     WHERE p.id = ?`,
    [pedidoId],
  );

  if (rows.length === 0) throw new Error("Pedido no encontrado");

  const p = rows[0];

  const esMio = p.repartidor_id === repartidorId;

  const estaLibre =
    p.estado === "listo_para_recoger" && p.repartidor_id === null;

  if (!esMio && !estaLibre) {
    throw new Error("Este pedido ya no está disponible");
  }

  // Comprobar si el pedido está liberado para reparto
  if (!esMio && estaLibre) {
    const liberado = condicionLiberado("p");

    const [noLiberado]: any = await db.query(
      `SELECT 1
       FROM pedidos p
       WHERE p.id = ?
         AND NOT (${liberado.sql})`,
      [pedidoId, ...liberado.params],
    );

    if (noLiberado.length > 0) {
      throw new Error(
        "Este pedido aún no está liberado para reparto: se libera 30 minutos antes de su ventana.",
      );
    }
  }

  const [items]: any = await db.query(
    `SELECT nombre_plato, cantidad
     FROM pedido_items
     WHERE pedido_id = ?`,
    [pedidoId],
  );

  const tieneCoords =
    p.restaurante_lat != null &&
    p.restaurante_lng != null &&
    p.latitud_entrega != null &&
    p.longitud_entrega != null;

  const km = tieneCoords
    ? distanciaKm(
        Number(p.restaurante_lat),
        Number(p.restaurante_lng),
        Number(p.latitud_entrega),
        Number(p.longitud_entrega),
      )
    : null;

  return {
    id: p.id,
    codigo: p.codigo,
    asignado_a_mi: esMio,
    restaurante_nombre: p.restaurante_nombre,
    restaurante_logo: p.restaurante_logo,
    restaurante_direccion: p.restaurante_direccion,
    distancia_km: km !== null ? Math.round(km * 10) / 10 : null,
    tiempo_estimado_min: km !== null ? Math.round(km * 3 + 10) : null,
    pago: Number(p.costo_envio),
    ventana: ventanaDePedido(p.ventana_inicio, p.ventana_fin),
    items,
    cliente_nombre: p.cliente_nombre,

    // El teléfono solo se entrega cuando el pedido ya es del repartidor
    cliente_telefono: esMio ? p.cliente_telefono : null,
    direccion_entrega: p.direccion_entrega,
  };
};

export const tomarPedido = async (pedidoId: number, repartidorId: number) => {
  const [userRows]: any = await db.query(
    "SELECT disponible FROM usuarios WHERE id = ? AND rol = 'repartidor'",
    [repartidorId],
  );

  if (userRows.length === 0) {
    throw new Error("Repartidor no encontrado");
  }

  if (!userRows[0].disponible) {
    throw new Error("Debes estar disponible para tomar pedidos");
  }

  const [activas]: any = await db.query(
    `SELECT id
     FROM pedidos
     WHERE repartidor_id = ?
       AND estado IN ('listo_para_recoger', 'en_entrega')
     LIMIT 1`,
    [repartidorId],
  );

  if (activas.length > 0) {
    throw new Error(
      "Ya tienes una entrega activa. Complétala antes de tomar otra.",
    );
  }

  // Condición que determina si el pedido ya está liberado para reparto
  const liberado = condicionLiberado("pedidos");

  // Solo se asigna si el pedido sigue libre y está liberado.
  // Esto evita asignaciones duplicadas y pedidos tomados antes de tiempo.
  const [result]: any = await db.query(
    `UPDATE pedidos
     SET repartidor_id = ?
     WHERE id = ?
       AND estado = 'listo_para_recoger'
       AND repartidor_id IS NULL
       AND ${liberado.sql}`,
    [repartidorId, pedidoId, ...liberado.params],
  );

  if (result.affectedRows === 0) {
    // Comprobar si el pedido sigue libre, pero aún no está liberado
    const [aun]: any = await db.query(
      `SELECT 1
       FROM pedidos
       WHERE id = ?
         AND estado = 'listo_para_recoger'
         AND repartidor_id IS NULL
         AND NOT (${liberado.sql})`,
      [pedidoId, ...liberado.params],
    );

    if (aun.length > 0) {
      throw new Error(
        "Este pedido aún no está liberado para reparto: se libera 30 minutos antes de su ventana.",
      );
    }

    throw new Error("Otro repartidor ya tomó este pedido");
  }

  await registrarEvento(pedidoId, "asignado");

  return { ok: true };
};

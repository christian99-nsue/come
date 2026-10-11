import { db } from "../../config/db";

export const listarPedidosEnCurso = async (repartidorId: number) => {
  const [rows]: any = await db.query(
    `SELECT p.id, p.codigo, p.estado, p.costo_envio, p.direccion_entrega,
            r.nombre AS restaurante_nombre, r.logo AS restaurante_logo,
            r.direccion AS restaurante_direccion,
            u.nombre AS cliente_nombre
     FROM pedidos p
     JOIN restaurantes r ON r.id = p.restaurante_id
     JOIN usuarios u ON u.id = p.cliente_id
     WHERE p.repartidor_id = ? AND p.estado IN ('listo_para_recoger', 'en_entrega')
     ORDER BY p.fecha_actualizacion DESC`,
    [repartidorId],
  );

  if (rows.length === 0) return [];

  // Una sola consulta para los eventos de todos los pedidos (la última vez que ocurrió cada uno)
  const ids = rows.map((r: any) => r.id);
  const [eventosRows]: any = await db.query(
    `SELECT pedido_id, evento, MAX(fecha) AS fecha
     FROM pedido_eventos
     WHERE pedido_id IN (?)
     GROUP BY pedido_id, evento`,
    [ids],
  );

  const eventosPorPedido = new Map<number, Record<string, string>>();
  for (const e of eventosRows) {
    const actuales = eventosPorPedido.get(e.pedido_id) || {};
    actuales[e.evento] = new Date(e.fecha).toISOString();
    eventosPorPedido.set(e.pedido_id, actuales);
  }

  return rows.map((r: any) => ({
    id: r.id,
    codigo: r.codigo,
    estado: r.estado as "listo_para_recoger" | "en_entrega",
    pago: Number(r.costo_envio),
    restaurante_nombre: r.restaurante_nombre,
    restaurante_logo: r.restaurante_logo,
    restaurante_direccion: r.restaurante_direccion,
    cliente_nombre: r.cliente_nombre,
    direccion_entrega: r.direccion_entrega,
    eventos: eventosPorPedido.get(r.id) || {},
  }));
};

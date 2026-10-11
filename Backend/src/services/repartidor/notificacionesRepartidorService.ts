import { db } from "../../config/db";

// ===== Lectura (la usa el repartidor desde su app) =====

export const listarNotificaciones = async (repartidorId: number) => {
  const [rows]: any = await db.query(
    `SELECT id, tipo, titulo, mensaje, leida, pedido_id, fecha_creacion
     FROM notificaciones_repartidor
     WHERE repartidor_id = ?
     ORDER BY fecha_creacion DESC
     LIMIT 50`,
    [repartidorId],
  );

  return rows.map((r: any) => ({ ...r, leida: !!r.leida }));
};

export const contarNoLeidas = async (repartidorId: number) => {
  const [rows]: any = await db.query(
    `SELECT COUNT(*) AS total FROM notificaciones_repartidor
     WHERE repartidor_id = ? AND leida = FALSE`,
    [repartidorId],
  );
  return Number(rows[0].total);
};

export const marcarComoLeida = async (
  notificacionId: number,
  repartidorId: number,
) => {
  const [result]: any = await db.query(
    `UPDATE notificaciones_repartidor SET leida = TRUE WHERE id = ? AND repartidor_id = ?`,
    [notificacionId, repartidorId],
  );
  if (result.affectedRows === 0) throw new Error("Notificación no encontrada");
  return { ok: true };
};

export const marcarTodasComoLeidas = async (repartidorId: number) => {
  await db.query(
    `UPDATE notificaciones_repartidor SET leida = TRUE WHERE repartidor_id = ?`,
    [repartidorId],
  );
  return { ok: true };
};

// ===== Creación (la llaman otros servicios cuando ocurre un evento) =====

// Avisa a todos los repartidores disponibles de que hay un pedido nuevo para recoger
export const notificarNuevoPedido = async (pedidoId: number) => {
  // Si ya se avisó de este pedido, no se repite
  const [yaAvisado]: any = await db.query(
    `SELECT id FROM notificaciones_repartidor
     WHERE pedido_id = ? AND tipo = 'nuevo_pedido' LIMIT 1`,
    [pedidoId],
  );
  if (yaAvisado.length > 0) return;

  const [rows]: any = await db.query(
    `SELECT p.codigo, r.nombre AS restaurante_nombre
     FROM pedidos p
     JOIN restaurantes r ON r.id = p.restaurante_id
     WHERE p.id = ?`,
    [pedidoId],
  );
  if (rows.length === 0) return;

  await db.query(
    `INSERT INTO notificaciones_repartidor (repartidor_id, tipo, titulo, mensaje, pedido_id)
     SELECT u.id, 'nuevo_pedido', 'Nuevo pedido disponible', ?, ?
     FROM usuarios u
     WHERE u.rol = 'repartidor' AND u.disponible = 1 AND u.notificaciones_activas = 1`,
    [`${rows[0].restaurante_nombre} · ${rows[0].codigo}`, pedidoId],
  );
};

// Confirma al repartidor que su entrega quedó registrada y cuánto ganó
export const notificarEntregaRegistrada = async (
  repartidorId: number,
  pedidoId: number,
) => {
  const [rows]: any = await db.query(
    `SELECT codigo, costo_envio FROM pedidos WHERE id = ?`,
    [pedidoId],
  );
  if (rows.length === 0) return;

  const ganancia = Number(rows[0].costo_envio).toLocaleString("es-ES");

  await db.query(
    `INSERT INTO notificaciones_repartidor (repartidor_id, tipo, titulo, mensaje, pedido_id)
     VALUES (?, 'entrega_registrada', 'Entrega registrada', ?, ?)`,
    [repartidorId, `${rows[0].codigo} · ganaste ${ganancia} XAF`, pedidoId],
  );
};

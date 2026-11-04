import { db } from "../../config/db";

export type EventoCliente =
  | "confirmado"
  | "rechazado"
  | "en_camino"
  | "entregado";

// ===== Lectura (la usa el cliente desde su app) =====

export const listarNotificaciones = async (clienteId: number) => {
  const [rows]: any = await db.query(
    `SELECT id, tipo, titulo, mensaje, leida, pedido_id, reporte_id, fecha_creacion
     FROM notificaciones_cliente
     WHERE cliente_id = ?
     ORDER BY fecha_creacion DESC, id DESC
     LIMIT 50`,
    [clienteId],
  );

  return rows.map((r: any) => ({
    id: r.id,
    tipo: r.tipo,
    titulo: r.titulo,
    mensaje: r.mensaje,
    leida: !!r.leida,
    pedido_id: r.pedido_id,
    reporte_id: r.reporte_id,
    fecha_creacion: new Date(r.fecha_creacion).toISOString(),
  }));
};

export const contarNoLeidas = async (clienteId: number) => {
  const [rows]: any = await db.query(
    "SELECT COUNT(*) AS total FROM notificaciones_cliente WHERE cliente_id = ? AND leida = FALSE",
    [clienteId],
  );
  return Number(rows[0].total);
};

export const marcarComoLeida = async (
  notificacionId: number,
  clienteId: number,
) => {
  const [result]: any = await db.query(
    "UPDATE notificaciones_cliente SET leida = TRUE WHERE id = ? AND cliente_id = ?",
    [notificacionId, clienteId],
  );
  if (result.affectedRows === 0) throw new Error("Notificación no encontrada");
  return { ok: true };
};

export const marcarTodasComoLeidas = async (clienteId: number) => {
  await db.query(
    "UPDATE notificaciones_cliente SET leida = TRUE WHERE cliente_id = ?",
    [clienteId],
  );
  return { ok: true };
};

// ===== Preferencias =====

export const obtenerPreferencias = async (clienteId: number) => {
  const [rows]: any = await db.query(
    "SELECT notificaciones_activas FROM usuarios WHERE id = ? AND rol = 'cliente'",
    [clienteId],
  );
  if (rows.length === 0) throw new Error("Usuario no encontrado");
  return { notificaciones_activas: !!rows[0].notificaciones_activas };
};

export const actualizarPreferencias = async (
  clienteId: number,
  valor: unknown,
) => {
  if (typeof valor !== "boolean") throw new Error("Valor no válido");

  await db.query(
    "UPDATE usuarios SET notificaciones_activas = ? WHERE id = ? AND rol = 'cliente'",
    [valor, clienteId],
  );
  return { notificaciones_activas: valor };
};

// ===== Creación (la llaman otros servicios cuando cambia un pedido) =====

function textos(evento: EventoCliente, restaurante: string, codigo: string) {
  switch (evento) {
    case "confirmado":
      return {
        titulo: "Pedido confirmado",
        mensaje: `${restaurante} ha confirmado tu pedido ${codigo}.`,
      };
    case "rechazado":
      return {
        titulo: "Pedido rechazado",
        mensaje: `${restaurante} no pudo aceptar tu pedido ${codigo}.`,
      };
    case "en_camino":
      return {
        titulo: "Tu pedido está en camino",
        mensaje: `El repartidor ya salió del restaurante con tu pedido ${codigo}.`,
      };
    default:
      return {
        titulo: "Pedido entregado",
        mensaje: `Tu pedido ${codigo} fue entregado. ¡Buen provecho! Cuéntanos qué tal estuvo.`,
      };
  }
}

// Nunca lanza error: una falla al avisar no debe romper el cambio de estado ya hecho
export const notificarCliente = async (
  pedidoId: number,
  evento: EventoCliente,
) => {
  try {
    const [rows]: any = await db.query(
      `SELECT p.codigo, p.cliente_id, r.nombre AS restaurante_nombre, u.notificaciones_activas
       FROM pedidos p
       JOIN restaurantes r ON r.id = p.restaurante_id
       JOIN usuarios u ON u.id = p.cliente_id
       WHERE p.id = ?`,
      [pedidoId],
    );
    if (rows.length === 0) return;

    const p = rows[0];
    if (!p.notificaciones_activas) return; // el cliente las tiene desactivadas

    const { titulo, mensaje } = textos(evento, p.restaurante_nombre, p.codigo);

    await db.query(
      `INSERT INTO notificaciones_cliente (cliente_id, tipo, titulo, mensaje, pedido_id)
       VALUES (?, 'pedido', ?, ?, ?)`,
      [p.cliente_id, titulo, mensaje.slice(0, 255), pedidoId],
    );
  } catch (error) {
    console.error(
      `No se pudo crear la notificación "${evento}" del pedido ${pedidoId}:`,
      error,
    );
  }
};

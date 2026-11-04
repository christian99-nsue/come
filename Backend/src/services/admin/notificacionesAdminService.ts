import { db } from "../../config/db";

type TipoNotificacion = "pedido" | "sistema" | "abastecimiento" | "suscripcion";

export const listarNotificaciones = async (
  restauranteId: number,
  tipo?: TipoNotificacion,
) => {
  let sql = `
    SELECT id, tipo, titulo, mensaje, leida, referencia_id, fecha_creacion
    FROM notificaciones_admin
    WHERE restaurante_id = ?
  `;
  const params: any[] = [restauranteId];

  if (tipo === "sistema") {
    sql += " AND tipo IN ('sistema', 'suscripcion')";
  } else if (tipo) {
    sql += " AND tipo = ?";
    params.push(tipo);
  }

  sql += " ORDER BY fecha_creacion DESC LIMIT 50";

  const [rows]: any = await db.query(sql, params);
  return rows;
};

export const contarNoLeidas = async (restauranteId: number) => {
  const [rows]: any = await db.query(
    `SELECT COUNT(*) AS total FROM notificaciones_admin WHERE restaurante_id = ? AND leida = FALSE`,
    [restauranteId],
  );
  return rows[0].total as number;
};

export const marcarComoLeida = async (
  notificacionId: number,
  restauranteId: number,
) => {
  const [result]: any = await db.query(
    `UPDATE notificaciones_admin SET leida = TRUE WHERE id = ? AND restaurante_id = ?`,
    [notificacionId, restauranteId],
  );
  if (result.affectedRows === 0) throw new Error("Notificación no encontrada");
  return { ok: true };
};

export const marcarTodasComoLeidas = async (restauranteId: number) => {
  await db.query(
    `UPDATE notificaciones_admin SET leida = TRUE WHERE restaurante_id = ?`,
    [restauranteId],
  );
  return { ok: true };
};

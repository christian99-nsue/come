import { db } from "../../config/db";

type FiltroHistorial = "todos" | "entregado" | "cancelado";

export const listarHistorial = async (
  restauranteId: number,
  filtro: FiltroHistorial = "todos",
) => {
  let sql = `
    SELECT p.id, p.codigo, p.estado, p.total, p.metodo_pago, p.fecha_creacion,
           u.nombre AS cliente_nombre
    FROM pedidos p
    JOIN usuarios u ON u.id = p.cliente_id
    WHERE p.restaurante_id = ?
      AND p.estado IN ('entregado', 'cancelado', 'rechazado')
  `;
  const params: any[] = [restauranteId];

  if (filtro === "entregado") {
    sql += " AND p.estado = 'entregado'";
  } else if (filtro === "cancelado") {
    sql += " AND p.estado IN ('cancelado', 'rechazado')";
  }

  sql += " ORDER BY p.fecha_creacion DESC";

  const [rows]: any = await db.query(sql, params);
  return rows;
};

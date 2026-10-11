import { db } from "../../config/db";

export const obtenerResumenHoy = async (restauranteId: number) => {
  const [rows]: any = await db.query(
    `
    SELECT estado, COUNT(*) AS cantidad
    FROM pedidos
    WHERE restaurante_id = ? AND DATE(fecha_creacion) = CURDATE()
    GROUP BY estado
    `,
    [restauranteId],
  );

  const resumen = {
    pedidosNuevos: 0,
    enPreparacion: 0,
    listosParaRecoger: 0,
    enEntrega: 0,
  };

  for (const row of rows) {
    if (row.estado === "nuevo") resumen.pedidosNuevos = row.cantidad;
    if (row.estado === "en_preparacion") resumen.enPreparacion = row.cantidad;
    if (row.estado === "listo_para_recoger")
      resumen.listosParaRecoger = row.cantidad;
    if (row.estado === "en_entrega") resumen.enEntrega = row.cantidad;
  }

  return resumen;
};

export const obtenerPedidosQueRequierenAtencion = async (
  restauranteId: number,
) => {
  const [rows]: any = await db.query(
    `
    SELECT p.id, p.codigo, p.estado, p.total, p.fecha_creacion, u.nombre AS cliente_nombre
    FROM pedidos p
    JOIN usuarios u ON u.id = p.cliente_id
    WHERE p.restaurante_id = ?
      AND p.estado IN ('nuevo', 'en_preparacion', 'listo_para_recoger')
    ORDER BY p.fecha_creacion ASC
    LIMIT 5
    `,
    [restauranteId],
  );
  return rows;
};

export const obtenerComparativaVentas = async (restauranteId: number) => {
  const [rows]: any = await db.query(
    `
    SELECT
      SUM(CASE WHEN DATE(fecha_creacion) = CURDATE() THEN total ELSE 0 END) AS ventas_hoy,
      SUM(CASE WHEN DATE(fecha_creacion) = CURDATE() - INTERVAL 1 DAY THEN total ELSE 0 END) AS ventas_ayer
    FROM pedidos
    WHERE restaurante_id = ? AND estado NOT IN ('cancelado', 'rechazado')
    `,
    [restauranteId],
  );

  const { ventas_hoy, ventas_ayer } = rows[0];
  const hoy = Number(ventas_hoy) || 0;
  const ayer = Number(ventas_ayer) || 0;
  const variacionPorcentaje =
    ayer > 0 ? Math.round(((hoy - ayer) / ayer) * 100) : 0;

  return { ventasHoy: hoy, ventasAyer: ayer, variacionPorcentaje };
};

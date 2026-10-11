import { db } from "../../config/db";

type Rango = "hoy" | "semana" | "mes";

// El rango se valida contra una lista antes de armar el SQL,
// por eso es seguro usarlo para construir la condición.
function condicionRango(rango: Rango) {
  const fecha = "COALESCE(p.fecha_entrega, p.fecha_actualizacion)";
  if (rango === "hoy") return `DATE(${fecha}) = CURDATE()`;
  if (rango === "semana")
    return `YEARWEEK(${fecha}, 1) = YEARWEEK(CURDATE(), 1)`;
  return `YEAR(${fecha}) = YEAR(CURDATE()) AND MONTH(${fecha}) = MONTH(CURDATE())`;
}

export const listarHistorial = async (repartidorId: number, rango: Rango) => {
  if (!["hoy", "semana", "mes"].includes(rango)) {
    throw new Error("Rango no válido");
  }

  const condicion = condicionRango(rango);

  const [entregasRows, resumenRows]: any = await Promise.all([
    db.query(
      `SELECT p.id, p.codigo, p.costo_envio,
              COALESCE(p.fecha_entrega, p.fecha_actualizacion) AS fecha,
              r.nombre AS restaurante_nombre, r.logo AS restaurante_logo
       FROM pedidos p
       JOIN restaurantes r ON r.id = p.restaurante_id
       WHERE p.repartidor_id = ? AND p.estado = 'entregado' AND ${condicion}
       ORDER BY fecha DESC
       LIMIT 100`,
      [repartidorId],
    ),
    db.query(
      `SELECT COUNT(*) AS entregas, COALESCE(SUM(p.costo_envio), 0) AS ganancias
       FROM pedidos p
       WHERE p.repartidor_id = ? AND p.estado = 'entregado' AND ${condicion}`,
      [repartidorId],
    ),
  ]);

  const entregas = entregasRows[0].map((r: any) => ({
    id: r.id,
    codigo: r.codigo,
    restaurante_nombre: r.restaurante_nombre,
    restaurante_logo: r.restaurante_logo,
    pago: Number(r.costo_envio),
    fecha: r.fecha,
  }));

  return {
    resumen: {
      entregas: Number(resumenRows[0][0].entregas),
      ganancias: Number(resumenRows[0][0].ganancias),
    },
    entregas,
  };
};

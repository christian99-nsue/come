import { db } from "../../config/db";

type Rango = "hoy" | "7dias" | "30dias";

function condicionFecha(rango: Rango) {
  if (rango === "hoy") return "DATE(fecha_creacion) = CURDATE()";
  if (rango === "7dias") return "fecha_creacion >= CURDATE() - INTERVAL 6 DAY";
  return "fecha_creacion >= CURDATE() - INTERVAL 29 DAY";
}

export const obtenerResumen = async (restauranteId: number, rango: Rango) => {
  const [rows]: any = await db.query(
    `
    SELECT COALESCE(SUM(total), 0) AS ingresos, COUNT(*) AS pedidos
    FROM pedidos
    WHERE restaurante_id = ?
      AND estado NOT IN ('cancelado', 'rechazado')
      AND ${condicionFecha(rango)}
    `,
    [restauranteId],
  );

  return {
    ingresos: Number(rows[0].ingresos),
    pedidos: Number(rows[0].pedidos),
  };
};

// "Hoy" se agrupa por hora; "7 días" / "30 días" se agrupa por día.
export const obtenerSerieIngresos = async (
  restauranteId: number,
  rango: Rango,
) => {
  if (rango === "hoy") {
    const [rows]: any = await db.query(
      `
      SELECT HOUR(fecha_creacion) AS etiqueta, SUM(total) AS ingresos
      FROM pedidos
      WHERE restaurante_id = ? AND estado NOT IN ('cancelado', 'rechazado') AND ${condicionFecha(rango)}
      GROUP BY HOUR(fecha_creacion)
      ORDER BY HOUR(fecha_creacion) ASC
      `,
      [restauranteId],
    );
    return rows.map((r: any) => ({
      etiqueta: `${String(r.etiqueta).padStart(2, "0")}h`,
      ingresos: Number(r.ingresos),
    }));
  }

  const [rows]: any = await db.query(
    `
    SELECT DATE(fecha_creacion) AS etiqueta, SUM(total) AS ingresos
    FROM pedidos
    WHERE restaurante_id = ? AND estado NOT IN ('cancelado', 'rechazado') AND ${condicionFecha(rango)}
    GROUP BY DATE(fecha_creacion)
    ORDER BY DATE(fecha_creacion) ASC
    `,
    [restauranteId],
  );
  return rows.map((r: any) => ({
    etiqueta: new Date(r.etiqueta).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    }),
    ingresos: Number(r.ingresos),
  }));
};

export const obtenerProductosMasVendidos = async (
  restauranteId: number,
  rango: Rango,
) => {
  const [rows]: any = await db.query(
    `
    SELECT pi.nombre_plato, SUM(pi.cantidad) AS unidades
    FROM pedido_items pi
    JOIN pedidos p ON p.id = pi.pedido_id
    WHERE p.restaurante_id = ?
      AND p.estado NOT IN ('cancelado', 'rechazado')
      AND ${condicionFecha(rango).replace("fecha_creacion", "p.fecha_creacion")}
    GROUP BY pi.nombre_plato
    ORDER BY unidades DESC
    LIMIT 5
    `,
    [restauranteId],
  );
  return rows.map((r: any) => ({
    nombre: r.nombre_plato,
    unidades: Number(r.unidades),
  }));
};

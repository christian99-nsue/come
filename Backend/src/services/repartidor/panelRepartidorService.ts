import { db } from "../../config/db";
import { distanciaKm } from "../../utils/geo";

export const obtenerPanel = async (repartidorId: number) => {
  const [userRows]: any = await db.query(
    "SELECT disponible FROM usuarios WHERE id = ? AND rol = 'repartidor'",
    [repartidorId],
  );
  if (userRows.length === 0) throw new Error("Repartidor no encontrado");

  const disponible = !!userRows[0].disponible;

  // Si no está disponible, no se le muestran pedidos
  if (!disponible) return { disponible, pedidos: [] };

  const [rows]: any = await db.query(
    `SELECT p.id, p.codigo, p.costo_envio, p.latitud_entrega, p.longitud_entrega,
            r.nombre AS restaurante_nombre, r.logo AS restaurante_logo,
            r.latitud AS restaurante_lat, r.longitud AS restaurante_lng
     FROM pedidos p
     JOIN restaurantes r ON r.id = p.restaurante_id
     WHERE p.estado = 'listo_para_recoger' AND p.repartidor_id IS NULL
     ORDER BY p.fecha_actualizacion ASC
     LIMIT 20`,
  );

  const pedidos = rows.map((r: any) => {
    const tieneCoords =
      r.restaurante_lat != null &&
      r.restaurante_lng != null &&
      r.latitud_entrega != null &&
      r.longitud_entrega != null;

    const km = tieneCoords
      ? distanciaKm(
          Number(r.restaurante_lat),
          Number(r.restaurante_lng),
          Number(r.latitud_entrega),
          Number(r.longitud_entrega),
        )
      : null;

    return {
      id: r.id,
      codigo: r.codigo,
      restaurante: r.restaurante_nombre,
      logo: r.restaurante_logo,
      distancia_km: km !== null ? Math.round(km * 10) / 10 : null,
      tiempo_estimado_min: km !== null ? Math.round(km * 3 + 10) : null,
      pago: Number(r.costo_envio),
    };
  });

  return { disponible, pedidos };
};

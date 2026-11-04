import { db } from "../../config/db";
import { distanciaKm } from "../../utils/geo";
import { condicionLiberado, ventanaDePedido } from "../ventanasService";

export const obtenerPanel = async (repartidorId: number) => {
  const [userRows]: any = await db.query(
    "SELECT disponible FROM usuarios WHERE id = ? AND rol = 'repartidor'",
    [repartidorId],
  );

  if (userRows.length === 0) throw new Error("Repartidor no encontrado");

  const disponible = !!userRows[0].disponible;

  // Si no está disponible, no se le muestran pedidos
  if (!disponible) return { disponible, pedidos: [] };

  // Condición para mostrar únicamente pedidos liberados
  const liberado = condicionLiberado("p");

  const [rows]: any = await db.query(
    `SELECT
       p.id,
       p.codigo,
       p.costo_envio,
       p.latitud_entrega,
       p.longitud_entrega,
       DATE_FORMAT(p.ventana_entrega_inicio, '%Y-%m-%d %H:%i:%s') AS ventana_inicio,
       DATE_FORMAT(p.ventana_entrega_fin, '%Y-%m-%d %H:%i:%s') AS ventana_fin,
       r.nombre AS restaurante_nombre,
       r.logo AS restaurante_logo,
       r.latitud AS restaurante_lat,
       r.longitud AS restaurante_lng
     FROM pedidos p
     JOIN restaurantes r ON r.id = p.restaurante_id
     WHERE p.estado = 'listo_para_recoger'
       AND p.repartidor_id IS NULL
       AND ${liberado.sql}
     ORDER BY
       (p.ventana_entrega_inicio IS NULL),
       p.ventana_entrega_inicio ASC,
       p.fecha_actualizacion ASC
     LIMIT 20`,
    [...liberado.params],
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
      ventana: ventanaDePedido(r.ventana_inicio, r.ventana_fin),
    };
  });

  return { disponible, pedidos };
};

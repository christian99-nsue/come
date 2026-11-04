import { db } from "../../config/db";
import { ErrorCarga, leerUbicacion } from "../../utils/ubicacion";

// Dónde está el restaurante: los repartidores la usan para llegar a recoger y para calcular la ruta de entrega

export async function obtenerUbicacion(restauranteId: number) {
  const [rows]: any = await db.query(
    "SELECT latitud, longitud FROM restaurantes WHERE id = ?",
    [restauranteId],
  );
  if (rows.length === 0) throw new ErrorCarga(404, "Restaurante no encontrado");

  const r = rows[0];
  return {
    latitud: r.latitud === null ? null : Number(r.latitud),
    longitud: r.longitud === null ? null : Number(r.longitud),
  };
}

export async function guardarUbicacion(
  restauranteId: number,
  latitud: unknown,
  longitud: unknown,
) {
  const punto = leerUbicacion(latitud, longitud);
  if (!punto) throw new ErrorCarga(400, "Indica la ubicación del restaurante");

  await obtenerUbicacion(restauranteId); // 404 si no existe
  await db.query(
    "UPDATE restaurantes SET latitud = ?, longitud = ? WHERE id = ?",
    [punto.lat, punto.lng, restauranteId],
  );
  return { latitud: punto.lat, longitud: punto.lng };
}

export async function quitarUbicacion(restauranteId: number) {
  await obtenerUbicacion(restauranteId);
  await db.query(
    "UPDATE restaurantes SET latitud = NULL, longitud = NULL WHERE id = ?",
    [restauranteId],
  );
  return { latitud: null, longitud: null };
}

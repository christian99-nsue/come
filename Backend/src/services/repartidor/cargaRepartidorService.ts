import { db } from "../../config/db";
import { MAX_PEDIDOS_POR_CARGA } from "../../config/carga";
import { condicionLiberado, ventanaDePedido } from "../ventanasService";
import { ErrorCarga, leerUbicacion, type Punto } from "../../utils/ubicacion";
import {
  distanciaCalleKm,
  medirRuta,
  minutosViaje,
  ordenOptimo,
  redondear,
  urlMapsDestino,
  urlMapsRuta,
} from "../../utils/rutas";

const fecha = (columna: string) =>
  `DATE_FORMAT(${columna}, '%Y-%m-%d %H:%i:%s')`;
const ESTADOS_EN_CARGA = "('listo_para_recoger', 'en_entrega')";

// Dónde está el repartidor ahora (lo dice su teléfono). Es opcional: si no llega o no vale, se ignora.
export function leerPosicion(lat: unknown, lng: unknown): Punto | null {
  try {
    return leerUbicacion(lat, lng);
  } catch {
    return null;
  }
}

const entero = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isInteger(v) && v > 0 ? v : null;
  if (typeof v === "string" && /^\d{1,10}$/.test(v))
    return Number(v) > 0 ? Number(v) : null;
  return null;
};

const puntoDe = (lat: unknown, lng: unknown): Punto | null =>
  lat !== null && lat !== undefined && lng !== null && lng !== undefined
    ? { lat: Number(lat), lng: Number(lng) }
    : null;

async function tieneCargaEnCurso(repartidorId: number) {
  const [filas]: any = await db.query(
    `SELECT COUNT(*) AS n FROM pedidos WHERE repartidor_id = ? AND estado IN ${ESTADOS_EN_CARGA}`,
    [repartidorId],
  );
  return Number(filas[0].n) > 0;
}

// ===== Los restaurantes que ahora mismo tienen pedidos esperando repartidor =====

export async function restaurantesConPedidos(
  repartidorId: number,
  posicion: Punto | null,
) {
  const liberado = condicionLiberado("p");

  const [filas]: any = await db.query(
    `SELECT r.id, r.nombre, r.logo, r.direccion, r.latitud, r.longitud,
            COUNT(*) AS listos,
            MIN(p.fecha_actualizacion) AS esperando_desde,
            COUNT(DISTINCT p.ventana_entrega_inicio) AS ventanas_con_hora,
            COALESCE(SUM(p.ventana_entrega_inicio IS NULL), 0) AS sin_ventana
     FROM pedidos p
     JOIN restaurantes r ON r.id = p.restaurante_id
     WHERE p.estado = 'listo_para_recoger' AND p.repartidor_id IS NULL AND ${liberado.sql}
     GROUP BY r.id, r.nombre, r.logo, r.direccion, r.latitud, r.longitud
     ORDER BY MIN(p.fecha_actualizacion) ASC`,
    liberado.params,
  );

  const restaurantes = filas.map((r: any) => {
    const punto = puntoDe(r.latitud, r.longitud);
    return {
      id: r.id as number,
      nombre: r.nombre as string,
      logo: r.logo as string | null,
      direccion: r.direccion as string | null,
      listos: Number(r.listos),
      ventanas:
        Number(r.ventanas_con_hora) + (Number(r.sin_ventana) > 0 ? 1 : 0),
      esperando_desde: new Date(r.esperando_desde).toISOString(),
      tiene_ubicacion: !!punto,
      distancia_km:
        posicion && punto ? redondear(distanciaCalleKm(posicion, punto)) : null,
    };
  });

  // Si se sabe dónde está el repartidor, primero los más cercanos; el resto, por quién lleva más esperando
  if (posicion)
    restaurantes.sort(
      (a: any, b: any) =>
        (a.distancia_km ?? Infinity) - (b.distancia_km ?? Infinity),
    );

  return {
    max_pedidos: MAX_PEDIDOS_POR_CARGA,
    tiene_carga: await tieneCargaEnCurso(repartidorId),
    restaurantes,
  };
}

// ===== Los pedidos de un restaurante, agrupados por su ventana de entrega =====

export async function pedidosDeRestaurante(
  repartidorId: number,
  restauranteId: unknown,
) {
  const id = entero(restauranteId);
  if (!id) throw new ErrorCarga(404, "Restaurante no encontrado");

  const [rest]: any = await db.query(
    "SELECT id, nombre, logo, direccion FROM restaurantes WHERE id = ?",
    [id],
  );
  if (rest.length === 0) throw new ErrorCarga(404, "Restaurante no encontrado");

  const liberado = condicionLiberado("p");
  const [filas]: any = await db.query(
    `SELECT p.id, p.codigo, p.direccion_entrega, p.total, p.metodo_pago, p.costo_envio, p.fecha_actualizacion,
            ${fecha("p.ventana_entrega_inicio")} AS vi, ${fecha("p.ventana_entrega_fin")} AS vf,
            (p.latitud_entrega IS NOT NULL AND p.longitud_entrega IS NOT NULL) AS tiene_ubicacion
     FROM pedidos p
     WHERE p.restaurante_id = ? AND p.estado = 'listo_para_recoger' AND p.repartidor_id IS NULL AND ${liberado.sql}
     ORDER BY (p.ventana_entrega_inicio IS NULL), p.ventana_entrega_inicio ASC, p.fecha_actualizacion ASC, p.id ASC`,
    [id, ...liberado.params],
  );

  // Una carga solo puede ser de una misma ventana: los pedidos se presentan ya separados por ventana
  const grupos: {
    clave: string;
    ventana: ReturnType<typeof ventanaDePedido>;
    pedidos: any[];
  }[] = [];
  for (const f of filas) {
    const clave = f.vi ?? "sin_ventana";
    let grupo = grupos.find((g) => g.clave === clave);
    if (!grupo) {
      grupo = { clave, ventana: ventanaDePedido(f.vi, f.vf), pedidos: [] };
      grupos.push(grupo);
    }
    grupo.pedidos.push({
      id: f.id as number,
      codigo: f.codigo as string,
      direccion_entrega: f.direccion_entrega as string | null,
      total: Number(f.total),
      metodo_pago: f.metodo_pago as string | null,
      costo_envio: Number(f.costo_envio),
      tiene_ubicacion: !!f.tiene_ubicacion,
      listo_desde: new Date(f.fecha_actualizacion).toISOString(),
    });
  }

  return {
    restaurante: rest[0],
    max_pedidos: MAX_PEDIDOS_POR_CARGA,
    tiene_carga: await tieneCargaEnCurso(repartidorId),
    grupos,
  };
}

// ===== Tomar una carga: hasta 10 pedidos, de un mismo restaurante y de una misma ventana =====

export async function tomarCarga(
  repartidorId: number,
  restauranteEntrada: unknown,
  pedidosEntrada: unknown,
) {
  const restauranteId = entero(restauranteEntrada);
  if (!restauranteId) throw new ErrorCarga(400, "Elige un restaurante");

  if (!Array.isArray(pedidosEntrada) || pedidosEntrada.length === 0)
    throw new ErrorCarga(400, "Elige al menos un pedido");
  if (pedidosEntrada.length > MAX_PEDIDOS_POR_CARGA) {
    throw new ErrorCarga(
      400,
      `Solo puedes llevar ${MAX_PEDIDOS_POR_CARGA} pedidos a la vez`,
    );
  }

  const ids = pedidosEntrada.map(entero);
  if (ids.some((i) => i === null))
    throw new ErrorCarga(400, "Hay pedidos que no son válidos");
  const pedidoIds = ids as number[];
  if (new Set(pedidoIds).size !== pedidoIds.length)
    throw new ErrorCarga(400, "Hay pedidos repetidos");

  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    // Se bloquea al repartidor: dos toques seguidos no pueden darle dos cargas a la vez
    const [repartidor]: any = await conexion.query(
      "SELECT id FROM usuarios WHERE id = ? AND rol = 'repartidor' FOR UPDATE",
      [repartidorId],
    );
    if (repartidor.length === 0)
      throw new ErrorCarga(403, "Solo los repartidores pueden tomar pedidos");

    const [activa]: any = await conexion.query(
      `SELECT COUNT(*) AS n FROM pedidos WHERE repartidor_id = ? AND estado IN ${ESTADOS_EN_CARGA}`,
      [repartidorId],
    );
    if (Number(activa[0].n) > 0) {
      throw new ErrorCarga(
        409,
        "Ya tienes una carga en curso. Termina de entregarla antes de tomar otra.",
      );
    }

    // Se bloquean los pedidos: otro repartidor que quiera los mismos espera y, al entrar, ya los verá tomados
    const [filas]: any = await conexion.query(
      `SELECT id, restaurante_id, estado, repartidor_id, ${fecha("ventana_entrega_inicio")} AS vi
       FROM pedidos WHERE id IN (?) FOR UPDATE`,
      [pedidoIds],
    );

    if (filas.length !== pedidoIds.length)
      throw new ErrorCarga(
        404,
        "Alguno de los pedidos ya no existe. Actualiza la lista.",
      );
    if (filas.some((f: any) => f.restaurante_id !== restauranteId)) {
      throw new ErrorCarga(
        400,
        "Todos los pedidos de una carga deben ser del mismo restaurante",
      );
    }
    if (
      filas.some(
        (f: any) =>
          f.estado !== "listo_para_recoger" || f.repartidor_id !== null,
      )
    ) {
      throw new ErrorCarga(
        409,
        "Alguno de esos pedidos ya no está disponible: lo tomó otro repartidor. Actualiza la lista.",
      );
    }

    const liberado = condicionLiberado("p");
    const [sueltos]: any = await conexion.query(
      `SELECT COUNT(*) AS n FROM pedidos p WHERE p.id IN (?) AND ${liberado.sql}`,
      [pedidoIds, ...liberado.params],
    );
    if (Number(sueltos[0].n) !== pedidoIds.length) {
      throw new ErrorCarga(
        409,
        "Alguno de esos pedidos todavía no está liberado para el reparto.",
      );
    }

    if (new Set(filas.map((f: any) => f.vi ?? "sin_ventana")).size > 1) {
      throw new ErrorCarga(
        400,
        "Todos los pedidos de una carga deben ser de la misma ventana de entrega",
      );
    }

    const [asignados]: any = await conexion.query(
      `UPDATE pedidos SET repartidor_id = ?
       WHERE id IN (?) AND estado = 'listo_para_recoger' AND repartidor_id IS NULL`,
      [repartidorId, pedidoIds],
    );
    if (asignados.affectedRows !== pedidoIds.length)
      throw new ErrorCarga(
        409,
        "Alguno de esos pedidos ya no está disponible. Actualiza la lista.",
      );

    await conexion.commit();
  } catch (error: any) {
    await conexion.rollback();
    if (error?.code === "ER_LOCK_DEADLOCK")
      throw new ErrorCarga(
        409,
        "Mucha gente tomando pedidos a la vez. Inténtalo de nuevo.",
      );
    throw error;
  } finally {
    conexion.release();
  }

  return obtenerCarga(repartidorId, null);
}

// ===== La carga que lleva el repartidor, con la mejor ruta =====

export async function obtenerCarga(
  repartidorId: number,
  posicion: Punto | null,
) {
  const [filas]: any = await db.query(
    `SELECT p.id, p.codigo, p.estado, p.direccion_entrega, p.latitud_entrega, p.longitud_entrega, p.total, p.metodo_pago, p.costo_envio,
            ${fecha("p.ventana_entrega_inicio")} AS vi, ${fecha("p.ventana_entrega_fin")} AS vf,
            u.nombre AS cliente_nombre, u.telefono AS cliente_telefono,
            r.id AS restaurante_id, r.nombre AS restaurante_nombre, r.direccion AS restaurante_direccion,
            r.latitud AS restaurante_lat, r.longitud AS restaurante_lng
     FROM pedidos p
     JOIN usuarios u ON u.id = p.cliente_id
     JOIN restaurantes r ON r.id = p.restaurante_id
     WHERE p.repartidor_id = ? AND p.estado IN ${ESTADOS_EN_CARGA}
     ORDER BY p.id`,
    [repartidorId],
  );
  if (filas.length === 0) return { carga: null };

  const primera = filas[0];
  const restaurante = puntoDe(primera.restaurante_lat, primera.restaurante_lng);

  // Mientras queda algo por recoger, la carga está en el restaurante; después, en la calle
  const fase: "recogida" | "entrega" = filas.some(
    (f: any) => f.estado === "listo_para_recoger",
  )
    ? "recogida"
    : "entrega";

  const conUbicacion = filas.filter((f: any) =>
    puntoDe(f.latitud_entrega, f.longitud_entrega),
  );
  const sinUbicacion = filas.filter(
    (f: any) => !puntoDe(f.latitud_entrega, f.longitud_entrega),
  );

  // Se empieza a entregar desde donde está el repartidor (si ya recogió y se sabe), o desde el restaurante
  const inicio: Punto | null =
    fase === "entrega" && posicion ? posicion : restaurante;

  const puntos: Punto[] = conUbicacion.map(
    (f: any) => puntoDe(f.latitud_entrega, f.longitud_entrega) as Punto,
  );
  const orden = ordenOptimo(inicio, puntos);
  const ordenados = orden.map((i) => conUbicacion[i]);
  const ruta = medirRuta(
    inicio,
    orden.map((i) => puntos[i]),
  );

  const aEntrega = (
    f: any,
    posicionEnRuta: number,
    tramo?: { km: number; minutos: number },
  ) => ({
    orden: posicionEnRuta,
    pedido_id: f.id as number,
    codigo: f.codigo as string,
    estado: f.estado as "listo_para_recoger" | "en_entrega",
    cliente_nombre: f.cliente_nombre as string,
    cliente_telefono: f.cliente_telefono as string | null,
    direccion: f.direccion_entrega as string | null,
    total: Number(f.total),
    metodo_pago: f.metodo_pago as string | null,
    costo_envio: Number(f.costo_envio),
    tiene_ubicacion: !!tramo,
    latitud: tramo ? Number(f.latitud_entrega) : null,
    longitud: tramo ? Number(f.longitud_entrega) : null,
    desde_anterior_km: tramo ? tramo.km : null,
    minutos_acumulados: tramo ? tramo.minutos : null,
  });

  const entregas = [
    ...ordenados.map((f: any, i: number) => aEntrega(f, i + 1, ruta.tramos[i])),
    // Los pedidos sin ubicación van al final: el repartidor tendrá que llamar al cliente para llegar
    ...sinUbicacion.map((f: any, i: number) =>
      aEntrega(f, ordenados.length + i + 1),
    ),
  ];

  const alRestauranteKm =
    posicion && restaurante
      ? redondear(distanciaCalleKm(posicion, restaurante))
      : null;

  return {
    carga: {
      fase,
      max_pedidos: MAX_PEDIDOS_POR_CARGA,
      total_pedidos: filas.length,
      sin_ubicacion: sinUbicacion.length,
      ventana: ventanaDePedido(primera.vi, primera.vf),
      restaurante: {
        id: primera.restaurante_id as number,
        nombre: primera.restaurante_nombre as string,
        direccion: primera.restaurante_direccion as string | null,
        tiene_ubicacion: !!restaurante,
      },
      // Cómo llegar al restaurante a recoger
      recogida: {
        distancia_km: alRestauranteKm,
        minutos:
          alRestauranteKm !== null ? minutosViaje(alRestauranteKm) : null,
        url_maps: urlMapsDestino(
          restaurante,
          `${primera.restaurante_nombre}, ${primera.restaurante_direccion ?? ""}`.trim(),
        ),
      },
      // El recorrido de las entregas, ya en el mejor orden
      entregas,
      resumen: { distancia_km: ruta.km, minutos: ruta.minutos },
      url_maps_entregas: urlMapsRuta(
        fase === "recogida" ? restaurante : null,
        orden.map((i) => puntos[i]),
      ),
    },
  };
}

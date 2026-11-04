import { db } from "../../config/db";
import { SUSCRIPCION_AL_DIA } from "../../config/suscripcionSql";

const METODOS_VALIDOS = ["efectivo", "transferencia", "tarjeta"];

// mysql2 devuelve las columnas JSON ya como array, pero por si llega como texto se admite también
export function parseMetodos(valor: any): string[] {
  let lista: any = valor;

  if (typeof valor === "string") {
    try {
      lista = JSON.parse(valor);
    } catch {
      lista = null;
    }
  }

  if (!Array.isArray(lista)) return ["efectivo"];

  const filtrados = lista.filter((m: any) => METODOS_VALIDOS.includes(m));
  return filtrados.length > 0 ? filtrados : ["efectivo"];
}

// Pedidos de los últimos 30 días que no se cancelaron ni se rechazaron
// Pedidos de los últimos 30 días que no se cancelaron ni se rechazaron
const PEDIDOS_RECIENTES = `(SELECT COUNT(*) FROM pedidos x
  WHERE x.restaurante_id = r.id
    AND x.fecha_creacion >= NOW() - INTERVAL 30 DAY
    AND x.estado NOT IN ('cancelado', 'rechazado'))`;

// El orden sale de esta lista fija, nunca de lo que escribe el cliente
// 2) Orden por defecto: primero los que de verdad pueden recibir pedidos
const ORDEN_DEFECTO = `(r.estado = 'abierto' AND ${SUSCRIPCION_AL_DIA("r")} = 1) DESC, r.rating DESC, r.nombre ASC`;
const ORDEN: Record<string, string> = {
  populares: `${PEDIDOS_RECIENTES} DESC, r.nombre ASC`,
  mejor_valorados: "r.rating DESC, r.reviews_count DESC, r.nombre ASC",
  entrega_rapida: "r.tiempo_preparacion_min ASC, r.nombre ASC",
  nuevos: "r.fecha_creacion DESC, r.nombre ASC",
};

// Columnas que comparten la lista de restaurantes y la de favoritos
export const COLUMNAS_RESTAURANTE = `
  r.id, r.nombre, r.logo, r.categorias_texto, r.estado, r.rating, r.reviews_count,
  r.tiempo_preparacion_min, r.costo_envio, r.pedido_minimo,
  (SELECT f.url FROM restaurante_fotos f
    WHERE f.restaurante_id = r.id
    ORDER BY f.fecha_creacion ASC LIMIT 1) AS foto_portada,
  EXISTS (SELECT 1 FROM platos pl
    WHERE pl.restaurante_id = r.id AND pl.disponible = 1) AS tiene_platos,
     EXISTS (SELECT 1 FROM platos pl
    WHERE pl.restaurante_id = r.id AND pl.disponible = 1) AS tiene_platos,
  ${SUSCRIPCION_AL_DIA("r")} AS suscripcion_al_dia`;

export const aRestauranteLista = (r: any) => ({
  id: r.id,
  nombre: r.nombre,
  logo: r.logo,
  foto_portada: r.foto_portada,
  categorias_texto: r.categorias_texto,
  rating: Number(r.rating),
  reviews_count: Number(r.reviews_count),
  tiempo_min: r.tiempo_preparacion_min,
  tiempo_max: r.tiempo_preparacion_min + 10, // estimación: preparación + reparto
  costo_envio: Number(r.costo_envio),
  pedido_minimo: Number(r.pedido_minimo),
  abierto: r.estado === "abierto" && !!r.suscripcion_al_dia,
  tiene_platos: !!r.tiene_platos,
  es_favorito: !!r.es_favorito,
});

interface FiltrosLista {
  busqueda?: string;
  categoria?: string;
  filtro?: string;
  limite?: number;
}

export const listarRestaurantes = async (
  { busqueda, categoria, filtro, limite }: FiltrosLista,
  clienteId: number,
) => {
  const conPlatos =
    "EXISTS (SELECT 1 FROM platos p WHERE p.restaurante_id = r.id AND p.disponible = 1)";

  const where: string[] = ["r.suspendido = 0"];
  const params: any[] = [];

  if (busqueda) {
    // Por nombre se encuentra siempre. Por tipo de cocina o por plato, solo si tiene platos disponibles.
    const termino = `%${busqueda}%`;
    where.push(
      `(r.nombre LIKE ? OR (${conPlatos} AND (r.categorias_texto LIKE ? OR EXISTS (
         SELECT 1 FROM platos p WHERE p.restaurante_id = r.id AND p.disponible = 1 AND p.nombre LIKE ?
       ))))`,
    );
    params.push(termino, termino, termino);
  } else {
    // Sin búsqueda, un restaurante sin platos disponibles no se puede pedir, así que no se lista
    where.push(conPlatos);
  }

  if (categoria) {
    where.push("r.categorias_texto LIKE ?");
    params.push(`%${categoria}%`);
  }

  // 5) En listarRestaurantes, el filtro "abierto"
  if (filtro === "abierto")
    where.push(`r.estado = 'abierto' AND ${SUSCRIPCION_AL_DIA("r")} = 1`);
  if (filtro === "mejor_valorados")
    where.push("r.reviews_count > 0 AND r.rating >= 4.5");
  if (filtro === "entrega_rapida") where.push("r.tiempo_preparacion_min <= 20");
  if (filtro === "populares") where.push(`${PEDIDOS_RECIENTES} > 0`);
  if (filtro === "nuevos")
    where.push("r.fecha_creacion >= NOW() - INTERVAL 30 DAY");

  // hasOwnProperty evita que un filtro como "constructor" se cuele como orden
  const orden =
    filtro && Object.prototype.hasOwnProperty.call(ORDEN, filtro)
      ? ORDEN[filtro]
      : ORDEN_DEFECTO;

  // Entre 1 y 100; cualquier otro valor se ignora
  const tope =
    Number.isInteger(limite) && (limite as number) > 0
      ? Math.min(limite as number, 100)
      : 100;

  const [rows]: any = await db.query(
    `SELECT ${COLUMNAS_RESTAURANTE},
            EXISTS (SELECT 1 FROM restaurantes_favoritos fav
                    WHERE fav.usuario_id = ? AND fav.restaurante_id = r.id) AS es_favorito
     FROM restaurantes r
     WHERE ${where.join(" AND ")}
     ORDER BY tiene_platos DESC, ${orden}
     LIMIT ?`,
    [clienteId, ...params, tope],
  );

  return rows.map(aRestauranteLista);
};

export const obtenerRestaurante = async (
  restauranteId: number,
  clienteId: number,
) => {
  const [rows]: any = await db.query(
    `SELECT id, nombre, logo, telefono, direccion, categorias_texto, estado, rating, reviews_count,
            tiempo_preparacion_min, costo_envio, pedido_minimo, metodos_pago_aceptados,
            ${SUSCRIPCION_AL_DIA("restaurantes")} AS suscripcion_al_dia
     FROM restaurantes WHERE id = ? AND suspendido = 0`,
    [restauranteId],
  );

  if (rows.length === 0) throw new Error("Restaurante no encontrado");
  const r = rows[0];

  const [favRows]: any = await db.query(
    "SELECT 1 FROM restaurantes_favoritos WHERE usuario_id = ? AND restaurante_id = ?",
    [clienteId, restauranteId],
  );

  const [[categorias], [platos], [horarios], [fotos]]: any = await Promise.all([
    db.query(
      "SELECT id, nombre FROM categorias_menu WHERE restaurante_id = ? ORDER BY orden ASC, nombre ASC",
      [restauranteId],
    ),
    db.query(
      `SELECT id, nombre, descripcion, imagen, precio, categoria_id, disponible
       FROM platos WHERE restaurante_id = ? ORDER BY nombre ASC`,
      [restauranteId],
    ),
    db.query(
      `SELECT dia_semana, hora_apertura, hora_cierre, cerrado
       FROM restaurante_horarios WHERE restaurante_id = ? ORDER BY dia_semana ASC`,
      [restauranteId],
    ),
    db.query(
      "SELECT id, url FROM restaurante_fotos WHERE restaurante_id = ? ORDER BY fecha_creacion ASC",
      [restauranteId],
    ),
  ]);

  return {
    restaurante: {
      id: r.id,
      es_favorito: favRows.length > 0,
      nombre: r.nombre,
      logo: r.logo,
      telefono: r.telefono,
      direccion: r.direccion,
      categorias_texto: r.categorias_texto,
      abierto: r.estado === "abierto" && !!r.suscripcion_al_dia,
      rating: Number(r.rating),
      reviews_count: Number(r.reviews_count),
      tiempo_min: r.tiempo_preparacion_min,
      tiempo_max: r.tiempo_preparacion_min + 10,
      costo_envio: Number(r.costo_envio),
      pedido_minimo: Number(r.pedido_minimo),
      metodos_pago: parseMetodos(r.metodos_pago_aceptados),
    },
    categorias,
    platos: platos.map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      imagen: p.imagen,
      precio: Number(p.precio),
      categoria_id: p.categoria_id,
      disponible: !!p.disponible,
    })),
    fotos,
  };
};

// Datos actuales (precio y disponibilidad) de los productos del carrito.
// El carrito del navegador solo guarda ids y cantidades: aquí se confirma lo demás.
export const obtenerDetalleCarrito = async (
  restauranteId: number,
  platoIds: unknown,
) => {
  const ids = Array.isArray(platoIds)
    ? [
        ...new Set(
          platoIds.map(Number).filter((n) => Number.isInteger(n) && n > 0),
        ),
      ].slice(0, 50)
    : [];

  const [rRows]: any = await db.query(
    `SELECT id, nombre, logo, estado, suspendido, costo_envio, pedido_minimo, tiempo_preparacion_min,
            metodos_pago_aceptados, ${SUSCRIPCION_AL_DIA("restaurantes")} AS suscripcion_al_dia
     FROM restaurantes WHERE id = ?`,
    [restauranteId],
  );
  if (rRows.length === 0) throw new Error("Restaurante no encontrado");
  const r = rRows[0];

  let platos: any[] = [];
  if (ids.length > 0) {
    const [rows]: any = await db.query(
      "SELECT id, nombre, imagen, precio, disponible FROM platos WHERE restaurante_id = ? AND id IN (?)",
      [restauranteId, ids],
    );
    platos = rows;
  }

  return {
    restaurante: {
      id: r.id,
      nombre: r.nombre,
      logo: r.logo,
      abierto:
        r.estado === "abierto" && !r.suspendido && !!r.suscripcion_al_dia,
      costo_envio: Number(r.costo_envio),
      pedido_minimo: Number(r.pedido_minimo),
      tiempo_min: r.tiempo_preparacion_min,
      tiempo_max: r.tiempo_preparacion_min + 10,
      metodos_pago: parseMetodos(r.metodos_pago_aceptados),
    },
    platos: platos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      imagen: p.imagen,
      precio: Number(p.precio),
      disponible: !!p.disponible,
    })),
  };
};

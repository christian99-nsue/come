import { db } from "../../config/db";
import { parseMetodos } from "./restaurantesClienteService";
import { registrarEvento } from "../repartidor/eventosPedidoService";
import { notificarCliente } from "./notificacionesClienteService";
import { SUSCRIPCION_AL_DIA } from "../../config/suscripcionSql";
import { resolverVentanaParaPedido } from "../ventanasService";
import { ventanaDePedido } from "../ventanasService";
import { leerUbicacion } from "../../utils/ubicacion";

const MAX_LINEAS = 30;
const MAX_POR_PLATO = 20;

interface DatosPedido {
  restaurante_id: number;
  items: { plato_id: number; cantidad: number }[];
  direccion_id: number;
  metodo_pago: string;
  ventana_id?: number;
  ventana_fecha?: string;
  total_esperado: number;
  latitud_entrega?: number | null;
  longitud_entrega?: number | null;
}

// Ej: #CM-250521-7842
function generarCodigo() {
  const d = new Date();
  const fecha =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const azar = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `#CM-${fecha}-${azar}`;
}

const xaf = (v: number) => v.toLocaleString("es-ES");

export const crearPedido = async (clienteId: number, data: DatosPedido) => {
  if (!Array.isArray(data.items) || data.items.length === 0)
    throw new Error("Tu carrito está vacío");
  if (data.items.length > MAX_LINEAS)
    throw new Error("Tu carrito tiene demasiados productos distintos");

  const restauranteId = Number(data.restaurante_id);
  if (!Number.isInteger(restauranteId) || restauranteId <= 0)
    throw new Error("Restaurante no válido");

  // Une las líneas repetidas y valida cada una
  const cantidades = new Map<number, number>();
  for (const it of data.items) {
    const platoId = Number(it.plato_id);
    const cantidad = Number(it.cantidad);
    if (
      !Number.isInteger(platoId) ||
      platoId <= 0 ||
      !Number.isInteger(cantidad) ||
      cantidad < 1
    ) {
      throw new Error("Hay un producto con datos no válidos");
    }
    cantidades.set(platoId, (cantidades.get(platoId) || 0) + cantidad);
  }
  for (const c of cantidades.values()) {
    if (c > MAX_POR_PLATO)
      throw new Error(`Máximo ${MAX_POR_PLATO} unidades por producto`);
  }

  // Validar las coordenadas de entrega antes de iniciar la transacción
  const ubicacion = leerUbicacion(data.latitud_entrega, data.longitud_entrega);

  const connection = await db.getConnection();
  let pedidoId = 0;
  let codigo = "";
  let aceptadoAuto = false;

  try {
    await connection.beginTransaction();

    const [rRows]: any = await connection.query(
      `SELECT id, estado, suspendido, costo_envio, pedido_minimo, aceptacion_pedidos, metodos_pago_aceptados,
              ${SUSCRIPCION_AL_DIA("restaurantes")} AS suscripcion_al_dia
       FROM restaurantes WHERE id = ?`,
      [restauranteId],
    );
    if (rRows.length === 0) throw new Error("Restaurante no encontrado");
    const rest = rRows[0];

    // Un restaurante suspendido por la plataforma no recibe pedidos nuevos
    if (rest.suspendido)
      throw new Error("Este restaurante no está disponible por ahora");
    // Cerrado, o con la suscripción vencida: tampoco
    if (rest.estado !== "abierto" || !rest.suscripcion_al_dia) {
      throw new Error("El restaurante está cerrado en este momento");
    }

    // Los precios SIEMPRE salen de la base de datos, nunca del navegador
    const [platosRows]: any = await connection.query(
      "SELECT id, nombre, precio, disponible FROM platos WHERE restaurante_id = ? AND id IN (?)",
      [restauranteId, [...cantidades.keys()]],
    );
    const platosPorId = new Map<number, any>(
      platosRows.map((p: any) => [p.id, p]),
    );

    const ventana = await resolverVentanaParaPedido(
      connection,
      data.ventana_id,
      data.ventana_fecha,
    );

    let subtotal = 0;
    const lineas: {
      plato_id: number;
      nombre: string;
      cantidad: number;
      precio: number;
    }[] = [];

    for (const [platoId, cantidad] of cantidades) {
      const plato = platosPorId.get(platoId);
      if (!plato) throw new Error("Uno de los productos ya no está disponible");
      if (!plato.disponible)
        throw new Error(`"${plato.nombre}" ya no está disponible`);

      const precio = Number(plato.precio);
      subtotal += precio * cantidad;
      lineas.push({
        plato_id: platoId,
        nombre: plato.nombre,
        cantidad,
        precio,
      });
    }

    const minimo = Number(rest.pedido_minimo);
    if (subtotal < minimo) {
      throw new Error(
        `El pedido mínimo de este restaurante es ${xaf(minimo)} XAF`,
      );
    }

    if (!parseMetodos(rest.metodos_pago_aceptados).includes(data.metodo_pago)) {
      throw new Error("Este restaurante no acepta ese método de pago");
    }

    const [dirRows]: any = await connection.query(
      `SELECT direccion, referencia, latitud, longitud
       FROM direcciones_cliente WHERE id = ? AND usuario_id = ?`,
      [Number(data.direccion_id), clienteId],
    );
    if (dirRows.length === 0)
      throw new Error("Selecciona una dirección de entrega válida");
    const dir = dirRows[0];

    const costoEnvio = Number(rest.costo_envio);
    const total = subtotal + costoEnvio;

    // Si lo que vio el cliente ya no coincide, no se crea el pedido
    if (
      Math.round(total * 100) !== Math.round(Number(data.total_esperado) * 100)
    ) {
      throw new Error(
        "Los precios o el costo de envío cambiaron. Revisa tu carrito antes de confirmar.",
      );
    }

    aceptadoAuto = rest.aceptacion_pedidos === "automatica";
    const estadoInicial = aceptadoAuto ? "en_preparacion" : "nuevo";

    // La referencia se añade al texto de la dirección para que la vea también el repartidor
    const direccionEntrega = (
      dir.referencia
        ? `${dir.direccion} (Ref: ${dir.referencia})`
        : dir.direccion
    ).slice(0, 255);

    let insertado = false;
    for (let intento = 0; intento < 5 && !insertado; intento++) {
      codigo = generarCodigo();
      try {
        const [ins]: any = await connection.query(
          `INSERT INTO pedidos
             (codigo, restaurante_id, cliente_id, estado, subtotal, costo_envio, total, metodo_pago,
              direccion_entrega, latitud_entrega, longitud_entrega)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            codigo,
            restauranteId,
            clienteId,
            estadoInicial,
            subtotal,
            costoEnvio,
            total,
            data.metodo_pago,
            direccionEntrega,
            dir.latitud,
            dir.longitud,
          ],
        );
        pedidoId = ins.insertId;

        // Guardar la ubicación actual del cliente
        await connection.query(
          `UPDATE pedidos
   SET latitud_entrega = ?, longitud_entrega = ?
   WHERE id = ?`,
          [ubicacion?.lat ?? null, ubicacion?.lng ?? null, pedidoId],
        );

        insertado = true;
      } catch (error: any) {
        if (error.code !== "ER_DUP_ENTRY") throw error; // solo se reintenta si el código ya existía
      }
    }
    if (!insertado)
      throw new Error("No se pudo crear el pedido. Inténtalo de nuevo.");

    for (const l of lineas) {
      await connection.query(
        `INSERT INTO pedido_items (pedido_id, plato_id, nombre_plato, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?, ?)`,
        [pedidoId, l.plato_id, l.nombre, l.cantidad, l.precio],
      );
    }

    // Aviso para el restaurante
    const [clienteRows]: any = await connection.query(
      "SELECT nombre FROM usuarios WHERE id = ?",
      [clienteId],
    );
    await connection.query(
      `INSERT INTO notificaciones_admin (restaurante_id, tipo, titulo, mensaje, referencia_id)
       VALUES (?, 'pedido', 'Nuevo pedido', ?, ?)`,
      [
        restauranteId,
        `${codigo} · ${clienteRows[0]?.nombre ?? "Cliente"} · ${xaf(total)} XAF`,
        pedidoId,
      ],
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  // Con aceptación automática queda registrado como si el restaurante lo hubiera aceptado
  if (aceptadoAuto) {
    await registrarEvento(pedidoId, "aceptado");
    await notificarCliente(pedidoId, "confirmado");
  }

  return { id: pedidoId, codigo };
};

export const obtenerPedido = async (pedidoId: number, clienteId: number) => {
  const [rows]: any = await db.query(
    `SELECT p.id, p.codigo, p.estado, p.subtotal, p.costo_envio, p.total, p.metodo_pago,
            p.direccion_entrega, p.fecha_creacion, p.repartidor_id,
            r.id AS restaurante_id, r.nombre AS restaurante_nombre, r.logo AS restaurante_logo,
            r.telefono AS restaurante_telefono, r.tiempo_preparacion_min,
            DATE_FORMAT(p.ventana_entrega_inicio, '%Y-%m-%d %H:%i:%s') AS ventana_inicio,
            DATE_FORMAT(p.ventana_entrega_fin, '%Y-%m-%d %H:%i:%s') AS ventana_fin,
            u.nombre AS repartidor_nombre, u.foto_perfil AS repartidor_foto,
            u.telefono AS repartidor_telefono
     FROM pedidos p
     JOIN restaurantes r ON r.id = p.restaurante_id
     LEFT JOIN usuarios u ON u.id = p.repartidor_id
     WHERE p.id = ? AND p.cliente_id = ?`,
    [pedidoId, clienteId],
  );
  if (rows.length === 0) throw new Error("Pedido no encontrado");
  const p = rows[0];

  const [items]: any = await db.query(
    "SELECT nombre_plato, cantidad, precio_unitario FROM pedido_items WHERE pedido_id = ?",
    [pedidoId],
  );

  const [valRows]: any = await db.query(
    "SELECT estrellas, comentario FROM valoraciones WHERE pedido_id = ?",
    [pedidoId],
  );

  const [eventosRows]: any = await db.query(
    "SELECT evento, MAX(fecha) AS fecha FROM pedido_eventos WHERE pedido_id = ? GROUP BY evento",
    [pedidoId],
  );
  const eventos: Record<string, string> = {};
  for (const e of eventosRows)
    eventos[e.evento] = new Date(e.fecha).toISOString();

  const enCurso = ["listo_para_recoger", "en_entrega"].includes(p.estado);
  const tieneRepartidor =
    p.repartidor_id !== null && (enCurso || p.estado === "entregado");

  return {
    id: p.id,
    codigo: p.codigo,
    estado: p.estado,
    subtotal: Number(p.subtotal),
    costo_envio: Number(p.costo_envio),
    total: Number(p.total),
    metodo_pago: p.metodo_pago,
    direccion_entrega: p.direccion_entrega,
    fecha_creacion: new Date(p.fecha_creacion).toISOString(),
    restaurante_id: p.restaurante_id,
    restaurante_nombre: p.restaurante_nombre,
    restaurante_logo: p.restaurante_logo,
    restaurante_telefono: p.restaurante_telefono,
    tiempo_min: p.tiempo_preparacion_min,
    tiempo_max: p.tiempo_preparacion_min + 10,
    entrega: ventanaDePedido(p.ventana_inicio, p.ventana_fin),
    // El teléfono del repartidor solo se entrega mientras lleva el pedido
    repartidor: tieneRepartidor
      ? {
          nombre: p.repartidor_nombre,
          foto_perfil: p.repartidor_foto,
          telefono: enCurso ? p.repartidor_telefono : null,
        }
      : null,
    eventos,
    puede_cancelar: p.estado === "nuevo",
    valoracion:
      valRows.length > 0
        ? {
            estrellas: Number(valRows[0].estrellas),
            comentario: valRows[0].comentario,
          }
        : null,
    puede_valorar: p.estado === "entregado" && valRows.length === 0,
    items: items.map((i: any) => ({
      nombre_plato: i.nombre_plato,
      cantidad: i.cantidad,
      precio_unitario: Number(i.precio_unitario),
    })),
  };
};

const SELECT_LISTADO = `
  SELECT p.id, p.codigo, p.estado, p.total, p.fecha_creacion,
         r.nombre AS restaurante_nombre, r.logo AS restaurante_logo,
         u.nombre AS repartidor_nombre,
         (SELECT COALESCE(SUM(i.cantidad), 0) FROM pedido_items i WHERE i.pedido_id = p.id) AS productos
  FROM pedidos p
  JOIN restaurantes r ON r.id = p.restaurante_id
  LEFT JOIN usuarios u ON u.id = p.repartidor_id`;

const aListado = (r: any, conRepartidor: boolean) => ({
  id: r.id,
  codigo: r.codigo,
  estado: r.estado,
  total: Number(r.total),
  productos: Number(r.productos),
  restaurante_nombre: r.restaurante_nombre,
  restaurante_logo: r.restaurante_logo,
  repartidor_nombre: conRepartidor ? r.repartidor_nombre : null,
  fecha_creacion: new Date(r.fecha_creacion).toISOString(),
});

export const listarPedidos = async (clienteId: number) => {
  const [activos]: any = await db.query(
    `${SELECT_LISTADO}
     WHERE p.cliente_id = ?
       AND p.estado IN ('nuevo', 'en_preparacion', 'listo_para_recoger', 'en_entrega')
     ORDER BY p.fecha_creacion DESC`,
    [clienteId],
  );

  const [finalizados]: any = await db.query(
    `${SELECT_LISTADO}
     WHERE p.cliente_id = ? AND p.estado IN ('entregado', 'cancelado', 'rechazado')
     ORDER BY p.fecha_creacion DESC
     LIMIT 100`,
    [clienteId],
  );

  return {
    activos: activos.map((r: any) => aListado(r, true)),
    historial: finalizados
      .filter((r: any) => r.estado === "entregado")
      .map((r: any) => aListado(r, false)),
    cancelados: finalizados
      .filter((r: any) => r.estado !== "entregado")
      .map((r: any) => aListado(r, false)),
  };
};

export const cancelarPedido = async (pedidoId: number, clienteId: number) => {
  // Solo se puede cancelar si el restaurante todavía no lo ha confirmado
  const [result]: any = await db.query(
    `UPDATE pedidos SET estado = 'cancelado'
     WHERE id = ? AND cliente_id = ? AND estado = 'nuevo'`,
    [pedidoId, clienteId],
  );

  if (result.affectedRows === 0) {
    throw new Error(
      "Este pedido ya no se puede cancelar porque el restaurante lo está atendiendo. Llama al restaurante.",
    );
  }

  await registrarEvento(pedidoId, "cancelado");

  // Aviso para el restaurante; si falla, la cancelación ya está hecha
  try {
    const [rows]: any = await db.query(
      `SELECT p.codigo, p.restaurante_id, u.nombre
       FROM pedidos p JOIN usuarios u ON u.id = p.cliente_id
       WHERE p.id = ?`,
      [pedidoId],
    );
    if (rows.length > 0) {
      await db.query(
        `INSERT INTO notificaciones_admin (restaurante_id, tipo, titulo, mensaje, referencia_id)
         VALUES (?, 'pedido', 'Pedido cancelado', ?, ?)`,
        [
          rows[0].restaurante_id,
          `${rows[0].codigo} · ${rows[0].nombre} canceló el pedido`,
          pedidoId,
        ],
      );
    }
  } catch (error) {
    console.error("No se pudo avisar al restaurante de la cancelación:", error);
  }

  return { ok: true };
};

// Productos de un pedido anterior con los datos de hoy (precio y disponibilidad)
export const datosParaRepetir = async (pedidoId: number, clienteId: number) => {
  const [pRows]: any = await db.query(
    `SELECT p.restaurante_id, r.nombre AS restaurante_nombre
     FROM pedidos p JOIN restaurantes r ON r.id = p.restaurante_id
     WHERE p.id = ? AND p.cliente_id = ?`,
    [pedidoId, clienteId],
  );
  if (pRows.length === 0) throw new Error("Pedido no encontrado");

  const [items]: any = await db.query(
    `SELECT i.plato_id, i.cantidad, pl.nombre, pl.imagen, pl.precio, pl.disponible
     FROM pedido_items i
     LEFT JOIN platos pl ON pl.id = i.plato_id AND pl.restaurante_id = ?
     WHERE i.pedido_id = ?`,
    [pRows[0].restaurante_id, pedidoId],
  );

  // Un plato eliminado o agotado no se añade
  const disponibles = items.filter(
    (i: any) => i.plato_id !== null && i.nombre !== null && !!i.disponible,
  );

  return {
    restaurante: {
      id: pRows[0].restaurante_id,
      nombre: pRows[0].restaurante_nombre,
    },
    items: disponibles.map((i: any) => ({
      plato_id: i.plato_id,
      nombre: i.nombre,
      imagen: i.imagen,
      precio: Number(i.precio),
      cantidad: Math.min(Number(i.cantidad), 20),
    })),
    no_disponibles: items.length - disponibles.length,
  };
};

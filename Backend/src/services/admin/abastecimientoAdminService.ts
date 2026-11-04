import { db } from "../../config/db";

export const listarProductos = async (
  categoria?: string,
  busqueda?: string,
) => {
  // Los productos que el súper admin desactivó ya no aparecen en el catálogo del restaurante
  let sql = `
    SELECT pa.id, pa.nombre, pa.imagen, pa.precio, pa.categoria,
           pr.nombre AS proveedor_nombre
    FROM productos_abastecimiento pa
    LEFT JOIN proveedores pr ON pr.id = pa.proveedor_id
    WHERE pa.activo = 1
  `;
  const params: any[] = [];

  if (categoria && categoria !== "todos") {
    sql += " AND pa.categoria = ?";
    params.push(categoria);
  }

  if (busqueda) {
    sql += " AND pa.nombre LIKE ?";
    params.push(`%${busqueda}%`);
  }

  sql += " ORDER BY pa.nombre ASC";

  const [rows]: any = await db.query(sql, params);
  return rows;
};

// ===== Pedidos de abastecimiento (lo único que el admin de restaurante SÍ puede crear) =====
interface ItemCarrito {
  producto_id: number;
  cantidad: number;
}

export const crearPedido = async (
  restauranteId: number,
  items: unknown,
  turnoEntrega?: unknown,
) => {
  if (!Array.isArray(items) || items.length === 0)
    throw new Error("El carrito está vacío");
  if (items.length > 50)
    throw new Error("El carrito tiene demasiados productos distintos");

  // Une las líneas repetidas y valida cada una: sin esto, una cantidad negativa restaría del total
  const cantidades = new Map<number, number>();
  for (const it of items) {
    const productoId = Number(it?.producto_id);
    const cantidad = Number(it?.cantidad);
    if (
      !Number.isInteger(productoId) ||
      productoId <= 0 ||
      !Number.isInteger(cantidad) ||
      cantidad < 1
    ) {
      throw new Error("Hay un producto con datos no válidos");
    }
    cantidades.set(productoId, (cantidades.get(productoId) || 0) + cantidad);
  }
  for (const c of cantidades.values()) {
    if (c > 500) throw new Error("Máximo 500 unidades por producto");
  }

  if (
    turnoEntrega !== undefined &&
    turnoEntrega !== null &&
    typeof turnoEntrega !== "string"
  ) {
    throw new Error("El turno de entrega no es válido");
  }
  const turno = String(turnoEntrega ?? "")
    .trim()
    .slice(0, 50);


  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // El precio SIEMPRE se toma del catálogo real, y solo de productos activos
    const [productosRows]: any = await connection.query(
      "SELECT id, precio FROM productos_abastecimiento WHERE id IN (?) AND activo = 1",
      [[...cantidades.keys()]],
    );
    if (productosRows.length !== cantidades.size) {
      throw new Error(
        "Uno de los productos ya no está disponible. Revisa tu carrito.",
      );
    }

    const precioPorId = new Map<number, number>(
      productosRows.map((p: any) => [p.id, Number(p.precio)]),
    );

    let total = 0;
    for (const [productoId, cantidad] of cantidades)
      total += (precioPorId.get(productoId) as number) * cantidad;

    const [pedidoResult]: any = await connection.query(
      `INSERT INTO pedidos_abastecimiento (restaurante_id, estado, total, turno_entrega)
       VALUES (?, 'pendiente', ?, ?)`,
      [restauranteId, total, turno || null],
    );
    const pedidoId = pedidoResult.insertId;

    for (const [productoId, cantidad] of cantidades) {
      await connection.query(
        `INSERT INTO pedido_abastecimiento_items (pedido_abastecimiento_id, producto_id, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [pedidoId, productoId, cantidad, precioPorId.get(productoId)],
      );
    }

    await connection.commit();
    return { id: pedidoId, total };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const listarPedidos = async (restauranteId: number) => {
  const [rows]: any = await db.query(
    `SELECT pa.id, pa.estado, pa.total, pa.turno_entrega,
            TIME_FORMAT(pa.hora_entrega, '%H:%i') AS hora_entrega,
            pa.motivo_cancelacion, pa.fecha_creacion,
            (SELECT COUNT(*) FROM pedido_abastecimiento_items i
              WHERE i.pedido_abastecimiento_id = pa.id) AS lineas,
            (SELECT COALESCE(SUM(i.cantidad), 0) FROM pedido_abastecimiento_items i
              WHERE i.pedido_abastecimiento_id = pa.id) AS unidades
     FROM pedidos_abastecimiento pa
     WHERE pa.restaurante_id = ?
     ORDER BY (pa.estado IN ('pendiente', 'confirmado')) DESC, pa.fecha_creacion DESC
     LIMIT 100`,
    [restauranteId],
  );

  return rows.map((p: any) => ({
    id: p.id as number,
    estado: p.estado as "pendiente" | "confirmado" | "entregado" | "cancelado",
    total: Number(p.total),
    turno_entrega: p.turno_entrega as string | null,
    hora_entrega: p.hora_entrega as string | null,
    motivo_cancelacion: p.motivo_cancelacion as string | null,
    fecha_creacion: new Date(p.fecha_creacion).toISOString(),
    lineas: Number(p.lineas),
    unidades: Number(p.unidades),
  }));
};

export const obtenerDetallePedido = async (
  pedidoId: number,
  restauranteId: number,
) => {
  if (!Number.isInteger(pedidoId) || pedidoId <= 0)
    throw new Error("Pedido de abastecimiento no encontrado");

  // Solo se entrega si el pedido es de este restaurante
  const [pedidoRows]: any = await db.query(
    `SELECT id, estado, total, turno_entrega, TIME_FORMAT(hora_entrega, '%H:%i') AS hora_entrega,
            motivo_cancelacion, fecha_creacion, fecha_actualizacion
     FROM pedidos_abastecimiento
     WHERE id = ? AND restaurante_id = ?`,
    [pedidoId, restauranteId],
  );
  if (pedidoRows.length === 0)
    throw new Error("Pedido de abastecimiento no encontrado");

  const [[itemsRows], [eventosRows]]: any = await Promise.all([
    db.query(
      `SELECT pi.cantidad, pi.precio_unitario, pa.nombre, pa.imagen
       FROM pedido_abastecimiento_items pi
       JOIN productos_abastecimiento pa ON pa.id = pi.producto_id
       WHERE pi.pedido_abastecimiento_id = ?
       ORDER BY pa.nombre ASC`,
      [pedidoId],
    ),
    // Sin nombres de personas del equipo: el restaurante solo ve qué pasó y cuándo
    db.query(
      `SELECT estado, nota, fecha
       FROM pedido_abastecimiento_eventos WHERE pedido_id = ? ORDER BY id ASC`,
      [pedidoId],
    ),
  ]);

  const p = pedidoRows[0];
  return {
    id: p.id as number,
    estado: p.estado as "pendiente" | "confirmado" | "entregado" | "cancelado",
    total: Number(p.total),
    turno_entrega: p.turno_entrega as string | null,
    hora_entrega: p.hora_entrega as string | null,
    motivo_cancelacion: p.motivo_cancelacion as string | null,
    fecha_creacion: new Date(p.fecha_creacion).toISOString(),
    fecha_actualizacion: new Date(p.fecha_actualizacion).toISOString(),
    items: itemsRows.map((i: any) => ({
      cantidad: Number(i.cantidad),
      precio_unitario: Number(i.precio_unitario),
      subtotal: Number(i.cantidad) * Number(i.precio_unitario),
      nombre: i.nombre as string,
      imagen: i.imagen as string | null,
    })),
    eventos: eventosRows.map((e: any) => ({
      estado: e.estado as
        | "pendiente"
        | "confirmado"
        | "entregado"
        | "cancelado",
      nota: e.nota as string | null,
      fecha: new Date(e.fecha).toISOString(),
    })),
  };
};

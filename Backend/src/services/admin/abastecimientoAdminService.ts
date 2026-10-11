import { db } from "../../config/db";

export const listarProductos = async (
  categoria?: string,
  busqueda?: string,
) => {
  let sql = `
    SELECT pa.id, pa.nombre, pa.imagen, pa.precio, pa.categoria,
           pr.nombre AS proveedor_nombre
    FROM productos_abastecimiento pa
    LEFT JOIN proveedores pr ON pr.id = pa.proveedor_id
    WHERE 1 = 1
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
  items: ItemCarrito[],
  turnoEntrega?: string,
) => {
  if (!items || items.length === 0) {
    throw new Error("El carrito está vacío");
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // El precio SIEMPRE se toma del catálogo real, nunca de lo que mande
    // el frontend — así nadie puede manipular el total del pedido.
    const ids = items.map((i) => i.producto_id);
    const [productosRows]: any = await connection.query(
      `SELECT id, precio FROM productos_abastecimiento WHERE id IN (?)`,
      [ids],
    );

    const precioPorId = new Map(
      productosRows.map((p: any) => [p.id, Number(p.precio)]),
    );

    let total = 0;
    for (const item of items) {
      const precio = precioPorId.get(item.producto_id);
      if (precio === undefined)
        throw new Error(`Producto ${item.producto_id} no existe`);
      total += precio * item.cantidad;
    }

    const [pedidoResult]: any = await connection.query(
      `INSERT INTO pedidos_abastecimiento (restaurante_id, estado, total, turno_entrega)
       VALUES (?, 'pendiente', ?, ?)`,
      [restauranteId, total, turnoEntrega || null],
    );

    const pedidoId = pedidoResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO pedido_abastecimiento_items (pedido_abastecimiento_id, producto_id, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [
          pedidoId,
          item.producto_id,
          item.cantidad,
          precioPorId.get(item.producto_id),
        ],
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
    `SELECT id, estado, total, turno_entrega, fecha_creacion
     FROM pedidos_abastecimiento
     WHERE restaurante_id = ?
     ORDER BY fecha_creacion DESC`,
    [restauranteId],
  );
  return rows;
};

export const obtenerDetallePedido = async (
  pedidoId: number,
  restauranteId: number,
) => {
  const [pedidoRows]: any = await db.query(
    `SELECT id, estado, total, turno_entrega, fecha_creacion
     FROM pedidos_abastecimiento
     WHERE id = ? AND restaurante_id = ?`,
    [pedidoId, restauranteId],
  );

  if (pedidoRows.length === 0)
    throw new Error("Pedido de abastecimiento no encontrado");

  const [itemsRows]: any = await db.query(
    `SELECT pi.cantidad, pi.precio_unitario, pa.nombre, pa.imagen
     FROM pedido_abastecimiento_items pi
     JOIN productos_abastecimiento pa ON pa.id = pi.producto_id
     WHERE pi.pedido_abastecimiento_id = ?`,
    [pedidoId],
  );

  return { ...pedidoRows[0], items: itemsRows };
};

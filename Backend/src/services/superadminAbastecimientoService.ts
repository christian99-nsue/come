import { db } from "../config/db";
import { construirSet } from "../utils/sql";
import { ErrorSuperAdmin } from "./superadminRestaurantesService";

const CATEGORIAS = ["carnes", "ingredientes", "bebidas", "materiales"];
const ESTADOS = ["pendiente", "confirmado", "entregado", "cancelado"] as const;
type EstadoPedido = (typeof ESTADOS)[number];

const POR_PAGINA = 20;
const MAX_PRECIO = 10_000_000;

// Un pedido entregado o cancelado ya no cambia
const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  pendiente: ["confirmado", "cancelado"],
  confirmado: ["entregado", "cancelado"],
  entregado: [],
  cancelado: [],
};

type SuperAdmin = { id: number; nombre: string };

const escaparLike = (t: string) => t.replace(/[\\%_]/g, "\\$&");
const texto = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const paginaDe = (v: unknown) =>
  Math.min(10000, Math.max(1, Math.floor(Number(v)) || 1));

// ===== Validaciones =====

function leerNombre(v: unknown, etiqueta: string) {
  const nombre = typeof v === "string" ? v.trim() : "";
  if (nombre.length < 2 || nombre.length > 150) {
    throw new ErrorSuperAdmin(
      400,
      `${etiqueta} debe tener entre 2 y 150 caracteres`,
    );
  }
  return nombre;
}

function leerCategoria(v: unknown) {
  if (typeof v !== "string" || !CATEGORIAS.includes(v))
    throw new ErrorSuperAdmin(400, "Elige una categoría válida");
  return v;
}

function leerActivo(v: unknown) {
  if (typeof v !== "boolean") throw new ErrorSuperAdmin(400, "Valor no válido");
  return v ? 1 : 0;
}

function leerPrecio(v: unknown) {
  const n = Number(v);
  if (
    v === "" ||
    v === null ||
    v === undefined ||
    !Number.isFinite(n) ||
    n <= 0 ||
    n > MAX_PRECIO
  ) {
    throw new ErrorSuperAdmin(400, "El precio debe ser un número mayor que 0");
  }
  return Math.round(n * 100) / 100;
}

// La imagen solo puede venir de nuestro almacenamiento, no de una dirección cualquiera
function leerImagen(v: unknown) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "string" || v.length > 255)
    throw new ErrorSuperAdmin(400, "La imagen no es válida");
  const base = process.env.SUPABASE_URL;
  if (base && !v.startsWith(`${base}/storage/v1/object/public/`))
    throw new ErrorSuperAdmin(400, "La imagen no es válida");
  return v;
}

async function leerProveedorId(v: unknown) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0)
    throw new ErrorSuperAdmin(400, "Proveedor no válido");
  const [rows]: any = await db.query(
    "SELECT id FROM proveedores WHERE id = ?",
    [n],
  );
  if (rows.length === 0)
    throw new ErrorSuperAdmin(400, "El proveedor no existe");
  return n;
}

// ===== Proveedores =====

const aProveedor = (r: any) => ({
  id: r.id as number,
  nombre: r.nombre as string,
  categoria: r.categoria as string,
  activo: !!r.activo,
  productos_activos: Number(r.productos_activos ?? 0),
});

async function obtenerProveedor(id: number) {
  const [rows]: any = await db.query(
    `SELECT pr.id, pr.nombre, pr.categoria, pr.activo,
            (SELECT COUNT(*) FROM productos_abastecimiento p WHERE p.proveedor_id = pr.id AND p.activo = 1) AS productos_activos
     FROM proveedores pr WHERE pr.id = ?`,
    [id],
  );
  if (rows.length === 0)
    throw new ErrorSuperAdmin(404, "Proveedor no encontrado");
  return aProveedor(rows[0]);
}

export const listarProveedores = async () => {
  const [rows]: any = await db.query(
    `SELECT pr.id, pr.nombre, pr.categoria, pr.activo,
            (SELECT COUNT(*) FROM productos_abastecimiento p WHERE p.proveedor_id = pr.id AND p.activo = 1) AS productos_activos
     FROM proveedores pr
     ORDER BY pr.activo DESC, pr.nombre ASC`,
  );
  return rows.map(aProveedor);
};

export const crearProveedor = async (datos: {
  nombre?: unknown;
  categoria?: unknown;
}) => {
  const nombre = leerNombre(datos.nombre, "El nombre");
  const categoria = leerCategoria(datos.categoria);

  const [dup]: any = await db.query(
    "SELECT id FROM proveedores WHERE nombre = ?",
    [nombre],
  );
  if (dup.length > 0)
    throw new ErrorSuperAdmin(409, "Ya existe un proveedor con ese nombre");

  const [res]: any = await db.query(
    "INSERT INTO proveedores (nombre, categoria) VALUES (?, ?)",
    [nombre, categoria],
  );
  return obtenerProveedor(res.insertId);
};

export const actualizarProveedor = async (
  id: number,
  datos: Record<string, any>,
) => {
  await obtenerProveedor(id); // 404 si no existe

  const cambios: Record<string, any> = {};
  if (datos.nombre !== undefined)
    cambios.nombre = leerNombre(datos.nombre, "El nombre");
  if (datos.categoria !== undefined)
    cambios.categoria = leerCategoria(datos.categoria);
  if (datos.activo !== undefined) cambios.activo = leerActivo(datos.activo);

  if (cambios.nombre) {
    const [dup]: any = await db.query(
      "SELECT id FROM proveedores WHERE nombre = ? AND id <> ?",
      [cambios.nombre, id],
    );
    if (dup.length > 0)
      throw new ErrorSuperAdmin(409, "Ya existe un proveedor con ese nombre");
  }

  const { sql, valores } = construirSet(cambios, [
    "nombre",
    "categoria",
    "activo",
  ]);
  if (!sql) throw new ErrorSuperAdmin(400, "No hay cambios para guardar");

  await db.query(`UPDATE proveedores SET ${sql} WHERE id = ?`, [
    ...valores,
    id,
  ]);
  return obtenerProveedor(id);
};

// ===== Productos =====

const aProducto = (r: any) => ({
  id: r.id as number,
  nombre: r.nombre as string,
  categoria: r.categoria as string,
  precio: Number(r.precio),
  imagen: r.imagen as string | null,
  activo: !!r.activo,
  proveedor_id: r.proveedor_id as number | null,
  proveedor_nombre: r.proveedor_nombre as string | null,
});

async function obtenerProducto(id: number) {
  const [rows]: any = await db.query(
    `SELECT pa.id, pa.nombre, pa.categoria, pa.precio, pa.imagen, pa.activo,
            pa.proveedor_id, pr.nombre AS proveedor_nombre
     FROM productos_abastecimiento pa
     LEFT JOIN proveedores pr ON pr.id = pa.proveedor_id
     WHERE pa.id = ?`,
    [id],
  );
  if (rows.length === 0)
    throw new ErrorSuperAdmin(404, "Producto no encontrado");
  return aProducto(rows[0]);
}

export const listarProductos = async (f: {
  busqueda?: unknown;
  categoria?: unknown;
  proveedor_id?: unknown;
  estado?: unknown;
  pagina?: unknown;
}) => {
  const where: string[] = ["1 = 1"];
  const params: any[] = [];

  const busqueda = texto(f.busqueda, 100);
  if (busqueda) {
    where.push("pa.nombre LIKE ?");
    params.push(`%${escaparLike(busqueda)}%`);
  }
  if (typeof f.categoria === "string" && CATEGORIAS.includes(f.categoria)) {
    where.push("pa.categoria = ?");
    params.push(f.categoria);
  }
  const proveedorId = Number(f.proveedor_id);
  if (Number.isInteger(proveedorId) && proveedorId > 0) {
    where.push("pa.proveedor_id = ?");
    params.push(proveedorId);
  }
  if (f.estado === "activos") where.push("pa.activo = 1");
  if (f.estado === "inactivos") where.push("pa.activo = 0");

  const pagina = paginaDe(f.pagina);
  const condicion = where.join(" AND ");

  const [[conteo], [filas]]: any = await Promise.all([
    db.query(
      `SELECT COUNT(*) AS total FROM productos_abastecimiento pa WHERE ${condicion}`,
      params,
    ),
    db.query(
      `SELECT pa.id, pa.nombre, pa.categoria, pa.precio, pa.imagen, pa.activo,
              pa.proveedor_id, pr.nombre AS proveedor_nombre
       FROM productos_abastecimiento pa
       LEFT JOIN proveedores pr ON pr.id = pa.proveedor_id
       WHERE ${condicion}
       ORDER BY pa.activo DESC, pa.nombre ASC
       LIMIT ? OFFSET ?`,
      [...params, POR_PAGINA, (pagina - 1) * POR_PAGINA],
    ),
  ]);

  return {
    total: Number(conteo[0].total),
    pagina,
    por_pagina: POR_PAGINA,
    items: filas.map(aProducto),
  };
};

export const crearProducto = async (datos: Record<string, any>) => {
  const nombre = leerNombre(datos.nombre, "El nombre");
  const categoria = leerCategoria(datos.categoria);
  const precio = leerPrecio(datos.precio);
  const proveedorId = await leerProveedorId(datos.proveedor_id);
  const imagen = leerImagen(datos.imagen);

  const [res]: any = await db.query(
    `INSERT INTO productos_abastecimiento (proveedor_id, categoria, nombre, imagen, precio) VALUES (?, ?, ?, ?, ?)`,
    [proveedorId, categoria, nombre, imagen, precio],
  );
  return obtenerProducto(res.insertId);
};

export const actualizarProducto = async (
  id: number,
  datos: Record<string, any>,
) => {
  await obtenerProducto(id); // 404 si no existe

  const cambios: Record<string, any> = {};
  if (datos.nombre !== undefined)
    cambios.nombre = leerNombre(datos.nombre, "El nombre");
  if (datos.categoria !== undefined)
    cambios.categoria = leerCategoria(datos.categoria);
  if (datos.precio !== undefined) cambios.precio = leerPrecio(datos.precio);
  if (datos.proveedor_id !== undefined)
    cambios.proveedor_id = await leerProveedorId(datos.proveedor_id);
  if (datos.imagen !== undefined) cambios.imagen = leerImagen(datos.imagen);
  if (datos.activo !== undefined) cambios.activo = leerActivo(datos.activo);

  const { sql, valores } = construirSet(cambios, [
    "nombre",
    "categoria",
    "precio",
    "proveedor_id",
    "imagen",
    "activo",
  ]);
  if (!sql) throw new ErrorSuperAdmin(400, "No hay cambios para guardar");

  await db.query(`UPDATE productos_abastecimiento SET ${sql} WHERE id = ?`, [
    ...valores,
    id,
  ]);
  return obtenerProducto(id);
};

// ===== Pedidos de abastecimiento =====

export const obtenerContadores = async () => {
  const [rows]: any = await db.query(
    `SELECT COALESCE(SUM(estado = 'pendiente'), 0) AS pendientes,
            COALESCE(SUM(estado = 'confirmado'), 0) AS confirmados,
            COALESCE(SUM(estado = 'entregado'), 0) AS entregados,
            COALESCE(SUM(estado = 'cancelado'), 0) AS cancelados
     FROM pedidos_abastecimiento`,
  );
  const r = rows[0];
  return {
    pendientes: Number(r.pendientes),
    confirmados: Number(r.confirmados),
    entregados: Number(r.entregados),
    cancelados: Number(r.cancelados),
  };
};

export const listarPedidos = async (f: {
  estado?: unknown;
  busqueda?: unknown;
  pagina?: unknown;
}) => {
  const where: string[] = ["1 = 1"];
  const params: any[] = [];

  if (
    typeof f.estado === "string" &&
    (ESTADOS as readonly string[]).includes(f.estado)
  ) {
    where.push("pa.estado = ?");
    params.push(f.estado);
  }

  const busqueda = texto(f.busqueda, 100);
  if (busqueda) {
    const t = `%${escaparLike(busqueda)}%`;
    if (/^#?\d+$/.test(busqueda)) {
      where.push("(pa.id = ? OR r.nombre LIKE ?)");
      params.push(Number(busqueda.replace("#", "")), t);
    } else {
      where.push("r.nombre LIKE ?");
      params.push(t);
    }
  }

  const pagina = paginaDe(f.pagina);
  const condicion = where.join(" AND ");
  const desde =
    "FROM pedidos_abastecimiento pa JOIN restaurantes r ON r.id = pa.restaurante_id";

  const [[conteo], [filas]]: any = await Promise.all([
    db.query(`SELECT COUNT(*) AS total ${desde} WHERE ${condicion}`, params),
    db.query(
      `SELECT pa.id, pa.estado, pa.total, pa.turno_entrega,
              TIME_FORMAT(pa.hora_entrega, '%H:%i') AS hora_entrega, pa.fecha_creacion,
              r.nombre AS restaurante_nombre, r.logo AS restaurante_logo,
              (SELECT COUNT(*) FROM pedido_abastecimiento_items i WHERE i.pedido_abastecimiento_id = pa.id) AS lineas,
              (SELECT COALESCE(SUM(i.cantidad), 0) FROM pedido_abastecimiento_items i WHERE i.pedido_abastecimiento_id = pa.id) AS unidades
       ${desde}
       WHERE ${condicion}
       ORDER BY FIELD(pa.estado, 'pendiente', 'confirmado', 'entregado', 'cancelado'),
                (CASE WHEN pa.estado IN ('pendiente', 'confirmado') THEN pa.fecha_creacion END) ASC,
                pa.fecha_creacion DESC
       LIMIT ? OFFSET ?`,
      [...params, POR_PAGINA, (pagina - 1) * POR_PAGINA],
    ),
  ]);

  return {
    total: Number(conteo[0].total),
    pagina,
    por_pagina: POR_PAGINA,
    items: filas.map((r: any) => ({
      id: r.id as number,
      estado: r.estado as EstadoPedido,
      total: Number(r.total),
      turno_entrega: r.turno_entrega as string | null,
      hora_entrega: r.hora_entrega as string | null,
      fecha_creacion: new Date(r.fecha_creacion).toISOString(),
      restaurante_nombre: r.restaurante_nombre as string,
      restaurante_logo: r.restaurante_logo as string | null,
      lineas: Number(r.lineas),
      unidades: Number(r.unidades),
    })),
  };
};

export const obtenerPedido = async (id: number) => {
  const [[principal], [items], [eventos]]: any = await Promise.all([
    db.query(
      `SELECT pa.id, pa.estado, pa.total, pa.turno_entrega, TIME_FORMAT(pa.hora_entrega, '%H:%i') AS hora_entrega,
              pa.fecha_creacion, pa.fecha_actualizacion, pa.motivo_cancelacion, pa.atendido_por,
              r.id AS restaurante_id, r.nombre AS restaurante_nombre, r.logo AS restaurante_logo,
              r.telefono AS restaurante_telefono, r.direccion AS restaurante_direccion,
              u.nombre AS admin_nombre, u.email AS admin_email, u.telefono AS admin_telefono
       FROM pedidos_abastecimiento pa
       JOIN restaurantes r ON r.id = pa.restaurante_id
       LEFT JOIN usuarios u ON u.id = r.admin_id
       WHERE pa.id = ?`,
      [id],
    ),
    db.query(
      `SELECT i.cantidad, i.precio_unitario, p.nombre, p.imagen, p.categoria, pr.nombre AS proveedor_nombre
       FROM pedido_abastecimiento_items i
       JOIN productos_abastecimiento p ON p.id = i.producto_id
       LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
       WHERE i.pedido_abastecimiento_id = ?
       ORDER BY pr.nombre ASC, p.nombre ASC`,
      [id],
    ),
    db.query(
      `SELECT estado, nota, super_admin_nombre, fecha
       FROM pedido_abastecimiento_eventos WHERE pedido_id = ? ORDER BY id ASC`,
      [id],
    ),
  ]);

  if (principal.length === 0)
    throw new ErrorSuperAdmin(404, "Pedido no encontrado");
  const p = principal[0];

  return {
    id: p.id as number,
    estado: p.estado as EstadoPedido,
    total: Number(p.total),
    turno_entrega: p.turno_entrega as string | null,
    hora_entrega: p.hora_entrega as string | null,
    fecha_creacion: new Date(p.fecha_creacion).toISOString(),
    fecha_actualizacion: new Date(p.fecha_actualizacion).toISOString(),
    motivo_cancelacion: p.motivo_cancelacion as string | null,
    atendido_por: p.atendido_por as string | null,
    restaurante: {
      id: p.restaurante_id as number,
      nombre: p.restaurante_nombre as string,
      logo: p.restaurante_logo as string | null,
      telefono: p.restaurante_telefono as string | null,
      direccion: p.restaurante_direccion as string | null,
    },
    admin: {
      nombre: p.admin_nombre as string | null,
      email: p.admin_email as string | null,
      telefono: p.admin_telefono as string | null,
    },
    items: items.map((i: any) => ({
      cantidad: Number(i.cantidad),
      precio_unitario: Number(i.precio_unitario),
      nombre: i.nombre as string,
      imagen: i.imagen as string | null,
      categoria: i.categoria as string,
      proveedor_nombre: i.proveedor_nombre as string | null,
    })),
    eventos: eventos.map((e: any) => ({
      estado: e.estado as EstadoPedido,
      nota: e.nota as string | null,
      super_admin_nombre: e.super_admin_nombre as string | null,
      fecha: new Date(e.fecha).toISOString(),
    })),
  };
};

// Aviso en el panel del administrador del restaurante. Si falla, el cambio de estado ya está hecho.
async function avisarAbastecimiento(
  restauranteId: number,
  pedidoId: number,
  titulo: string,
  mensaje: string,
) {
  try {
    await db.query(
      `INSERT INTO notificaciones_admin (restaurante_id, tipo, titulo, mensaje, referencia_id)
       VALUES (?, 'abastecimiento', ?, ?, ?)`,
      [restauranteId, titulo.slice(0, 150), mensaje.slice(0, 255), pedidoId],
    );
  } catch (error) {
    console.error(
      "No se pudo avisar al restaurante del pedido de abastecimiento:",
      error,
    );
  }
}

export const cambiarEstadoPedido = async (
  id: number,
  datos: { estado?: unknown; motivo?: unknown; hora_entrega?: unknown },
  sa: SuperAdmin,
) => {
  if (
    typeof datos.estado !== "string" ||
    !(ESTADOS as readonly string[]).includes(datos.estado)
  ) {
    throw new ErrorSuperAdmin(400, "Estado no válido");
  }
  const nuevo = datos.estado as EstadoPedido;

  let motivo: string | null = null;
  let hora: string | null = null;

  if (nuevo === "cancelado") {
    const m = typeof datos.motivo === "string" ? datos.motivo.trim() : "";
    if (m.length < 5 || m.length > 255) {
      throw new ErrorSuperAdmin(
        400,
        "Escribe el motivo de la cancelación (entre 5 y 255 caracteres)",
      );
    }
    motivo = m;
  }

  if (
    nuevo === "confirmado" &&
    datos.hora_entrega !== undefined &&
    datos.hora_entrega !== null &&
    datos.hora_entrega !== ""
  ) {
    if (
      typeof datos.hora_entrega !== "string" ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(datos.hora_entrega)
    ) {
      throw new ErrorSuperAdmin(
        400,
        "La hora no es válida (usa el formato HH:MM)",
      );
    }
    hora = datos.hora_entrega;
  }

  let restauranteId = 0;
  let turno: string | null = null;

  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    const [rows]: any = await conexion.query(
      "SELECT id, restaurante_id, estado, turno_entrega FROM pedidos_abastecimiento WHERE id = ? FOR UPDATE",
      [id],
    );
    if (rows.length === 0)
      throw new ErrorSuperAdmin(404, "Pedido no encontrado");

    const actual = rows[0].estado as EstadoPedido;
    if (!TRANSICIONES[actual].includes(nuevo)) {
      throw new ErrorSuperAdmin(
        409,
        `Un pedido ${actual} no puede pasar a ${nuevo}`,
      );
    }

    restauranteId = rows[0].restaurante_id;
    turno = rows[0].turno_entrega;

    await conexion.query(
      `UPDATE pedidos_abastecimiento
       SET estado = ?, atendido_por = ?, motivo_cancelacion = ?, hora_entrega = COALESCE(?, hora_entrega)
       WHERE id = ?`,
      [nuevo, sa.nombre, motivo, hora, id],
    );
    await conexion.query(
      `INSERT INTO pedido_abastecimiento_eventos (pedido_id, estado, nota, super_admin_id, super_admin_nombre)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        nuevo,
        motivo ?? (hora ? `Entrega estimada: ${hora}` : null),
        sa.id,
        sa.nombre,
      ],
    );

    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }

  if (nuevo === "confirmado") {
    const detalle = [
      hora ? `Entrega estimada: ${hora}` : "",
      turno ? `(${turno})` : "",
    ]
      .filter(Boolean)
      .join(" ");
    await avisarAbastecimiento(
      restauranteId,
      id,
      "Pedido de abastecimiento confirmado",
      `Tu pedido #${id} fue confirmado. ${detalle}`.trim(),
    );
  } else if (nuevo === "entregado") {
    await avisarAbastecimiento(
      restauranteId,
      id,
      "Pedido de abastecimiento entregado",
      `Tu pedido #${id} fue marcado como entregado.`,
    );
  } else if (nuevo === "cancelado") {
    await avisarAbastecimiento(
      restauranteId,
      id,
      "Pedido de abastecimiento cancelado",
      `Tu pedido #${id} fue cancelado. Motivo: ${motivo}`,
    );
  }

  return obtenerPedido(id);
};

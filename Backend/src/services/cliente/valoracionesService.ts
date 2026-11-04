import { db } from "../../config/db";

interface DatosValoracion {
  estrellas: unknown;
  comentario?: unknown;
}

// "Juan Carlos Ndong" -> "Juan C."
function nombreCorto(nombre: string) {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[1].charAt(0).toUpperCase()}.`;
}

export const crearValoracion = async (
  clienteId: number,
  pedidoId: number,
  data: DatosValoracion,
) => {
  const estrellas = Number(data.estrellas);
  if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) {
    throw new Error("Elige entre 1 y 5 estrellas");
  }

  if (
    data.comentario !== undefined &&
    data.comentario !== null &&
    typeof data.comentario !== "string"
  ) {
    throw new Error("El comentario no es válido");
  }
  const comentario = String(data.comentario ?? "").trim();
  if (comentario.length > 500)
    throw new Error("El comentario no puede superar 500 caracteres");

  const conexion = await db.getConnection();
  let restauranteId = 0;
  let codigo = "";

  try {
    await conexion.beginTransaction();

    const [pedidos]: any = await conexion.query(
      "SELECT id, codigo, estado, restaurante_id FROM pedidos WHERE id = ? AND cliente_id = ?",
      [pedidoId, clienteId],
    );
    if (pedidos.length === 0) throw new Error("Pedido no encontrado");
    if (pedidos[0].estado !== "entregado")
      throw new Error("Solo puedes valorar pedidos que ya recibiste");

    restauranteId = pedidos[0].restaurante_id;
    codigo = pedidos[0].codigo;

    try {
      await conexion.query(
        `INSERT INTO valoraciones (pedido_id, restaurante_id, cliente_id, estrellas, comentario)
         VALUES (?, ?, ?, ?, ?)`,
        [pedidoId, restauranteId, clienteId, estrellas, comentario || null],
      );
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY")
        throw new Error("Ya valoraste este pedido");
      throw error;
    }

    // El promedio y el contador se recalculan aquí mismo, a partir de las valoraciones reales
    await conexion.query(
      `UPDATE restaurantes
       SET rating = COALESCE((SELECT ROUND(AVG(estrellas), 1) FROM valoraciones WHERE restaurante_id = ?), 0),
           reviews_count = (SELECT COUNT(*) FROM valoraciones WHERE restaurante_id = ?)
       WHERE id = ?`,
      [restauranteId, restauranteId, restauranteId],
    );

    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }

  // Aviso para el restaurante; si falla, la valoración ya está guardada
  try {
    const [cliente]: any = await db.query(
      "SELECT nombre FROM usuarios WHERE id = ?",
      [clienteId],
    );
    const estrellasTexto = `${"★".repeat(estrellas)}${"☆".repeat(5 - estrellas)}`;

    await db.query(
      `INSERT INTO notificaciones_admin (restaurante_id, tipo, titulo, mensaje, referencia_id)
       VALUES (?, 'pedido', 'Nueva valoración', ?, ?)`,
      [
        restauranteId,
        `${estrellasTexto} · ${codigo} · ${cliente[0]?.nombre ?? "Cliente"}`.slice(
          0,
          255,
        ),
        pedidoId,
      ],
    );
  } catch (error) {
    console.error("No se pudo avisar al restaurante de la valoración:", error);
  }

  return { ok: true };
};

// "publico": nombre abreviado y sin código de pedido. "admin": nombre completo y código.
export const obtenerValoraciones = async (
  restauranteId: number,
  modo: "publico" | "admin",
) => {
  const [existe]: any = await db.query(
    "SELECT id FROM restaurantes WHERE id = ?",
    [restauranteId],
  );
  if (existe.length === 0) throw new Error("Restaurante no encontrado");

  const [resumenRows]: any = await db.query(
    "SELECT ROUND(AVG(estrellas), 1) AS promedio, COUNT(*) AS total FROM valoraciones WHERE restaurante_id = ?",
    [restauranteId],
  );

  const [distRows]: any = await db.query(
    "SELECT estrellas, COUNT(*) AS cantidad FROM valoraciones WHERE restaurante_id = ? GROUP BY estrellas",
    [restauranteId],
  );

  const distribucion: Record<string, number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };
  for (const r of distRows)
    distribucion[String(r.estrellas)] = Number(r.cantidad);

  const [rows]: any = await db.query(
    `SELECT v.id, v.estrellas, v.comentario, v.fecha_creacion, u.nombre AS cliente_nombre, p.codigo
     FROM valoraciones v
     LEFT JOIN usuarios u ON u.id = v.cliente_id
     JOIN pedidos p ON p.id = v.pedido_id
     WHERE v.restaurante_id = ?
     ORDER BY v.fecha_creacion DESC, v.id DESC
     LIMIT 50`,
    [restauranteId],
  );

  return {
    resumen: {
      promedio: Number(resumenRows[0].promedio) || 0,
      total: Number(resumenRows[0].total),
      distribucion,
    },
    items: rows.map((r: any) => {
      const nombre = r.cliente_nombre || "Cliente";
      return {
        id: r.id,
        nombre: modo === "admin" ? nombre : nombreCorto(nombre),
        estrellas: Number(r.estrellas),
        comentario: r.comentario,
        fecha_creacion: new Date(r.fecha_creacion).toISOString(),
        codigo: modo === "admin" ? r.codigo : undefined,
      };
    }),
  };
};

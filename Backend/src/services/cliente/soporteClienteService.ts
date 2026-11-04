import { db } from "../../config/db";

const CATEGORIAS = ["pedido", "app", "cuenta", "otro"];

interface DatosReporte {
  categoria: string;
  asunto: string;
  mensaje: string;
  codigo_pedido?: string;
}

export const crearReporte = async (usuarioId: number, data: DatosReporte) => {
  const asunto = String(data.asunto || "").trim();
  const mensaje = String(data.mensaje || "").trim();
  const codigo = String(data.codigo_pedido || "").trim();

  if (!CATEGORIAS.includes(data.categoria))
    throw new Error("Selecciona el tipo de consulta");
  if (asunto.length < 3 || asunto.length > 150)
    throw new Error("El asunto debe tener entre 3 y 150 caracteres");
  if (mensaje.length < 10 || mensaje.length > 1000) {
    throw new Error("Cuéntanos con entre 10 y 1000 caracteres");
  }

  // Evita que se llene la tabla de reportes repetidos
  const [recientes]: any = await db.query(
    `SELECT COUNT(*) AS total FROM reportes_soporte
     WHERE usuario_id = ? AND fecha_creacion > NOW() - INTERVAL 1 HOUR`,
    [usuarioId],
  );
  if (Number(recientes[0].total) >= 5) {
    throw new Error(
      "Has enviado varios mensajes seguidos. Espera un rato antes de enviar otro.",
    );
  }

  // El código del pedido es opcional, pero debe ser de un pedido del propio cliente
  let pedidoId: number | null = null;
  if (codigo) {
    const variantes = [
      codigo,
      codigo.startsWith("#") ? codigo.slice(1) : `#${codigo}`,
    ];
    const [pedidos]: any = await db.query(
      "SELECT id FROM pedidos WHERE codigo IN (?) AND cliente_id = ? LIMIT 1",
      [variantes, usuarioId],
    );
    if (pedidos.length === 0)
      throw new Error("No encontramos ese código entre tus pedidos");
    pedidoId = pedidos[0].id;
  }

  const [result]: any = await db.query(
    `INSERT INTO reportes_soporte (usuario_id, categoria, asunto, mensaje, pedido_id)
     VALUES (?, ?, ?, ?, ?)`,
    [usuarioId, data.categoria, asunto, mensaje, pedidoId],
  );

  return { id: result.insertId };
};

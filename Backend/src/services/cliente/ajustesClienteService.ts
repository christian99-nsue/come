import { db } from "../../config/db";
import { construirSet } from "../../utils/sql";

const TEMAS = ["claro", "oscuro", "automatico"];
const TAMANOS = ["pequeno", "normal", "grande", "muy_grande"];

export const obtenerAjustes = async (clienteId: number) => {
  const [rows]: any = await db.query(
    `SELECT tema, tamano_texto, alto_contraste, reducir_movimiento
     FROM usuarios WHERE id = ? AND rol = 'cliente'`,
    [clienteId],
  );
  if (rows.length === 0) throw new Error("Usuario no encontrado");

  const r = rows[0];
  return {
    tema: r.tema,
    tamano_texto: r.tamano_texto,
    alto_contraste: !!r.alto_contraste,
    reducir_movimiento: !!r.reducir_movimiento,
  };
};

export const actualizarAjustes = async (
  clienteId: number,
  data: Record<string, any>,
) => {
  if (data.tema !== undefined && !TEMAS.includes(data.tema))
    throw new Error("Tema no válido");
  if (data.tamano_texto !== undefined && !TAMANOS.includes(data.tamano_texto)) {
    throw new Error("Tamaño de texto no válido");
  }
  for (const campo of ["alto_contraste", "reducir_movimiento"]) {
    if (data[campo] !== undefined && typeof data[campo] !== "boolean")
      throw new Error("Valor no válido");
  }

  const { sql, valores } = construirSet(data, [
    "tema",
    "tamano_texto",
    "alto_contraste",
    "reducir_movimiento",
  ]);
  if (!sql) throw new Error("No hay cambios para guardar");

  await db.query(
    `UPDATE usuarios SET ${sql} WHERE id = ? AND rol = 'cliente'`,
    [...valores, clienteId],
  );

  return obtenerAjustes(clienteId);
};

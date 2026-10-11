// Arma el SET de un UPDATE recorriendo SOLO la lista de campos permitidos,
// nunca las claves que manda el cliente. Así no se pueden tocar columnas
// como `rol` o `restaurante_id`, ni meter SQL en el nombre de una columna.
export function construirSet(
  data: Record<string, any>,
  camposPermitidos: string[],
) {
  const campos: string[] = [];
  const valores: any[] = [];

  for (const campo of camposPermitidos) {
    if (data[campo] !== undefined) {
      campos.push(`${campo} = ?`);
      valores.push(data[campo]);
    }
  }

  return { sql: campos.join(", "), valores };
}

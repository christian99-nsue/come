import { db } from "../../config/db";

const tieneEntregaActiva = async (repartidorId: number) => {
  const [rows]: any = await db.query(
    `SELECT id FROM pedidos
     WHERE repartidor_id = ? AND estado IN ('listo_para_recoger', 'en_entrega')
     LIMIT 1`,
    [repartidorId],
  );
  return rows.length > 0;
};

export const obtenerDisponibilidad = async (repartidorId: number) => {
  const [rows]: any = await db.query(
    "SELECT disponible FROM usuarios WHERE id = ? AND rol = 'repartidor'",
    [repartidorId],
  );
  if (rows.length === 0) throw new Error("Repartidor no encontrado");

  return {
    disponible: !!rows[0].disponible,
    tiene_entrega_activa: await tieneEntregaActiva(repartidorId),
  };
};

export const cambiarDisponibilidad = async (
  repartidorId: number,
  disponible: boolean,
) => {
  if (typeof disponible !== "boolean") {
    throw new Error("Valor de disponibilidad no válido");
  }

  if (!disponible && (await tieneEntregaActiva(repartidorId))) {
    throw new Error(
      "No puedes ponerte como no disponible mientras tengas una entrega activa",
    );
  }

  await db.query(
    "UPDATE usuarios SET disponible = ? WHERE id = ? AND rol = 'repartidor'",
    [disponible, repartidorId],
  );

  return { ok: true, disponible };
};

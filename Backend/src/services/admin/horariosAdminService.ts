import { db } from "../../config/db";

interface HorarioDia {
  dia_semana: number; // 0=Domingo ... 6=Sábado
  hora_apertura: string; // "08:00"
  hora_cierre: string; // "22:00"
  cerrado: boolean;
}

export const obtenerHorarios = async (restauranteId: number) => {
  const [rows]: any = await db.query(
    `SELECT dia_semana, hora_apertura, hora_cierre, cerrado
     FROM restaurante_horarios
     WHERE restaurante_id = ?
     ORDER BY dia_semana ASC`,
    [restauranteId],
  );

  // Si el restaurante todavía no configuró horarios, devolvemos los 7 días
  // vacíos por defecto para que el frontend tenga algo que mostrar/editar.
  if (rows.length === 0) {
    return Array.from({ length: 7 }, (_, dia) => ({
      dia_semana: dia,
      hora_apertura: "08:00",
      hora_cierre: "22:00",
      cerrado: false,
    }));
  }

  return rows;
};

// Reemplaza TODOS los horarios de una vez (el frontend siempre manda los 7 días)
export const guardarHorarios = async (
  restauranteId: number,
  horarios: HorarioDia[],
) => {
  if (!horarios || horarios.length !== 7) {
    throw new Error("Debes enviar los horarios de los 7 días de la semana");
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM restaurante_horarios WHERE restaurante_id = ?`,
      [restauranteId],
    );

    for (const h of horarios) {
      await connection.query(
        `INSERT INTO restaurante_horarios (restaurante_id, dia_semana, hora_apertura, hora_cierre, cerrado)
         VALUES (?, ?, ?, ?, ?)`,
        [
          restauranteId,
          h.dia_semana,
          h.hora_apertura,
          h.hora_cierre,
          h.cerrado,
        ],
      );
    }

    await connection.commit();
    return { ok: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

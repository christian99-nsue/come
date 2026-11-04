import { BLOQUEAR_SIN_SUSCRIPCION } from "./planes";

// Fragmento de SQL que vale 1 si el restaurante tiene la suscripción al día y 0 si no.
// "alias" es el nombre con el que aparece la tabla restaurantes en la consulta (r, o restaurantes).
export const SUSCRIPCION_AL_DIA = (alias: string) => `(
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM suscripciones sx WHERE sx.restaurante_id = ${alias}.id)
      THEN ${BLOQUEAR_SIN_SUSCRIPCION ? 0 : 1}
    ELSE EXISTS (
      SELECT 1 FROM suscripciones sv
      WHERE sv.id = (SELECT MAX(m.id) FROM suscripciones m WHERE m.restaurante_id = ${alias}.id)
        AND sv.estado = 'activa'
        AND sv.fecha_renovacion >= CURDATE()
    )
  END
)`;

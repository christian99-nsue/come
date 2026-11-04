import { db } from "../config/db";

// Avisa al administrador del restaurante antes de que venza su suscripción, el último día, y una vez
// cuando ya venció. Sin esto, la suscripción se vence sin que nadie se entere y el restaurante deja de
// recibir pedidos por sorpresa.

const INTERVALO_MS = 10 * 60_000;

// Con cuántos días de antelación se avisa, según el plan: un plan semanal no puede avisar con una semana
const DIAS_ANTES: Record<string, number> = { mensual: 7, semanal: 2 };
const DIAS_ANTES_POR_DEFECTO = 3;

// Tras vencer, se avisa solo durante unos días (no se avisa de algo que venció hace meses)
const DIAS_AVISAR_VENCIDA = 3;

type TipoAviso = "por_vencer" | "ultimo_dia" | "vencida";

const NOMBRE_PLAN: Record<string, string> = {
  semanal: "plan semanal",
  mensual: "plan mensual",
};

const fechaLarga = (ymd: string) => {
  const [a, m, d] = ymd.split("-");
  return `${d}/${m}/${a}`;
};

// Un solo aviso por situación: el que corresponde a hoy. Si el servidor estuvo apagado, no se envían de golpe
// los de los días que se perdió.
export function tipoDeAviso(
  dias: number,
  plan: string,
  pagoPendiente: boolean,
): TipoAviso | null {
  if (dias < 0) return dias >= -DIAS_AVISAR_VENCIDA ? "vencida" : null;
  if (pagoPendiente) return null; // ya pidió renovar: solo falta que se confirme su pago
  if (dias === 0) return "ultimo_dia";
  if (dias <= (DIAS_ANTES[plan] ?? DIAS_ANTES_POR_DEFECTO)) return "por_vencer";
  return null;
}

function textoDelAviso(
  tipo: TipoAviso,
  plan: string,
  dias: number,
  renovacion: string,
  pagoPendiente: boolean,
) {
  const nombre = NOMBRE_PLAN[plan] ?? "plan";

  if (tipo === "por_vencer") {
    return {
      titulo: "Tu suscripción vence pronto",
      mensaje: `Tu ${nombre} vence ${dias === 1 ? "mañana" : `en ${dias} días`} (${fechaLarga(renovacion)}). Renuévalo para seguir recibiendo pedidos.`,
    };
  }
  if (tipo === "ultimo_dia") {
    return {
      titulo: "Tu suscripción vence hoy",
      mensaje:
        "Hoy es el último día de tu plan. Desde mañana tu restaurante no recibirá pedidos hasta que lo renueves.",
    };
  }
  return {
    titulo: "Tu suscripción venció",
    mensaje: pagoPendiente
      ? "Tu suscripción venció, pero tu pago está pendiente de confirmación. Te avisaremos cuando se active."
      : "Tu suscripción venció y tu restaurante no recibe pedidos. Renuévala para volver a abrir.",
  };
}

export interface AvisoEnviado {
  restaurante_id: number;
  tipo: TipoAviso;
}

// Se puede llamar las veces que sea: cada aviso se envía una sola vez por periodo de suscripción.
// Al renovar cambia la fecha de renovación, y el siguiente periodo vuelve a avisar.
export async function procesarAvisosSuscripcion(): Promise<AvisoEnviado[]> {
  // Se usa la misma fecha que el bloqueo de restaurantes con suscripción vencida (la de la base de datos),
  // para que el aviso y el bloqueo nunca se contradigan
  const [candidatos]: any = await db.query(
    `SELECT r.id AS restaurante_id, s.plan,
            DATE_FORMAT(s.fecha_renovacion, '%Y-%m-%d') AS renovacion,
            DATEDIFF(s.fecha_renovacion, CURDATE()) AS dias,
            EXISTS (SELECT 1 FROM pagos_suscripcion p WHERE p.restaurante_id = r.id AND p.estado = 'pendiente') AS pago_pendiente
     FROM restaurantes r
     JOIN suscripciones s ON s.id = (SELECT MAX(x.id) FROM suscripciones x WHERE x.restaurante_id = r.id)
     WHERE s.estado = 'activa'
       AND r.suspendido = 0
       AND s.fecha_renovacion >= CURDATE() - INTERVAL ${DIAS_AVISAR_VENCIDA} DAY
       AND s.fecha_renovacion <= CURDATE() + INTERVAL 7 DAY`,
  );

  const enviados: AvisoEnviado[] = [];

  for (const c of candidatos) {
    const dias = Number(c.dias);
    const pendiente = !!c.pago_pendiente;
    const tipo = tipoDeAviso(dias, c.plan, pendiente);
    if (!tipo) continue;

    const conexion = await db.getConnection();
    try {
      await conexion.beginTransaction();

      // Reservar el aviso y enviarlo van juntos: si el envío falla, se deshace y se reintenta más tarde
      const [reserva]: any = await conexion.query(
        "INSERT IGNORE INTO avisos_suscripcion (restaurante_id, fecha_renovacion, tipo) VALUES (?, ?, ?)",
        [c.restaurante_id, c.renovacion, tipo],
      );
      if (reserva.affectedRows === 0) {
        await conexion.rollback();
        continue; // ya se avisó de esto
      }

      const { titulo, mensaje } = textoDelAviso(
        tipo,
        c.plan,
        dias,
        c.renovacion,
        pendiente,
      );
      await conexion.query(
        "INSERT INTO notificaciones_admin (restaurante_id, tipo, titulo, mensaje) VALUES (?, 'suscripcion', ?, ?)",
        [c.restaurante_id, titulo, mensaje],
      );

      await conexion.commit();
      enviados.push({ restaurante_id: c.restaurante_id, tipo });
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }

  return enviados;
}

// Se pone en marcha una vez, al arrancar el servidor
export function iniciarAvisosSuscripcion(intervaloMs = INTERVALO_MS) {
  let ocupado = false;

  const vuelta = async () => {
    if (ocupado) return;
    ocupado = true;
    try {
      for (const a of await procesarAvisosSuscripcion()) {
        console.log(
          `[suscripciones] Aviso "${a.tipo}" enviado al restaurante ${a.restaurante_id}`,
        );
      }
    } catch (error) {
      console.error(
        "[suscripciones] No se pudieron procesar los avisos:",
        error,
      );
    } finally {
      ocupado = false;
    }
  };

  setTimeout(vuelta, 10_000);
  const temporizador = setInterval(vuelta, intervaloMs);
  return () => clearInterval(temporizador);
}

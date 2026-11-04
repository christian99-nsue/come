import { db } from "../config/db";
import { MINUTOS_CORTE } from "../config/ventanas";
import { ahoraLocal, etiquetaDia, type AhoraLocal } from "../utils/ventanas";

// Cuando se cierran los pedidos de una ventana (30 minutos antes de que abra), el lote queda liberado:
// los repartidores ya pueden verlo. Este proceso avisa una sola vez a los repartidores disponibles.

const INTERVALO_MS = 30_000;

// ¿Existe la preferencia de notificaciones en la tabla de usuarios? Se mira al momento para que
// funcione igual si esa columna existe o no.
async function existePreferencia() {
  const [rows]: any = await db.query(
    `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'notificaciones_activas'`,
  );
  return Number(rows[0].n) > 0;
}

function mensajeDelLote(
  inicio: string,
  fin: string,
  pedidos: number,
  listos: number,
  hoy: string,
) {
  const dia = etiquetaDia(inicio.slice(0, 10), hoy).toLowerCase();
  const del = `${inicio.slice(11, 16)}–${fin.slice(11, 16)}`;
  const total = `${pedidos} ${pedidos === 1 ? "pedido" : "pedidos"} para la ventana de ${del} (${dia}).`;
  const estado =
    listos === 0
      ? "Se están preparando."
      : listos === pedidos
        ? `${listos === 1 ? "Ya está listo" : "Ya están listos"} para recoger.`
        : `${listos} ya ${listos === 1 ? "está listo" : "están listos"} para recoger.`;
  return `${total} ${estado}`;
}

export interface LoteProcesado {
  inicio: string;
  pedidos: number;
  listos: number;
  repartidores_avisados: number;
}

// Libera los lotes cuyo corte ya pasó y cuya ventana no ha terminado. Se puede llamar las veces que sea:
// cada lote se avisa una sola vez, aunque haya varios servidores o se reinicie el servidor.
export async function procesarLotes(
  ahora: AhoraLocal = ahoraLocal(),
): Promise<LoteProcesado[]> {
  const [lotes]: any = await db.query(
    `SELECT DATE_FORMAT(ventana_entrega_inicio, '%Y-%m-%d %H:%i:%s') AS inicio,
            DATE_FORMAT(ventana_entrega_fin, '%Y-%m-%d %H:%i:%s') AS fin,
            COUNT(*) AS pedidos,
            COALESCE(SUM(estado = 'listo_para_recoger' AND repartidor_id IS NULL), 0) AS listos
     FROM pedidos
     WHERE ventana_entrega_inicio IS NOT NULL
       AND ventana_entrega_inicio - INTERVAL ${MINUTOS_CORTE} MINUTE <= ?
       AND ventana_entrega_fin > ?
       AND estado IN ('nuevo', 'en_preparacion', 'listo_para_recoger')
     GROUP BY ventana_entrega_inicio, ventana_entrega_fin
     ORDER BY ventana_entrega_inicio ASC`,
    [ahora.texto, ahora.texto],
  );

  const procesados: LoteProcesado[] = [];

  for (const lote of lotes) {
    const pedidos = Number(lote.pedidos);
    const listos = Number(lote.listos);
    const conexion = await db.getConnection();

    try {
      await conexion.beginTransaction();

      // Reservar el lote y avisar van juntos: si el aviso falla, la reserva se deshace y se reintenta
      // en la siguiente vuelta. Si ya estaba reservado, otro proceso se encarga: aquí no se hace nada.
      const [reserva]: any = await conexion.query(
        "INSERT IGNORE INTO lotes_reparto (ventana_inicio, ventana_fin, pedidos, listos) VALUES (?, ?, ?, ?)",
        [lote.inicio, lote.fin, pedidos, listos],
      );
      if (reserva.affectedRows === 0) {
        await conexion.rollback();
        continue;
      }

      const filtroPreferencia = (await existePreferencia())
        ? "AND COALESCE(notificaciones_activas, 1) = 1"
        : "";
      const [aviso]: any = await conexion.query(
        `INSERT INTO notificaciones_repartidor (repartidor_id, tipo, titulo, mensaje)
         SELECT id, 'lote_liberado', ?, ?
         FROM usuarios
         WHERE rol = 'repartidor' AND COALESCE(disponible, 1) = 1 ${filtroPreferencia}`,
        [
          `Reparto abierto: ventana de ${lote.inicio.slice(11, 16)}`,
          mensajeDelLote(lote.inicio, lote.fin, pedidos, listos, ahora.fecha),
        ],
      );

      await conexion.query(
        "UPDATE lotes_reparto SET repartidores_avisados = ? WHERE ventana_inicio = ?",
        [aviso.affectedRows, lote.inicio],
      );
      await conexion.commit();

      procesados.push({
        inicio: lote.inicio,
        pedidos,
        listos,
        repartidores_avisados: aviso.affectedRows,
      });
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }

  return procesados;
}

// Se pone en marcha una vez, al arrancar el servidor
export function iniciarPlanificadorLotes(intervaloMs = INTERVALO_MS) {
  let ocupado = false;

  const vuelta = async () => {
    if (ocupado) return; // si la anterior sigue en curso, se salta
    ocupado = true;
    try {
      for (const l of await procesarLotes()) {
        console.log(
          `[reparto] Lote de las ${l.inicio.slice(11, 16)} liberado: ${l.pedidos} pedidos, ${l.repartidores_avisados} repartidores avisados`,
        );
      }
    } catch (error) {
      console.error("[reparto] No se pudieron procesar los lotes:", error);
    } finally {
      ocupado = false;
    }
  };

  setTimeout(vuelta, 5_000);
  const temporizador = setInterval(vuelta, intervaloMs);
  return () => clearInterval(temporizador);
}

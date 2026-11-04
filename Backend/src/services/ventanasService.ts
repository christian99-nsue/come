import { db } from "../config/db";
import { MINUTOS_CORTE } from "../config/ventanas";
import {
  agruparHorario,
  ahoraLocal,
  diaSemana,
  etiquetaDia,
  hhmm,
  proximasOcurrencias,
  validarOcurrencia,
  type Ocurrencia,
  type VentanaFila,
  type MotivoNoValida,
} from "../utils/ventanas";

// Las ventanas que el súper admin tiene encendidas
export async function cargarVentanasActivas(
  consulta: { query: (sql: string, p?: any[]) => Promise<any> } = db,
): Promise<VentanaFila[]> {
  const [rows]: any = await consulta.query(
    `SELECT id, TIME_FORMAT(hora_inicio, '%H:%i:%s') AS hora_inicio, TIME_FORMAT(hora_fin, '%H:%i:%s') AS hora_fin,
            dias, activa
     FROM ventanas_entrega WHERE activa = 1`,
  );
  return rows.map((r: any) => ({
    ...r,
    dias: Number(r.dias),
    activa: !!r.activa,
  }));
}

// Lo que ve el cliente al elegir: solo las ventanas a las que todavía se puede pedir
export async function ventanasDisponibles() {
  const ahora = ahoraLocal();
  const ventanas = await cargarVentanasActivas();

  return {
    hoy: ahora.fecha,
    ahora: hhmm(ahora.segundos),
    minutos_corte: MINUTOS_CORTE,
    ventanas: proximasOcurrencias(ventanas, ahora),
  };
}

// Se rechaza un pedido para una ventana que ya no está disponible. Lleva las alternativas,
// para que la app pueda mostrar las siguientes sin otra consulta.
export class ErrorVentana extends Error {
  estado = 409;
  codigo = "VENTANA_NO_DISPONIBLE";
  ventanas: Ocurrencia[];

  constructor(mensaje: string, ventanas: Ocurrencia[]) {
    super(mensaje);
    this.ventanas = ventanas;
  }
}

const rango = (o: Ocurrencia) => `${o.inicio}–${o.fin}`;

function mensajeNoValida(motivo: MotivoNoValida, o?: Ocurrencia) {
  if (motivo === "cerrada" && o) {
    const dia =
      o.etiqueta_dia === "Hoy" ? "" : ` de ${o.etiqueta_dia.toLowerCase()}`;
    return `La ventana de ${rango(o)}${dia} ya no está disponible: los pedidos para esa ventana cerraron a las ${o.cierre_hora}.`;
  }
  if (motivo === "inexistente" || motivo === "inactiva")
    return "Esa ventana de entrega ya no está disponible.";
  return "Esa ventana de entrega no está disponible para ese día.";
}

// Comprueba la ventana elegida para un pedido y devuelve cuándo se entregará. Debe llamarse justo
// al crear el pedido: la hora se mira en ese instante, no cuando el cliente la eligió.
export async function resolverVentanaParaPedido(
  conexion: { query: (sql: string, p?: any[]) => Promise<any> },
  ventanaId: unknown,
  fecha: unknown,
): Promise<Ocurrencia> {
  const ahora = ahoraLocal();
  const activas = await cargarVentanasActivas(conexion);
  const alternativas = () => proximasOcurrencias(activas, ahora);

  if (ventanaId === undefined || ventanaId === null || ventanaId === "") {
    throw new ErrorVentana(
      alternativas().length > 0
        ? "Elige una ventana de entrega para tu pedido."
        : "Por ahora no hay ventanas de entrega disponibles. Vuelve a intentarlo más tarde.",
      alternativas(),
    );
  }

  const id = Number(ventanaId);
  // Se busca entre TODAS (no solo las activas) para distinguir "apagada" de "no existe"
  const [rows]: any =
    Number.isInteger(id) && id > 0
      ? await conexion.query(
          `SELECT id, TIME_FORMAT(hora_inicio, '%H:%i:%s') AS hora_inicio, TIME_FORMAT(hora_fin, '%H:%i:%s') AS hora_fin,
                dias, activa FROM ventanas_entrega WHERE id = ?`,
          [id],
        )
      : [[]];
  const ventana: VentanaFila | undefined = rows[0]
    ? { ...rows[0], dias: Number(rows[0].dias), activa: !!rows[0].activa }
    : undefined;

  const resultado = validarOcurrencia(ventana, fecha, ahora);
  if (!resultado.ok) {
    throw new ErrorVentana(
      mensajeNoValida(resultado.motivo, resultado.ocurrencia),
      alternativas(),
    );
  }
  return resultado.ocurrencia;
}

// Condición SQL para el reparto: un pedido con ventana solo se libera a los repartidores cuando se
// cierran los pedidos de esa ventana (30 minutos antes). Los pedidos sin ventana (anteriores) no se tocan.
export function condicionLiberado(alias = "p") {
  const ahora = ahoraLocal();
  return {
    sql: `(${alias}.ventana_entrega_inicio IS NULL OR ${alias}.ventana_entrega_inicio - INTERVAL ${MINUTOS_CORTE} MINUTE <= ?)`,
    params: [ahora.texto] as string[],
  };
}

// Cómo se muestra la ventana de un pedido. Recibe textos "AAAA-MM-DD HH:MM:SS" (usa DATE_FORMAT en la
// consulta): así no hay conversiones de zona horaria por el camino.
export function ventanaDePedido(
  inicio: string | null | undefined,
  fin: string | null | undefined,
) {
  if (!inicio || !fin) return null;
  const fecha = inicio.slice(0, 10);
  return {
    fecha,
    etiqueta_dia: etiquetaDia(fecha, ahoraLocal().fecha),
    inicio: inicio.slice(11, 16),
    fin: fin.slice(11, 16),
  };
}


export async function horarioSemanal() {
  const ahora = ahoraLocal();
  const ventanas = await cargarVentanasActivas();
  const { grupos, sin_entregas } = agruparHorario(ventanas);

  return {
    minutos_corte: MINUTOS_CORTE,
    dia_hoy: diaSemana(ahora.fecha), // para marcar cuál es el de hoy
    grupos,
    sin_entregas,
  };
}
import {
  ZONA_HORARIA,
  MINUTOS_CORTE,
  DIAS_VISIBLES,
  MAX_VENTANAS_OFRECIDAS,
} from "../config/ventanas";

// Una ventana semanal que define el súper admin: "de 10:00 a 11:00, de lunes a viernes"
export interface VentanaFila {
  id: number;
  hora_inicio: string; // "HH:MM" o "HH:MM:SS"
  hora_fin: string;
  dias: number; // bits: 1 = domingo, 2 = lunes, 4 = martes ... 64 = sábado (0 = domingo en JavaScript)
  activa: boolean | number;
}

// Una ventana en un día concreto: "hoy de 10:00 a 11:00"
export interface Ocurrencia {
  ventana_id: number;
  fecha: string; // AAAA-MM-DD, en hora local
  inicio: string; // HH:MM
  fin: string;
  desde: string; // AAAA-MM-DD HH:MM:SS
  hasta: string;
  cierre: string; // hasta cuándo se aceptan pedidos para esta ventana
  cierre_hora: string; // HH:MM
  cierra_en_min: number; // minutos que faltan para el cierre
  etiqueta_dia: string; // "Hoy", "Mañana", "jue, 23 oct"
}

export interface AhoraLocal {
  fecha: string;
  segundos: number; // desde las 00:00
  texto: string; // AAAA-MM-DD HH:MM:SS
  absoluto: number; // segundos desde 1970 en hora local, para comparar sin líos de días
}

const pad = (n: number) => String(n).padStart(2, "0");

export const numeroDeDia = (fecha: string) => {
  const [a, m, d] = fecha.split("-").map(Number);
  return Math.floor(Date.UTC(a, m - 1, d) / 86400000);
};

export const fechaDeNumero = (dia: number) =>
  new Date(dia * 86400000).toISOString().slice(0, 10);
export const sumarDias = (fecha: string, n: number) =>
  fechaDeNumero(numeroDeDia(fecha) + n);
export const diaSemana = (fecha: string) =>
  new Date(numeroDeDia(fecha) * 86400000).getUTCDay();

export const segundosDe = (hora: string) => {
  const [h, m, s] = hora.split(":").map(Number);
  return h * 3600 + m * 60 + (s || 0);
};

export const hhmm = (segundos: number) =>
  `${pad(Math.floor(segundos / 3600))}:${pad(Math.floor((segundos % 3600) / 60))}`;

export const HORA_VALIDA = /^([01]\d|2[0-3]):[0-5]\d$/;
export const FECHA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

// La fecha y la hora que son ahora MISMO en la zona de la plataforma
export function ahoraLocal(
  ahora: Date = new Date(),
  zona: string = ZONA_HORARIA,
): AhoraLocal {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(ahora);

  const valor = (tipo: string) => partes.find((p) => p.type === tipo)!.value;
  const fecha = `${valor("year")}-${valor("month")}-${valor("day")}`;
  const segundos =
    Number(valor("hour")) * 3600 +
    Number(valor("minute")) * 60 +
    Number(valor("second"));

  return {
    fecha,
    segundos,
    texto: `${fecha} ${valor("hour")}:${valor("minute")}:${valor("second")}`,
    absoluto: numeroDeDia(fecha) * 86400 + segundos,
  };
}

export function etiquetaDia(fecha: string, hoy: string) {
  const diferencia = numeroDeDia(fecha) - numeroDeDia(hoy);
  if (diferencia === 0) return "Hoy";
  if (diferencia === 1) return "Mañana";
  if (diferencia === -1) return "Ayer";
  return new Date(numeroDeDia(fecha) * 86400000).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function ocurrencia(
  v: VentanaFila,
  fecha: string,
  ahora: AhoraLocal,
): Ocurrencia {
  const inicio = segundosDe(v.hora_inicio);
  const fin = segundosDe(v.hora_fin);
  const base = numeroDeDia(fecha) * 86400;
  const cierreAbs = base + inicio - MINUTOS_CORTE * 60;
  const diaCierre = Math.floor(cierreAbs / 86400);
  const segCierre = cierreAbs - diaCierre * 86400;

  return {
    ventana_id: v.id,
    fecha,
    inicio: hhmm(inicio),
    fin: hhmm(fin),
    desde: `${fecha} ${hhmm(inicio)}:00`,
    hasta: `${fecha} ${hhmm(fin)}:00`,
    cierre: `${fechaDeNumero(diaCierre)} ${hhmm(segCierre)}:00`,
    cierre_hora: hhmm(segCierre),
    cierra_en_min: Math.ceil((cierreAbs - ahora.absoluto) / 60),
    etiqueta_dia: etiquetaDia(fecha, ahora.fecha),
  };
}

// Las ventanas a las que todavía se puede pedir, de la más cercana a la más lejana
export function proximasOcurrencias(
  ventanas: VentanaFila[],
  ahora: AhoraLocal,
  limite = MAX_VENTANAS_OFRECIDAS,
): Ocurrencia[] {
  const salida: Ocurrencia[] = [];

  for (let i = 0; i < DIAS_VISIBLES; i++) {
    const fecha = sumarDias(ahora.fecha, i);
    const dia = diaSemana(fecha);

    const delDia = ventanas
      .filter((v) => v.activa && (v.dias & (1 << dia)) !== 0)
      .sort((a, b) => segundosDe(a.hora_inicio) - segundosDe(b.hora_inicio));

    for (const v of delDia) {
      const o = ocurrencia(v, fecha, ahora);
      // Se puede pedir mientras no haya pasado el corte (hasta el último segundo del corte, inclusive)
      if (
        o.cierra_en_min * 60 >= 0 &&
        numeroDeDia(fecha) * 86400 +
          segundosDe(v.hora_inicio) -
          MINUTOS_CORTE * 60 >=
          ahora.absoluto
      ) {
        salida.push(o);
      }
    }
  }
  return salida.slice(0, limite);
}

export type MotivoNoValida =
  | "inexistente"
  | "inactiva"
  | "fecha_invalida"
  | "fuera_de_rango"
  | "dia_no_valido"
  | "cerrada";

// ¿Se puede pedir AHORA para esta ventana en este día?
export function validarOcurrencia(
  v: VentanaFila | undefined,
  fecha: unknown,
  ahora: AhoraLocal,
):
  | { ok: true; ocurrencia: Ocurrencia }
  | { ok: false; motivo: MotivoNoValida; ocurrencia?: Ocurrencia } {
  if (!v) return { ok: false, motivo: "inexistente" };
  if (!v.activa) return { ok: false, motivo: "inactiva" };
  if (
    typeof fecha !== "string" ||
    !FECHA_VALIDA.test(fecha) ||
    Number.isNaN(numeroDeDia(fecha))
  ) {
    return { ok: false, motivo: "fecha_invalida" };
  }
  // Una fecha como 2026-02-31 no existe: JavaScript la "corrige" al mes siguiente, así que se comprueba
  if (fechaDeNumero(numeroDeDia(fecha)) !== fecha)
    return { ok: false, motivo: "fecha_invalida" };

  const diferencia = numeroDeDia(fecha) - numeroDeDia(ahora.fecha);
  if (diferencia < 0 || diferencia >= DIAS_VISIBLES)
    return { ok: false, motivo: "fuera_de_rango" };
  if ((v.dias & (1 << diaSemana(fecha))) === 0)
    return { ok: false, motivo: "dia_no_valido" };

  const o = ocurrencia(v, fecha, ahora);
  const cierreAbs =
    numeroDeDia(fecha) * 86400 + segundosDe(v.hora_inicio) - MINUTOS_CORTE * 60;
  if (ahora.absoluto > cierreAbs)
    return { ok: false, motivo: "cerrada", ocurrencia: o };

  return { ok: true, ocurrencia: o };
}

export const seSolapan = (
  a: { inicio: number; fin: number; dias: number },
  b: { inicio: number; fin: number; dias: number },
) => (a.dias & b.dias) !== 0 && a.inicio < b.fin && b.inicio < a.fin;

// ===== Horario semanal, para mostrárselo al cliente =====

const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0]; // lunes primero
const NOMBRE_DIA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export interface GrupoHorario {
  etiqueta: string; // "Lunes a viernes"
  dias: number[]; // 0 = domingo ... 6 = sábado
  ventanas: { inicio: string; fin: string }[];
}

// "Lunes", "Sábado y domingo", "Lunes a viernes", "Todos los días". Los días llegan seguidos y en orden de semana.
export function etiquetaDias(dias: number[]): string {
  if (dias.length === 7) return "Todos los días";
  if (dias.length === 1) return NOMBRE_DIA[dias[0]];
  if (dias.length === 2)
    return `${NOMBRE_DIA[dias[0]]} y ${NOMBRE_DIA[dias[1]].toLowerCase()}`;
  return `${NOMBRE_DIA[dias[0]]} a ${NOMBRE_DIA[dias[dias.length - 1]].toLowerCase()}`;
}

// Junta los días seguidos que tienen exactamente las mismas ventanas, y aparte dice qué días no hay entregas
export function agruparHorario(ventanas: VentanaFila[]): {
  grupos: GrupoHorario[];
  sin_entregas: string[];
} {
  const porDia = ORDEN_SEMANA.map((dia) => ({
    dia,
    ventanas: ventanas
      .filter((v) => v.activa && (v.dias & (1 << dia)) !== 0)
      .sort((a, b) => segundosDe(a.hora_inicio) - segundosDe(b.hora_inicio))
      .map((v) => ({
        inicio: v.hora_inicio.slice(0, 5),
        fin: v.hora_fin.slice(0, 5),
      })),
  }));

  const grupos: GrupoHorario[] = [];
  const vacios: number[] = [];
  let actual: GrupoHorario | null = null;
  let firmaActual = "";

  for (const { dia, ventanas: vs } of porDia) {
    if (vs.length === 0) {
      vacios.push(dia);
      actual = null;
      firmaActual = "";
      continue;
    }

    const firma = JSON.stringify(vs);
    if (actual && firma === firmaActual) {
      actual.dias.push(dia);
    } else {
      actual = { etiqueta: "", dias: [dia], ventanas: vs };
      firmaActual = firma;
      grupos.push(actual);
    }
  }
  for (const g of grupos) g.etiqueta = etiquetaDias(g.dias);

  // Los días sin entregas también se juntan si son seguidos
  const sinEntregas: string[] = [];
  let racha: number[] = [];
  const cerrar = () => {
    if (racha.length > 0) sinEntregas.push(etiquetaDias(racha));
    racha = [];
  };
  for (const dia of ORDEN_SEMANA) {
    if (vacios.includes(dia)) racha.push(dia);
    else cerrar();
  }
  cerrar();

  return { grupos, sin_entregas: sinEntregas };
}

import { db } from "../config/db";
import { MINUTOS_CORTE, ZONA_HORARIA } from "../config/ventanas";
import {
  ahoraLocal,
  diaSemana,
  hhmm,
  HORA_VALIDA,
  ocurrencia,
  segundosDe,
  seSolapan,
  sumarDias,
  numeroDeDia,
  type VentanaFila,
} from "../utils/ventanas";
import { ErrorSuperAdmin } from "./superadminRestaurantesService";

const MAX_VENTANAS = 20;
const DURACION_MINIMA = 15 * 60;
const DURACION_MAXIMA = 12 * 3600;
const DIAS_EN_PANTALLA = 3;

// Pedidos que todavía hay que entregar
const ESTADOS_ABIERTOS =
  "('nuevo', 'en_preparacion', 'listo_para_recoger', 'en_entrega')";

const COLUMNAS = `id, TIME_FORMAT(hora_inicio, '%H:%i:%s') AS hora_inicio, TIME_FORMAT(hora_fin, '%H:%i:%s') AS hora_fin, dias, activa`;

type Fila = {
  id: number;
  hora_inicio: string;
  hora_fin: string;
  dias: number;
  activa: boolean;
};

const leerFila = (r: any): Fila => ({
  ...r,
  dias: Number(r.dias),
  activa: !!r.activa,
});

const diasDe = (mascara: number) =>
  [0, 1, 2, 3, 4, 5, 6].filter((d) => (mascara & (1 << d)) !== 0);

function leerHora(valor: unknown, nombre: string) {
  if (typeof valor !== "string" || !HORA_VALIDA.test(valor)) {
    throw new ErrorSuperAdmin(
      400,
      `La hora de ${nombre} no es válida (usa el formato HH:MM)`,
    );
  }
  return valor;
}

function leerDias(valor: unknown) {
  if (!Array.isArray(valor) || valor.length === 0)
    throw new ErrorSuperAdmin(400, "Elige al menos un día");
  let mascara = 0;
  for (const d of valor) {
    if (!Number.isInteger(d) || d < 0 || d > 6)
      throw new ErrorSuperAdmin(400, "Día no válido");
    mascara |= 1 << d;
  }
  return mascara;
}

async function pendientesPorVentana() {
  const [rows]: any = await db.query(
    `SELECT ventana_id, COUNT(*) AS total FROM pedidos
     WHERE ventana_id IS NOT NULL AND estado IN ${ESTADOS_ABIERTOS} GROUP BY ventana_id`,
  );
  return new Map<number, number>(
    rows.map((r: any) => [r.ventana_id, Number(r.total)]),
  );
}

const aVentana = (f: Fila, pendientes: Map<number, number>) => ({
  id: f.id,
  hora_inicio: f.hora_inicio.slice(0, 5),
  hora_fin: f.hora_fin.slice(0, 5),
  dias: diasDe(f.dias),
  activa: f.activa,
  pedidos_pendientes: pendientes.get(f.id) ?? 0,
});

export const listarVentanas = async () => {
  const ahora = ahoraLocal();
  const [rows]: any = await db.query(
    `SELECT ${COLUMNAS} FROM ventanas_entrega ORDER BY hora_inicio ASC, id ASC`,
  );
  const filas: Fila[] = rows.map(leerFila);
  const pendientes = await pendientesPorVentana();

  // Los próximos días: cuántos pedidos se han acumulado para cada entrega
  const desde = ahora.fecha;
  const hasta = sumarDias(ahora.fecha, DIAS_EN_PANTALLA);
  const [conteos]: any = await db.query(
    `SELECT DATE_FORMAT(ventana_entrega_inicio, '%Y-%m-%d %H:%i:%s') AS desde, COUNT(*) AS total
     FROM pedidos
     WHERE ventana_entrega_inicio >= ? AND ventana_entrega_inicio < ? AND estado NOT IN ('cancelado', 'rechazado')
     GROUP BY ventana_entrega_inicio`,
    [`${desde} 00:00:00`, `${hasta} 00:00:00`],
  );
  const porDesde = new Map<string, number>(
    conteos.map((c: any) => [c.desde, Number(c.total)]),
  );

  // 1) Justo después de const porDesde = new Map(...)
  const [lotesRows]: any = await db.query(
    `SELECT DATE_FORMAT(ventana_inicio, '%Y-%m-%d %H:%i:%s') AS inicio, repartidores_avisados
     FROM lotes_reparto WHERE ventana_inicio >= ? AND ventana_inicio < ?`,
    [`${desde} 00:00:00`, `${hasta} 00:00:00`],
  );
  const avisados = new Map<string, number>(
    lotesRows.map((l: any) => [l.inicio, Number(l.repartidores_avisados)]),
  );

  const proximas = [];
  for (let i = 0; i < DIAS_EN_PANTALLA; i++) {
    const fecha = sumarDias(ahora.fecha, i);
    const dia = diaSemana(fecha);

    for (const f of filas.filter(
      (x) => x.activa && (x.dias & (1 << dia)) !== 0,
    )) {
      const o = ocurrencia(f as VentanaFila, fecha, ahora);
      const base = numeroDeDia(fecha) * 86400;
      const inicioAbs = base + segundosDe(f.hora_inicio);
      const finAbs = base + segundosDe(f.hora_fin);
      if (ahora.absoluto >= finAbs) continue; // ya terminó

      // recibiendo = todavía se puede pedir · cerrada = ya no, se prepara el reparto · en_curso = se está entregando
      const estado =
        ahora.absoluto <= inicioAbs - MINUTOS_CORTE * 60
          ? "recibiendo"
          : ahora.absoluto < inicioAbs
            ? "cerrada"
            : "en_curso";

      proximas.push({
        ventana_id: f.id,
        fecha,
        etiqueta_dia: o.etiqueta_dia,
        inicio: o.inicio,
        fin: o.fin,
        cierre_hora: o.cierre_hora,
        estado,
        pedidos: porDesde.get(o.desde) ?? 0,
        avisados: avisados.get(o.desde) ?? null, // null = todavía no se ha liberado
      });
    }
  }
  proximas.sort((a, b) =>
    `${a.fecha} ${a.inicio}`.localeCompare(`${b.fecha} ${b.inicio}`),
  );

  return {
    ahora: {
      fecha: ahora.fecha,
      hora: hhmm(ahora.segundos),
      zona: ZONA_HORARIA,
    },
    minutos_corte: MINUTOS_CORTE,
    ventanas: filas.map((f) => aVentana(f, pendientes)),
    proximas,
  };
};

// Una ventana no puede pisar a otra en un día que compartan
async function comprobarSolapes(
  inicio: string,
  fin: string,
  mascara: number,
  excepto?: number,
) {
  const [rows]: any = await db.query(
    `SELECT ${COLUMNAS} FROM ventanas_entrega WHERE id <> ?`,
    [excepto ?? 0],
  );
  for (const o of rows.map(leerFila)) {
    if (
      seSolapan(
        { inicio: segundosDe(inicio), fin: segundosDe(fin), dias: mascara },
        {
          inicio: segundosDe(o.hora_inicio),
          fin: segundosDe(o.hora_fin),
          dias: o.dias,
        },
      )
    ) {
      throw new ErrorSuperAdmin(
        409,
        `Se solapa con la ventana de ${o.hora_inicio.slice(0, 5)} a ${o.hora_fin.slice(0, 5)}`,
      );
    }
  }
}

function comprobarDuracion(inicio: string, fin: string) {
  const duracion = segundosDe(fin) - segundosDe(inicio);
  if (duracion <= 0)
    throw new ErrorSuperAdmin(
      400,
      "La hora de fin debe ser posterior a la de inicio",
    );
  if (duracion < DURACION_MINIMA)
    throw new ErrorSuperAdmin(
      400,
      "Una ventana debe durar al menos 15 minutos",
    );
  if (duracion > DURACION_MAXIMA)
    throw new ErrorSuperAdmin(
      400,
      "Una ventana no puede durar más de 12 horas",
    );
}

async function obtenerVentana(id: number) {
  const [rows]: any = await db.query(
    `SELECT ${COLUMNAS} FROM ventanas_entrega WHERE id = ?`,
    [id],
  );
  if (rows.length === 0)
    throw new ErrorSuperAdmin(404, "Ventana no encontrada");
  return leerFila(rows[0]);
}

export const crearVentana = async (
  datos: { hora_inicio?: unknown; hora_fin?: unknown; dias?: unknown },
  nombre: string,
) => {
  const inicio = leerHora(datos.hora_inicio, "inicio");
  const fin = leerHora(datos.hora_fin, "fin");
  const mascara = leerDias(datos.dias);
  comprobarDuracion(inicio, fin);

  const [total]: any = await db.query(
    "SELECT COUNT(*) AS n FROM ventanas_entrega",
  );
  if (Number(total[0].n) >= MAX_VENTANAS)
    throw new ErrorSuperAdmin(
      409,
      `No puede haber más de ${MAX_VENTANAS} ventanas`,
    );

  await comprobarSolapes(inicio, fin, mascara);

  const [res]: any = await db.query(
    "INSERT INTO ventanas_entrega (hora_inicio, hora_fin, dias, creada_por) VALUES (?, ?, ?, ?)",
    [`${inicio}:00`, `${fin}:00`, mascara, nombre],
  );
  return aVentana(
    await obtenerVentana(res.insertId),
    await pendientesPorVentana(),
  );
};

export const actualizarVentana = async (
  id: number,
  datos: {
    hora_inicio?: unknown;
    hora_fin?: unknown;
    dias?: unknown;
    activa?: unknown;
  },
) => {
  const actual = await obtenerVentana(id);

  const inicio =
    datos.hora_inicio !== undefined
      ? leerHora(datos.hora_inicio, "inicio")
      : actual.hora_inicio.slice(0, 5);
  const fin =
    datos.hora_fin !== undefined
      ? leerHora(datos.hora_fin, "fin")
      : actual.hora_fin.slice(0, 5);
  const mascara = datos.dias !== undefined ? leerDias(datos.dias) : actual.dias;

  if (datos.activa !== undefined && typeof datos.activa !== "boolean")
    throw new ErrorSuperAdmin(400, "Valor no válido");
  const activa =
    datos.activa !== undefined ? (datos.activa as boolean) : actual.activa;

  comprobarDuracion(inicio, fin);
  // Si se queda apagada, no estorba a las demás
  if (activa) await comprobarSolapes(inicio, fin, mascara, id);

  await db.query(
    "UPDATE ventanas_entrega SET hora_inicio = ?, hora_fin = ?, dias = ?, activa = ? WHERE id = ?",
    [`${inicio}:00`, `${fin}:00`, mascara, activa ? 1 : 0, id],
  );
  return aVentana(await obtenerVentana(id), await pendientesPorVentana());
};

export const eliminarVentana = async (id: number) => {
  await obtenerVentana(id);

  const pendientes = (await pendientesPorVentana()).get(id) ?? 0;
  if (pendientes > 0) {
    throw new ErrorSuperAdmin(
      409,
      `Hay ${pendientes} ${pendientes === 1 ? "pedido pendiente" : "pedidos pendientes"} en esta ventana. Desactívala en lugar de eliminarla.`,
    );
  }

  await db.query("DELETE FROM ventanas_entrega WHERE id = ?", [id]);
  return { ok: true };
};

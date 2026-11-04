import { db } from "../../config/db";
import { construirSet } from "../../utils/sql";
import { SUSCRIPCION_AL_DIA } from "../../config/suscripcionSql";
import { tipoDeAviso } from "../../jobs/avisosSuscripcion";

const METODOS_VALIDOS = ["efectivo", "transferencia", "tarjeta"];
const MAX_MONTO = 1_000_000;

// mysql2 devuelve las columnas JSON ya como array, pero por si llega como texto se admite también
function leerMetodos(valor: any): string[] {
  let lista: any = valor;
  if (typeof valor === "string") {
    try {
      lista = JSON.parse(valor);
    } catch {
      lista = null;
    }
  }
  return Array.isArray(lista)
    ? lista.filter((m: any) => METODOS_VALIDOS.includes(m))
    : ["efectivo"];
}

export const obtenerRestaurante = async (restauranteId: number) => {
  const [rows]: any = await db.query(
    `SELECT r.id, r.nombre, r.logo, r.telefono, r.direccion, r.categorias_texto, r.estado,
            r.tiempo_preparacion_min, r.aceptacion_pedidos, r.costo_envio, r.pedido_minimo,
            r.metodos_pago_aceptados, r.rating, r.reviews_count,  r.suspendido,  ${SUSCRIPCION_AL_DIA("r")} AS suscripcion_al_dia,
            (SELECT CASE WHEN s.estado = 'activa' AND s.fecha_renovacion < CURDATE() THEN 'vencida' ELSE s.estado END
               FROM suscripciones s WHERE s.restaurante_id = r.id ORDER BY s.id DESC LIMIT 1) AS suscripcion_estado,
               (SELECT CASE WHEN s.estado = 'activa' THEN DATEDIFF(s.fecha_renovacion, CURDATE()) END
               FROM suscripciones s WHERE s.restaurante_id = r.id ORDER BY s.id DESC LIMIT 1) AS suscripcion_dias,
            (SELECT s.plan FROM suscripciones s WHERE s.restaurante_id = r.id ORDER BY s.id DESC LIMIT 1) AS suscripcion_plan,
            EXISTS (SELECT 1 FROM pagos_suscripcion p WHERE p.restaurante_id = r.id AND p.estado = 'pendiente') AS suscripcion_pago_pendiente,

 r.motivo_suspension,
            (SELECT COUNT(*) FROM platos p
              WHERE p.restaurante_id = r.id AND p.disponible = 1) AS platos_disponibles,
            (SELECT COUNT(*) FROM pedidos x
              WHERE x.restaurante_id = r.id
                AND x.estado IN ('nuevo', 'en_preparacion', 'listo_para_recoger', 'en_entrega')) AS pedidos_activos
     FROM restaurantes r
     WHERE r.id = ?`,
    [restauranteId],
  );

  if (rows.length === 0) throw new Error("Restaurante no encontrado");
  const r = rows[0];

  return {
    ...r,
    suspendido: !!r.suspendido,
    suscripcion_al_dia: !!r.suscripcion_al_dia,
    suscripcion_dias:
      r.suscripcion_dias === null ? null : Number(r.suscripcion_dias),
    suscripcion_aviso:
      r.suscripcion_al_dia && r.suscripcion_dias !== null
        ? tipoDeAviso(
            Number(r.suscripcion_dias),
            r.suscripcion_plan,
            !!r.suscripcion_pago_pendiente,
          )
        : null,
    metodos_pago_aceptados: leerMetodos(r.metodos_pago_aceptados),
    costo_envio: Number(r.costo_envio),
    pedido_minimo: Number(r.pedido_minimo),
    rating: Number(r.rating),
    reviews_count: Number(r.reviews_count),
    platos_disponibles: Number(r.platos_disponibles),
    pedidos_activos: Number(r.pedidos_activos),
  };
};

export const actualizarRestaurante = async (
  restauranteId: number,
  data: Record<string, any>,
) => {
  if (data.estado === "abierto") {
    const [actual]: any = await db.query(
      `SELECT suspendido, ${SUSCRIPCION_AL_DIA("restaurantes")} AS al_dia FROM restaurantes WHERE id = ?`,
      [restauranteId],
    );
    if (actual[0]?.suspendido) {
      throw new Error(
        "Tu restaurante está suspendido por la plataforma y no puede abrirse hasta que se reactive",
      );
    }
    if (actual[0] && !actual[0].al_dia) {
      throw new Error(
        "Tu suscripción no está vigente. Renuévala para poder abrir tu restaurante.",
      );
    }
  }
  const cambios: Record<string, any> = {};

  const textoOpcional = (campo: string, etiqueta: string, max: number) => {
    if (data[campo] === undefined) return;
    if (data[campo] !== null && typeof data[campo] !== "string")
      throw new Error(`${etiqueta} no es válido`);
    const valor = String(data[campo] ?? "").trim();
    if (valor.length > max)
      throw new Error(
        `${etiqueta} es demasiado largo (máximo ${max} caracteres)`,
      );
    cambios[campo] = valor || null;
  };

  const monto = (campo: string, etiqueta: string) => {
    if (data[campo] === undefined) return;
    const n = Number(data[campo]);
    if (
      data[campo] === "" ||
      data[campo] === null ||
      !Number.isFinite(n) ||
      n < 0 ||
      n > MAX_MONTO
    ) {
      throw new Error(
        `${etiqueta} debe ser un número entre 0 y ${MAX_MONTO.toLocaleString("es-ES")}`,
      );
    }
    cambios[campo] = Math.round(n * 100) / 100;
  };

  if (data.nombre !== undefined) {
    if (typeof data.nombre !== "string")
      throw new Error("El nombre no es válido");
    const nombre = data.nombre.trim();
    if (nombre.length < 2 || nombre.length > 150)
      throw new Error("El nombre debe tener entre 2 y 150 caracteres");
    cambios.nombre = nombre;
  }

  textoOpcional("telefono", "El teléfono", 20);
  textoOpcional("direccion", "La dirección", 255);
  textoOpcional("categorias_texto", "El tipo de cocina", 150);
  textoOpcional("logo", "El logo", 500);

  // El logo solo puede venir de nuestro almacenamiento, no de una dirección cualquiera
  const base = process.env.SUPABASE_URL;
  if (
    cambios.logo &&
    base &&
    !String(cambios.logo).startsWith(`${base}/storage/v1/object/public/`)
  ) {
    throw new Error("El logo no es válido");
  }

  if (data.estado !== undefined) {
    if (!["abierto", "cerrado"].includes(data.estado))
      throw new Error("Estado no válido");
    cambios.estado = data.estado;
  }

  if (data.aceptacion_pedidos !== undefined) {
    if (!["manual", "automatica"].includes(data.aceptacion_pedidos))
      throw new Error("Tipo de aceptación no válido");
    cambios.aceptacion_pedidos = data.aceptacion_pedidos;
  }

  if (data.tiempo_preparacion_min !== undefined) {
    const t = Number(data.tiempo_preparacion_min);
    if (!Number.isInteger(t) || t < 5 || t > 180) {
      throw new Error(
        "El tiempo de preparación debe ser un número entero entre 5 y 180 minutos",
      );
    }
    cambios.tiempo_preparacion_min = t;
  }

  monto("costo_envio", "El costo de envío");
  monto("pedido_minimo", "El pedido mínimo");

  if (data.metodos_pago_aceptados !== undefined) {
    let lista: any = data.metodos_pago_aceptados;
    if (typeof lista === "string") {
      try {
        lista = JSON.parse(lista);
      } catch {
        throw new Error("Métodos de pago no válidos");
      }
    }
    if (
      !Array.isArray(lista) ||
      lista.length === 0 ||
      !lista.every((m: any) => METODOS_VALIDOS.includes(m))
    ) {
      throw new Error("Elige al menos un método de pago válido");
    }
    cambios.metodos_pago_aceptados = JSON.stringify([...new Set(lista)]);
  }

  const { sql, valores } = construirSet(cambios, [
    "nombre",
    "telefono",
    "direccion",
    "categorias_texto",
    "logo",
    "estado",
    "aceptacion_pedidos",
    "tiempo_preparacion_min",
    "costo_envio",
    "pedido_minimo",
    "metodos_pago_aceptados",
  ]);
  if (!sql) throw new Error("No hay cambios para guardar");

  await db.query(`UPDATE restaurantes SET ${sql} WHERE id = ?`, [
    ...valores,
    restauranteId,
  ]);

  // Devuelve el restaurante ya actualizado, para que las pantallas muestren lo guardado
  return obtenerRestaurante(restauranteId);
};

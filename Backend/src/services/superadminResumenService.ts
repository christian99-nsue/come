import { db } from "../config/db";

const n = (v: any) => Number(v ?? 0);

// Si una consulta falla (por ejemplo, falta una tabla), esa sección queda en null y las demás siguen
async function seccion(nombre: string, sql: string) {
  try {
    const [rows]: any = await db.query(sql);
    return rows[0];
  } catch (error) {
    console.error(
      `Resumen del súper admin: falló la sección "${nombre}":`,
      error,
    );
    return null;
  }
}

export const obtenerResumen = async () => {
  const [pedidos, ventas, restaurantes, usuarios, suscripciones, soporte] =
    await Promise.all([
      seccion(
        "pedidos",
        `SELECT SUM(fecha_creacion >= CURDATE()) AS hoy,
              SUM(fecha_creacion >= NOW() - INTERVAL 7 DAY) AS semana,
              SUM(estado IN ('nuevo','en_preparacion','listo_para_recoger','en_entrega')) AS en_curso
       FROM pedidos`,
      ),
      // Ventas = total de los pedidos ya entregados (incluye el envío)
      seccion(
        "ventas",
        `SELECT
         COALESCE(SUM(CASE WHEN COALESCE(fecha_entrega, fecha_actualizacion) >= CURDATE() THEN total END), 0) AS hoy,
         COALESCE(SUM(CASE WHEN COALESCE(fecha_entrega, fecha_actualizacion) >= NOW() - INTERVAL 7 DAY THEN total END), 0) AS semana,
         COALESCE(SUM(CASE WHEN COALESCE(fecha_entrega, fecha_actualizacion) >= NOW() - INTERVAL 30 DAY THEN total END), 0) AS mes
       FROM pedidos WHERE estado = 'entregado'`,
      ),
      seccion(
        "restaurantes",
        "SELECT COUNT(*) AS total, SUM(estado = 'abierto') AS abiertos FROM restaurantes",
      ),
      seccion(
        "usuarios",
        `SELECT SUM(rol = 'cliente') AS clientes,
              SUM(rol = 'repartidor') AS repartidores,
              SUM(rol = 'admin') AS administradores
       FROM usuarios`,
      ),
      // Solo cuenta la suscripción más reciente de cada restaurante. Se calcula por fecha porque
      // nada cambia el estado a "vencida" automáticamente.
      seccion(
        "suscripciones",
        `SELECT
         SUM(s.estado = 'activa' AND s.fecha_renovacion >= CURDATE()) AS activas,
         SUM(s.estado = 'activa' AND s.fecha_renovacion BETWEEN CURDATE() AND CURDATE() + INTERVAL 7 DAY) AS por_vencer,
         SUM(s.estado = 'vencida' OR (s.estado = 'activa' AND s.fecha_renovacion < CURDATE())) AS vencidas
       FROM suscripciones s
       WHERE s.id = (SELECT MAX(x.id) FROM suscripciones x WHERE x.restaurante_id = s.restaurante_id)`,
      ),
      seccion(
        "soporte",
        "SELECT SUM(estado = 'abierto') AS abiertos FROM reportes_soporte",
      ),
    ]);

  return {
    pedidos: pedidos && {
      hoy: n(pedidos.hoy),
      semana: n(pedidos.semana),
      en_curso: n(pedidos.en_curso),
    },
    ventas: ventas && {
      hoy: n(ventas.hoy),
      semana: n(ventas.semana),
      mes: n(ventas.mes),
    },
    restaurantes: restaurantes && {
      total: n(restaurantes.total),
      abiertos: n(restaurantes.abiertos),
    },
    usuarios: usuarios && {
      clientes: n(usuarios.clientes),
      repartidores: n(usuarios.repartidores),
      administradores: n(usuarios.administradores),
    },
    suscripciones: suscripciones && {
      activas: n(suscripciones.activas),
      por_vencer: n(suscripciones.por_vencer),
      vencidas: n(suscripciones.vencidas),
    },
    soporte: soporte && { abiertos: n(soporte.abiertos) },
    generado_en: new Date().toISOString(),
  };
};

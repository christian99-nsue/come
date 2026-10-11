import { db } from "../../config/db";
import crypto from "crypto";

// Solo devuelve repartidores que tienen AL MENOS un pedido entregado (o en curso)
// para este restaurante — nunca la lista completa de repartidores de la plataforma.
export const listarRepartidores = async (restauranteId: number) => {
  const [rows]: any = await db.query(
    `
    SELECT
      u.id,
      u.nombre,
      u.foto_perfil,
      u.disponible,
      COUNT(p.id) AS entregas_totales,
      (
        SELECT p2.codigo
        FROM pedidos p2
        WHERE p2.repartidor_id = u.id
          AND p2.restaurante_id = ?
          AND p2.estado IN ('listo_para_recoger', 'en_entrega')
        ORDER BY p2.fecha_creacion DESC
        LIMIT 1
      ) AS pedido_activo_codigo
    FROM usuarios u
    JOIN pedidos p
      ON p.repartidor_id = u.id
     AND p.restaurante_id = ?
     AND p.estado = 'entregado'
    WHERE u.rol = 'repartidor'
    GROUP BY u.id, u.nombre, u.foto_perfil, u.disponible
    ORDER BY u.nombre ASC
    `,
    [restauranteId, restauranteId]
  );

  return rows.map((r: any) => ({
    id: r.id,
    nombre: r.nombre,
    foto_perfil: r.foto_perfil,
    entregas_totales: r.entregas_totales,
    estado: r.pedido_activo_codigo ? "en_entrega" : r.disponible ? "disponible" : "no_disponible",
    pedido_activo_codigo: r.pedido_activo_codigo,
  }));
};

// Genera un código de invitación para que un NUEVO repartidor se vincule.
// Ese repartidor no aparecerá en listarRepartidores() hasta que complete
// su primera entrega — es intencional, según la regla del negocio.
export const generarCodigoInvitacion = async (restauranteId: number) => {
  const codigo = crypto.randomBytes(4).toString("hex").toUpperCase(); // ej: "A3F9C21B"
  const fechaExpiracion = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 días

  await db.query(
    `INSERT INTO codigos_repartidor (restaurante_id, codigo, fecha_expiracion) VALUES (?, ?, ?)`,
    [restauranteId, codigo, fechaExpiracion]
  );

  return { codigo, expira: fechaExpiracion };
};

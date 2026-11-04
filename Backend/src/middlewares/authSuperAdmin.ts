import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/db";

// El hub firma con su clave privada; aquí solo existe la pública, que no sirve para fabricar tokens
const clavePublica = process.env.HUB_PUBLIC_KEY
  ? Buffer.from(process.env.HUB_PUBLIC_KEY, "base64").toString("utf8")
  : null;

const PLATAFORMA = "come"; // debe coincidir con el slug de COME en la tabla `plataformas` del hub
const METODOS_LECTURA = ["GET", "HEAD", "OPTIONS"];

async function registrarAccion(
  superAdmin: { id: number; nombre: string },
  req: Request,
  estado: number,
) {
  try {
    await db.query(
      "INSERT INTO superadmin_acciones (super_admin_id, nombre, accion, detalle, ip) VALUES (?, ?, ?, ?, ?)",
      [
        superAdmin.id,
        superAdmin.nombre,
        "escritura",
        JSON.stringify({
          metodo: req.method,
          ruta: req.baseUrl + req.path,
          estado,
        }),
        String(req.ip ?? "").slice(0, 45),
      ],
    );
  } catch (error) {
    // Una falla al registrar no debe romper la acción
    console.error("No se pudo registrar la acción del súper admin:", error);
  }
}

export const verificarSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!clavePublica) {
    return res.status(503).json({
      message: "El acceso desde el hub no está configurado en este servidor",
    });
  }

  try {
    const cabecera = req.headers.authorization;
    if (!cabecera?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const payload = jwt.verify(cabecera.slice(7), clavePublica, {
      algorithms: ["RS256"], // fijado: así un token HS256 (los de COME) nunca se acepta aquí
      audience: PLATAFORMA, // un token emitido para otra plataforma se rechaza
      issuer: "hub",
      clockTolerance: 5,
    }) as jwt.JwtPayload;

    const id = Number(payload.sub);
    if (
      payload.rol !== "superadmin" ||
      !Number.isInteger(id) ||
      id <= 0 ||
      !["total", "solo_lectura"].includes(payload.permiso)
    ) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const superAdmin = {
      id,
      nombre: String(payload.nombre || "Súper admin").slice(0, 120),
      permiso: payload.permiso as "total" | "solo_lectura",
    };
    (req as any).superAdmin = superAdmin;

    if (!METODOS_LECTURA.includes(req.method)) {
      // Solo el permiso "total" puede cambiar datos
      if (superAdmin.permiso !== "total") {
        return res
          .status(403)
          .json({ message: "Tu acceso a esta plataforma es de solo lectura" });
      }
      // Toda escritura queda registrada, sin que cada ruta tenga que acordarse
      res.on("finish", () => {
        registrarAccion(superAdmin, req, res.statusCode);
      });
    }

    next();
  } catch {
    res.status(401).json({ message: "Token inválido o caducado" });
  }
};

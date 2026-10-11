import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/db";

// Verifica el JWT y además resuelve el restaurante que administra ese usuario,
// dejándolo en req.restauranteId para que los controladores no repitan esa consulta.
export const verificarTokenAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    const [userRows]: any = await db.query(
      "SELECT id, rol FROM usuarios WHERE id = ?",
      [payload.id]
    );

    if (userRows.length === 0 || userRows[0].rol !== "admin") {
      return res.status(403).json({ message: "No autorizado" });
    }

    const [restauranteRows]: any = await db.query(
      "SELECT id FROM restaurantes WHERE admin_id = ?",
      [payload.id]
    );

    if (restauranteRows.length === 0) {
      return res.status(404).json({ message: "Este admin no tiene un restaurante asociado" });
    }

    (req as any).usuarioId = payload.id;
    (req as any).restauranteId = restauranteRows[0].id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

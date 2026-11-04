import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/db";

export const verificarTokenCliente = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
    };

    const [rows]: any = await db.query(
      "SELECT id, rol FROM usuarios WHERE id = ?",
      [payload.id],
    );

    if (rows.length === 0 || rows[0].rol !== "cliente") {
      return res.status(403).json({ message: "No autorizado" });
    }

    (req as any).usuarioId = payload.id;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

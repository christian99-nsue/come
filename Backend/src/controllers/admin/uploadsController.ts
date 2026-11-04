import type { Request, Response } from "express";
import * as uploadService from "../../services/admin/uploadService";

// Carpetas válidas dentro del bucket — evita que alguien mande cualquier string
// y desordene el storage con nombres arbitrarios.
const CARPETAS_VALIDAS = [
  "platos",
  "categorias",
  "logos-restaurante",
  "perfiles-admin",
  "fotos-restaurante",
  "perfiles-repartidor",
  "perfiles-cliente",
  "abastecimiento",
];

export const subirImagen = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se recibió ningún archivo" });
    }

    const carpeta = req.body.carpeta as string;
    if (!CARPETAS_VALIDAS.includes(carpeta)) {
      return res.status(400).json({ message: "Carpeta de destino no válida" });
    }

    const resultado = await uploadService.subirImagen(
      {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        size: req.file.size,
        originalname: req.file.originalname,
      },
      carpeta,
    );

    res.status(201).json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

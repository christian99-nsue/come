import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import * as uploadsController from "../controllers/admin/uploadsController";
import { verificarSuperAdmin } from "../middlewares/authSuperAdmin";

const router = Router();
router.use(verificarSuperAdmin); // subir un archivo es una escritura: exige permiso "total" y queda registrado

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// La carpeta de destino la fija el servidor, diga lo que diga la petición
const fijarCarpeta = (req: Request, _res: Response, next: NextFunction) => {
  req.body.carpeta = "abastecimiento";
  next();
};

router.post(
  "/",
  (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (error: any) => {
      if (error) {
        return res.status(400).json({
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "La imagen no puede superar los 5 MB."
              : "No se pudo leer el archivo",
        });
      }
      next();
    });
  },
  fijarCarpeta,
  uploadsController.subirImagen,
);

export default router;

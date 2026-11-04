import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import * as uploadsController from "../../controllers/admin/uploadsController";
import { verificarTokenCliente } from "../../middlewares/authCliente";

const router = Router();
router.use(verificarTokenCliente);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// El cliente solo puede subir a su carpeta de perfiles, diga lo que diga la petición
const fijarCarpeta = (req: Request, _res: Response, next: NextFunction) => {
  req.body.carpeta = "perfiles-cliente";
  next();
};

router.post(
  "/",
  upload.single("file"),
  fijarCarpeta,
  uploadsController.subirImagen,
);

export default router;

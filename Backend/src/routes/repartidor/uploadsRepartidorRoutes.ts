import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import * as uploadsController from "../../controllers/admin/uploadsController";
import { verificarTokenRepartidor } from "../../middlewares/authRepartidor";

const router = Router();
router.use(verificarTokenRepartidor);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// El repartidor solo puede subir a su carpeta de perfiles, diga lo que diga el cliente
const fijarCarpeta = (req: Request, _res: Response, next: NextFunction) => {
  req.body.carpeta = "perfiles-repartidor";
  next();
};

router.post(
  "/",
  upload.single("file"),
  fijarCarpeta,
  uploadsController.subirImagen,
);

export default router;

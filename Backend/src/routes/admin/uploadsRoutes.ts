import { Router } from "express";
import multer from "multer";
import * as uploadsController from "../../controllers/admin/uploadsController";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

// Guardamos el archivo en memoria (no en disco) porque lo reenviamos
// directo a Supabase — no necesitamos persistirlo localmente.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB, igual que en uploadService
});

router.post("/", upload.single("file"), uploadsController.subirImagen);

export default router;

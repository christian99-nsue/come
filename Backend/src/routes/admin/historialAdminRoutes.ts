import { Router } from "express";
import type { Request, Response } from "express";
import * as historialService from "../../services/admin/historialAdminService";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const filtro = (req.query.estado as any) || "todos";
    const historial = await historialService.listarHistorial(
      restauranteId,
      filtro,
    );
    res.json(historial);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

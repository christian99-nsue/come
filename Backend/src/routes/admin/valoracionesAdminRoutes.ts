import { Router } from "express";
import type { Request, Response } from "express";
import * as valoracionesService from "../../services/cliente/valoracionesService";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    res.json(
      await valoracionesService.obtenerValoraciones(restauranteId, "admin"),
    );
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

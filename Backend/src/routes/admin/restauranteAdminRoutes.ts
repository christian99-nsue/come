import { Router } from "express";
import type { Request, Response } from "express";
import * as restauranteService from "../../services/admin/restauranteAdminService";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const restaurante =
      await restauranteService.obtenerRestaurante(restauranteId);
    res.json(restaurante);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.patch("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const resultado = await restauranteService.actualizarRestaurante(
      restauranteId,
      req.body,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

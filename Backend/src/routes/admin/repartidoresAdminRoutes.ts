import { Router } from "express";
import type { Request, Response } from "express";
import * as repartidoresService from "../../services/admin/repartidoresAdminService";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

// Solo repartidores que YA trabajaron con este restaurante (al menos 1 pedido entregado)
router.get("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const repartidores =
      await repartidoresService.listarRepartidores(restauranteId);
    res.json(repartidores);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/generar-codigo", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const resultado =
      await repartidoresService.generarCodigoInvitacion(restauranteId);
    res.status(201).json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

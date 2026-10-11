import { Router } from "express";
import type { Request, Response } from "express";
import * as dashboardService from "../../services/admin/dashboardAdminService";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;

    const [resumenHoy, pedidosAtencion, comparativaVentas] = await Promise.all([
      dashboardService.obtenerResumenHoy(restauranteId),
      dashboardService.obtenerPedidosQueRequierenAtencion(restauranteId),
      dashboardService.obtenerComparativaVentas(restauranteId),
    ]);

    res.json({ resumenHoy, pedidosAtencion, comparativaVentas });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

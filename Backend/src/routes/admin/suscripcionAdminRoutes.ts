import { Router } from "express";
import type { Request, Response } from "express";
import * as suscripcionService from "../../services/admin/suscripcionAdminService";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    res.json(await suscripcionService.obtenerSuscripcion(restauranteId));
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.post("/solicitud", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const { plan, metodo_pago, referencia } = req.body ?? {};
    res
      .status(201)
      .json(
        await suscripcionService.solicitarPlan(
          restauranteId,
          plan,
          metodo_pago,
          referencia,
        ),
      );
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

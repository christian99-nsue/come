import { Router } from "express";
import type { Request, Response } from "express";
import * as suscripcionService from "../../services/admin/suscripcionAdminService";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const suscripcion =
      await suscripcionService.obtenerSuscripcion(restauranteId);
    res.json(suscripcion);
  } catch (error: any) {
    console.error("ERROR SUSCRIPCIÓN:", error);
    res.status(500).json({ message: error.message });
  }
});

router.patch("/plan", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const { plan, metodo_pago } = req.body;
    const resultado = await suscripcionService.cambiarPlan(
      restauranteId,
      plan,
      metodo_pago,
    );
    res.json(resultado);
  } catch (error: any) {
    console.error("ERROR SUSCRIPCIÓN:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

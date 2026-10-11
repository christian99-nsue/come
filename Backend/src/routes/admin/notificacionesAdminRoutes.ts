import { Router } from "express";
import type { Request, Response } from "express";
import * as notifService from "../../services/admin/notificacionesAdminService";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const tipo = req.query.tipo as any;
    const notificaciones = await notifService.listarNotificaciones(
      restauranteId,
      tipo,
    );
    res.json(notificaciones);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/no-leidas", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const total = await notifService.contarNoLeidas(restauranteId);
    res.json({ total });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:id/leida", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const resultado = await notifService.marcarComoLeida(
      Number(req.params.id),
      restauranteId,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/leer-todas", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const resultado = await notifService.marcarTodasComoLeidas(restauranteId);
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

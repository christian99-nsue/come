import { Router } from "express";
import type { Request, Response } from "express";
import * as horariosService from "../../services/admin/horariosAdminService";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const horarios = await horariosService.obtenerHorarios(restauranteId);
    res.json(horarios);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const resultado = await horariosService.guardarHorarios(
      restauranteId,
      req.body.horarios,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

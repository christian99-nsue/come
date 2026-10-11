import { Router } from "express";
import type { Request, Response } from "express";
import * as ventasService from "../../services/admin/ventasAdminService";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const rango = (req.query.rango as any) || "hoy";

    const [resumen, serie, productosMasVendidos] = await Promise.all([
      ventasService.obtenerResumen(restauranteId, rango),
      ventasService.obtenerSerieIngresos(restauranteId, rango),
      ventasService.obtenerProductosMasVendidos(restauranteId, rango),
    ]);

    res.json({ resumen, serie, productosMasVendidos });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

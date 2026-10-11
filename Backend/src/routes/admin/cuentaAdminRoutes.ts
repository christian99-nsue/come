import { Router } from "express";
import type { Request, Response } from "express";
import * as cuentaService from "../../services/admin/cuentaAdminService";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const cuenta = await cuentaService.obtenerCuenta(usuarioId);
    res.json(cuenta);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.patch("/", async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const resultado = await cuentaService.actualizarCuenta(usuarioId, req.body);
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/password", async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const { contrasenaActual, contrasenaNueva } = req.body;
    const resultado = await cuentaService.cambiarContrasena(
      usuarioId,
      contrasenaActual,
      contrasenaNueva,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

import { Router } from "express";
import type { Request, Response } from "express";
import * as perfilService from "../../services/repartidor/perfilRepartidorService";
import { verificarTokenRepartidor } from "../../middlewares/authRepartidor";

const router = Router();
router.use(verificarTokenRepartidor);

router.get("/", async (req: Request, res: Response) => {
  try {
    const perfil = await perfilService.obtenerPerfil((req as any).usuarioId);
    res.json(perfil);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.get("/cuenta", async (req: Request, res: Response) => {
  try {
    const cuenta = await perfilService.obtenerCuenta((req as any).usuarioId);
    res.json(cuenta);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.patch("/", async (req: Request, res: Response) => {
  try {
    const perfil = await perfilService.actualizarPerfil(
      (req as any).usuarioId,
      req.body,
    );
    res.json(perfil);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/preferencias", async (req: Request, res: Response) => {
  try {
    const resultado = await perfilService.actualizarPreferencias(
      (req as any).usuarioId,
      req.body.notificaciones_activas,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/password", async (req: Request, res: Response) => {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body;
    const resultado = await perfilService.cambiarContrasena(
      (req as any).usuarioId,
      contrasenaActual,
      contrasenaNueva,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

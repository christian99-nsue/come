import { Router } from "express";
import type { Request, Response } from "express";
import * as fotosService from "../../services/admin/fotosRestauranteAdminService";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const fotos = await fotosService.listarFotos(restauranteId);
    res.json(fotos);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// El frontend primero sube la imagen a /api/admin/uploads (carpeta "fotos-restaurante"),
// y con la URL + ruta que eso devuelve, llama aquí para guardarla en la galería.
router.post("/", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const { url, path } = req.body;
    const foto = await fotosService.agregarFoto(restauranteId, url, path);
    res.status(201).json(foto);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const resultado = await fotosService.eliminarFoto(
      Number(req.params.id),
      restauranteId,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

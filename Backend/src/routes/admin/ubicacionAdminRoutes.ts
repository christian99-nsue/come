import { Router } from "express";
import type { Request, Response } from "express";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";
import * as ubicacion from "../../services/repartidor/ubicacionRestauranteService";
import { ErrorCarga } from "../../utils/ubicacion";

const router = Router();
router.use(verificarTokenAdmin);

// Siempre es el restaurante de quien tiene la sesión: no se puede tocar el de otro
const restauranteId = (req: Request) => (req as any).restauranteId as number;

function responderError(res: Response, error: unknown) {
  if (error instanceof ErrorCarga)
    return res.status(error.estado).json({ message: error.message });
  console.error(error);
  res.status(500).json({ message: "Error del servidor" });
}

router.get("/", async (req: Request, res: Response) => {
  try {
    res.json(await ubicacion.obtenerUbicacion(restauranteId(req)));
  } catch (error) {
    responderError(res, error);
  }
});

router.put("/", async (req: Request, res: Response) => {
  try {
    const cuerpo = req.body && typeof req.body === "object" ? req.body : {};
    res.json(
      await ubicacion.guardarUbicacion(
        restauranteId(req),
        cuerpo.latitud,
        cuerpo.longitud,
      ),
    );
  } catch (error) {
    responderError(res, error);
  }
});

router.delete("/", async (req: Request, res: Response) => {
  try {
    res.json(await ubicacion.quitarUbicacion(restauranteId(req)));
  } catch (error) {
    responderError(res, error);
  }
});

export default router;

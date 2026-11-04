import { Router } from "express";
import type { Request, Response } from "express";
import * as carga from "../../services/repartidor/cargaRepartidorService";
import { ErrorCarga } from "../../utils/ubicacion";

// Se monta dentro de las rutas del repartidor, así que ya llega con la sesión comprobada (req.usuarioId)
const router = Router();

const repartidorId = (req: Request) => (req as any).usuarioId as number;
const posicion = (req: Request) =>
  carga.leerPosicion(req.query.lat, req.query.lng);

function responderError(res: Response, error: unknown) {
  if (error instanceof ErrorCarga)
    return res.status(error.estado).json({ message: error.message });
  console.error(error);
  res.status(500).json({ message: "Error del servidor" });
}

// Los restaurantes con pedidos esperando (?lat=&lng= para ordenarlos por cercanía)
router.get("/restaurantes", async (req: Request, res: Response) => {
  try {
    res.json(
      await carga.restaurantesConPedidos(repartidorId(req), posicion(req)),
    );
  } catch (error) {
    responderError(res, error);
  }
});

// Los pedidos de un restaurante, agrupados por ventana
router.get("/restaurantes/:id/pedidos", async (req: Request, res: Response) => {
  try {
    res.json(
      await carga.pedidosDeRestaurante(repartidorId(req), req.params.id),
    );
  } catch (error) {
    responderError(res, error);
  }
});

// Tomar hasta 10 pedidos de un restaurante
router.post("/tomar", async (req: Request, res: Response) => {
  try {
    const cuerpo = req.body && typeof req.body === "object" ? req.body : {};
    res
      .status(201)
      .json(
        await carga.tomarCarga(
          repartidorId(req),
          cuerpo.restaurante_id,
          cuerpo.pedido_ids,
        ),
      );
  } catch (error) {
    responderError(res, error);
  }
});

// La carga actual, con la ruta (?lat=&lng= para recalcularla desde donde está)
router.get("/", async (req: Request, res: Response) => {
  try {
    res.json(await carga.obtenerCarga(repartidorId(req), posicion(req)));
  } catch (error) {
    responderError(res, error);
  }
});

export default router;

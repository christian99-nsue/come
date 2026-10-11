import { Router } from "express";
import type { Request, Response } from "express";
import * as panelService from "../../services/repartidor/panelRepartidorService";
import * as pedidosService from "../../services/repartidor/pedidosRepartidorService";
import * as entregaService from "../../services/repartidor/entregaRepartidorService";
import * as disponibilidadService from "../../services/repartidor/disponibilidadRepartidorService";
import * as historialService from "../../services/repartidor/historialRepartidorService";
import * as notificacionesService from "../../services/repartidor/notificacionesRepartidorService";
import { verificarTokenRepartidor } from "../../middlewares/authRepartidor";
import * as misPedidosService from "../../services/repartidor/misPedidosRepartidorService";

const router = Router();
router.use(verificarTokenRepartidor);

// ===== Panel y pedidos disponibles =====
router.get("/panel", async (req: Request, res: Response) => {
  try {
    const panel = await panelService.obtenerPanel((req as any).usuarioId);
    res.json(panel);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/pedidos/:id", async (req: Request, res: Response) => {
  try {
    const pedido = await pedidosService.obtenerPedido(
      Number(req.params.id),
      (req as any).usuarioId,
    );
    res.json(pedido);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/pedidos/:id/tomar", async (req: Request, res: Response) => {
  try {
    const resultado = await pedidosService.tomarPedido(
      Number(req.params.id),
      (req as any).usuarioId,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ===== Entrega en curso =====
router.get("/entrega-actual", async (req: Request, res: Response) => {
  try {
    const entrega = await entregaService.obtenerEntregaActual(
      (req as any).usuarioId,
    );
    res.json(entrega); // puede ser null
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/pedidos/:id/recogido", async (req: Request, res: Response) => {
  try {
    const resultado = await entregaService.marcarRecogido(
      Number(req.params.id),
      (req as any).usuarioId,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/pedidos/:id/entregado", async (req: Request, res: Response) => {
  try {
    const resultado = await entregaService.marcarEntregado(
      Number(req.params.id),
      (req as any).usuarioId,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/pedidos/:id/completado", async (req: Request, res: Response) => {
  try {
    const entrega = await entregaService.obtenerEntregaCompletada(
      Number(req.params.id),
      (req as any).usuarioId,
    );
    res.json(entrega);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

// ===== Historial =====
router.get("/historial", async (req: Request, res: Response) => {
  try {
    const rango = (req.query.rango as any) || "hoy";
    const historial = await historialService.listarHistorial(
      (req as any).usuarioId,
      rango,
    );
    res.json(historial);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ===== Notificaciones =====
router.get("/notificaciones", async (req: Request, res: Response) => {
  try {
    const lista = await notificacionesService.listarNotificaciones(
      (req as any).usuarioId,
    );
    res.json(lista);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/notificaciones/no-leidas", async (req: Request, res: Response) => {
  try {
    const total = await notificacionesService.contarNoLeidas(
      (req as any).usuarioId,
    );
    res.json({ total });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch(
  "/notificaciones/leer-todas",
  async (req: Request, res: Response) => {
    try {
      const resultado = await notificacionesService.marcarTodasComoLeidas(
        (req as any).usuarioId,
      );
      res.json(resultado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
);

router.patch(
  "/notificaciones/:id/leida",
  async (req: Request, res: Response) => {
    try {
      const resultado = await notificacionesService.marcarComoLeida(
        Number(req.params.id),
        (req as any).usuarioId,
      );
      res.json(resultado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
);

// ===== Disponibilidad =====
router.get("/disponibilidad", async (req: Request, res: Response) => {
  try {
    const estado = await disponibilidadService.obtenerDisponibilidad(
      (req as any).usuarioId,
    );
    res.json(estado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/disponibilidad", async (req: Request, res: Response) => {
  try {
    const resultado = await disponibilidadService.cambiarDisponibilidad(
      (req as any).usuarioId,
      req.body.disponible,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ===== Mis pedidos (en curso) =====
router.get("/mis-pedidos", async (req: Request, res: Response) => {
  try {
    const pedidos = await misPedidosService.listarPedidosEnCurso(
      (req as any).usuarioId,
    );
    res.json(pedidos);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

import { Router } from "express";
import type { Request, Response } from "express";
import * as restaurantesService from "../../services/cliente/restaurantesClienteService";
import * as direccionesService from "../../services/cliente/direccionesClienteService";
import * as pedidosService from "../../services/cliente/pedidosClienteService";
import { verificarTokenCliente } from "../../middlewares/authCliente";
import * as notificacionesService from "../../services/cliente/notificacionesClienteService";
import * as perfilService from "../../services/cliente/perfilClienteService";
import * as soporteService from "../../services/cliente/soporteClienteService";
import * as favoritosService from "../../services/cliente/favoritosClienteService";
import * as valoracionesService from "../../services/cliente/valoracionesService";
import * as ajustesService from "../../services/cliente/ajustesClienteService";
import * as misReportesService from "../../services/misReportesService";
import {
  ventanasDisponibles,
  horarioSemanal,
} from "../../services/ventanasService";

const router = Router();
router.use(verificarTokenCliente);

const texto = (v: unknown) =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

// ===== Restaurantes =====
router.get("/restaurantes", async (req: Request, res: Response) => {
  try {
    const lista = await restaurantesService.listarRestaurantes(
      {
        busqueda: texto(req.query.busqueda),
        categoria: texto(req.query.categoria),
        filtro: texto(req.query.filtro),
        limite: Number(req.query.limite) || undefined,
      },
      (req as any).usuarioId,
    );
    res.json(lista);
  } catch (error: any) {
    console.error("[restaurantes] ERROR", JSON.stringify(req.query), error);
    res.status(400).json({ message: error.message });
  }
});

router.get("/restaurantes/:id", async (req: Request, res: Response) => {
  try {
    const detalle = await restaurantesService.obtenerRestaurante(
      Number(req.params.id),
      (req as any).usuarioId,
    );
    res.json(detalle);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

// ===== Carrito: precios y disponibilidad actuales =====
router.post("/carrito/detalle", async (req: Request, res: Response) => {
  try {
    const { restaurante_id, items } = req.body;
    const platoIds = Array.isArray(items)
      ? items.map((i: any) => i?.plato_id)
      : [];
    const detalle = await restaurantesService.obtenerDetalleCarrito(
      Number(restaurante_id),
      platoIds,
    );
    res.json(detalle);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ===== Direcciones =====
router.get("/direcciones", async (req: Request, res: Response) => {
  try {
    res.json(
      await direccionesService.listarDirecciones((req as any).usuarioId),
    );
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/direcciones", async (req: Request, res: Response) => {
  try {
    const direccion = await direccionesService.crearDireccion(
      (req as any).usuarioId,
      req.body,
    );
    res.status(201).json(direccion);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch(
  "/direcciones/:id/principal",
  async (req: Request, res: Response) => {
    try {
      res.json(
        await direccionesService.marcarPrincipal(
          (req as any).usuarioId,
          Number(req.params.id),
        ),
      );
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
);

router.delete("/direcciones/:id", async (req: Request, res: Response) => {
  try {
    res.json(
      await direccionesService.eliminarDireccion(
        (req as any).usuarioId,
        Number(req.params.id),
      ),
    );
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ===== Pedidos =====
router.post("/pedidos", async (req: Request, res: Response) => {
  try {
    const pedido = await pedidosService.crearPedido(
      (req as any).usuarioId,
      req.body,
    );

    res.status(201).json(pedido);
  } catch (error: any) {
    if (error.codigo === "VENTANA_NO_DISPONIBLE") {
      return res.status(409).json({
        message: error.message,
        codigo: error.codigo,
        ventanas: error.ventanas,
      });
    }

    res.status(400).json({ message: error.message });
  }
});

router.get("/pedidos/:id", async (req: Request, res: Response) => {
  try {
    res.json(
      await pedidosService.obtenerPedido(
        Number(req.params.id),
        (req as any).usuarioId,
      ),
    );
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.get("/pedidos", async (req: Request, res: Response) => {
  try {
    res.json(await pedidosService.listarPedidos((req as any).usuarioId));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/pedidos/:id/cancelar", async (req: Request, res: Response) => {
  try {
    res.json(
      await pedidosService.cancelarPedido(
        Number(req.params.id),
        (req as any).usuarioId,
      ),
    );
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/pedidos/:id/repetir", async (req: Request, res: Response) => {
  try {
    res.json(
      await pedidosService.datosParaRepetir(
        Number(req.params.id),
        (req as any).usuarioId,
      ),
    );
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

// ===== Notificaciones =====
router.get("/notificaciones", async (req: Request, res: Response) => {
  try {
    res.json(
      await notificacionesService.listarNotificaciones((req as any).usuarioId),
    );
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

router.get(
  "/notificaciones/preferencias",
  async (req: Request, res: Response) => {
    try {
      res.json(
        await notificacionesService.obtenerPreferencias((req as any).usuarioId),
      );
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
);

router.patch(
  "/notificaciones/preferencias",
  async (req: Request, res: Response) => {
    try {
      const resultado = await notificacionesService.actualizarPreferencias(
        (req as any).usuarioId,
        req.body.notificaciones_activas,
      );
      res.json(resultado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
);

router.patch(
  "/notificaciones/leer-todas",
  async (req: Request, res: Response) => {
    try {
      res.json(
        await notificacionesService.marcarTodasComoLeidas(
          (req as any).usuarioId,
        ),
      );
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

// ===== Perfil =====
router.get("/perfil", async (req: Request, res: Response) => {
  try {
    res.json(await perfilService.obtenerPerfil((req as any).usuarioId));
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.patch("/perfil", async (req: Request, res: Response) => {
  try {
    res.json(
      await perfilService.actualizarPerfil((req as any).usuarioId, req.body),
    );
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ===== Editar una dirección guardada =====
router.patch("/direcciones/:id", async (req: Request, res: Response) => {
  try {
    const direccion = await direccionesService.actualizarDireccion(
      (req as any).usuarioId,
      Number(req.params.id),
      req.body,
    );
    res.json(direccion);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ===== Soporte =====
router.post("/soporte/reportes", async (req: Request, res: Response) => {
  try {
    const resultado = await soporteService.crearReporte(
      (req as any).usuarioId,
      req.body,
    );
    res.status(201).json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ===== Favoritos =====
router.get("/favoritos", async (req: Request, res: Response) => {
  try {
    res.json(await favoritosService.listarFavoritos((req as any).usuarioId));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/favoritos/:restauranteId", async (req: Request, res: Response) => {
  try {
    const resultado = await favoritosService.agregarFavorito(
      (req as any).usuarioId,
      Number(req.params.restauranteId),
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete(
  "/favoritos/:restauranteId",
  async (req: Request, res: Response) => {
    try {
      const resultado = await favoritosService.quitarFavorito(
        (req as any).usuarioId,
        Number(req.params.restauranteId),
      );
      res.json(resultado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
);

// ===== Valoraciones =====
router.post("/pedidos/:id/valoracion", async (req: Request, res: Response) => {
  try {
    const resultado = await valoracionesService.crearValoracion(
      (req as any).usuarioId,
      Number(req.params.id),
      req.body,
    );
    res.status(201).json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get(
  "/restaurantes/:id/valoraciones",
  async (req: Request, res: Response) => {
    try {
      res.json(
        await valoracionesService.obtenerValoraciones(
          Number(req.params.id),
          "publico",
        ),
      );
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  },
);

// ===== Contraseña =====
router.patch("/perfil/password", async (req: Request, res: Response) => {
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

// ===== Apariencia y accesibilidad =====
router.get("/ajustes", async (req: Request, res: Response) => {
  try {
    res.json(await ajustesService.obtenerAjustes((req as any).usuarioId));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/ajustes", async (req: Request, res: Response) => {
  try {
    res.json(
      await ajustesService.actualizarAjustes((req as any).usuarioId, req.body),
    );
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ===== Mis reportes =====
router.get("/soporte/reportes", async (req: Request, res: Response) => {
  try {
    res.json(
      await misReportesService.listarMisReportes((req as any).usuarioId),
    );
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/soporte/reportes/:id", async (req: Request, res: Response) => {
  try {
    res.json(
      await misReportesService.obtenerMiReporte(
        (req as any).usuarioId,
        Number(req.params.id),
      ),
    );
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.post(
  "/soporte/reportes/:id/mensajes",
  async (req: Request, res: Response) => {
    try {
      res
        .status(201)
        .json(
          await misReportesService.enviarMensajeUsuario(
            (req as any).usuarioId,
            Number(req.params.id),
            req.body?.mensaje,
          ),
        );
    } catch (error: any) {
      res.status(error.estado ?? 400).json({ message: error.message });
    }
  },
);

router.get("/ventanas", async (_req: Request, res: Response) => {
  try {
    res.json(await ventanasDisponibles());
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/ventanas/horario", async (_req: Request, res: Response) => {
  try {
    res.json(await horarioSemanal());
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

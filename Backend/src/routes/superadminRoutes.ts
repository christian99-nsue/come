import { Router } from "express";
import type { Request, Response } from "express";
import { verificarSuperAdmin } from "../middlewares/authSuperAdmin";
import * as resumenService from "../services/superadminResumenService";
import * as restaurantesService from "../services/superadminRestaurantesService";
import { ErrorSuperAdmin } from "../services/superadminRestaurantesService";
import * as suscripcionesService from "../services/superadminSuscripcionesService";
import * as soporteService from "../services/superadminSoporteService";
import * as abastecimientoService from "../services/superadminAbastecimientoService";
import * as ventanasHubService from "../services/superadminVentanasService";
import * as accesosService from "../services/superadminAccesosService";

const router = Router();
router.use(verificarSuperAdmin);

function responderError(res: Response, error: unknown) {
  if (error instanceof ErrorSuperAdmin)
    return res.status(error.estado).json({ message: error.message });
  console.error(error);
  res.status(500).json({ message: "Error del servidor" });
}

const idValido = (valor: string | string[] | undefined) => {
  if (typeof valor !== "string") return null;

  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
};

// Quién es el súper admin y con qué permiso entró
router.get("/yo", (req: Request, res: Response) => {
  res.json((req as any).superAdmin);
});

router.get("/resumen", async (_req: Request, res: Response) => {
  try {
    res.json(await resumenService.obtenerResumen());
  } catch (error) {
    responderError(res, error);
  }
});

// ===== Restaurantes =====
router.get("/restaurantes", async (req: Request, res: Response) => {
  try {
    res.json(
      await restaurantesService.listarRestaurantes({
        busqueda: req.query.busqueda,
        filtro: req.query.filtro,
        pagina: req.query.pagina,
      }),
    );
  } catch (error) {
    responderError(res, error);
  }
});

router.get("/restaurantes/:id", async (req: Request, res: Response) => {
  try {
    const id = idValido(req.params.id);
    if (!id) throw new ErrorSuperAdmin(404, "Restaurante no encontrado");
    res.json(await restaurantesService.obtenerRestaurante(id));
  } catch (error) {
    responderError(res, error);
  }
});

router.post(
  "/restaurantes/:id/suspender",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Restaurante no encontrado");
      res.json(
        await restaurantesService.suspenderRestaurante(
          id,
          req.body?.motivo,
          (req as any).superAdmin,
        ),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.post(
  "/restaurantes/:id/reactivar",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Restaurante no encontrado");
      res.json(
        await restaurantesService.reactivarRestaurante(
          id,
          (req as any).superAdmin,
        ),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

// ===== Suscripciones =====
router.get(
  "/suscripciones/pendientes",
  async (_req: Request, res: Response) => {
    try {
      res.json(await suscripcionesService.listarPendientes());
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.get("/suscripciones", async (req: Request, res: Response) => {
  try {
    res.json(
      await suscripcionesService.listarSuscripciones({
        busqueda: req.query.busqueda,
        filtro: req.query.filtro,
        pagina: req.query.pagina,
      }),
    );
  } catch (error) {
    responderError(res, error);
  }
});

router.get(
  "/suscripciones/restaurante/:id",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Restaurante no encontrado");
      res.json(await suscripcionesService.obtenerDetalle(id));
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.post(
  "/suscripciones/restaurante/:id/pago",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Restaurante no encontrado");
      res.json(
        await suscripcionesService.registrarPagoManual(
          id,
          req.body ?? {},
          (req as any).superAdmin,
        ),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.post(
  "/suscripciones/pagos/:id/confirmar",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Solicitud no encontrada");
      res.json(
        await suscripcionesService.confirmarPago(id, (req as any).superAdmin),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.post(
  "/suscripciones/pagos/:id/rechazar",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Solicitud no encontrada");
      res.json(
        await suscripcionesService.rechazarPago(
          id,
          req.body?.motivo,
          (req as any).superAdmin,
        ),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

// ===== Soporte =====
router.get("/soporte/contadores", async (_req: Request, res: Response) => {
  try {
    res.json(await soporteService.obtenerContadores());
  } catch (error) {
    responderError(res, error);
  }
});

router.get("/soporte", async (req: Request, res: Response) => {
  try {
    res.json(
      await soporteService.listarReportes({
        busqueda: req.query.busqueda,
        estado: req.query.estado,
        categoria: req.query.categoria,
        rol: req.query.rol,
        pagina: req.query.pagina,
      }),
    );
  } catch (error) {
    responderError(res, error);
  }
});

router.get("/soporte/:id", async (req: Request, res: Response) => {
  try {
    const id = idValido(req.params.id);
    if (!id) throw new ErrorSuperAdmin(404, "Reporte no encontrado");
    res.json(await soporteService.obtenerReporte(id));
  } catch (error) {
    responderError(res, error);
  }
});

router.post("/soporte/:id/estado", async (req: Request, res: Response) => {
  try {
    const id = idValido(req.params.id);
    if (!id) throw new ErrorSuperAdmin(404, "Reporte no encontrado");
    res.json(
      await soporteService.cambiarEstado(
        id,
        req.body?.estado,
        (req as any).superAdmin,
      ),
    );
  } catch (error) {
    responderError(res, error);
  }
});

router.post("/soporte/:id/respuestas", async (req: Request, res: Response) => {
  try {
    const id = idValido(req.params.id);
    if (!id) throw new ErrorSuperAdmin(404, "Reporte no encontrado");
    res
      .status(201)
      .json(
        await soporteService.responder(
          id,
          req.body ?? {},
          (req as any).superAdmin,
        ),
      );
  } catch (error) {
    responderError(res, error);
  }
});

// ===== Abastecimiento =====
router.get(
  "/abastecimiento/contadores",
  async (_req: Request, res: Response) => {
    try {
      res.json(await abastecimientoService.obtenerContadores());
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.get(
  "/abastecimiento/proveedores",
  async (_req: Request, res: Response) => {
    try {
      res.json(await abastecimientoService.listarProveedores());
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.post(
  "/abastecimiento/proveedores",
  async (req: Request, res: Response) => {
    try {
      res
        .status(201)
        .json(await abastecimientoService.crearProveedor(req.body ?? {}));
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.patch(
  "/abastecimiento/proveedores/:id",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Proveedor no encontrado");
      res.json(
        await abastecimientoService.actualizarProveedor(id, req.body ?? {}),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.get("/abastecimiento/productos", async (req: Request, res: Response) => {
  try {
    res.json(
      await abastecimientoService.listarProductos({
        busqueda: req.query.busqueda,
        categoria: req.query.categoria,
        proveedor_id: req.query.proveedor_id,
        estado: req.query.estado,
        pagina: req.query.pagina,
      }),
    );
  } catch (error) {
    responderError(res, error);
  }
});

router.post(
  "/abastecimiento/productos",
  async (req: Request, res: Response) => {
    try {
      res
        .status(201)
        .json(await abastecimientoService.crearProducto(req.body ?? {}));
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.patch(
  "/abastecimiento/productos/:id",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Producto no encontrado");
      res.json(
        await abastecimientoService.actualizarProducto(id, req.body ?? {}),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.get("/abastecimiento/pedidos", async (req: Request, res: Response) => {
  try {
    res.json(
      await abastecimientoService.listarPedidos({
        estado: req.query.estado,
        busqueda: req.query.busqueda,
        pagina: req.query.pagina,
      }),
    );
  } catch (error) {
    responderError(res, error);
  }
});

router.get(
  "/abastecimiento/pedidos/:id",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Pedido no encontrado");
      res.json(await abastecimientoService.obtenerPedido(id));
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.post(
  "/abastecimiento/pedidos/:id/estado",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Pedido no encontrado");
      res.json(
        await abastecimientoService.cambiarEstadoPedido(
          id,
          req.body ?? {},
          (req as any).superAdmin,
        ),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

// ===== Ventanas de entrega =====
router.get("/ventanas", async (_req: Request, res: Response) => {
  try {
    res.json(await ventanasHubService.listarVentanas());
  } catch (error) {
    responderError(res, error);
  }
});

router.post("/ventanas", async (req: Request, res: Response) => {
  try {
    res
      .status(201)
      .json(
        await ventanasHubService.crearVentana(
          req.body ?? {},
          (req as any).superAdmin.nombre,
        ),
      );
  } catch (error) {
    responderError(res, error);
  }
});

router.patch("/ventanas/:id", async (req: Request, res: Response) => {
  try {
    const id = idValido(req.params.id);
    if (!id) throw new ErrorSuperAdmin(404, "Ventana no encontrada");
    res.json(await ventanasHubService.actualizarVentana(id, req.body ?? {}));
  } catch (error) {
    responderError(res, error);
  }
});

router.delete("/ventanas/:id", async (req: Request, res: Response) => {
  try {
    const id = idValido(req.params.id);
    if (!id) throw new ErrorSuperAdmin(404, "Ventana no encontrada");
    res.json(await ventanasHubService.eliminarVentana(id));
  } catch (error) {
    responderError(res, error);
  }
});

// ===== Accesos: códigos de invitación y solicitudes =====
router.get("/accesos/contadores", async (_req: Request, res: Response) => {
  try {
    res.json(await accesosService.contadoresAccesos());
  } catch (error) {
    responderError(res, error);
  }
});

router.get("/accesos/codigos", async (req: Request, res: Response) => {
  try {
    res.json(
      await accesosService.listarCodigos({
        estado: req.query.estado,
        rol: req.query.rol,
        pagina: req.query.pagina,
      }),
    );
  } catch (error) {
    responderError(res, error);
  }
});

router.post("/accesos/codigos", async (req: Request, res: Response) => {
  try {
    res
      .status(201)
      .json(
        await accesosService.crearCodigo(
          req.body ?? {},
          (req as any).superAdmin,
        ),
      );
  } catch (error) {
    responderError(res, error);
  }
});

router.post(
  "/accesos/codigos/:id/revocar",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Código no encontrado");
      res.json(await accesosService.revocarCodigo(id));
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.get("/accesos/solicitudes", async (req: Request, res: Response) => {
  try {
    res.json(
      await accesosService.listarSolicitudes({
        estado: req.query.estado,
        rol: req.query.rol,
        pagina: req.query.pagina,
      }),
    );
  } catch (error) {
    responderError(res, error);
  }
});

router.post(
  "/accesos/solicitudes/:id/aprobar",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Solicitud no encontrada");
      res.json(
        await accesosService.aprobarSolicitud(id, (req as any).superAdmin),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.post(
  "/accesos/solicitudes/:id/enlace",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Solicitud no encontrada");
      res.json(
        await accesosService.regenerarEnlace(id, (req as any).superAdmin),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.post(
  "/accesos/solicitudes/:id/rechazar",
  async (req: Request, res: Response) => {
    try {
      const id = idValido(req.params.id);
      if (!id) throw new ErrorSuperAdmin(404, "Solicitud no encontrada");
      res.json(
        await accesosService.rechazarSolicitud(
          id,
          req.body?.motivo,
          (req as any).superAdmin,
        ),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

export default router;

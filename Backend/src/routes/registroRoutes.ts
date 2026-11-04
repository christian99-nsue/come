import { Router } from "express";
import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import * as registro from "../services/registroService";
import { ErrorRegistro } from "../utils/registro";

const router = Router();

const mensaje = {
  message: "Demasiados intentos. Espera un rato e inténtalo de nuevo.",
};

// Altas por IP: frena a quien intente crear cuentas o solicitudes en masa
const limiteAltas = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: mensaje,
});

// Comprobar códigos y enlaces: frena a quien intente adivinarlos
const limiteComprobar = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: mensaje,
});

function responderError(res: Response, error: unknown) {
  if (error instanceof ErrorRegistro)
    return res
      .status(error.estado)
      .json({ message: error.message, campo: error.campo });
  console.error(error);
  res.status(500).json({ message: "Error del servidor" });
}

const cuerpo = (req: Request) =>
  req.body && typeof req.body === "object" ? req.body : {};

router.post("/cliente", limiteAltas, async (req: Request, res: Response) => {
  try {
    res.status(201).json(await registro.registrarCliente(cuerpo(req)));
  } catch (error) {
    responderError(res, error);
  }
});

router.post(
  "/codigo/verificar",
  limiteComprobar,
  async (req: Request, res: Response) => {
    try {
      res.json(
        await registro.verificarCodigo(cuerpo(req).rol, cuerpo(req).codigo),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

// Con código de invitación: la cuenta queda activa
router.post(
  "/con-codigo",
  limiteAltas,
  limiteComprobar,
  async (req: Request, res: Response) => {
    try {
      res
        .status(201)
        .json(await registro.registrarConCodigo(cuerpo(req).rol, cuerpo(req)));
    } catch (error) {
      responderError(res, error);
    }
  },
);

// Sin código: solicitud que revisa el súper admin
router.post("/solicitud", limiteAltas, async (req: Request, res: Response) => {
  try {
    res
      .status(201)
      .json(await registro.crearSolicitud(cuerpo(req).rol, cuerpo(req)));
  } catch (error) {
    responderError(res, error);
  }
});

// La persona (sin cuenta todavía) consulta cómo va su solicitud: teléfono + código de seguimiento
router.post(
  "/solicitud/estado",
  limiteComprobar,
  async (req: Request, res: Response) => {
    try {
      res.json(
        await registro.consultarSolicitud(
          cuerpo(req).telefono,
          cuerpo(req).seguimiento,
        ),
      );
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.get(
  "/enlace/:token",
  limiteComprobar,
  async (req: Request, res: Response) => {
    try {
      res.json(await registro.consultarEnlace(req.params.token));
    } catch (error) {
      responderError(res, error);
    }
  },
);

router.post(
  "/enlace/:token/completar",
  limiteComprobar,
  async (req: Request, res: Response) => {
    try {
      res
        .status(201)
        .json(await registro.completarConEnlace(req.params.token, cuerpo(req)));
    } catch (error) {
      responderError(res, error);
    }
  },
);

export default router;

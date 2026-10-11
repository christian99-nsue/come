import { Router } from "express";
import * as pedidosController from "../../controllers/admin/pedidosAdminController";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();

router.use(verificarTokenAdmin); // todas las rutas de este archivo requieren admin logueado

router.get("/", pedidosController.listarPedidos); // GET  /api/admin/pedidos?estado=nuevo
router.get("/:id", pedidosController.obtenerDetallePedido); // GET  /api/admin/pedidos/:id
router.patch("/:id/aceptar", pedidosController.aceptarPedido); // PATCH /api/admin/pedidos/:id/aceptar
router.patch("/:id/rechazar", pedidosController.rechazarPedido);
router.patch("/:id/estado", pedidosController.cambiarEstadoPedido);

export default router;

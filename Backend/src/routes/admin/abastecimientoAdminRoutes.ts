import { Router } from "express";
import * as abastecimientoController from "../../controllers/admin/abastecimientoAdminController";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();
router.use(verificarTokenAdmin);

// Catálogo — SOLO LECTURA (lo gestiona el súper admin de la plataforma)
router.get("/productos", abastecimientoController.listarProductos);

// Pedidos de abastecimiento del restaurante — esto SÍ lo crea el admin
router.get("/pedidos", abastecimientoController.listarPedidos);
router.get("/pedidos/:id", abastecimientoController.obtenerDetallePedido);
router.post("/pedidos", abastecimientoController.crearPedido);

export default router;

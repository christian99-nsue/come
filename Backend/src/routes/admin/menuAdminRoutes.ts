import { Router } from "express";
import * as menuController from "../../controllers/admin/menuAdminController";
import { verificarTokenAdmin } from "../../middlewares/authAdmin";

const router = Router();

router.use(verificarTokenAdmin);

router.get("/categorias", menuController.listarCategorias);
router.post("/categorias", menuController.crearCategoria);
router.get("/categorias/:id", menuController.obtenerCategoria);
router.patch("/categorias/:id", menuController.actualizarCategoria);
router.delete("/categorias/:id", menuController.eliminarCategoria);

router.get("/platos", menuController.listarPlatos); // ?categoria_id=
router.post("/platos", menuController.crearPlato);
router.get("/platos/:id", menuController.obtenerPlato);
router.patch("/platos/:id", menuController.actualizarPlato);
router.patch(
  "/platos/:id/disponibilidad",
  menuController.cambiarDisponibilidad,
);
router.delete("/platos/:id", menuController.eliminarPlato);

export default router;

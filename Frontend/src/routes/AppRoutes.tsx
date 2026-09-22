import Login from "../pages/auth/Login";
import { HashRouter, Routes, Route } from "react-router-dom";
import LayoutCliente from "../components/layouts/LayoutCliente";
import Inicio from "../pages/cliente/Inicio";
import Explorar from "../pages/cliente/Explorar";
import Carrito from "../pages/cliente/Carrito";
import Pedidos from "../pages/cliente/Pedidos";
import Perfil from "../pages/cliente/Perfil";
import Restaurantes from "../pages/cliente/Restaurantes";
import RestauranteDetalle from "../pages/cliente/RestauranteDetalle";
import Cupon from "../pages/cliente/Cupon_1";
import DireccionEntrega from "../pages/cliente/DireccionEntrega";
import PedidoRealizado from "../pages/cliente/PedidoRealizado";
import TiempoEntrega from "../pages/cliente/TiempoEntrega";
import FinalizarPedido from "../pages/cliente/FinalizarPedido";
import EditarPerfil from "../pages/cliente/EditarPerfil";
import MisDirecciones from "../pages/cliente/MisDirecciones";
import MetodosPago from "../pages/cliente/MetodosPago";
import Accesibilidad from "../pages/cliente/Accesibilidad";
import TemaAplicacion from "../pages/cliente/TemaAplicacion";
import Idioma from "../pages/cliente/Idioma";
import Notificaciones from "../pages/cliente/Notificaciones";
import CentroAyuda from "../pages/cliente/CentroAyuda";
import Contactanos from "../pages/cliente/Contactanos";
import TerminosCondiciones from "../pages/cliente/TerminosCondiciones";

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cliente" element={<LayoutCliente />}>
          <Route index path="inicio" element={<Inicio />} />
          <Route path="explorar" element={<Explorar />} />
          <Route path="carrito" element={<Carrito />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="inicio/restaurantes" element={<Restaurantes />} />
          <Route path="restaurante/:id" element={<RestauranteDetalle />} />
          <Route path="cupon" element={<Cupon />} />
          <Route path="direccion-entrega" element={<DireccionEntrega />} />
          <Route path="tiempo-entrega" element={<TiempoEntrega />} />
          <Route path="finalizar-pedido" element={<FinalizarPedido />} />
          <Route path="pedido-realizado" element={<PedidoRealizado />} />
          <Route path="perfil/editar-perfil" element={<EditarPerfil />} />
          <Route path="perfil/mis-direcciones" element={<MisDirecciones />} />
          <Route path="perfil/metodos-pago" element={<MetodosPago />} />
          <Route path="perfil/notificaciones" element={<Notificaciones />} />
          <Route path="perfil/idioma" element={<Idioma />} />
          <Route path="perfil/tema-aplicacion" element={<TemaAplicacion />} />
          <Route path="perfil/accesibilidad" element={<Accesibilidad />} />
          <Route path="perfil/centro-ayuda" element={<CentroAyuda />} />
          <Route path="perfil/contactanos" element={<Contactanos />} />
          <Route
            path="terminos-condiciones"
            element={<TerminosCondiciones />}
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}

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
import LayoutRepartidor from "../components/layouts/LayoutRepartidor";
import ConfirmarEntrega from "../pages/repartidor/ConfirmarEntrega";
import EntregaCompletada from "../pages/repartidor/EntregaCompletada";
import EstadoDisponibilidad from "../pages/repartidor/EstadoDisponibilidad";
import HistorialEntregas from "../pages/repartidor/HistorialEntregas";
import MapaRuta from "../pages/repartidor/MapaRuta";
import MiEntregaActual from "../pages/repartidor/MiEntregaActual";
import MiPerfilRepartidor from "../pages/repartidor/MiPerfilRepartidor";
import NotificacionesRepartidor from "../pages/repartidor/NotificacionesRepartidor";
import PanelRepartidor from "../pages/repartidor/PanelRepartidor";
import PedidoDisponible from "../pages/repartidor/PedidoDisponible";
import PedidoEnViaje from "../pages/repartidor/PedidoEnViaje";
import Favoritos from "../pages/cliente/Favoritos";
import NotificacionesFeed from "../pages/cliente/NotificacionesFeed";
import CambiarContrasenaRepartidor from "../pages/repartidor/CambiarContrasenaRepartidor";
import ConfiguracionRepartidor from "../pages/repartidor/ConfiguracionRepartidor";
import EditarPerfilRepartidor from "../pages/repartidor/EditarPerfilRepartidor";
import InfoCuentaRepartidor from "../pages/repartidor/InfoCuentaRepartidor";
import AyudaSoporteRepartidor from "../pages/repartidor/AyudaSoporteRepartidor";
import General from "../pages/repartidor/General";
import IdiomaRepartidor from "../pages/repartidor/IdiomaRepartidor";
import NavegacionExterna from "../pages/repartidor/NavegacionExterna";
import TemaAplicacionRepartidor from "../pages/repartidor/TemaAplicacionRepartidor";
import TerminosCondicionesRepartidor from "../pages/repartidor/TerminosCondicionesRepartidor";
import LayoutAdmin from "../components/layouts/LayoutAdmin";
import DashboardAdmin from "../pages/admin/DashboardAdmin";
import DetallePedidoAdmin from "../pages/admin/DetallePedidoAdmin";
import PedidosAdmin from "../pages/admin/PedidosAdmin";
import CrearCategoria from "../pages/admin/CrearCategoria";
import CrearPlato from "../pages/admin/CrearPlato";
import MenuAdmin from "../pages/admin/MenuAdmin";
import RepartidoresAdmin from "../pages/admin/RepartidoresAdmin";
import AbastecimientoAdmin from "../pages/admin/AbastecimientoAdmin";
import CarritoAbastecimiento from "../pages/admin/CarritoAbastecimiento";
import ConfiguracionAdmin from "../pages/admin/ConfiguracionAdmin";
import HistorialAdmin from "../pages/admin/HistorialAdmin";
import NotificacionesAdmin from "../pages/admin/NotificacionesAdmin";
import VentasAdmin from "../pages/admin/VentasAdmin";
import { AbastecimientoCartProvider } from "../context/AbastecimientoCartContext";
import InformacionRestaurante from "../pages/admin/InformacionRestaurante";
import HorariosFuncionamiento from "../pages/admin/HorariosFuncionamiento";
import PedidosConfigAdmin from "../pages/admin/PedidosConfigAdmin";
import PagosConfigAdmin from "../pages/admin/PagosConfigAdmin";
import CuentaAdmin from "../pages/admin/CuentaAdmin";
import EditarPerfilAdmin from "../pages/admin/EditarPerfilAdmin";
import CambiarContrasenaAdmin from "../pages/admin/CambiarContrasenaAdmin";
import AyudaSoporteAdmin from "../pages/admin/AyudaSoporteAdmin";
import SuscripcionAdmin from "../pages/admin/SuscripcionAdmin";
import FotosRestaurante from "../pages/admin/FotosRestaurante";
import EditarPlato from "../pages/admin/EditarPlato";
import EditarCategoria from "../pages/admin/EditarCategoria";
import MisPedidosRepartidor from "../pages/repartidor/MisPedidosRepartidor";

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Rutas para clientes */}
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
          <Route path="notificaciones" element={<NotificacionesFeed />} />
          <Route
            path="notificaciones/preferencias"
            element={<Notificaciones />}
          />
          <Route path="favoritos" element={<Favoritos />} />
          <Route
            path="terminos-condiciones"
            element={<TerminosCondiciones />}
          />
        </Route>

        {/* Rutas para el repartidor */}
        <Route path="/repartidor" element={<LayoutRepartidor />}>
          <Route index element={<PanelRepartidor />} />
          <Route
            path="estado-disponibilidad"
            element={<EstadoDisponibilidad />}
          />
          <Route path="pedido/:id" element={<PedidoDisponible />} />
          <Route path="mi-entrega" element={<MiEntregaActual />} />
          <Route path="en-viaje" element={<PedidoEnViaje />} />
          <Route path="ruta" element={<MapaRuta />} />
          <Route path="confirmar-entrega" element={<ConfirmarEntrega />} />
          <Route
            path="entrega-completada/:id"
            element={<EntregaCompletada />}
          />
          <Route path="historial" element={<HistorialEntregas />} />
          <Route path="notificaciones" element={<NotificacionesRepartidor />} />
          <Route path="perfil" element={<MiPerfilRepartidor />} />
          <Route path="editar-perfil" element={<EditarPerfilRepartidor />} />
          <Route
            path="cambiar-contrasena"
            element={<CambiarContrasenaRepartidor />}
          />
          <Route path="info-cuenta" element={<InfoCuentaRepartidor />} />
          <Route path="configuracion" element={<ConfiguracionRepartidor />} />
          <Route path="configuracion/general" element={<General />} />
          <Route path="configuracion/idioma" element={<IdiomaRepartidor />} />
          <Route
            path="configuracion/tema"
            element={<TemaAplicacionRepartidor />}
          />
          <Route
            path="configuracion/navegacion-externa"
            element={<NavegacionExterna />}
          />
          <Route path="centro-ayuda" element={<AyudaSoporteRepartidor />} />
          <Route
            path="terminos-condiciones"
            element={<TerminosCondicionesRepartidor />}
          />
          <Route path="mis-pedidos" element={<MisPedidosRepartidor />} />
        </Route>

        {/* Rutas para el admin */}
        <Route
          path="/admin"
          element={
            <AbastecimientoCartProvider>
              <LayoutAdmin />
            </AbastecimientoCartProvider>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="pedidos" element={<PedidosAdmin />} />
          <Route path="pedidos/:id" element={<DetallePedidoAdmin />} />
          {/* ...pedidos */}
          <Route path="menu" element={<MenuAdmin />} />
          <Route path="menu/crear-plato" element={<CrearPlato />} />
          <Route path="menu/crear-categoria" element={<CrearCategoria />} />
          <Route path="repartidores" element={<RepartidoresAdmin />} />
          <Route path="abastecimiento" element={<AbastecimientoAdmin />} />
          <Route
            path="abastecimiento/carrito"
            element={<CarritoAbastecimiento />}
          />
          <Route path="historial" element={<HistorialAdmin />} />
          <Route path="notificaciones" element={<NotificacionesAdmin />} />
          <Route path="configuracion" element={<ConfiguracionAdmin />} />
          <Route path="ventas" element={<VentasAdmin />} />
          <Route
            path="configuracion/restaurante"
            element={<InformacionRestaurante />}
          />
          <Route
            path="configuracion/horarios"
            element={<HorariosFuncionamiento />}
          />
          <Route
            path="configuracion/pedidos"
            element={<PedidosConfigAdmin />}
          />
          <Route path="configuracion/pagos" element={<PagosConfigAdmin />} />
          <Route path="configuracion/cuenta" element={<CuentaAdmin />} />
          <Route
            path="configuracion/cuenta/editar-perfil"
            element={<EditarPerfilAdmin />}
          />
          <Route
            path="configuracion/cuenta/cambiar-contrasena"
            element={<CambiarContrasenaAdmin />}
          />
          <Route path="suscripcion" element={<SuscripcionAdmin />} />
          <Route path="ayuda-soporte" element={<AyudaSoporteAdmin />} />
          <Route path="configuracion/fotos" element={<FotosRestaurante />} />
          <Route path="menu/editar-plato/:id" element={<EditarPlato />} />
          <Route
            path="menu/editar-categoria/:id"
            element={<EditarCategoria />}
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}

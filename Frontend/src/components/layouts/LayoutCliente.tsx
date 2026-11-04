import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import MenuLateralCliente from "../../pages/cliente/MenuLateralCliente";
import ConfirmModal from "../common/ConfirmModal";
import "../../styles/cliente/layoutCliente.css";
import { useNoLeidasCliente } from "../../hooks/useNoLeidasCliente";
import { useLayoutEffect } from "react";
import "../../styles/cliente/ClienteApariencia.css";
import { VentanasProvider } from "../../context/VentanasContext.tsx";
import {
  aplicarPreferencias,
  cargarPreferencias,
  leerCache,
  quitarPreferencias,
} from "../../utils/preferenciasCliente";

export default function LayoutCliente() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const ocultarNavegacion = [
    "/cliente/direccion-entrega",
    "/cliente/finalizar-pedido",
  ].includes(pathname);
  const noLeidas = useNoLeidasCliente();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarConfirmacionLogout, setMostrarConfirmacionLogout] =
    useState(false);

  useLayoutEffect(() => {
    aplicarPreferencias(leerCache());
    cargarPreferencias().catch(() => {});

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const alCambiar = () => aplicarPreferencias(leerCache());
    media.addEventListener("change", alCambiar);

    return () => {
      media.removeEventListener("change", alCambiar);
      quitarPreferencias();
    };
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMostrarConfirmacionLogout(false);
    navigate("/", { replace: true });
  };

  return (
    <VentanasProvider>
      <div className="layout-cliente">
        <Header
          notificationCount={noLeidas}
          onMenuClick={() => setMenuAbierto(true)}
        />
        <Outlet />
        {!ocultarNavegacion && <Footer />}
        <MenuLateralCliente
          open={menuAbierto}
          onClose={() => setMenuAbierto(false)}
          onLogoutClick={() => setMostrarConfirmacionLogout(true)}
          noLeidas={noLeidas}
        />
        <ConfirmModal
          open={mostrarConfirmacionLogout}
          title="¿Cerrar sesión?"
          message="Tendrás que volver a iniciar sesión con tu número de teléfono y contraseña para acceder de nuevo."
          confirmLabel="Cerrar sesión"
          cancelLabel="Cancelar"
          danger
          onConfirm={cerrarSesion}
          onCancel={() => setMostrarConfirmacionLogout(false)}
        />
      </div>
    </VentanasProvider>
  );
}

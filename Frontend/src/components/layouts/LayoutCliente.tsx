import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import MenuLateralCliente from "../../pages/cliente/MenuLateralCliente";
import ConfirmModal from "../common/ConfirmModal";
import "../../styles/cliente/layoutCliente.css";

export default function LayoutCliente() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarConfirmacionLogout, setMostrarConfirmacionLogout] =
    useState(false);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMostrarConfirmacionLogout(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="layout-cliente">
      <Header notificationCount={3} onMenuClick={() => setMenuAbierto(true)} />
      <Outlet />
      <Footer />

      <MenuLateralCliente
        open={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        onLogoutClick={() => setMostrarConfirmacionLogout(true)}
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
  );
}

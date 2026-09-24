import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Menu, Bell, Package, User } from "lucide-react";
import MenuLateralRepartidor from "../../pages/repartidor/MenuLateralRepartidor";
import ConfirmModal from "../common/ConfirmModal";
import "../../styles/repartidor/LayoutRepartidor.css";

export default function LayoutRepartidor() {
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
    <div className="layout-repartidor">
      <HeaderRepartidor onMenuClick={() => setMenuAbierto(true)} />
      <Outlet />
      <FooterRepartidor />

      <MenuLateralRepartidor
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

function HeaderRepartidor({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();

  return (
    <header className="rep-app-header">
      <button
        type="button"
        className="rep-header-icon-btn"
        aria-label="Abrir menú"
        onClick={onMenuClick}
      >
        <Menu size={22} />
      </button>
      <h1 className="rep-app-header-title">Entregas</h1>
      <button
        type="button"
        className="rep-header-icon-btn"
        aria-label="Notificaciones"
        onClick={() => navigate("/repartidor/notificaciones")}
      >
        <Bell size={20} />
        <span className="rep-header-badge">3</span>
      </button>
    </header>
  );
}

function FooterRepartidor() {
  return (
    <nav className="rep-bottom-nav">
      <NavLink
        to="/repartidor"
        end
        className={({ isActive }) =>
          isActive ? "rep-bottom-nav-item active" : "rep-bottom-nav-item"
        }
      >
        <Package size={24} className="rep-bottom-nav-icon" />
        <span className="rep-bottom-nav-label">Entregas</span>
      </NavLink>
      <NavLink
        to="perfil"
        className={({ isActive }) =>
          isActive ? "rep-bottom-nav-item active" : "rep-bottom-nav-item"
        }
      >
        <User size={24} className="rep-bottom-nav-icon" />
        <span className="rep-bottom-nav-label">Cuenta</span>
      </NavLink>
    </nav>
  );
}

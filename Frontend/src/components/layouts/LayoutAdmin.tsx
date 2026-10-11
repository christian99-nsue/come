import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Menu,
  Bell,
  Home,
  ClipboardList,
  UtensilsCrossed,
  MoreHorizontal,
} from "lucide-react";
import MenuLateralAdmin from "../../pages/admin/MenuLateralAdmin";
import ConfirmModal from "../common/ConfirmModal";
import "../../styles/admin/LayoutAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Restaurante {
  nombre: string;
  logo: string | null;
  estado: "abierto" | "cerrado";
}

export default function LayoutAdmin() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarLogout, setMostrarLogout] = useState(false);
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_URL}/api/admin/restaurante`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRestaurante(res.data))
      .catch(() => setRestaurante(null));
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMostrarLogout(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      <header className="admin-app-header">
        <button
          type="button"
          className="admin-icon-btn"
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
        <div className="admin-app-header-text">
          <span className="admin-app-header-name">
            {restaurante ? restaurante.nombre : "Cargando..."}
          </span>
          <span className="admin-app-header-role">
            Administrador de restaurante
          </span>
        </div>
        <button
          type="button"
          className="admin-icon-btn"
          onClick={() => navigate("/admin/notificaciones")}
          aria-label="Notificaciones"
        >
          <Bell size={20} />
        </button>
      </header>

      <Outlet />

      <nav className="admin-bottom-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? "admin-nav-item active" : "admin-nav-item"
          }
        >
          <Home size={22} className="admin-nav-icon" />
          <span className="admin-nav-label">Inicio</span>
        </NavLink>
        <NavLink
          to="pedidos"
          className={({ isActive }) =>
            isActive ? "admin-nav-item active" : "admin-nav-item"
          }
        >
          <ClipboardList size={22} className="admin-nav-icon" />
          <span className="admin-nav-label">Pedidos</span>
        </NavLink>
        <NavLink
          to="menu"
          className={({ isActive }) =>
            isActive ? "admin-nav-item active" : "admin-nav-item"
          }
        >
          <UtensilsCrossed size={22} className="admin-nav-icon" />
          <span className="admin-nav-label">Menú</span>
        </NavLink>
        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          className="admin-nav-item"
        >
          <MoreHorizontal size={22} className="admin-nav-icon" />
          <span className="admin-nav-label">Más</span>
        </button>
      </nav>

      <MenuLateralAdmin
        open={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        onLogoutClick={() => setMostrarLogout(true)}
        restaurante={{
          nombre: restaurante?.nombre || "Mi restaurante",
          abierto: restaurante?.estado === "abierto",
          logo: restaurante?.logo || null,
        }}
      />

      <ConfirmModal
        open={mostrarLogout}
        title="¿Cerrar sesión?"
        message="Tendrás que volver a iniciar sesión con tu correo y contraseña para acceder de nuevo."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        danger
        onConfirm={cerrarSesion}
        onCancel={() => setMostrarLogout(false)}
      />
    </>
  );
}

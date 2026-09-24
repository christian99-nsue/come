import { useNavigate } from "react-router-dom";
import {
  X,
  Package,
  History,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { getUser } from "../../utils/auth";
import "../../styles/repartidor/MenuLateralRepartidor.css";
import avatar from "../../assets/pilar.jpg";

interface MenuLateralProps {
  open: boolean;
  onClose: () => void;
  onLogoutClick: () => void;
}

const repartidor = {
  nombre: "Carlos",
  rol: "Repartidor",
  avatar: avatar,
  disponible: true,
};

export default function MenuLateralRepartidor({
  open,
  onClose,
  onLogoutClick,
}: MenuLateralProps) {
  const navigate = useNavigate();
  const user = getUser();

  if (!open) return null;

  const ir = (ruta: string) => {
    onClose();
    navigate(ruta);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-user">
            <img
              src={repartidor.avatar}
              alt={user.nombre}
              className="drawer-avatar"
            />
            <div>
              <div className="drawer-user-name">{user.nombre}</div>
              <div className="drawer-user-role">{user.rol}</div>
              <span className="drawer-user-status">
                ● {repartidor.disponible ? "Disponible" : "No disponible"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="drawer-nav">
          <button
            type="button"
            className="drawer-nav-item"
            onClick={() => ir("/repartidor")}
          >
            <Package size={18} /> Mis entregas
          </button>
          <button
            type="button"
            className="drawer-nav-item"
            onClick={() => ir("/repartidor/historial")}
          >
            <History size={18} /> Historial
          </button>
          <button
            type="button"
            className="drawer-nav-item"
            onClick={() => ir("/repartidor/notificaciones")}
          >
            <Bell size={18} /> Notificaciones
          </button>
          <button
            type="button"
            className="drawer-nav-item"
            onClick={() => ir("/repartidor/perfil")}
          >
            <User size={18} /> Mi perfil
          </button>
          <button
            type="button"
            className="drawer-nav-item"
            onClick={() => ir("/repartidor/configuracion")}
          >
            <Settings size={18} /> Configuración
          </button>
          <button
            type="button"
            className="drawer-nav-item"
            onClick={() => ir("/repartidor/centro-ayuda")}
          >
            <HelpCircle size={18} /> Ayuda
          </button>
        </nav>

        <button
          type="button"
          className="drawer-logout"
          onClick={() => {
            onClose();
            onLogoutClick();
          }}
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

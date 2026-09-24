import { useNavigate } from "react-router-dom";
import {
  X,
  Home,
  Search,
  UtensilsCrossed,
  Heart,
  MapPin,
  Bell,
  User,
  LifeBuoy,
  LogOut,
  ChevronRight,
  Phone,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { getUser } from "../../utils/auth";
import "../../styles/cliente/MenuLateralCliente.css";
import avatar from "../../assets/6.jpg";

interface MenuLateralClienteProps {
  open: boolean;
  onClose: () => void;
  onLogoutClick: () => void;
}

const usuario = {
  nombre: "Juan Pérez",
  rol: "Cliente",
  telefono: "+240 555 123 456",
  avatar: avatar,
};

const notificacionesSinLeer = 3;

export default function MenuLateralCliente({
  open,
  onClose,
  onLogoutClick,
}: MenuLateralClienteProps) {
  const navigate = useNavigate();
  const user = getUser();

  if (!open) return null;

  const ir = (ruta: string) => {
    onClose();
    navigate(ruta);
  };

  return (
    <div className="cliente-drawer-overlay" onClick={onClose}>
      <div
        className="cliente-drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="cliente-drawer-close-btn"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>
        <button
          type="button"
          className="cliente-drawer-user"
          onClick={() => ir("/cliente/perfil/editar-perfil")}
        >
          <img
            src={usuario.avatar}
            alt={usuario.nombre}
            className="cliente-drawer-avatar"
          />
          <div className="cliente-drawer-user-info">
            <span className="cliente-drawer-user-name">{user.nombre}</span>
            <span className="cliente-drawer-user-role">{user.rol}</span>

            <span className="cliente-drawer-user-phone">
              <Phone size={14} /> {user.telefono}
            </span>
          </div>
          <ChevronRight size={18} className="cliente-drawer-chevron" />
        </button>

        <nav className="cliente-drawer-nav">
          <NavLink
            type="button"
            to="inicio"
            end
            className={({ isActive }) =>
              isActive ? "cliente-drawer-item active" : "cliente-drawer-item"
            }
            onClick={onClose}
          >
            <Home size={19} /> Inicio
          </NavLink>
          <NavLink
            type="button"
            to="explorar"
            className={({ isActive }) =>
              isActive ? "cliente-drawer-item active" : "cliente-drawer-item"
            }
            onClick={onClose}
          >
            <Search size={19} /> Explorar
          </NavLink>
          <NavLink
            type="button"
            to="pedidos"
            className={({ isActive }) =>
              isActive ? "cliente-drawer-item active" : "cliente-drawer-item"
            }
            onClick={onClose}
          >
            <UtensilsCrossed size={19} /> Mis pedidos
          </NavLink>
          <NavLink
            type="button"
            to="favoritos"
            className={({ isActive }) =>
              isActive ? "cliente-drawer-item active" : "cliente-drawer-item"
            }
            onClick={onClose}
          >
            <Heart size={19} /> Favoritos
          </NavLink>
          <NavLink
            type="button"
            to="perfil/mis-direcciones"
            className={({ isActive }) =>
              isActive ? "cliente-drawer-item active" : "cliente-drawer-item"
            }
            onClick={onClose}
          >
            <MapPin size={19} /> Direcciones de entrega
          </NavLink>
          <NavLink
            type="button"
            to="notificaciones"
            className={({ isActive }) =>
              isActive ? "cliente-drawer-item active" : "cliente-drawer-item"
            }
            onClick={onClose}
          >
            <Bell size={19} /> Notificaciones
            {notificacionesSinLeer > 0 && (
              <span className="cliente-drawer-badge">
                {notificacionesSinLeer}
              </span>
            )}
          </NavLink>
          <NavLink
            type="button"
            to="perfil"
            className={({ isActive }) =>
              isActive ? "cliente-drawer-item active" : "cliente-drawer-item"
            }
            onClick={onClose}
          >
            <User size={19} /> Mi perfil
          </NavLink>

          <NavLink
            type="button"
            to="perfil/centro-ayuda"
            className={({ isActive }) =>
              isActive ? "cliente-drawer-item active" : "cliente-drawer-item"
            }
            onClick={onClose}
          >
            <LifeBuoy size={19} /> Ayuda y soporte
          </NavLink>
        </nav>

        <div className="cliente-drawer-divider" />

        <button
          type="button"
          className="cliente-drawer-logout"
          onClick={() => {
            onClose();
            onLogoutClick();
          }}
        >
          <LogOut size={19} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

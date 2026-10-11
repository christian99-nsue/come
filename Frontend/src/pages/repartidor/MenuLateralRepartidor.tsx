import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  X,
  Package,
  ClipboardList,
  History,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import "../../styles/repartidor/MenuLateralRepartidor.css";

const API_URL = import.meta.env.VITE_API_URL;

interface MenuLateralProps {
  open: boolean;
  onClose: () => void;
  onLogoutClick: () => void;
}

interface PerfilMenu {
  nombre: string;
  foto_perfil: string | null;
  disponible: boolean;
}

export default function MenuLateralRepartidor({
  open,
  onClose,
  onLogoutClick,
}: MenuLateralProps) {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilMenu | null>(null);
  const [noLeidas, setNoLeidas] = useState(0);

  // Cada vez que se abre el menú se piden los datos actuales
  useEffect(() => {
    if (!open) return;

    let cancelado = false;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get(`${API_URL}/api/repartidor/perfil`, { headers })
      .then((res) => {
        if (cancelado) return;
        setPerfil({
          nombre: res.data.nombre,
          foto_perfil: res.data.foto_perfil,
          disponible: res.data.disponible,
        });
      })
      .catch(() => {});

    axios
      .get(`${API_URL}/api/repartidor/notificaciones/no-leidas`, { headers })
      .then((res) => {
        if (!cancelado) setNoLeidas(res.data.total);
      })
      .catch(() => {});

    return () => {
      cancelado = true;
    };
  }, [open]);

  if (!open) return null;

  const ir = (ruta: string) => {
    onClose();
    navigate(ruta);
  };

  const nombre = perfil?.nombre ?? "Cargando...";
  const inicial = (perfil?.nombre ?? "R").charAt(0).toUpperCase();

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-user">
            {perfil?.foto_perfil ? (
              <img
                src={perfil.foto_perfil}
                alt={nombre}
                className="drawer-avatar"
              />
            ) : (
              <div className="drawer-avatar-fallback">{inicial}</div>
            )}
            <div className="drawer-user-text">
              <div className="drawer-user-name">{nombre}</div>
              <div className="drawer-user-role">Repartidor</div>
              {perfil && (
                <span
                  className={
                    perfil.disponible
                      ? "drawer-user-status"
                      : "drawer-user-status off"
                  }
                >
                  ● {perfil.disponible ? "Disponible" : "No disponible"}
                </span>
              )}
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
            onClick={() => ir("/repartidor/mis-pedidos")}
          >
            <ClipboardList size={18} /> Mis pedidos
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
            {noLeidas > 0 && (
              <span className="drawer-badge">
                {noLeidas > 9 ? "9+" : noLeidas}
              </span>
            )}
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

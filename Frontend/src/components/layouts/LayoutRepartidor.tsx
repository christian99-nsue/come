import { Menu, Bell, Package, User } from "lucide-react";
import MenuLateralRepartidor from "../../pages/repartidor/MenuLateralRepartidor";
import ConfirmModal from "../common/ConfirmModal";
import "../../styles/repartidor/LayoutRepartidor.css";
import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useRef } from "react";
import {
  aplicarTema,
  cargarPreferencias,
  leerCache,
  reproducirSonido,
} from "../../utils/preferenciasRepartidor";
import "../../styles/repartidor/RepartidorDark.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function LayoutRepartidor() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarConfirmacionLogout, setMostrarConfirmacionLogout] =
    useState(false);

  // Tema y preferencias: se pinta al instante con la copia local y se sincroniza con el servidor
  useEffect(() => {
    aplicarTema(leerCache().tema);
    cargarPreferencias().catch(() => {});

    // Al salir del panel (o cerrar sesión) se quita el tema oscuro
    return () => document.documentElement.removeAttribute("data-theme");
  }, []);

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
  const location = useLocation();
  const [noLeidas, setNoLeidas] = useState(0);
  const anterior = useRef<number | null>(null);

  // Se actualiza al cambiar de pantalla y cada 30 s. Si subió, suena un aviso.
  useEffect(() => {
    const token = localStorage.getItem("token");

    const cargar = () => {
      axios
        .get(`${API_URL}/api/repartidor/notificaciones/no-leidas`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const total: number = res.data.total;
          if (
            anterior.current !== null &&
            total > anterior.current &&
            leerCache().sonido_notificaciones
          ) {
            reproducirSonido();
          }
          anterior.current = total;
          setNoLeidas(total);
        })
        .catch(() => {});
    };

    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, [location.pathname]);

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
        {noLeidas > 0 && (
          <span className="rep-header-badge">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
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

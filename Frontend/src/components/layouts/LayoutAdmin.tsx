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
import type {
  ContextoAdmin,
  RestauranteAdmin,
} from "../../types/restauranteAdmin";
import "../../styles/admin/LayoutAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function LayoutAdmin() {
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarLogout, setMostrarLogout] = useState(false);
  const [restaurante, setRestaurante] = useState<RestauranteAdmin | null>(null);

  const [confirmarCierre, setConfirmarCierre] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [errorEstado, setErrorEstado] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/restaurante`, { headers })
      .then((res) => setRestaurante(res.data))
      .catch(() => setRestaurante(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMostrarLogout(false);
    navigate("/", { replace: true });
  };

  const cambiarEstado = async (nuevo: "abierto" | "cerrado") => {
    setConfirmarCierre(false);
    setCambiandoEstado(true);
    setErrorEstado("");

    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/restaurante`,
        { estado: nuevo },
        { headers },
      );
      setRestaurante(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setErrorEstado(
          err.response?.data?.message ||
            "No se pudo cambiar el estado del restaurante",
        );
      } else {
        setErrorEstado("No se pudo cambiar el estado del restaurante");
      }
    } finally {
      setCambiandoEstado(false);
    }
  };

  // Abrir es directo; cerrar pide confirmación
  const alternarEstado = () => {
    if (!restaurante) return;
    if (restaurante.estado === "abierto") setConfirmarCierre(true);
    else cambiarEstado("abierto");
  };

  const abierto = restaurante?.estado === "abierto";
  // 1) Junto a const abierto = ...
  const sinSuscripcion =
    !!restaurante && !restaurante.suspendido && !restaurante.suscripcion_al_dia;
  const activos = restaurante?.pedidos_activos ?? 0;

  const contexto: ContextoAdmin = { restaurante, actualizar: setRestaurante };

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

      {restaurante?.suspendido && (
        <div className="admin-suspended-banner">
          <strong>Tu restaurante está suspendido por la plataforma</strong>
          {restaurante.motivo_suspension && (
            <span>Motivo: {restaurante.motivo_suspension}</span>
          )}
          <span>
            No recibes pedidos nuevos y no puedes abrirlo. Los pedidos en curso
            puedes terminarlos con normalidad. Contacta con soporte para
            reactivarlo.
          </span>
        </div>
      )}

      {sinSuscripcion && restaurante && (
        <div className="admin-suspended-banner">
          <strong>
            {restaurante.suscripcion_estado === "vencida"
              ? "Tu suscripción venció"
              : "Tu restaurante no tiene una suscripción vigente"}
          </strong>
          <span>
            No recibes pedidos nuevos hasta que la renueves. Los pedidos en
            curso puedes terminarlos con normalidad.
          </span>
          <button
            type="button"
            className="admin-banner-btn"
            onClick={() => navigate("/admin/suscripcion")}
          >
            Renovar suscripción
          </button>
        </div>
      )}

      {restaurante &&
        !restaurante.suspendido &&
        restaurante.suscripcion_aviso &&
        restaurante.suscripcion_aviso !== "vencida" && (
          <div className="admin-expiry-banner">
            <strong>
              {restaurante.suscripcion_aviso === "ultimo_dia"
                ? "Tu suscripción vence hoy"
                : `Tu suscripción vence ${restaurante.suscripcion_dias === 1 ? "mañana" : `en ${restaurante.suscripcion_dias} días`}`}
            </strong>
            <span>
              Renuévala para seguir recibiendo pedidos sin interrupciones.
            </span>
            <button
              type="button"
              className="admin-banner-btn amber"
              onClick={() => navigate("/admin/suscripcion")}
            >
              Renovar suscripción
            </button>
          </div>
        )}

      {restaurante &&
        !restaurante.suspendido &&
        restaurante.suscripcion_al_dia && (
          <div
            className={abierto ? "admin-status-bar open" : "admin-status-bar"}
          >
            <div className="admin-status-text">
              <span className="admin-status-title">
                {abierto ? "● Abierto" : "● Cerrado"}
              </span>
            </div>
            <button
              type="button"
              className={abierto ? "toggle-switch active" : "toggle-switch"}
              onClick={alternarEstado}
              disabled={cambiandoEstado}
              aria-label={
                abierto ? "Cerrar el restaurante" : "Abrir el restaurante"
              }
              aria-pressed={abierto}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        )}

      {restaurante &&
        !restaurante.suspendido &&
        restaurante.suscripcion_al_dia &&
        restaurante.platos_disponibles === 0 && (
          <p className="admin-status-warning">
            No tienes platos disponibles: los clientes no verán tu restaurante
            hasta que actives alguno en Menú.
          </p>
        )}
      {errorEstado && (
        <p className="admin-status-warning error">{errorEstado}</p>
      )}

      <Outlet context={contexto} />

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
        <NavLink
          to="mas"
          className={({ isActive }) =>
            isActive ? "admin-nav-item active" : "admin-nav-item"
          }
        >
          <MoreHorizontal size={22} className="admin-nav-icon" />
          <span className="admin-nav-label">Más</span>
        </NavLink>
      </nav>

      <MenuLateralAdmin
        open={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        onLogoutClick={() => setMostrarLogout(true)}
        restaurante={{
          nombre: restaurante?.nombre || "Mi restaurante",
          abierto:
            restaurante?.estado === "abierto" &&
            !!restaurante?.suscripcion_al_dia &&
            !restaurante?.suspendido,
          logo: restaurante?.logo || null,
        }}
      />

      <ConfirmModal
        open={confirmarCierre}
        title="¿Cerrar el restaurante?"
        message={
          activos > 0
            ? `Dejarás de recibir pedidos nuevos. Tus ${activos} ${
                activos === 1
                  ? "pedido en curso seguirá"
                  : "pedidos en curso seguirán"
              } su camino normal.`
            : "Dejarás de recibir pedidos nuevos hasta que vuelvas a abrir."
        }
        confirmLabel="Cerrar restaurante"
        cancelLabel="Cancelar"
        danger
        onConfirm={() => cambiarEstado("cerrado")}
        onCancel={() => setConfirmarCierre(false)}
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

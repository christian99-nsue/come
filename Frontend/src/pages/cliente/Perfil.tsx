import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  MapPin,
  Wallet,
  BellRing,
  HelpCircle,
  MessageSquare,
  FileText,
  LogOut,
  ChevronRight,
  Phone,
  Inbox,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import { Lock, Moon, Accessibility } from "lucide-react";
import { leerCache, etiquetaTema } from "../../utils/preferenciasCliente";
import "../../styles/cliente/perfil.css";

const API_URL = import.meta.env.VITE_API_URL;

interface PerfilData {
  nombre: string;
  email: string | null;
  telefono: string;
  foto_perfil: string | null;
  metodo_pago_preferido: "efectivo" | "transferencia" | "tarjeta";
  notificaciones_activas: boolean;
  fecha_registro: string | null;
  pedidos_entregados: number;
  direcciones_count: number;
}

interface MenuItem {
  icon: typeof User;
  title: string;
  subtitle: string;
  badge?: number;
  onClick: () => void;
}

const nombresPago = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};

function clienteDesde(iso: string | null) {
  if (!iso) return null;
  return `Cliente desde ${new Date(iso).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`;
}

export default function Perfil() {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/cliente/perfil`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setPerfil(res.data))
      .catch(() => setError("No se pudo cargar tu perfil"))
      .finally(() => setCargando(false));
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMostrarConfirmacion(false);
    navigate("/", { replace: true });
  };

  const cuentaItems: MenuItem[] = perfil
    ? [
        {
          icon: User,
          title: "Información personal",
          subtitle: "Edita tu nombre, correo y teléfono",
          onClick: () => navigate("/cliente/perfil/editar-perfil"),
        },
        {
          icon: Lock,
          title: "Cambiar contraseña",
          subtitle: "Actualiza tu contraseña de acceso",
          onClick: () => navigate("/cliente/perfil/cambiar-contrasena"),
        },
        {
          icon: MapPin,
          title: "Mis direcciones",
          subtitle:
            perfil.direcciones_count > 0
              ? "Gestiona tus direcciones de entrega"
              : "Añade tu primera dirección de entrega",
          badge:
            perfil.direcciones_count > 0 ? perfil.direcciones_count : undefined,
          onClick: () => navigate("/cliente/perfil/mis-direcciones"),
        },
        {
          icon: Wallet,
          title: "Métodos de pago",
          subtitle: `Preferido: ${nombresPago[perfil.metodo_pago_preferido]}`,
          onClick: () => navigate("/cliente/perfil/metodos-pago"),
        },
      ]
    : [];

  const preferenciasItems: MenuItem[] = perfil
    ? [
        {
          icon: BellRing,
          title: "Notificaciones",
          subtitle: perfil.notificaciones_activas
            ? "Activadas"
            : "Desactivadas",
          onClick: () =>
            navigate("/cliente/perfil/notificaciones/preferencias"),
        },
        {
          icon: Moon,
          title: "Tema de la aplicación",
          subtitle: etiquetaTema[leerCache().tema],
          onClick: () => navigate("/cliente/perfil/tema-aplicacion"),
        },
        {
          icon: Accessibility,
          title: "Accesibilidad",
          subtitle: "Tamaño de texto, contraste y movimiento",
          onClick: () => navigate("/cliente/perfil/accesibilidad"),
        },
      ]
    : [];

  const ayudaItems: MenuItem[] = [
    {
      icon: HelpCircle,
      title: "Centro de ayuda",
      subtitle: "Preguntas frecuentes y guías",
      onClick: () => navigate("/cliente/perfil/centro-ayuda"),
    },
    {
      icon: MessageSquare,
      title: "Contáctanos",
      subtitle: "Escríbenos, estamos para ayudarte",
      onClick: () => navigate("/cliente/perfil/contactanos"),
    },
    {
      icon: FileText,
      title: "Términos y condiciones",
      subtitle: "Lee nuestras políticas y términos",
      onClick: () => navigate("/cliente/perfil/terminos-condiciones"),
    },
    {
      icon: Inbox,
      title: "Mis reportes",
      subtitle: "Tus consultas y las respuestas de soporte",
      onClick: () => navigate("/cliente/mis-reportes"),
    },
  ];

  return (
    <div className="perfil-page">
      <section className="perfil-header">
        <div>
          <h1 className="perfil-title">Mi perfil</h1>
          <p className="perfil-subtitle">Gestiona tu cuenta y preferencias</p>
        </div>
      </section>

      {cargando && <p className="perfil-status">Cargando tu perfil...</p>}
      {!cargando && error && <p className="perfil-status error">{error}</p>}

      {perfil && (
        <>
          <button
            type="button"
            className="user-card"
            onClick={() => navigate("/cliente/perfil/editar-perfil")}
          >
            {perfil.foto_perfil ? (
              <img
                src={perfil.foto_perfil}
                alt={perfil.nombre}
                className="user-card-avatar"
              />
            ) : (
              <div className="user-card-avatar fallback">
                {perfil.nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="user-card-info">
              <span className="user-card-name">{perfil.nombre}</span>
              <span className="user-card-detail user-card-phone">
                <Phone size={12} /> {perfil.telefono}
              </span>
              <div className="user-card-badges">
                {clienteDesde(perfil.fecha_registro) && (
                  <span className="user-card-badge">
                    {clienteDesde(perfil.fecha_registro)}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight size={18} className="perfil-chevron" />
          </button>

          <ProfileSection title="Cuenta" items={cuentaItems} />
          <ProfileSection title="Preferencias" items={preferenciasItems} />
        </>
      )}

      <ProfileSection title="Ayuda y soporte" items={ayudaItems} />

      {/* Cerrar sesión se muestra siempre, aunque el perfil no haya podido cargar */}
      <button
        type="button"
        className="logout-row"
        onClick={() => setMostrarConfirmacion(true)}
      >
        <span className="logout-icon">
          <LogOut size={18} />
        </span>
        <div className="logout-text">
          <span className="logout-title">Cerrar sesión</span>
          <span className="logout-subtitle">
            Sal de tu cuenta de forma segura
          </span>
        </div>
        <ChevronRight size={18} className="logout-chevron" />
      </button>

      <ConfirmModal
        open={mostrarConfirmacion}
        title="¿Cerrar sesión?"
        message="Tendrás que volver a iniciar sesión con tu número de teléfono y contraseña para acceder de nuevo."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        danger
        onConfirm={cerrarSesion}
        onCancel={() => setMostrarConfirmacion(false)}
      />
    </div>
  );
}

function ProfileSection({
  title,
  items,
}: {
  title: string;
  items: MenuItem[];
}) {
  return (
    <section className="perfil-section">
      <h3 className="perfil-section-title">{title}</h3>
      <div className="perfil-menu-card">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.title}
              className="perfil-menu-row"
              onClick={item.onClick}
              style={
                i < items.length - 1
                  ? { borderBottom: "1px solid #f0f0f0" }
                  : undefined
              }
            >
              <span className="perfil-menu-icon">
                <Icon size={18} />
              </span>
              <div className="perfil-menu-text">
                <span className="perfil-menu-title">{item.title}</span>
                <span className="perfil-menu-subtitle">{item.subtitle}</span>
              </div>
              {item.badge !== undefined && (
                <span className="perfil-menu-count">{item.badge}</span>
              )}
              <ChevronRight size={18} className="perfil-chevron" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

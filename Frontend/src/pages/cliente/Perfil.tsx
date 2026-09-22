import {
  User,
  MapPin,
  Wallet,
  BellRing,
  Globe,
  Moon,
  HelpCircle,
  MessageSquare,
  LogOut,
  ChevronRight,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import avatar from "../../assets/6.jpg";
import ConfirmModal from "../../components/common/ConfirmModal";
import "../../styles/cliente/perfil.css";
import { useState } from "react";

interface MenuItem {
  icon: typeof User;
  title: string;
  subtitle: string;
  onClick?: () => void;
  danger?: boolean;
}

interface Usuario {
  nombre: string;
  email: string;
  telefono: string;
  avatar: string;
}

const usuarioMock: Usuario = {
  nombre: "Christian Nsue",
  email: "christian.nsuе00@gmail.com",
  telefono: "222123456",
  avatar: avatar,
};

export default function Perfil() {
  const navigate = useNavigate();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const cuentaItems: MenuItem[] = [
    {
      icon: User,
      title: "Informacion personal",
      subtitle: "Edita tu nombre, correo y telefono",
      onClick: () => navigate("/cliente/perfil/editar-perfil"),
    },
    {
      icon: MapPin,
      title: "Mis direcciones",
      subtitle: "Gestiona tus direcciones de entrega",
      onClick: () => navigate("/cliente/perfil/mis-direcciones"),
    },
    {
      icon: Wallet,
      title: "Metodos de pago",
      subtitle: "Tarjetas, efectivo y mas",
      onClick: () => navigate("/cliente/perfil/metodos-pago"),
    },
  ];

  const preferenciasItems: MenuItem[] = [
    {
      icon: BellRing,
      title: "Notificaciones",
      subtitle: "Configura tus notificaciones",
      onClick: () => navigate("/cliente/perfil/notificaciones"),
    },
    {
      icon: Globe,
      title: "Idioma",
      subtitle: "Español",
      onClick: () => navigate("/cliente/perfil/idioma"),
    },
    {
      icon: Moon,
      title: "Tema de la aplicacion",
      subtitle: "Claro",
      onClick: () => navigate("/cliente/perfil/tema-aplicacion"),
    },
  ];

  const ayudaItems: MenuItem[] = [
    {
      icon: HelpCircle,
      title: "Centro de ayuda",
      subtitle: "Preguntas frecuentes y guias",
      onClick: () => navigate("/cliente/perfil/centro-ayuda"),
    },
    {
      icon: MessageSquare,
      title: "Contactanos",
      subtitle: "Escribenos, estamos para ayudarte",
      onClick: () => navigate("/cliente/perfil/contactanos"),
    },
  ];

  // Se ejecuta solo cuando el usuario CONFIRMA en el modal
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMostrarConfirmacion(false);
    navigate("/", { replace: true });
  };

  const user = getUser();

  console.log("USUARIO DEL STORAGE:", user);

  return (
    <div className="perfil-page">
      {/* Encabezado */}
      <section className="perfil-header">
        <div>
          <h1 className="perfil-title">Mi perfil</h1>
          <p className="perfil-subtitle">Gestiona tu cuenta y preferencias</p>
        </div>
      </section>

      {/* Card del usuario */}
      <button
        type="button"
        className="user-card"
        onClick={() => navigate("/cliente/perfil/editar-perfil")}
      >
        <img
          src={usuarioMock.avatar}
          alt={usuarioMock.nombre}
          className="user-card-avatar"
        />
        <div className="user-card-info">
          <span className="user-card-name">{user?.nombre}</span>
          <span className="user-card-detail">
            {user?.email ?? usuarioMock.email}{" "}
          </span>
          <span className="user-card-detail user-card-phone">
            <Phone size={14} /> {user?.telefono}
          </span>
        </div>
        <ChevronRight size={18} className="perfil-chevron" />
      </button>

      {/* Cuenta */}
      <ProfileSection title="Cuenta" items={cuentaItems} />

      {/* Preferencias */}
      <ProfileSection title="Preferencias" items={preferenciasItems} />

      {/* Ayuda y soporte */}
      <ProfileSection title="Ayuda y soporte" items={ayudaItems} />

      {/* Cerrar sesión */}
      <button
        type="button"
        className="logout-row"
        onClick={() => setMostrarConfirmacion(true)}
      >
        <span className="logout-icon">
          <LogOut size={18} />
        </span>
        <div className="logout-text">
          <span className="logout-title">Cerrar sesion</span>
          <span className="logout-subtitle">
            Sal de tu cuenta de forma segura
          </span>
        </div>
        <ChevronRight size={18} className="logout-chevron" />
      </button>

      {/* Modal de confirmación */}
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
              <ChevronRight size={18} className="perfil-chevron" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

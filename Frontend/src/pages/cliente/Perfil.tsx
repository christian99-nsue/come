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
import { getUser } from "../../utils/auth";
import avatar from "../../assets/6.jpg";
import "../../styles/perfil.css";

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
  nombre: "Juan carlos ndong",
  email: "juan.carlos@gmail.com",
  telefono: "222123456",
  avatar: avatar,
};

const cuentaItems: MenuItem[] = [
  {
    icon: User,
    title: "Informacion personal",
    subtitle: "Edita tu nombre, correo y telefono",
  },
  {
    icon: MapPin,
    title: "Mis direcciones",
    subtitle: "Gestiona tus direcciones de entrega",
  },
  {
    icon: Wallet,
    title: "Metodos de pago",
    subtitle: "Tarjetas, efectivo y mas",
  },
];

const preferenciasItems: MenuItem[] = [
  {
    icon: BellRing,
    title: "Notificaciones",
    subtitle: "Configura tus notificaciones",
  },
  {
    icon: Globe,
    title: "Idioma",
    subtitle: "Español",
  },
  {
    icon: Moon,
    title: "Tema de la aplicacion",
    subtitle: "Claro",
  },
];

const ayudaItems: MenuItem[] = [
  {
    icon: HelpCircle,
    title: "Centro de ayuda",
    subtitle: "Preguntas frecuentes y guias",
  },
  {
    icon: MessageSquare,
    title: "Contactanos",
    subtitle: "Escribenos, estamos para ayudarte",
  },
];

export default function Perfil() {
  const handleLogout = () => {
    console.log("Cerrar sesión");
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
      <button type="button" className="user-card">
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
      <button type="button" className="logout-row" onClick={handleLogout}>
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

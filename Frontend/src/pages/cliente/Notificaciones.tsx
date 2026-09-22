import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Tag,
  Megaphone,
  Star,
  CalendarClock,
  Mail,
  Info,
} from "lucide-react";
import "../../styles/cliente/Notificaciones.css";

interface OpcionNotificacion {
  id: string;
  icon: typeof Bell;
  titulo: string;
  subtitulo: string;
  activo: boolean;
}

const notificacionesAppMock: OpcionNotificacion[] = [
  {
    id: "pedidos",
    icon: Bell,
    titulo: "Pedidos y entregas",
    subtitulo: "Actualizaciones sobre el estado de tus pedidos.",
    activo: true,
  },
  {
    id: "promociones",
    icon: Tag,
    titulo: "Promociones y descuentos",
    subtitulo: "Ofertas especiales y cupones.",
    activo: true,
  },
  {
    id: "novedades",
    icon: Megaphone,
    titulo: "Novedades",
    subtitulo: "Nuevos restaurantes y funciones de la app.",
    activo: true,
  },
  {
    id: "recomendaciones",
    icon: Star,
    titulo: "Recomendaciones",
    subtitulo: "Sugerencias personalizadas según tus gustos.",
    activo: false,
  },
  {
    id: "recordatorios",
    icon: CalendarClock,
    titulo: "Recordatorios",
    subtitulo: "Sobre tus pedidos y horarios favoritos.",
    activo: false,
  },
];

const notificacionesCorreoMock: OpcionNotificacion[] = [
  {
    id: "correo-ofertas",
    icon: Mail,
    titulo: "Recibir ofertas y novedades por email.",
    subtitulo: "",
    activo: false,
  },
];

export default function Notificaciones() {
  const navigate = useNavigate();
  const [appOpciones, setAppOpciones] = useState(notificacionesAppMock);
  const [correoOpciones, setCorreoOpciones] = useState(
    notificacionesCorreoMock,
  );

  const toggleApp = (id: string) => {
    setAppOpciones((prev) =>
      prev.map((o) => (o.id === id ? { ...o, activo: !o.activo } : o)),
    );
  };

  const toggleCorreo = (id: string) => {
    setCorreoOpciones((prev) =>
      prev.map((o) => (o.id === id ? { ...o, activo: !o.activo } : o)),
    );
  };

  return (
    <div className="notificaciones-page">
      <section className="notificaciones-header">
        <button
          type="button"
          className="notificaciones-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="notificaciones-title">Notificaciones</h1>
      </section>

      <h3 className="notificaciones-section-title">Notificaciones de la app</h3>
      <div className="notificaciones-list">
        {appOpciones.map((o) => {
          const Icon = o.icon;
          return (
            <div className="notificacion-row" key={o.id}>
              <span className="notificacion-icon">
                <Icon size={18} />
              </span>
              <div className="notificacion-text">
                <span className="notificacion-title">{o.titulo}</span>
                <span className="notificacion-subtitle">{o.subtitulo}</span>
              </div>
              <button
                type="button"
                className={o.activo ? "toggle-switch active" : "toggle-switch"}
                onClick={() => toggleApp(o.id)}
                aria-label={`Activar/desactivar ${o.titulo}`}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          );
        })}
      </div>

      <h3 className="notificaciones-section-title">
        Notificaciones por correo electrónico
      </h3>
      <div className="notificaciones-list">
        {correoOpciones.map((o) => {
          const Icon = o.icon;
          return (
            <div className="notificacion-row" key={o.id}>
              <span className="notificacion-icon">
                <Icon size={18} />
              </span>
              <div className="notificacion-text">
                <span className="notificacion-title">{o.titulo}</span>
              </div>
              <button
                type="button"
                className={o.activo ? "toggle-switch active" : "toggle-switch"}
                onClick={() => toggleCorreo(o.id)}
                aria-label={`Activar/desactivar ${o.titulo}`}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="notificaciones-note">
        <Info size={16} className="notificaciones-note-icon" />
        Puedes desactivar las notificaciones en cualquier momento.
      </div>
    </div>
  );
}

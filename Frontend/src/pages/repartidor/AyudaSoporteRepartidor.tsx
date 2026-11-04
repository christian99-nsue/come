import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Flag,
  MessageSquare,
  Headphones,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { SOPORTE } from "../../utils/soporte";
import "../../styles/repartidor/RepartidorShared.css";

export default function AyudaSoporteRepartidor() {
  const navigate = useNavigate();

  const opciones = [
    {
      icon: HelpCircle,
      titulo: "Preguntas frecuentes",
      subtitulo: "Resuelve tus dudas más comunes",
      accion: () => navigate("/repartidor/ayuda/preguntas"),
    },
    {
      icon: MessageCircle,
      titulo: "Contactar soporte",
      subtitulo: "Escríbenos por correo",
      accion: () => {
        window.location.href = `mailto:${SOPORTE.email}?subject=${encodeURIComponent("Ayuda - Repartidor")}`;
      },
    },
    {
      icon: Inbox,
      titulo: "Mis reportes",
      subtitulo: "Tus consultas y las respuestas de soporte",
      accion: () => navigate("/repartidor/ayuda/reportes"),
    },
    {
      icon: Flag,
      titulo: "Reportar un problema",
      subtitulo: "Describe el inconveniente",
      accion: () => navigate("/repartidor/ayuda/reportar"),
    },
    {
      icon: MessageSquare,
      titulo: "Chat en vivo",
      subtitulo: "Habla con un agente por WhatsApp",
      accion: () => window.open(`https://wa.me/${SOPORTE.whatsapp}`, "_blank"),
    },
  ];

  return (
    <div className="rep-page">
      <section className="rep-header">
        <button
          type="button"
          className="rep-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="rep-title">Ayuda y soporte</h1>
      </section>

      <div className="rep-menu-list">
        {opciones.map((op) => {
          const Icon = op.icon;
          return (
            <button
              key={op.titulo}
              type="button"
              className="rep-menu-row"
              onClick={op.accion}
            >
              <span className="rep-info-icon">
                <Icon size={17} />
              </span>
              <div className="rep-menu-label-col">
                <span className="rep-menu-label">{op.titulo}</span>
                <span className="rep-menu-sublabel">{op.subtitulo}</span>
              </div>
              <ChevronRight size={17} color="#9ca3af" />
            </button>
          );
        })}
      </div>

      <div className="rep-support-hours">
        <Headphones size={18} className="rep-support-hours-icon" />
        Nuestro equipo de soporte está disponible {SOPORTE.horario}.
      </div>
    </div>
  );
}

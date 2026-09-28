import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, MessageCircle, Flag, MessageSquare, Headphones, ChevronRight } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const opciones = [
  { icon: HelpCircle, titulo: "Preguntas frecuentes", subtitulo: "Resuelve tus dudas más comunes" },
  { icon: MessageCircle, titulo: "Contactar soporte", subtitulo: "Estamos aquí para ayudarte" },
  { icon: Flag, titulo: "Reportar un problema", subtitulo: "Describe el inconveniente" },
  { icon: MessageSquare, titulo: "Chat en vivo", subtitulo: "Habla con un agente" },
];

export default function AyudaSoporteRepartidor() {
  const navigate = useNavigate();

  return (
    <div className="rep-page">
      <section className="rep-header">
        <button type="button" className="rep-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <h1 className="rep-title">Ayuda y soporte</h1>
      </section>

      <div className="rep-menu-list">
        {opciones.map((op) => {
          const Icon = op.icon;
          return (
            <button key={op.titulo} type="button" className="rep-menu-row">
              <span className="rep-info-icon"><Icon size={17} /></span>
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
        Nuestro equipo de soporte está disponible de 8:00 a 22:00 (GMT).
      </div>
    </div>
  );
}

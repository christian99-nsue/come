import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  Send,
  Clock,
} from "lucide-react";
import "../../styles/cliente/Contactanos.css";

const canalesMock = [
  {
    id: "whatsapp",
    icon: MessageCircle,
    titulo: "WhatsApp",
    subtitulo: "Respuesta en minutos",
    color: "#16a34a",
  },
  {
    id: "telefono",
    icon: Phone,
    titulo: "Llamada",
    subtitulo: "+240 555 000 111",
    color: "#2563eb",
  },
  {
    id: "email",
    icon: Mail,
    titulo: "Correo electrónico",
    subtitulo: "soporte@come.com",
    color: "#ea580c",
  },
];

export default function Contactanos() {
  const navigate = useNavigate();
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);

  const enviarMensaje = () => {
    if (!asunto.trim() || !mensaje.trim()) return;
    // TODO: conectar con POST /api/soporte/mensajes
    setEnviado(true);
  };

  return (
    <div className="contacto-page">
      <section className="contacto-header">
        <button
          type="button"
          className="contacto-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="contacto-title">Contáctanos</h1>
      </section>

      <p className="contacto-intro">
        Elige el canal que prefieras o escríbenos directamente desde aquí.
      </p>

      <div className="contacto-canales">
        {canalesMock.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.id} type="button" className="contacto-canal-card">
              <span
                className="contacto-canal-icon"
                style={{ backgroundColor: `${c.color}1a`, color: c.color }}
              >
                <Icon size={20} />
              </span>
              <span className="contacto-canal-title">{c.titulo}</span>
              <span className="contacto-canal-subtitle">{c.subtitulo}</span>
            </button>
          );
        })}
      </div>

      <div className="contacto-hours">
        <Clock size={16} className="contacto-hours-icon" />
        Horario de atención: Lunes a Domingo, 8:00 - 22:00
      </div>

      <section className="contacto-form-section">
        <h3 className="contacto-form-title">Envíanos un mensaje</h3>

        {enviado ? (
          <div className="contacto-success">
            <span className="contacto-success-icon">✅</span>
            <span className="contacto-success-title">¡Mensaje enviado!</span>
            <span className="contacto-success-subtitle">
              Nuestro equipo te responderá lo antes posible.
            </span>
          </div>
        ) : (
          <>
            <label className="contacto-field">
              <span className="contacto-label">Asunto</span>
              <input
                type="text"
                placeholder="Ej: Problema con mi pedido #12345"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                className="contacto-input"
              />
            </label>

            <label className="contacto-field">
              <span className="contacto-label">Mensaje</span>
              <textarea
                placeholder="Cuéntanos en qué podemos ayudarte..."
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="contacto-textarea"
                maxLength={500}
              />
              <span className="contacto-textarea-count">{mensaje.length}/500</span>
            </label>

            <button
              type="button"
              className="contacto-submit-btn"
              onClick={enviarMensaje}
            >
              <Send size={16} />
              Enviar mensaje
            </button>
          </>
        )}
      </section>
    </div>
  );
}

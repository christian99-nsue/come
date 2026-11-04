import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  Send,
  Clock,
} from "lucide-react";
import { SOPORTE } from "../../utils/soporte";
import "../../styles/cliente/Contactanos.css";

const API_URL = import.meta.env.VITE_API_URL;

const canales = [
  {
    id: "whatsapp",
    icon: MessageCircle,
    titulo: "WhatsApp",
    subtitulo: "Escríbenos",
    color: "#16a34a",
    href: `https://wa.me/${SOPORTE.whatsapp}`,
    externo: true,
  },
  {
    id: "telefono",
    icon: Phone,
    titulo: "Llamada",
    subtitulo: SOPORTE.telefono,
    color: "#2563eb",
    href: `tel:${SOPORTE.telefono}`,
    externo: false,
  },
  {
    id: "email",
    icon: Mail,
    titulo: "Correo",
    subtitulo: SOPORTE.email,
    color: "#ea580c",
    href: `mailto:${SOPORTE.email}`,
    externo: false,
  },
];

export default function Contactanos() {
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState("");
  const [codigoPedido, setCodigoPedido] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const enviarMensaje = async () => {
    setError("");
    if (!categoria) return setError("Selecciona el tipo de consulta");
    if (asunto.trim().length < 3) return setError("Escribe un asunto");
    if (mensaje.trim().length < 10)
      return setError("Cuéntanos con un poco más de detalle");

    setEnviando(true);
    try {
      await axios.post(
        `${API_URL}/api/cliente/soporte/reportes`,
        { categoria, asunto, mensaje, codigo_pedido: codigoPedido },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setEnviado(true);
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message || "No se pudo enviar tu mensaje");
      } else {
        setError("No se pudo enviar tu mensaje");
      }
    } finally {
      setEnviando(false);
    }
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
        {canales.map((c) => {
          const Icon = c.icon;
          return (
            <a
              key={c.id}
              className="contacto-canal-card"
              href={c.href}
              target={c.externo ? "_blank" : undefined}
              rel={c.externo ? "noreferrer" : undefined}
            >
              <span
                className="contacto-canal-icon"
                style={{ backgroundColor: `${c.color}1a`, color: c.color }}
              >
                <Icon size={20} />
              </span>
              <span className="contacto-canal-title">{c.titulo}</span>
              <span className="contacto-canal-subtitle">{c.subtitulo}</span>
            </a>
          );
        })}
      </div>

      <div className="contacto-hours">
        <Clock size={16} className="contacto-hours-icon" />
        Horario de atención: {SOPORTE.horario}
      </div>

      <section className="contacto-form-section">
        <h3 className="contacto-form-title">Envíanos un mensaje</h3>

        {enviado ? (
          <div className="contacto-success">
            <span className="contacto-success-icon">✅</span>
            <span className="contacto-success-title">¡Mensaje enviado!</span>
            <span className="contacto-success-subtitle">
              Nuestro equipo lo revisará lo antes posible.
            </span>
            <button
              type="button"
              className="contacto-submit-btn"
              onClick={() => navigate("/cliente/mis-reportes")}
            >
              Ver mis reportes
            </button>
          </div>
        ) : (
          <>
            {error && <p className="contacto-error">{error}</p>}

            <label className="contacto-field">
              <span className="contacto-label">Tipo de consulta</span>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="contacto-input"
              >
                <option value="">Selecciona una opción</option>
                <option value="pedido">Un pedido o una entrega</option>
                <option value="app">La aplicación</option>
                <option value="cuenta">Mi cuenta</option>
                <option value="otro">Otro</option>
              </select>
            </label>

            <label className="contacto-field">
              <span className="contacto-label">
                Código del pedido (opcional)
              </span>
              <input
                type="text"
                placeholder="Ej: #CM-250521-7842"
                value={codigoPedido}
                onChange={(e) => setCodigoPedido(e.target.value)}
                className="contacto-input"
              />
            </label>

            <label className="contacto-field">
              <span className="contacto-label">Asunto</span>
              <input
                type="text"
                placeholder="Resumen de tu consulta"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                className="contacto-input"
                maxLength={150}
              />
            </label>

            <label className="contacto-field">
              <span className="contacto-label">Mensaje</span>
              <textarea
                placeholder="Cuéntanos en qué podemos ayudarte..."
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="contacto-textarea"
                maxLength={1000}
              />
              <span className="contacto-textarea-count">
                {mensaje.length}/1000
              </span>
            </label>

            <button
              type="button"
              className="contacto-submit-btn"
              onClick={enviarMensaje}
              disabled={enviando}
            >
              <Send size={16} />
              {enviando ? "Enviando..." : "Enviar mensaje"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}

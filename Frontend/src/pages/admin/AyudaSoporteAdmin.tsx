import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Headphones,
  Mail,
  Package,
  UtensilsCrossed,
  Bike,
  ShoppingCart,
  CreditCard,
  FileText,
  ShieldCheck,
  AlertTriangle,
  MessageCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/AyudaSoporteAdmin.css";

const preguntasFrecuentes = [
  {
    icon: Package,
    titulo: "¿Cómo gestionar los pedidos?",
    subtitulo: "Desde la recepción hasta la entrega.",
  },
  {
    icon: UtensilsCrossed,
    titulo: "¿Cómo crear y editar un menú?",
    subtitulo: "Gestiona tus platos, precios y disponibilidad.",
  },
  {
    icon: Bike,
    titulo: "¿Cómo funciona el sistema de repartidores?",
    subtitulo: "Asignación de pedidos y seguimiento.",
  },
  {
    icon: ShoppingCart,
    titulo: "¿Cómo hacer un pedido al por mayor?",
    subtitulo: "Productos disponibles y proceso de compra.",
  },
  {
    icon: CreditCard,
    titulo: "¿Cómo gestionar mi suscripción?",
    subtitulo: "Planes, pagos y renovación.",
  },
];

const otrosTemas = [
  {
    icon: FileText,
    titulo: "Términos y condiciones",
    subtitulo: "Condiciones de uso de la plataforma.",
  },
  {
    icon: ShieldCheck,
    titulo: "Política de privacidad",
    subtitulo: "Cómo protegemos tus datos.",
  },
  {
    icon: AlertTriangle,
    titulo: "Reportar un problema",
    subtitulo: "Cuéntanos qué sucede.",
  },
  {
    icon: MessageCircle,
    titulo: "Chat en vivo",
    subtitulo: "Habla con un agente de soporte.",
  },
];

export default function AyudaSoporteAdmin() {
  const navigate = useNavigate();

  return (
    <div className="admin-page ayuda-admin-page">
      <section className="admin-header">
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="admin-title">Ayuda y soporte</h1>
      </section>

      <div className="ayuda-admin-hero">
        <span className="ayuda-admin-hero-icon">
          <Headphones size={22} />
        </span>
        <div className="ayuda-admin-hero-text">
          <span className="ayuda-admin-hero-title">¿Necesitas ayuda?</span>
          <span className="ayuda-admin-hero-subtitle">
            Nuestro equipo de soporte está disponible para resolver tus dudas.
          </span>
        </div>
      </div>

      <a href="mailto:soporte@come.com" className="ayuda-admin-contact-btn">
        <Mail size={17} /> Contactar soporte
      </a>

      <div className="ayuda-admin-section-header">
        <h3 className="admin-section-title-sm" style={{ margin: 0 }}>
          Preguntas frecuentes
        </h3>
        <button type="button" className="ayuda-admin-ver-todas">
          Ver todas <ChevronRight size={14} />
        </button>
      </div>

      <div className="admin-menu-list">
        {preguntasFrecuentes.map((p) => {
          const Icon = p.icon;
          return (
            <button key={p.titulo} type="button" className="admin-menu-row">
              <span className="ayuda-admin-icon-box">
                <Icon size={17} />
              </span>
              <div className="admin-menu-label-col">
                <span className="admin-menu-label">{p.titulo}</span>
                <span className="admin-menu-sublabel">{p.subtitulo}</span>
              </div>
              <ChevronRight size={17} color="#9ca3af" />
            </button>
          );
        })}
      </div>

      <h3 className="admin-section-title-sm">Otros temas</h3>
      <div className="admin-menu-list">
        {otrosTemas.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.titulo} type="button" className="admin-menu-row">
              <span className="ayuda-admin-icon-box">
                <Icon size={17} />
              </span>
              <div className="admin-menu-label-col">
                <span className="admin-menu-label">{t.titulo}</span>
                <span className="admin-menu-sublabel">{t.subtitulo}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="ayuda-admin-hours">
        <Clock size={17} className="ayuda-admin-hours-icon" />
        <div>
          <span className="ayuda-admin-hours-title">Horario de atención</span>
          <span className="ayuda-admin-hours-subtitle">
            Lunes a domingo · 08:00 - 22:00 (GMT)
          </span>
        </div>
      </div>
    </div>
  );
}

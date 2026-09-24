import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  CalendarDays,
  CreditCard,
  Plus,
  MapPin,
  Bell,
  ChevronRight,
} from "lucide-react";
import { getUser } from "../../utils/auth";
import "../../styles/repartidor/RepartidorShared.css";
import avatar from "../../assets/pilar.jpg";

const cuentaMock = {
  nombre: "Carlos Martínez",
  rol: "Repartidor",
  disponible: true,
  avatar: avatar,
  correo: "carlos.martinez@ejemplo.com",
  telefono: "+240 555 987 654",
  fechaRegistro: "12 de marzo de 2025",
  tarjetasGuardadas: 1,
  direccionFacturacion: "Calle Principal 12, Malabo",
  recibirNotificaciones: true,
};

export default function InfoCuentaRepartidor() {
  const navigate = useNavigate();
  const user = getUser();
  const c = cuentaMock;

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
        <h1 className="rep-title">Información de la cuenta</h1>
      </section>

      <button
        type="button"
        className="rep-card rep-card-green rep-profile-card rep-account-top-card"
      >
        <img src={c.avatar} alt={c.nombre} className="rep-profile-avatar" />
        <div className="rep-account-top-text">
          <div className="rep-profile-name">{user.nombre}</div>
          <div className="rep-profile-role">{user.rol}</div>
          <span className="rep-badge rep-badge-green rep-status-badge">
            ● {c.disponible ? "Disponible" : "No disponible"}
          </span>
        </div>
        <ChevronRight size={18} color="#9ca3af" />
      </button>

      <h3 className="rep-section-title-sm">Detalles de la cuenta</h3>
      <div className="rep-menu-list">
        <div className="rep-info-row">
          <span className="rep-info-icon">
            <Mail size={17} />
          </span>
          <div className="rep-info-text">
            <span className="rep-info-label">Correo electrónico</span>
            <span className="rep-info-value">{c.correo}</span>
          </div>
        </div>
        <div className="rep-info-row">
          <span className="rep-info-icon">
            <Phone size={17} />
          </span>
          <div className="rep-info-text">
            <span className="rep-info-label">Teléfono</span>
            <span className="rep-info-value">{c.telefono}</span>
          </div>
        </div>
        <div className="rep-info-row rep-info-row-last">
          <span className="rep-info-icon">
            <CalendarDays size={17} />
          </span>
          <div className="rep-info-text">
            <span className="rep-info-label">Fecha de registro</span>
            <span className="rep-info-value">{c.fechaRegistro}</span>
          </div>
        </div>
      </div>

      <h3 className="rep-section-title-sm">Métodos de pago</h3>
      <div className="rep-menu-list">
        <button type="button" className="rep-menu-row">
          <span className="rep-info-icon">
            <CreditCard size={17} />
          </span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Tarjetas guardadas</span>
            <span className="rep-menu-sublabel">
              {c.tarjetasGuardadas} tarjeta
            </span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
        <button type="button" className="rep-menu-row">
          <span className="rep-info-icon">
            <Plus size={17} />
          </span>
          <span className="rep-menu-label">Añadir método de pago</span>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
      </div>

      <h3 className="rep-section-title-sm">Datos de facturación</h3>
      <div className="rep-menu-list">
        <button type="button" className="rep-menu-row">
          <span className="rep-info-icon">
            <MapPin size={17} />
          </span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Dirección de facturación</span>
            <span className="rep-menu-sublabel">{c.direccionFacturacion}</span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
      </div>

      <h3 className="rep-section-title-sm">Preferencias de comunicación</h3>
      <div className="rep-menu-list">
        <div className="rep-toggle-row">
          <span className="rep-info-icon">
            <Bell size={17} />
          </span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Recibir notificaciones</span>
            <span className="rep-menu-sublabel">
              Pedidos, cambios y avisos importantes
            </span>
          </div>
          <button
            type="button"
            className={
              c.recibirNotificaciones ? "toggle-switch active" : "toggle-switch"
            }
            aria-label="Activar/desactivar notificaciones"
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>
    </div>
  );
}

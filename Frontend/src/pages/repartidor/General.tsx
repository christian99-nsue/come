import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, Mail, Settings, Bell, ChevronRight } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

export default function General() {
  const navigate = useNavigate();
  const [disponible, setDisponible] = useState(true);
  const [sonido, setSonido] = useState(true);

  return (
    <div className="rep-page">
      <section className="rep-header">
        <button type="button" className="rep-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <h1 className="rep-title">General</h1>
      </section>

      <h3 className="rep-section-title-sm">Información personal</h3>
      <div className="rep-menu-list">
        <button type="button" className="rep-menu-row" onClick={() => navigate("/repartidor/editar-perfil")}>
          <span className="rep-info-icon"><User size={17} /></span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Nombre</span>
            <span className="rep-menu-sublabel">Carlos Martínez</span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
        <button type="button" className="rep-menu-row" onClick={() => navigate("/repartidor/editar-perfil")}>
          <span className="rep-info-icon"><Phone size={17} /></span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Teléfono</span>
            <span className="rep-menu-sublabel">+240 555 987 654</span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
        <button type="button" className="rep-menu-row" onClick={() => navigate("/repartidor/editar-perfil")}>
          <span className="rep-info-icon"><Mail size={17} /></span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Correo electrónico</span>
            <span className="rep-menu-sublabel">carlos.martinez@ejemplo.com</span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
      </div>

      <h3 className="rep-section-title-sm">Disponibilidad</h3>
      <div className="rep-menu-list">
        <div className="rep-toggle-row">
          <span className="rep-info-icon"><Settings size={17} /></span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Estado de disponibilidad</span>
            <span className="rep-menu-sublabel">Recibirás pedidos para entregar</span>
          </div>
          <button
            type="button"
            className={disponible ? "toggle-switch active" : "toggle-switch"}
            onClick={() => setDisponible((v) => !v)}
            aria-label="Activar/desactivar disponibilidad"
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      <h3 className="rep-section-title-sm">Notificaciones</h3>
      <div className="rep-menu-list">
        <div className="rep-toggle-row">
          <span className="rep-info-icon"><Bell size={17} /></span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Sonido de notificaciones</span>
            <span className="rep-menu-sublabel">Activa o desactiva el sonido</span>
          </div>
          <button
            type="button"
            className={sonido ? "toggle-switch active" : "toggle-switch"}
            onClick={() => setSonido((v) => !v)}
            aria-label="Activar/desactivar sonido"
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>
    </div>
  );
}

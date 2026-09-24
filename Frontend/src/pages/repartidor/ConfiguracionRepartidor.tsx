import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  Globe,
  Moon,
  Volume2,
  Vibrate,
  MapPin,
  Navigation,
  ShieldCheck,
  Fingerprint,
  Lock,
  HelpCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

export default function ConfiguracionRepartidor() {
  const navigate = useNavigate();
  const [sonido, setSonido] = useState(true);
  const [vibracion, setVibracion] = useState(true);
  const [compartirUbicacion, setCompartirUbicacion] = useState(true);
  const [dosFactores, setDosFactores] = useState(true);

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
        <h1 className="rep-title">Configuración</h1>
      </section>

      <h3 className="rep-section-title-sm rep-config-group-title">
        <Settings size={15} /> General
      </h3>
      <div className="rep-menu-list">
        <button type="button" className="rep-menu-row">
          <span className="rep-info-icon">
            <Globe size={17} />
          </span>
          <span className="rep-menu-label">Idioma</span>
          <span className="rep-config-value">Español</span>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
        <button type="button" className="rep-menu-row">
          <span className="rep-info-icon">
            <Moon size={17} />
          </span>
          <span className="rep-menu-label">Tema de aplicación</span>
          <span className="rep-config-value">Claro</span>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
        <div className="rep-toggle-row">
          <span className="rep-info-icon">
            <Volume2 size={17} />
          </span>
          <span className="rep-menu-label">Sonido de notificaciones</span>
          <button
            type="button"
            className={sonido ? "toggle-switch active" : "toggle-switch"}
            onClick={() => setSonido((v) => !v)}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        <div className="rep-toggle-row">
          <span className="rep-info-icon">
            <Vibrate size={17} />
          </span>
          <span className="rep-menu-label">Vibración</span>
          <button
            type="button"
            className={vibracion ? "toggle-switch active" : "toggle-switch"}
            onClick={() => setVibracion((v) => !v)}
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      <h3 className="rep-section-title-sm rep-config-group-title">
        <MapPin size={15} /> Ubicación y entrega
      </h3>
      <div className="rep-menu-list">
        <div className="rep-toggle-row">
          <span className="rep-info-icon">
            <MapPin size={17} />
          </span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Compartir ubicación</span>
            <span className="rep-menu-sublabel">
              Para mejorar la precisión de las entregas
            </span>
          </div>
          <button
            type="button"
            className={
              compartirUbicacion ? "toggle-switch active" : "toggle-switch"
            }
            onClick={() => setCompartirUbicacion((v) => !v)}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        <button type="button" className="rep-menu-row">
          <span className="rep-info-icon">
            <Navigation size={17} />
          </span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Navegación externa</span>
            <span className="rep-menu-sublabel">Abrir en Google Maps</span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
      </div>

      <h3 className="rep-section-title-sm rep-config-group-title">
        <ShieldCheck size={15} /> Privacidad y seguridad
      </h3>
      <div className="rep-menu-list">
        <div className="rep-toggle-row">
          <span className="rep-info-icon">
            <Fingerprint size={17} />
          </span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Autenticación en dos pasos</span>
            <span className="rep-menu-sublabel">
              Mayor seguridad para tu cuenta
            </span>
          </div>
          <button
            type="button"
            className={dosFactores ? "toggle-switch active" : "toggle-switch"}
            onClick={() => setDosFactores((v) => !v)}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        <button type="button" className="rep-menu-row">
          <span className="rep-info-icon">
            <Lock size={17} />
          </span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Bloqueo de aplicación</span>
            <span className="rep-menu-sublabel">Usa huella o PIN</span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
      </div>

      <h3 className="rep-section-title-sm rep-config-group-title">
        <HelpCircle size={15} /> Soporte
      </h3>
      <div className="rep-menu-list">
        <button
          type="button"
          className="rep-menu-row"
          onClick={() => navigate("/repartidor/centro-ayuda")}
        >
          <span className="rep-info-icon">
            <HelpCircle size={17} />
          </span>
          <span className="rep-menu-label">Ayuda y soporte</span>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
        <button type="button" className="rep-menu-row">
          <span className="rep-info-icon">
            <FileText size={17} />
          </span>
          <span className="rep-menu-label">Términos y condiciones</span>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
      </div>
    </div>
  );
}

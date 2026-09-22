import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon, MonitorSmartphone, Battery } from "lucide-react";
import "../../styles/cliente/TemaAplicacion.css";

type Tema = "claro" | "oscuro" | "automatico";

export default function TemaAplicacion() {
  const navigate = useNavigate();
  const [tema, setTema] = useState<Tema>("claro");

  return (
    <div className="tema-page">
      <section className="tema-header">
        <button
          type="button"
          className="tema-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="tema-title">Tema de aplicación</h1>
      </section>

      <div className="tema-list">
        <button
          type="button"
          className={tema === "claro" ? "tema-option active" : "tema-option"}
          onClick={() => setTema("claro")}
        >
          <span className="tema-option-icon">
            <Sun size={18} />
          </span>
          <div className="tema-option-text">
            <span className="tema-option-title">Claro</span>
            <span className="tema-option-subtitle">
              El tema clásico, con fondo claro y textos oscuros.
            </span>
            <div className="tema-preview tema-preview-claro">
              <span className="tema-preview-dot" />
              <span className="tema-preview-line" />
            </div>
          </div>
          <span
            className={tema === "claro" ? "tema-radio active" : "tema-radio"}
          />
        </button>

        <button
          type="button"
          className={tema === "oscuro" ? "tema-option active" : "tema-option"}
          onClick={() => setTema("oscuro")}
        >
          <span className="tema-option-icon">
            <Moon size={18} />
          </span>
          <div className="tema-option-text">
            <span className="tema-option-title">Oscuro</span>
            <span className="tema-option-subtitle">
              Reduce la fatiga visual, ideal para la noche.
            </span>
            <div className="tema-preview tema-preview-oscuro">
              <span className="tema-preview-dot" />
              <span className="tema-preview-line" />
            </div>
          </div>
          <span
            className={tema === "oscuro" ? "tema-radio active" : "tema-radio"}
          />
        </button>

        <button
          type="button"
          className={
            tema === "automatico" ? "tema-option active" : "tema-option"
          }
          onClick={() => setTema("automatico")}
        >
          <span className="tema-option-icon">
            <MonitorSmartphone size={18} />
          </span>
          <div className="tema-option-text">
            <span className="tema-option-title">Automático</span>
            <span className="tema-option-subtitle">
              Se adapta al tema de tu dispositivo.
            </span>
            <div className="tema-preview tema-preview-oscuro">
              <span className="tema-preview-dot" />
              <span className="tema-preview-line" />
            </div>
          </div>
          <span
            className={
              tema === "automatico" ? "tema-radio active" : "tema-radio"
            }
          />
        </button>
      </div>

      <div className="tema-note">
        <Battery size={16} className="tema-note-icon" />
        El tema oscuro puede ayudar a ahorrar batería en algunos dispositivos.
      </div>
    </div>
  );
}

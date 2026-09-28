import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

type Tema = "claro" | "oscuro";

export default function TemaAplicacionRepartidor() {
  const navigate = useNavigate();
  const [tema, setTema] = useState<Tema>("oscuro");

  const guardarCambios = () => {
    // TODO: PATCH /api/repartidores/:id/preferencias { tema }
    navigate(-1);
  };

  return (
    <div className="rep-page">
      <section className="rep-header">
        <button type="button" className="rep-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <h1 className="rep-title">Tema de aplicación</h1>
      </section>

      <p className="rep-page-subtitle">Elige el tema que más te guste</p>

      <div className="rep-menu-list">
        <button
          type="button"
          className={tema === "claro" ? "rep-radio-card active" : "rep-radio-card"}
          onClick={() => setTema("claro")}
        >
          <span className="rep-radio-icon"><Sun size={18} /></span>
          <div className="rep-radio-text">
            <span className="rep-radio-title">Claro</span>
            <span className="rep-radio-subtitle">Interfaz con fondos claros y textos oscuros.</span>
          </div>
          <span className={tema === "claro" ? "rep-radio-dot active" : "rep-radio-dot"} />
        </button>

        <button
          type="button"
          className={tema === "oscuro" ? "rep-radio-card active" : "rep-radio-card"}
          onClick={() => setTema("oscuro")}
        >
          <span className="rep-radio-icon"><Moon size={18} /></span>
          <div className="rep-radio-text">
            <span className="rep-radio-title">Oscuro</span>
            <span className="rep-radio-subtitle">Reduce la fatiga visual, ideal para la noche.</span>
          </div>
          <span className={tema === "oscuro" ? "rep-radio-dot active" : "rep-radio-dot"} />
        </button>
      </div>

      <div className="rep-theme-preview-row">
        <div className="rep-theme-preview rep-theme-preview-light">
          <span className="rep-theme-preview-dot" />
          <span className="rep-theme-preview-line" />
          <span className="rep-theme-preview-line short" />
        </div>
        <div className="rep-theme-preview rep-theme-preview-dark">
          <span className="rep-theme-preview-dot" />
          <span className="rep-theme-preview-line" />
          <span className="rep-theme-preview-line short" />
        </div>
      </div>

      <button type="button" className="rep-btn-primary" onClick={guardarCambios}>
        Guardar cambios
      </button>
    </div>
  );
}

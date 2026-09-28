import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Navigation, Info } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

type App = "google_maps" | "waze";

export default function NavegacionExterna() {
  const navigate = useNavigate();
  const [app, setApp] = useState<App>("google_maps");

  const guardarCambios = () => {
    // TODO: PATCH /api/repartidores/:id/preferencias { navegacion: app }
    navigate(-1);
  };

  return (
    <div className="rep-page">
      <section className="rep-header">
        <button type="button" className="rep-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <h1 className="rep-title">Navegación externa</h1>
      </section>

      <p className="rep-page-subtitle">Abrir en</p>

      <div className="rep-menu-list">
        <button
          type="button"
          className={app === "google_maps" ? "rep-radio-card active" : "rep-radio-card"}
          onClick={() => setApp("google_maps")}
        >
          <span className="rep-radio-icon"><Navigation size={18} /></span>
          <div className="rep-radio-text">
            <span className="rep-radio-title">Google Maps</span>
            <span className="rep-radio-subtitle">Se abrirá la ruta en Google Maps.</span>
          </div>
          <span className={app === "google_maps" ? "rep-radio-dot active" : "rep-radio-dot"} />
        </button>

        <button
          type="button"
          className={app === "waze" ? "rep-radio-card active" : "rep-radio-card"}
          onClick={() => setApp("waze")}
        >
          <span className="rep-radio-icon"><Navigation size={18} /></span>
          <div className="rep-radio-text">
            <span className="rep-radio-title">Waze</span>
            <span className="rep-radio-subtitle">Se abrirá la ruta en Waze.</span>
          </div>
          <span className={app === "waze" ? "rep-radio-dot active" : "rep-radio-dot"} />
        </button>
      </div>

      <div className="rep-inline-note rep-note-box">
        <Info size={16} className="rep-inline-note-icon" />
        Puedes cambiar esta opción en cualquier momento desde la configuración.
      </div>

      <button type="button" className="rep-btn-primary" onClick={guardarCambios}>
        Guardar cambios
      </button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Navigation, Info } from "lucide-react";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import {
  leerCache,
  cargarPreferencias,
  guardarPreferencias,
  type Navegacion,
} from "../../utils/preferenciasRepartidor";
import "../../styles/repartidor/RepartidorShared.css";

export default function NavegacionExterna() {
  const navigate = useNavigate();

  const [guardado, setGuardado] = useState<Navegacion>(
    leerCache().navegacion_externa,
  );
  const [app, setApp] = useState<Navegacion>(leerCache().navegacion_externa);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPreferencias()
      .then((p) => {
        setGuardado(p.navegacion_externa);
        setApp(p.navegacion_externa);
      })
      .catch(() => {});
  }, []);

  const guardarCambios = async () => {
    setGuardando(true);
    setError("");
    try {
      await guardarPreferencias({ navegacion_externa: app });
      setMostrarExito(true);
    } catch {
      setError("No se pudo guardar la opción");
    } finally {
      setGuardando(false);
    }
  };

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
        <h1 className="rep-title">Navegación externa</h1>
      </section>

      <p className="rep-page-subtitle">Abrir en</p>

      <div className="rep-menu-list">
        <button
          type="button"
          className={
            app === "google_maps" ? "rep-radio-card active" : "rep-radio-card"
          }
          onClick={() => setApp("google_maps")}
        >
          <span className="rep-radio-icon">
            <Navigation size={18} />
          </span>
          <div className="rep-radio-text">
            <span className="rep-radio-title">Google Maps</span>
            <span className="rep-radio-subtitle">
              Se abrirá la ruta en Google Maps.
            </span>
          </div>
          <span
            className={
              app === "google_maps" ? "rep-radio-dot active" : "rep-radio-dot"
            }
          />
        </button>

        <button
          type="button"
          className={
            app === "maps" ? "rep-radio-card active" : "rep-radio-card"
          }
          onClick={() => setApp("maps")}
        >
          <span className="rep-radio-icon">
            <Navigation size={18} />
          </span>
          <div className="rep-radio-text">
            <span className="rep-radio-title">Maps</span>
            <span className="rep-radio-subtitle">
              Se abrirá la ruta en Maps (Apple).
            </span>
          </div>
          <span
            className={
              app === "maps" ? "rep-radio-dot active" : "rep-radio-dot"
            }
          />
        </button>
      </div>

      <div className="rep-inline-note rep-note-box">
        <Info size={16} className="rep-inline-note-icon" />
        Puedes cambiar esta opción en cualquier momento desde la configuración.
      </div>

      {error && <p className="rep-status-text rep-status-error">{error}</p>}

      <button
        type="button"
        className="rep-btn-primary"
        onClick={guardarCambios}
        disabled={guardando || app === guardado}
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>

      <CambiosGuardadosOverlay
        open={mostrarExito}
        onContinuar={() =>
          navigate("/repartidor/configuracion", { replace: true })
        }
      />
    </div>
  );
}

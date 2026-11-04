import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import {
  aplicarTema,
  leerCache,
  cargarPreferencias,
  guardarPreferencias,
  type Tema,
} from "../../utils/preferenciasRepartidor";
import "../../styles/repartidor/RepartidorShared.css";

export default function TemaAplicacionRepartidor() {
  const navigate = useNavigate();

  const [guardado, setGuardado] = useState<Tema>(leerCache().tema);
  const [tema, setTema] = useState<Tema>(leerCache().tema);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPreferencias()
      .then((p) => {
        setGuardado(p.tema);
        setTema(p.tema);
      })
      .catch(() => {});

    // Si sales sin guardar, vuelve al tema que tenías guardado
    return () => aplicarTema(leerCache().tema);
  }, []);

  // Se ve en vivo al elegir, antes de guardar
  const elegir = (nuevo: Tema) => {
    setTema(nuevo);
    aplicarTema(nuevo);
  };

  const guardarCambios = async () => {
    setGuardando(true);
    setError("");
    try {
      await guardarPreferencias({ tema });
      setMostrarExito(true);
    } catch {
      setError("No se pudo guardar el tema");
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
        <h1 className="rep-title">Tema de aplicación</h1>
      </section>

      <p className="rep-page-subtitle">Elige el tema que más te guste</p>

      <div className="rep-menu-list">
        <button
          type="button"
          className={
            tema === "claro" ? "rep-radio-card active" : "rep-radio-card"
          }
          onClick={() => elegir("claro")}
        >
          <span className="rep-radio-icon">
            <Sun size={18} />
          </span>
          <div className="rep-radio-text">
            <span className="rep-radio-title">Claro</span>
            <span className="rep-radio-subtitle">
              Interfaz con fondos claros y textos oscuros.
            </span>
          </div>
          <span
            className={
              tema === "claro" ? "rep-radio-dot active" : "rep-radio-dot"
            }
          />
        </button>

        <button
          type="button"
          className={
            tema === "oscuro" ? "rep-radio-card active" : "rep-radio-card"
          }
          onClick={() => elegir("oscuro")}
        >
          <span className="rep-radio-icon">
            <Moon size={18} />
          </span>
          <div className="rep-radio-text">
            <span className="rep-radio-title">Oscuro</span>
            <span className="rep-radio-subtitle">
              Reduce la fatiga visual, ideal para la noche.
            </span>
          </div>
          <span
            className={
              tema === "oscuro" ? "rep-radio-dot active" : "rep-radio-dot"
            }
          />
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

      {error && <p className="rep-status-text rep-status-error">{error}</p>}

      <button
        type="button"
        className="rep-btn-primary"
        onClick={guardarCambios}
        disabled={guardando || tema === guardado}
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

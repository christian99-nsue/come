import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import {
  leerCache,
  cargarPreferencias,
  guardarPreferencias,
  type Idioma,
} from "../../utils/preferenciasRepartidor";
import "../../styles/repartidor/RepartidorShared.css";

const idiomas: { id: Idioma; nombre: string; bandera: string }[] = [
  { id: "es", nombre: "Español", bandera: "🇪🇸" },
  { id: "en", nombre: "Inglés", bandera: "🇬🇧" },
  { id: "fr", nombre: "Francés", bandera: "🇫🇷" },
];

export default function IdiomaRepartidor() {
  const navigate = useNavigate();

  const [guardado, setGuardado] = useState<Idioma>(leerCache().idioma);
  const [seleccionado, setSeleccionado] = useState<Idioma>(leerCache().idioma);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPreferencias()
      .then((p) => {
        setGuardado(p.idioma);
        setSeleccionado(p.idioma);
      })
      .catch(() => {});
  }, []);

  const guardarCambios = async () => {
    setGuardando(true);
    setError("");
    try {
      await guardarPreferencias({ idioma: seleccionado });
      setMostrarExito(true);
    } catch {
      setError("No se pudo guardar el idioma");
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
        <h1 className="rep-title">Idioma</h1>
      </section>

      <p className="rep-page-subtitle">Selecciona tu idioma</p>

      <div className="rep-menu-list">
        {idiomas.map((idioma) => (
          <button
            key={idioma.id}
            type="button"
            className="rep-lang-row"
            onClick={() => setSeleccionado(idioma.id)}
          >
            <span className="rep-lang-flag">{idioma.bandera}</span>
            <span className="rep-menu-label">{idioma.nombre}</span>
            <span
              className={
                seleccionado === idioma.id
                  ? "rep-radio-dot active"
                  : "rep-radio-dot"
              }
            />
          </button>
        ))}
      </div>

      {error && <p className="rep-status-text rep-status-error">{error}</p>}

      <button
        type="button"
        className="rep-btn-primary"
        onClick={guardarCambios}
        disabled={guardando || seleccionado === guardado}
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

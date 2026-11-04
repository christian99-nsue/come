import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, CircleDot, Zap, Info } from "lucide-react";
import {
  aplicarPreferencias,
  leerCache,
  cargarPreferencias,
  guardarPreferencias,
  type PreferenciasCliente,
  type TamanoTexto,
} from "../../utils/preferenciasCliente";
import "../../styles/cliente/Accesibilidad.css";

const tamanos: { id: TamanoTexto; label: string; size: number }[] = [
  { id: "pequeno", label: "Pequeño", size: 12 },
  { id: "normal", label: "Normal", size: 14 },
  { id: "grande", label: "Grande", size: 16 },
  { id: "muy_grande", label: "Muy grande", size: 18 },
];

export default function Accesibilidad() {
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState<PreferenciasCliente>(leerCache());
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPreferencias()
      .then(setPrefs)
      .catch(() => {});
  }, []);

  const cambiar = async (cambio: Partial<PreferenciasCliente>) => {
    const anterior = prefs;
    const nuevo = { ...prefs, ...cambio };

    setPrefs(nuevo);
    aplicarPreferencias(nuevo); // se ve al instante
    setError("");

    try {
      setPrefs(await guardarPreferencias(cambio));
    } catch {
      // Si el servidor falla, todo vuelve a como estaba
      setPrefs(anterior);
      aplicarPreferencias(anterior);
      setError("No se pudo guardar tu preferencia");
    }
  };

  return (
    <div className="accesibilidad-page">
      <section className="accesibilidad-header">
        <button
          type="button"
          className="accesibilidad-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="accesibilidad-title">Accesibilidad</h1>
      </section>

      <h3 className="accesibilidad-section-title">Tamaño de texto</h3>
      <div className="accesibilidad-list">
        {tamanos.map((t) => (
          <button
            key={t.id}
            type="button"
            className="accesibilidad-row"
            onClick={() => cambiar({ tamano_texto: t.id })}
          >
            <span className="accesibilidad-aa" style={{ fontSize: t.size }}>
              Aa
            </span>
            <span className="accesibilidad-label">{t.label}</span>
            <span
              className={
                prefs.tamano_texto === t.id
                  ? "accesibilidad-radio active"
                  : "accesibilidad-radio"
              }
            />
          </button>
        ))}
      </div>

      <h3 className="accesibilidad-section-title">Contraste</h3>
      <div className="accesibilidad-list">
        <button
          type="button"
          className="accesibilidad-row"
          onClick={() => cambiar({ alto_contraste: false })}
        >
          <span className="accesibilidad-icon">
            <Sun size={18} />
          </span>
          <span className="accesibilidad-label">Normal</span>
          <span
            className={
              !prefs.alto_contraste
                ? "accesibilidad-radio active"
                : "accesibilidad-radio"
            }
          />
        </button>
        <button
          type="button"
          className="accesibilidad-row"
          onClick={() => cambiar({ alto_contraste: true })}
        >
          <span className="accesibilidad-icon">
            <CircleDot size={18} />
          </span>
          <span className="accesibilidad-label">Alto contraste</span>
          <span
            className={
              prefs.alto_contraste
                ? "accesibilidad-radio active"
                : "accesibilidad-radio"
            }
          />
        </button>
      </div>

      <div className="accesibilidad-list">
        <div className="accesibilidad-row-toggle">
          <span className="accesibilidad-icon">
            <Zap size={18} />
          </span>
          <div className="accesibilidad-toggle-text">
            <span className="accesibilidad-label">Reducir movimiento</span>
            <span className="accesibilidad-subtitle">
              Disminuye las animaciones y apaga el avance automático de los
              banners.
            </span>
          </div>
          <button
            type="button"
            className={
              prefs.reducir_movimiento
                ? "toggle-switch active"
                : "toggle-switch"
            }
            onClick={() =>
              cambiar({ reducir_movimiento: !prefs.reducir_movimiento })
            }
            aria-label="Activar o desactivar reducir movimiento"
            aria-pressed={prefs.reducir_movimiento}
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      {error && <p className="accesibilidad-error">{error}</p>}

      <div className="accesibilidad-note">
        <Info size={16} className="accesibilidad-note-icon" />
        El tamaño de texto amplía toda la interfaz, no solo las letras.
      </div>
    </div>
  );
}

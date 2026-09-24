import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, CircleDot, Zap, Eye, Info } from "lucide-react";
import "../../styles/cliente/Accesibilidad.css";

type TamanoTexto = "pequeno" | "normal" | "grande" | "muy_grande";
type Contraste = "normal" | "alto";

export default function Accesibilidad() {
  const navigate = useNavigate();
  const [tamanoTexto, setTamanoTexto] = useState<TamanoTexto>("normal");
  const [contraste, setContraste] = useState<Contraste>("normal");
  const [reduceMovimiento, setReduceMovimiento] = useState(false);
  const [modoDaltonismo, setModoDaltonismo] = useState(false);

  const opcionesTamano: { id: TamanoTexto; label: string; size: number }[] = [
    { id: "pequeno", label: "Pequeño", size: 12 },
    { id: "normal", label: "Normal", size: 14 },
    { id: "grande", label: "Grande", size: 16 },
    { id: "muy_grande", label: "Muy grande", size: 18 },
  ];

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
        {opcionesTamano.map((op) => (
          <button
            key={op.id}
            type="button"
            className="accesibilidad-row"
            onClick={() => setTamanoTexto(op.id)}
          >
            <span className="accesibilidad-aa" style={{ fontSize: op.size }}>
              Aa
            </span>
            <span className="accesibilidad-label">{op.label}</span>
            <span
              className={
                tamanoTexto === op.id
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
          onClick={() => setContraste("normal")}
        >
          <span className="accesibilidad-icon">
            <Sun size={18} />
          </span>
          <span className="accesibilidad-label">Normal</span>
          <span
            className={
              contraste === "normal"
                ? "accesibilidad-radio active"
                : "accesibilidad-radio"
            }
          />
        </button>
        <button
          type="button"
          className="accesibilidad-row"
          onClick={() => setContraste("alto")}
        >
          <span className="accesibilidad-icon">
            <CircleDot size={18} />
          </span>
          <span className="accesibilidad-label">Alto contraste</span>
          <span
            className={
              contraste === "alto"
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
            <span className="accesibilidad-label">Reduce movimiento</span>
            <span className="accesibilidad-subtitle">
              Disminuye las animaciones y efectos en la app.
            </span>
          </div>
          <button
            type="button"
            className={
              reduceMovimiento ? "toggle-switch active" : "toggle-switch"
            }
            onClick={() => setReduceMovimiento((v) => !v)}
            aria-label="Activar/desactivar reducir movimiento"
          >
            <span className="toggle-knob" />
          </button>
        </div>

        <div className="accesibilidad-row-toggle">
          <span className="accesibilidad-icon">
            <Eye size={18} />
          </span>
          <div className="accesibilidad-toggle-text">
            <span className="accesibilidad-label">Modo de daltonismo</span>
            <span className="accesibilidad-subtitle">
              Mejora la visualización de colores para personas con daltonismo.
            </span>
          </div>
          <button
            type="button"
            className={
              modoDaltonismo ? "toggle-switch active" : "toggle-switch"
            }
            onClick={() => setModoDaltonismo((v) => !v)}
            aria-label="Activar/desactivar modo de daltonismo"
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      <div className="accesibilidad-note">
        <Info size={16} className="accesibilidad-note-icon" />
        Estas opciones te ayudarán a tener una mejor experiencia en la app.
      </div>
    </div>
  );
}

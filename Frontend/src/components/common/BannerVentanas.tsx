import { useState } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useVentanas } from "../../hooks/useVentanas";
import { mensajeBanner, textoCierre } from "../../utils/ventanas";
import "../../styles/common/VentanasEntrega.css";

export default function BannerVentanas() {
  const { ventanas, hoy } = useVentanas();
  const [abierto, setAbierto] = useState(false);

  // Mientras carga, o si no se pudo cargar, no se enseña nada: no se alarma por algo que no se sabe
  if (!ventanas) return null;

  const m = mensajeBanner(ventanas, hoy);

  return (
    <div className={`vent-banner ${m.tipo}`}>
      <div className="vent-banner-top">
        <Clock size={18} className="vent-banner-icon" />
        <div className="vent-banner-text">
          <strong>{m.titulo}</strong>
          <span>{m.detalle}</span>
        </div>
        {ventanas.length > 1 && (
          <button
            type="button"
            className="vent-banner-btn"
            onClick={() => setAbierto((a) => !a)}
          >
            {abierto ? "Ocultar" : "Ver todas"}{" "}
            {abierto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {abierto && (
        <div className="vent-banner-lista">
          {ventanas.map((v) => (
            <div
              key={`${v.ventana_id}-${v.fecha}`}
              className="vent-banner-item"
            >
              <span className="vent-banner-dia">{v.etiqueta_dia}</span>
              <span className="vent-banner-rango">
                {v.inicio}–{v.fin}
              </span>
              <span className="vent-banner-cierre">{textoCierre(v, hoy)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

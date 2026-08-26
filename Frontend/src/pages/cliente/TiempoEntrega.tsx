import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bike, Zap, CalendarClock } from "lucide-react";
import "../../styles/tiempoEntrega.css";
import delivery from "../../assets/delivery.jfif";

type OpcionEntrega = "estandar" | "rapida" | "programada";

const subtotal = 3500;

function formatXAF(valor: number) {
  return `${valor.toLocaleString("es-ES")} XAF`;
}

const costosPorOpcion: Record<OpcionEntrega, number> = {
  estandar: 0,
  rapida: 2000,
  programada: 0,
};

export default function TiempoEntrega() {
  const navigate = useNavigate();
  const [opcion, setOpcion] = useState<OpcionEntrega>("estandar");

  const costoEnvio = costosPorOpcion[opcion];
  const total = subtotal + costoEnvio;

  return (
    <div className="tiempo-page">
      <section className="tiempo-header">
        <button
          type="button"
          className="tiempo-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="tiempo-title">Tiempo de entrega</h1>
      </section>

      <div className="tiempo-hero">
        <img src={delivery} alt="Repartidor" className="tiempo-hero-img" />
        <h2 className="tiempo-hero-title">Selecciona el tiempo de entrega</h2>
        <p className="tiempo-hero-subtitle">
          Elige la opción que mejor se adapte a ti
        </p>
      </div>

      <div className="tiempo-options">
        <button
          type="button"
          className={
            opcion === "estandar" ? "tiempo-option active" : "tiempo-option"
          }
          onClick={() => setOpcion("estandar")}
        >
          <span className="tiempo-option-icon">
            <Bike size={20} />
          </span>
          <div className="tiempo-option-text">
            <span className="tiempo-option-title">Entrega estándar</span>
            <span className="tiempo-option-subtitle">20-30 min</span>
          </div>
          <span className="tiempo-option-price">
            {formatXAF(costosPorOpcion.estandar)}
          </span>
          <span
            className={
              opcion === "estandar" ? "tiempo-radio active" : "tiempo-radio"
            }
          />
        </button>

        <button
          type="button"
          className={
            opcion === "rapida" ? "tiempo-option active" : "tiempo-option"
          }
          onClick={() => setOpcion("rapida")}
        >
          <span className="tiempo-option-icon">
            <Zap size={20} />
          </span>
          <div className="tiempo-option-text">
            <span className="tiempo-option-title">Entrega rápida</span>
            <span className="tiempo-option-subtitle">10-15 min</span>
          </div>
          <span className="tiempo-option-price">
            {formatXAF(costosPorOpcion.rapida)}
          </span>
          <span
            className={
              opcion === "rapida" ? "tiempo-radio active" : "tiempo-radio"
            }
          />
        </button>

        <button
          type="button"
          className={
            opcion === "programada" ? "tiempo-option active" : "tiempo-option"
          }
          onClick={() => setOpcion("programada")}
        >
          <span className="tiempo-option-icon">
            <CalendarClock size={20} />
          </span>
          <div className="tiempo-option-text">
            <span className="tiempo-option-title">Programar entrega</span>
            <span className="tiempo-option-subtitle">Elige fecha y hora</span>
          </div>
          <span className="tiempo-option-price">Gratis</span>
          <span
            className={
              opcion === "programada" ? "tiempo-radio active" : "tiempo-radio"
            }
          />
        </button>
      </div>

      <p className="tiempo-note">
        Los tiempos son estimados y pueden variar según la ubicación y el
        tráfico.
      </p>

      <div className="tiempo-summary">
        <div className="tiempo-summary-row">
          <span>Subtotal</span>
          <span>{formatXAF(subtotal)}</span>
        </div>
        <div className="tiempo-summary-row">
          <span>Costo de envío</span>
          <span>{formatXAF(costoEnvio)}</span>
        </div>
        <div className="tiempo-summary-row tiempo-summary-total">
          <span>Total</span>
          <span>{formatXAF(total)}</span>
        </div>
      </div>

      <div className="tiempo-bottom-bar">
        <button
          type="button"
          className="tiempo-view-cart"
          onClick={() => navigate("/cliente/carrito")}
        >
          <span className="tiempo-cart-badge">3</span>
          Ver carrito · 3 productos · {formatXAF(total)}
        </button>
        <button
          type="button"
          className="tiempo-continue-btn"
          onClick={() => navigate("/cliente/finalizar-pedido")}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

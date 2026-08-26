import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Briefcase, Plus } from "lucide-react";
import "../../styles/direccionEntrega.css";


interface Direccion {
  id: string;
  etiqueta: string;
  icono: "casa" | "trabajo";
  linea1: string;
  linea2: string;
}

const direccionesMock: Direccion[] = [
  {
    id: "casa",
    etiqueta: "Casa",
    icono: "casa",
    linea1: "Calle Mayor 12, Piso 2B",
    linea2: "Malabo, Guinea Ecuatorial",
  },
  {
    id: "trabajo",
    etiqueta: "Trabajo",
    icono: "trabajo",
    linea1: "Edificio Banco BEAC, Planta 3",
    linea2: "Malabo, Guinea Ecuatorial",
  },
];

const subtotal = 3500;
const costoEnvio = 0;

function formatXAF(valor: number) {
  return `${valor.toLocaleString("es-ES")} XAF`;
}

export default function DireccionEntrega() {
  const navigate = useNavigate();
  const [direccionActiva, setDireccionActiva] = useState("casa");
  const [instrucciones, setInstrucciones] = useState("");

  const total = subtotal + costoEnvio;

  return (
    <div className="direccion-page">
      <section className="direccion-header">
        <button
          type="button"
          className="direccion-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="direccion-title">Dirección de entrega</h1>
      </section>

      {/* Mapa (placeholder) */}

      <section className="direccion-section">
        <h3 className="direccion-section-title">Dirección guardada</h3>
        <div className="direccion-list">
          {direccionesMock.map((d) => (
            <button
              key={d.id}
              type="button"
              className="direccion-card"
              onClick={() => setDireccionActiva(d.id)}
            >
              <span className="direccion-card-icon">
                {d.icono === "casa" ? (
                  <Home size={18} />
                ) : (
                  <Briefcase size={18} />
                )}
              </span>
              <div className="direccion-card-info">
                <span className="direccion-card-label">{d.etiqueta}</span>
                <span className="direccion-card-address">{d.linea1}</span>
                <span className="direccion-card-address">{d.linea2}</span>
              </div>
              <span
                className={
                  direccionActiva === d.id
                    ? "direccion-radio active"
                    : "direccion-radio"
                }
              />
            </button>
          ))}
        </div>

        <button type="button" className="direccion-add-btn">
          <span className="direccion-add-icon">
            <Plus size={16} />
          </span>
          Añadir nueva dirección
        </button>
      </section>

      <section className="direccion-section">
        <h3 className="direccion-section-title">
          Instrucciones de entrega (opcional)
        </h3>
        <textarea
          className="direccion-textarea"
          placeholder="Ej: Dejar en la puerta, llamar al llegar, etc."
          maxLength={120}
          value={instrucciones}
          onChange={(e) => setInstrucciones(e.target.value)}
        />
        <span className="direccion-textarea-count">
          {instrucciones.length}/120
        </span>
      </section>

      <div className="direccion-summary">
        <div className="direccion-summary-row">
          <span>Subtotal</span>
          <span>{formatXAF(subtotal)}</span>
        </div>
        <div className="direccion-summary-row">
          <span>Costo de envío</span>
          <span>{formatXAF(costoEnvio)}</span>
        </div>
        <div className="direccion-summary-row direccion-summary-total">
          <span>Total</span>
          <span>{formatXAF(total)}</span>
        </div>
      </div>

      <div className="direccion-bottom-bar">
        <button
          type="button"
          className="direccion-view-cart"
          onClick={() => navigate("/cliente/carrito")}
        >
          <span className="direccion-cart-badge">3</span>
          Ver carrito · 3 productos · {formatXAF(total)}
        </button>
        <button
          type="button"
          className="direccion-continue-btn"
          onClick={() => navigate("/cliente/tiempo-entrega")}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

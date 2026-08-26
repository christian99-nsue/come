import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Tag } from "lucide-react";
import "../../styles/cupon.css";

interface Cupon {
  id: string;
  codigo: string;
  descuento: string;
  descripcion: string;
  validoHasta: string;
}

const cuponesMock: Cupon[] = [
  {
    id: "1",
    codigo: "FOODLINK10",
    descuento: "10%",
    descripcion: "10% de descuento en pedidos mayores a 5.000 XAF",
    validoHasta: "31/12/2026",
  },
  {
    id: "2",
    codigo: "FOODLINK15",
    descuento: "15%",
    descripcion: "15% de descuento en pedidos mayores a 10.000 XAF",
    validoHasta: "31/12/2026",
  },
  {
    id: "3",
    codigo: "FOODLINK20",
    descuento: "20%",
    descripcion: "20% de descuento en pedidos mayores a 15.000 XAF",
    validoHasta: "31/12/2026",
  },
];

const subtotal = 3500;
const costoEnvio = 0;

function formatXAF(valor: number) {
  return `${valor.toLocaleString("es-ES")} XAF`;
}

export default function Cupon() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState<Cupon | null>(null);

  const total = subtotal + costoEnvio;

  const aplicarCodigo = () => {
    const encontrado = cuponesMock.find(
      (c) => c.codigo.toLowerCase() === codigo.trim().toLowerCase(),
    );
    if (encontrado) setCuponAplicado(encontrado);
  };

  return (
    <div className="cupon-page">
      <section className="cupon-header">
        <button
          type="button"
          className="cupon-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="cupon-title">Cupón de descuento</h1>
      </section>

      <div className="cupon-hero">
        <div className="cupon-hero-icon">
          <Tag size={28} />
        </div>
        <h2 className="cupon-hero-title">¿Tienes un cupón?</h2>
        <p className="cupon-hero-subtitle">
          Ingresa tu código y obtén descuentos en tu pedido.
        </p>
      </div>

      <div className="cupon-input-row">
        <div className="cupon-input-wrapper">
          <Ticket size={18} className="cupon-input-icon" />
          <input
            type="text"
            placeholder="Ingresa tu código de cupón"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="cupon-input"
          />
        </div>
        <button
          type="button"
          className="cupon-apply-btn"
          onClick={aplicarCodigo}
        >
          Aplicar
        </button>
      </div>

      {cuponAplicado && (
        <div className="cupon-applied-banner">
          Cupón <strong>{cuponAplicado.codigo}</strong> aplicado (
          {cuponAplicado.descuento} de descuento)
        </div>
      )}

      <section className="cupon-section">
        <h3 className="cupon-section-title">Cupones disponibles</h3>
        <div className="cupon-list">
          {cuponesMock.map((c) => (
            <button
              key={c.id}
              type="button"
              className={
                cuponAplicado?.id === c.id ? "cupon-card active" : "cupon-card"
              }
              onClick={() => {
                setCodigo(c.codigo);
                setCuponAplicado(c);
              }}
            >
              <div className="cupon-card-badge">
                {c.descuento}
                <span>DESC</span>
              </div>
              <div className="cupon-card-info">
                <span className="cupon-card-code">{c.codigo}</span>
                <span className="cupon-card-desc">{c.descripcion}</span>
                <span className="cupon-card-valid">
                  Válido hasta {c.validoHasta}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="cupon-summary">
        <div className="cupon-summary-row">
          <span>Subtotal</span>
          <span>{formatXAF(subtotal)}</span>
        </div>
        <div className="cupon-summary-row">
          <span>Costo de envío</span>
          <span>{formatXAF(costoEnvio)}</span>
        </div>
        <div className="cupon-summary-row cupon-summary-total">
          <span>Total</span>
          <span>{formatXAF(total)}</span>
        </div>
      </div>

      <div className="cupon-bottom-bar">
        <button
          type="button"
          className="cupon-view-cart"
          onClick={() => navigate("/cliente/carrito")}
        >
          <span className="cupon-cart-badge">3</span>
          Ver carrito · 3 productos · {formatXAF(total)}
        </button>
        <button
          type="button"
          className="cupon-continue-btn"
          onClick={() => navigate("/cliente/direccion-entrega")}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

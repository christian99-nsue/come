import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  Clock,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import "../../styles/cliente/finalizarPedido.css";
import burgerHouse from "../../assets/burger-house.jpg";

interface ProductoPedido {
  id: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  imagen: string;
}

const productosMock: ProductoPedido[] = [
  {
    id: "1",
    nombre: "Classic Burger",
    cantidad: 1,
    precioUnitario: 3500,
    imagen: burgerHouse,
  },
];

const direccionEntrega = {
  linea1: "Calle Mayor 12, Piso 2B",
  linea2: "Malabo, Guinea Ecuatorial",
  referencia: "Edificio bantu, timbre 2B",
};

const tiempoEntrega = {
  tipo: "Entrega estándar",
  rango: "20-30 min",
};

const metodoPago = {
  tipo: "Efectivo",
  detalle: "Pagarás en efectivo al recibir tu pedido",
};

const costoEnvio = 0;

function formatXAF(valor: number) {
  return `${valor.toLocaleString("es-ES")} XAF`;
}

export default function FinalizarPedido() {
  const navigate = useNavigate();

  const subtotal = productosMock.reduce(
    (acc, p) => acc + p.precioUnitario * p.cantidad,
    0,
  );
  const total = subtotal + costoEnvio;

  const confirmarPedido = () => {
    // TODO: conectar con POST /api/pedidos (crear el pedido real en el backend)
    navigate("/cliente/pedido-realizado");
  };

  return (
    <div className="finalizar-page">
      {/* Encabezado */}
      <section className="finalizar-header">
        <button
          type="button"
          className="finalizar-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="finalizar-header-text">
          <h1 className="finalizar-title">Finalizar pedido</h1>
          <p className="finalizar-subtitle">
            <Lock size={12} /> Tus datos están seguros
          </p>
        </div>
      </section>

      {/* Banner "¡Casi listo!" */}
      <div className="finalizar-banner">
        <span className="finalizar-banner-icon">
          <ShieldCheck size={24} />
        </span>
        <div className="finalizar-banner-text">
          <span className="finalizar-banner-title">¡Casi listo!</span>
          <span className="finalizar-banner-subtitle">
            Revisa tu pedido y confirma para que podamos prepararlo cuanto
            antes.
          </span>
        </div>
        <span className="finalizar-banner-emoji">
          <ShoppingBag size={34} />
        </span>
      </div>

      {/* Resumen del pedido */}
      <section className="finalizar-section">
        <div className="finalizar-section-header">
          <h3>Resumen del pedido</h3>
          <button
            type="button"
            className="finalizar-edit-btn"
            onClick={() => navigate("/cliente/carrito")}
          >
            Editar
          </button>
        </div>

        <div className="finalizar-product-list">
          {productosMock.map((p) => (
            <div key={p.id} className="finalizar-product-row">
              <img
                src={p.imagen}
                alt={p.nombre}
                className="finalizar-product-img"
              />
              <div className="finalizar-product-info">
                <span className="finalizar-product-name">{p.nombre}</span>
                <span className="finalizar-product-qty">
                  {p.cantidad} x {formatXAF(p.precioUnitario)}
                </span>
              </div>
              <span className="finalizar-product-price">
                {formatXAF(p.precioUnitario * p.cantidad)}
              </span>
            </div>
          ))}
        </div>

        <div className="finalizar-totals">
          <div className="finalizar-totals-row">
            <span>Subtotal</span>
            <span>{formatXAF(subtotal)}</span>
          </div>
          <div className="finalizar-totals-row">
            <span>Costo de envío</span>
            <span>{formatXAF(costoEnvio)}</span>
          </div>
          <div className="finalizar-totals-row finalizar-totals-final">
            <span>Total a pagar</span>
            <span>{formatXAF(total)}</span>
          </div>
        </div>
      </section>

      {/* Dirección de entrega */}
      <button
        type="button"
        className="finalizar-info-card"
        onClick={() => navigate("/cliente/direccion-entrega")}
      >
        <span className="finalizar-info-icon">
          <MapPin size={18} />
        </span>
        <div className="finalizar-info-text">
          <div className="finalizar-info-top">
            <span className="finalizar-info-title">Dirección de entrega</span>
            <span className="finalizar-edit-btn">Editar</span>
          </div>
          <span className="finalizar-info-line">{direccionEntrega.linea1}</span>
          <span className="finalizar-info-line">{direccionEntrega.linea2}</span>
          <span className="finalizar-info-ref">
            Referencia: {direccionEntrega.referencia}
          </span>
        </div>
        <ChevronRight size={18} className="finalizar-chevron" />
      </button>

      {/* Tiempo de entrega */}
      <button
        type="button"
        className="finalizar-info-card"
        onClick={() => navigate("/cliente/tiempo-entrega")}
      >
        <span className="finalizar-info-icon">
          <Clock size={18} />
        </span>
        <div className="finalizar-info-text">
          <div className="finalizar-info-top">
            <span className="finalizar-info-title">Tiempo de entrega</span>
            <span className="finalizar-edit-btn">Editar</span>
          </div>
          <span className="finalizar-info-line">{tiempoEntrega.tipo}</span>
          <span className="finalizar-info-line">{tiempoEntrega.rango}</span>
        </div>
        <ChevronRight size={18} className="finalizar-chevron" />
      </button>

      {/* Método de pago */}
      <button type="button" className="finalizar-info-card">
        <span className="finalizar-info-icon">
          <CreditCard size={18} />
        </span>
        <div className="finalizar-info-text">
          <div className="finalizar-info-top">
            <span className="finalizar-info-title">Método de pago</span>
            <span className="finalizar-edit-btn">Editar</span>
          </div>
          <span className="finalizar-info-line">{metodoPago.tipo}</span>
          <span className="finalizar-info-line">{metodoPago.detalle}</span>
        </div>
        <ChevronRight size={18} className="finalizar-chevron" />
      </button>

      {/* Barra inferior: Total + confirmar */}
      <div className="finalizar-bottom-bar">
        <div className="finalizar-bottom-total">
          <span>Total a pagar</span>
          <span>{formatXAF(total)}</span>
        </div>
        <button
          type="button"
          className="finalizar-confirm-btn"
          onClick={confirmarPedido}
        >
          <Lock size={16} />
          Confirmar y realizar pedido
        </button>
        <p className="finalizar-terms">
          Al confirmar aceptas nuestros{" "}
          <button type="button" className="finalizar-terms-link">
            Términos y Condiciones
          </button>
        </p>
      </div>
    </div>
  );
}

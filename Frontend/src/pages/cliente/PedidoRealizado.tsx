import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
} from "lucide-react";
import "../../styles/cliente/pedidoRealizado.css";
import delivery from "../../assets/delivery.jfif";
import burgerHouse from "../../assets/burger-house.jpg";
import burger from "../../assets/burger1.png";
import { Bell } from "lucide-react";

interface ProductoPedido {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  imagen: string;
}

const productosMock: ProductoPedido[] = [
  {
    id: "1",
    nombre: "Classic Burger",
    cantidad: 1,
    precio: 3500,
    imagen: burgerHouse,
  },
];

const numeroPedido = "#FL-250521-7842";
const subtotal = 3500;
const costoEnvio = 0;
const totalPagado = subtotal + costoEnvio;

function formatXAF(valor: number) {
  return `${valor.toLocaleString("es-ES")} XAF`;
}

export default function PedidoRealizado() {
  const navigate = useNavigate();

  return (
    <div className="realizado-page">
      <div className="realizado-check-wrapper">
        <div className="realizado-check-circle">
          <CheckCircle2 size={40} />
        </div>
      </div>

      <h1 className="realizado-title">¡Pedido realizado!</h1>
      <p className="realizado-subtitle">
        Gracias por tu pedido. Estamos preparándolo con mucho amor para ti.
      </p>

      <div className="realizado-order-number">
        <span className="realizado-order-label">Número de pedido</span>
        <span className="realizado-order-value">{numeroPedido}</span>
      </div>

      {/* Tiempo estimado */}
      <div className="realizado-eta-card">
        <span className="realizado-eta-icon">
          <Clock size={20} />
        </span>
        <div className="realizado-eta-text">
          <span className="realizado-eta-label">
            Tiempo estimado de entrega
          </span>
          <span className="realizado-eta-value">20-30 min</span>
          <span className="realizado-eta-note">
            Te avisaremos cuando tu pedido esté en camino.
          </span>
        </div>
        <img
          src={delivery}
          alt="Repartidor en camino"
          className="realizado-eta-img"
        />
      </div>

      {/* Resumen del pedido */}
      <section className="realizado-section">
        <div className="realizado-section-header">
          <h3>Resumen del pedido</h3>
        </div>

        <div className="realizado-restaurant-row">
          <img
            src={burger}
            alt="Burger House"
            className="realizado-restaurant-logo"
          />
          <div className="realizado-restaurant-info">
            <span className="realizado-restaurant-name">Burger House</span>
            <span className="realizado-restaurant-count">
              {productosMock.length} productos
            </span>
          </div>
          <button type="button" className="realizado-link-btn">
            Ver detalle
          </button>
        </div>

        <div className="realizado-product-list">
          {productosMock.map((p) => (
            <div key={p.id} className="realizado-product-row">
              <img
                src={burgerHouse}
                alt="product-image"
                className="realizado-product-img"
              />

              <span className="realizado-product-qty">{p.cantidad}</span>
              <span className="realizado-product-name">{p.nombre}</span>
              <span className="realizado-product-price">
                {formatXAF(p.precio)}
              </span>
            </div>
          ))}
        </div>

        <div className="realizado-totals">
          <div className="realizado-totals-row">
            <span>Subtotal</span>
            <span>{formatXAF(subtotal)}</span>
          </div>
          <div className="realizado-totals-row">
            <span>Costo de envío</span>
            <span>{formatXAF(costoEnvio)}</span>
          </div>
          <div className="realizado-totals-row realizado-totals-final">
            <span>Total pagado</span>
            <span>{formatXAF(totalPagado)}</span>
          </div>
        </div>
      </section>

      {/* Dirección de entrega */}
      <section className="realizado-address-card">
        <span className="realizado-address-icon">
          <MapPin size={18} />
        </span>
        <div className="realizado-address-text">
          <span className="realizado-address-title">Dirección de entrega</span>
          <span className="realizado-address-line">
            Calle Mayor 12, Piso 2B
          </span>
          <span className="realizado-address-line">
            Malabo, Guinea Ecuatorial
          </span>
          <span className="realizado-address-ref">
            Referencia: Edificio blanco, timbre 2B
          </span>
        </div>
      </section>

      {/* Notificaciones */}
      <section className="realizado-notify-card">
        <span className="realizado-notify-icon">
          {" "}
          <Bell size={36} fill="#0fc83a" color="#0fc83a" />
        </span>
        <div className="realizado-notify-text">
          <span className="realizado-notify-title">
            Te mantendremos informado
          </span>
          <span className="realizado-notify-subtitle">
            Recibirás notificaciones en cada etapa de tu pedido por la app y por
            el método de contacto elegido.
          </span>
        </div>
        <div className="realizado-notify-actions">
          <button
            type="button"
            className="realizado-notify-btn"
            aria-label="WhatsApp"
          >
            <MessageCircle size={16} />
          </button>
          <button
            type="button"
            className="realizado-notify-btn"
            aria-label="Llamada"
          >
            <Phone size={16} />
          </button>
        </div>
      </section>

      <button
        type="button"
        className="realizado-done-btn"
        onClick={() => navigate("/cliente/pedidos")}
      >
        Entendido
      </button>

      <p className="realizado-help-text">
        ¿Necesitas ayuda?{" "}
        <button type="button" className="realizado-help-link">
          Contáctanos
        </button>
      </p>
    </div>
  );
}

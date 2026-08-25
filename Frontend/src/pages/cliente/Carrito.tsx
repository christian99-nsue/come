import { useState } from "react";
import {
  Trash2,
  Minus,
  Plus,
  ChevronRight,
  PackagePlus,
  Ticket,
  MapPin,
  Clock,
} from "lucide-react";
import burgerHouse from "../../assets/burger-house.jpg";
import combo from "../../assets/combo.png";
import "../../styles/carrito.css";

interface CartItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

interface Restaurante {
  nombre: string;
  minimo: number;
  imagen: string;
}

const restauranteMock: Restaurante = {
  nombre: "Burger House",
  minimo: 3000,
  imagen: burgerHouse,
};

const itemsIniciales: CartItem[] = [
  {
    id: "combo-clasico",
    nombre: "Combo Clasico",
    descripcion: "Hamburguesas, papas fritas y refresco",
    precio: 3500,
    cantidad: 1,
    imagen: combo,
  },
];

function formatXAF(valor: number) {
  return `${valor.toLocaleString("es-ES")} XAF`;
}

export default function Carrito() {
  const [items, setItems] = useState<CartItem[]>(itemsIniciales);
  const [direccion] = useState("Malabo, Centro- Calle Acacio Mañe");
  const [tiempoEntrega] = useState("Lo antes posible (20 - 30 min)");

  const subtotal = items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );
  const envio = 0;
  const servicio = 0;
  const total = subtotal + envio + servicio;

  const aumentarCantidad = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item,
      ),
    );
  };

  const disminuirCantidad = (id: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item,
        )
        .filter((item) => item.cantidad > 0),
    );
  };

  const eliminarItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  if (items.length === 0) {
    return (
      <div className="carrito-page">
        <section className="carrito-header">
          <div>
            <h1 className="carrito-title">Mi carrito</h1>
            <p className="carrito-subtitle">Tu carrito está vacío</p>
          </div>
        </section>
        <p className="carrito-empty-text">
          Explora los restaurantes y añade productos a tu carrito.
        </p>
      </div>
    );
  }

  return (
    <div className="carrito-page">
      {/* Encabezado */}
      <section className="carrito-header">
        <div>
          <h1 className="carrito-title">Mi carrito</h1>
          <p className="carrito-subtitle">
            Revisa tu pedido antes de confirmar
          </p>
        </div>
        <button
          type="button"
          className="carrito-clear-btn"
          onClick={vaciarCarrito}
          aria-label="Vaciar carrito"
        >
          <Trash2 size={18} />
        </button>
      </section>

      {/* Card del restaurante + items */}
      <section className="restaurant-order-card">
        <div className="restaurant-order-top">
          <img
            src={restauranteMock.imagen}
            alt={restauranteMock.nombre}
            className="restaurant-order-img"
          />
          <div className="restaurant-order-info">
            <span className="restaurant-order-name">
              {restauranteMock.nombre}
            </span>
            <span className="restaurant-order-min">
              Minimo {formatXAF(restauranteMock.minimo)}
            </span>
          </div>
          <ChevronRight size={18} className="carrito-chevron" />
        </div>

        {items.map((item) => (
          <div key={item.id} className="cart-item-row">
            <div className="cart-item-img-wrapper">
              <img
                src={item.imagen}
                alt={item.nombre}
                className="cart-item-img"
              />
              <span className="cart-item-qty-badge">{item.cantidad}</span>
            </div>
            <div className="cart-item-info">
              <span className="cart-item-name">{item.nombre}</span>
              <span className="cart-item-desc">{item.descripcion}</span>
              <span className="cart-item-price">{formatXAF(item.precio)}</span>
            </div>
            <div className="cart-item-actions">
              <div className="cart-item-stepper">
                <button
                  type="button"
                  onClick={() => disminuirCantidad(item.id)}
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={14} />
                </button>
                <span>{item.cantidad}</span>
                <button
                  type="button"
                  onClick={() => aumentarCantidad(item.id)}
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                type="button"
                className="cart-item-delete"
                onClick={() => eliminarItem(item.id)}
                aria-label="Eliminar producto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        <button type="button" className="add-more-row">
          <span className="add-more-icon">
            <PackagePlus size={18} />
          </span>
          <div className="add-more-text">
            <span className="add-more-title">Añadir mas productos</span>
            <span className="add-more-subtitle">
              Explora el menu del restaurante
            </span>
          </div>
          <ChevronRight size={18} className="carrito-chevron" />
        </button>
      </section>

      {/* Cupón */}
      <button type="button" className="coupon-row">
        <span className="coupon-icon">
          <Ticket size={18} />
        </span>
        <div className="coupon-text">
          <span className="coupon-title">¿Tienes un cupon?</span>
          <span className="coupon-subtitle">
            Añade tu codigo y obten descuentos
          </span>
        </div>
        <ChevronRight size={18} className="carrito-chevron" />
      </button>

      {/* Resumen del pedido */}
      <section className="order-summary">
        <h3 className="order-summary-title">Resumen del pedido</h3>
        <div className="order-summary-row">
          <span>Subtotal</span>
          <span>{formatXAF(subtotal)}</span>
        </div>
        <div className="order-summary-row">
          <span>Envio</span>
          <span>{formatXAF(envio)}</span>
        </div>
        <div className="order-summary-row">
          <span>Servicio</span>
          <span>{formatXAF(servicio)}</span>
        </div>
        <div className="order-summary-divider" />
        <div className="order-summary-row order-summary-total">
          <span>Total</span>
          <span>{formatXAF(total)}</span>
        </div>
      </section>

      {/* Dirección de entrega */}
      <button type="button" className="info-row">
        <span className="info-row-icon">
          <MapPin size={18} />
        </span>
        <div className="info-row-text">
          <span className="info-row-title">Direccion de entrega</span>
          <span className="info-row-subtitle">{direccion}</span>
        </div>
        <ChevronRight size={18} className="carrito-chevron" />
      </button>

      {/* Tiempo de entrega */}
      <button type="button" className="info-row">
        <span className="info-row-icon">
          <Clock size={18} />
        </span>
        <div className="info-row-text">
          <span className="info-row-title">Tiempo de entrega</span>
          <span className="info-row-subtitle">{tiempoEntrega}</span>
        </div>
        <ChevronRight size={18} className="carrito-chevron" />
      </button>

      {/* Botón finalizar pedido */}
      <button type="button" className="checkout-btn">
        <span>Finalizar pedido</span>
        <span>{formatXAF(total)}</span>
      </button>
    </div>
  );
}

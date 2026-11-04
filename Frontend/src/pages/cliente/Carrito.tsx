import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Trash2, Minus, Plus, ChevronRight, PackagePlus } from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useCarrito } from "../../context/useCarrito";
import BannerVentanas from "../../components/common/BannerVentanas";
import { useVentanas } from "../../hooks/useVentanas";
import {
  calcularLineas,
  formatXAF,
  type PlatoCatalogo,
} from "../../utils/carritoCalculos";
import "../../styles/cliente/Carrito.css";

const API_URL = import.meta.env.VITE_API_URL;

interface DatosRestaurante {
  id: number;
  nombre: string;
  logo: string | null;
  abierto: boolean;
  costo_envio: number;
  pedido_minimo: number;
}

export default function Carrito() {
  const navigate = useNavigate();
  const location = useLocation();
  const avisoRepetir = (location.state as { aviso?: string } | null)?.aviso;
  const token = localStorage.getItem("token");

  const { restaurante, items, cambiarCantidad, quitar, vaciar } = useCarrito();
  const { ventanas } = useVentanas();

  const [catalogo, setCatalogo] = useState<PlatoCatalogo[] | null>(null);
  const [datos, setDatos] = useState<DatosRestaurante | null>(null);
  const [error, setError] = useState("");
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);

  // Se piden los precios y la disponibilidad actuales cuando cambian los productos del carrito.
  const idsClave = items
    .map((i) => i.plato_id)
    .sort()
    .join(",");

  useEffect(() => {
    if (!restaurante || items.length === 0) return;

    let cancelado = false;

    axios
      .post(
        `${API_URL}/api/cliente/carrito/detalle`,
        {
          restaurante_id: restaurante.id,
          items: items.map((i) => ({ plato_id: i.plato_id })),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then((res) => {
        if (cancelado) return;
        setCatalogo(res.data.platos);
        setDatos(res.data.restaurante);
      })
      .catch(() => {
        if (!cancelado) {
          setError(
            "No se pudo verificar tu carrito. Revisa tu conexión e inténtalo de nuevo.",
          );
        }
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurante?.id, idsClave]);

  if (!restaurante || items.length === 0) {
    return (
      <div className="carrito-page">
        <section className="carrito-header">
          <div>
            <h1 className="carrito-title">Mi carrito</h1>
            <p className="carrito-subtitle">Tu carrito está vacío</p>
          </div>
        </section>

        <BannerVentanas />

        <p className="carrito-empty-text">
          Explora los restaurantes y añade productos a tu carrito.
        </p>

        <button
          type="button"
          className="checkout-btn"
          onClick={() => navigate("/cliente/restaurantes")}
        >
          <span>Ver restaurantes</span>
        </button>
      </div>
    );
  }

  const { lineas, subtotal, hayProblemas } = calcularLineas(items, catalogo);
  const envio = datos ? datos.costo_envio : 0;
  const total = subtotal + envio;
  const minimo = datos ? datos.pedido_minimo : 0;
  const bajoMinimo = datos !== null && subtotal < minimo;
  const cerrado = datos !== null && !datos.abierto;

  let motivoBloqueo = "";

  if (ventanas && ventanas.length === 0) {
    motivoBloqueo = "No hay ventanas de entrega disponibles por ahora";
  } else if (error) {
    motivoBloqueo = error;
  } else if (cerrado) {
    motivoBloqueo = "El restaurante está cerrado en este momento.";
  } else if (hayProblemas) {
    motivoBloqueo =
      "Quita los productos que ya no están disponibles para continuar.";
  } else if (bajoMinimo) {
    motivoBloqueo = `El pedido mínimo de este restaurante es ${formatXAF(minimo)}.`;
  }

  const puedeContinuar = datos !== null && !motivoBloqueo;

  return (
    <div className="carrito-page">
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
          onClick={() => setConfirmarVaciar(true)}
          aria-label="Vaciar carrito"
        >
          <Trash2 size={18} />
        </button>
      </section>

      <BannerVentanas />

      {avisoRepetir && <p className="carrito-warning">{avisoRepetir}</p>}

      <section className="restaurant-order-card">
        <div
          className="restaurant-order-top"
          role="button"
          tabIndex={0}
          onClick={() => navigate(`/cliente/restaurante/${restaurante.id}`)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              navigate(`/cliente/restaurante/${restaurante.id}`);
            }
          }}
        >
          <img
            src={
              datos?.logo ||
              `https://picsum.photos/seed/restaurante-${restaurante.id}/80/80`
            }
            alt={restaurante.nombre}
            className="restaurant-order-img"
          />

          <div className="restaurant-order-info">
            <span className="restaurant-order-name">{restaurante.nombre}</span>

            {minimo > 0 && (
              <span className="restaurant-order-min">
                Mínimo {formatXAF(minimo)}
              </span>
            )}
          </div>

          <ChevronRight size={18} className="carrito-chevron" />
        </div>

        {lineas.map((l) => (
          <div key={l.item.plato_id} className="cart-item-row">
            <div className="cart-item-img-wrapper">
              <img
                src={
                  l.imagen ||
                  `https://picsum.photos/seed/plato-${l.item.plato_id}/120/120`
                }
                alt={l.nombre}
                className="cart-item-img"
              />
              <span className="cart-item-qty-badge">{l.item.cantidad}</span>
            </div>

            <div className="cart-item-info">
              <span className="cart-item-name">{l.nombre}</span>

              {l.problema ? (
                <span className="cart-item-problem">{l.problema}</span>
              ) : (
                <span className="cart-item-price">{formatXAF(l.precio)}</span>
              )}
            </div>

            <div className="cart-item-actions">
              {!l.problema && (
                <div className="cart-item-stepper">
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(l.item.plato_id, -1)}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus size={14} />
                  </button>

                  <span>{l.item.cantidad}</span>

                  <button
                    type="button"
                    onClick={() => cambiarCantidad(l.item.plato_id, 1)}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}

              <button
                type="button"
                className="cart-item-delete"
                onClick={() => quitar(l.item.plato_id)}
                aria-label="Eliminar producto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="add-more-row"
          onClick={() => navigate(`/cliente/restaurante/${restaurante.id}`)}
        >
          <span className="add-more-icon">
            <PackagePlus size={18} />
          </span>

          <div className="add-more-text">
            <span className="add-more-title">Añadir más productos</span>
            <span className="add-more-subtitle">
              Explora el menú del restaurante
            </span>
          </div>

          <ChevronRight size={18} className="carrito-chevron" />
        </button>
      </section>

      <section className="order-summary">
        <h3 className="order-summary-title">Resumen del pedido</h3>

        <div className="order-summary-row">
          <span>Subtotal</span>
          <span>{formatXAF(subtotal)}</span>
        </div>

        <div className="order-summary-row">
          <span>Envío</span>
          <span>{datos ? formatXAF(envio) : "Calculando..."}</span>
        </div>

        <div className="order-summary-divider" />

        <div className="order-summary-row order-summary-total">
          <span>Total</span>
          <span>{formatXAF(total)}</span>
        </div>
      </section>

      {motivoBloqueo && <p className="carrito-warning">{motivoBloqueo}</p>}

      <button
        type="button"
        className="checkout-btn"
        disabled={!puedeContinuar}
        onClick={() => navigate("/cliente/direccion-entrega")}
      >
        <span>Continuar</span>
        <span>{formatXAF(total)}</span>
      </button>

      <ConfirmModal
        open={confirmarVaciar}
        title="¿Vaciar el carrito?"
        message="Se quitarán todos los productos de tu pedido."
        confirmLabel="Vaciar carrito"
        cancelLabel="Cancelar"
        danger
        onConfirm={() => {
          vaciar();
          setConfirmarVaciar(false);
        }}
        onCancel={() => setConfirmarVaciar(false)}
      />
    </div>
  );
}

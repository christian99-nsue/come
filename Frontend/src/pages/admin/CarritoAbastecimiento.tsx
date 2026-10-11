import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Minus, Plus, X, Clock } from "lucide-react";
import { useAbastecimientoCart } from "../../context/AbastecimientoCartContext";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/CarritoAbastecimiento.css";

const API_URL = import.meta.env.VITE_API_URL;

const turnosMock = [
  { id: "turno1", label: "Turno 1 (08:00 - 10:00)" },
  { id: "turno2", label: "Turno 2 (14:00 - 16:00)" },
];

function formatXAF(v: number) {
  return `${v.toLocaleString("es-ES")} XAF`;
}

export default function CarritoAbastecimiento() {
  const navigate = useNavigate();
  const {
    items,
    aumentarCantidad,
    disminuirCantidad,
    quitarProducto,
    vaciarCarrito,
    total,
  } = useAbastecimientoCart();

  const [turnoSeleccionado, setTurnoSeleccionado] = useState(turnosMock[0].id);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const realizarPedido = async () => {
    setError("");
    setEnviando(true);

    try {
      const turno = turnosMock.find((t) => t.id === turnoSeleccionado);

      await axios.post(
        `${API_URL}/api/admin/abastecimiento/pedidos`,
        {
          items: items.map((i) => ({
            producto_id: i.producto.id,
            cantidad: i.cantidad,
          })),
          turno_entrega: turno?.label,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      vaciarCarrito();
      navigate("/admin/abastecimiento", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "No se pudo realizar el pedido",
        );
      } else {
        setError("No se pudo realizar el pedido");
      }
    } finally {
      setEnviando(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="admin-page">
        <section className="admin-header">
          <button
            type="button"
            className="admin-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="admin-title">Carrito de abastecimiento</h1>
        </section>

        <p className="pedidos-status-text">Tu carrito está vacío.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <section className="admin-header">
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>

        <h1 className="admin-title">Carrito de abastecimiento</h1>
      </section>

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      <div className="carrito-abast-list">
        {items.map((item) => (
          <div key={item.producto.id} className="carrito-abast-item">
            <img
              src={
                item.producto.imagen ||
                "https://picsum.photos/seed/abast-placeholder/100/100"
              }
              alt={item.producto.nombre}
              className="carrito-abast-img"
            />

            <div className="carrito-abast-info">
              <span className="carrito-abast-nombre">
                {item.producto.nombre}
              </span>

              <span className="carrito-abast-precio">
                {formatXAF(item.producto.precio)}
              </span>
            </div>

            <div className="carrito-abast-stepper">
              <button
                type="button"
                onClick={() => disminuirCantidad(item.producto.id)}
                aria-label="Disminuir"
              >
                <Minus size={14} />
              </button>

              <span>{item.cantidad}</span>

              <button
                type="button"
                onClick={() => aumentarCantidad(item.producto.id)}
                aria-label="Aumentar"
              >
                <Plus size={14} />
              </button>
            </div>

            <span className="carrito-abast-subtotal">
              {formatXAF(item.producto.precio * item.cantidad)}
            </span>

            <button
              type="button"
              className="carrito-abast-remove"
              onClick={() => quitarProducto(item.producto.id)}
              aria-label={`Quitar ${item.producto.nombre}`}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="admin-card carrito-abast-total-card">
        <div className="carrito-abast-total-row">
          <span>Total</span>
          <span className="carrito-abast-total-value">{formatXAF(total)}</span>
        </div>
      </div>

      <h3 className="admin-section-title-sm">
        <Clock size={15} style={{ verticalAlign: "middle", marginRight: 6 }} />
        Turno de entrega
      </h3>

      <div className="carrito-abast-turnos">
        {turnosMock.map((t) => (
          <button
            key={t.id}
            type="button"
            className={
              turnoSeleccionado === t.id
                ? "carrito-abast-turno active"
                : "carrito-abast-turno"
            }
            onClick={() => setTurnoSeleccionado(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="admin-btn-primary carrito-abast-submit"
        onClick={realizarPedido}
        disabled={enviando}
      >
        {enviando ? "Enviando pedido..." : "Realizar pedido"}
      </button>
    </div>
  );
}

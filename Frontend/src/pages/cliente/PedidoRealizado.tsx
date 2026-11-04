import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, MapPin } from "lucide-react";
import { formatXAF } from "../../utils/carritoCalculos";
import "../../styles/cliente/PedidoRealizado.css";
import EntregaPrevista from "../../components/common/EntregaPrevista";

const API_URL = import.meta.env.VITE_API_URL;

interface EntregaPedido {
  fecha: string;
  etiqueta_dia: string;
  inicio: string;
  fin: string;
}

interface PedidoCreado {
  id: number;
  codigo: string;
  estado: string;
  subtotal: number;
  costo_envio: number;
  total: number;
  metodo_pago: "efectivo" | "transferencia" | "tarjeta";
  direccion_entrega: string | null;
  restaurante_nombre: string;
  restaurante_logo: string | null;
  entrega: EntregaPedido | null;
  items: {
    nombre_plato: string;
    cantidad: number;
    precio_unitario: number;
  }[];
}

const notaPago = {
  efectivo: "Pagarás en efectivo al recibir tu pedido.",
  transferencia:
    "El restaurante te indicará los datos para completar la transferencia.",
  tarjeta: "El restaurante coordinará el cobro contigo.",
};

export default function PedidoRealizado() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [pedido, setPedido] = useState<PedidoCreado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get<PedidoCreado>(`${API_URL}/api/cliente/pedidos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      .then((res) => setPedido(res.data))
      .catch((err: unknown) => {
        if (!axios.isCancel(err)) {
          setError("No se pudo cargar tu pedido");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [id, token]);

  if (cargando) {
    return (
      <div className="realizado-page">
        <p className="realizado-subtitle">Cargando tu pedido...</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="realizado-page">
        <p className="realizado-subtitle">{error}</p>
        <button
          type="button"
          className="realizado-done-btn"
          onClick={() => navigate("/cliente/pedidos")}
        >
          Ver mis pedidos
        </button>
      </div>
    );
  }

  return (
    <div className="realizado-page">
      <div className="realizado-check-wrapper">
        <div className="realizado-check-circle">
          <CheckCircle2 size={40} />
        </div>
      </div>

      <h1 className="realizado-title">¡Pedido realizado!</h1>

      <p className="realizado-subtitle">
        {pedido.estado === "en_preparacion"
          ? "El restaurante ya está preparando tu pedido."
          : "Enviamos tu pedido al restaurante. Te avisaremos cuando lo acepte."}
      </p>

      <div className="realizado-order-number">
        <span className="realizado-order-label">Número de pedido</span>
        <span className="realizado-order-value">{pedido.codigo}</span>
      </div>

      {/* Ventana de entrega seleccionada por el cliente */}
      <EntregaPrevista entrega={pedido.entrega} />

      <p className="realizado-payment-note">{notaPago[pedido.metodo_pago]}</p>

      <section className="realizado-section">
        <div className="realizado-section-header">
          <h3>Resumen del pedido</h3>
        </div>

        <div className="realizado-restaurant-row">
          <img
            src={
              pedido.restaurante_logo ||
              `https://picsum.photos/seed/pedido-${pedido.id}/80/80`
            }
            alt={pedido.restaurante_nombre}
            className="realizado-restaurant-logo"
          />

          <div className="realizado-restaurant-info">
            <span className="realizado-restaurant-name">
              {pedido.restaurante_nombre}
            </span>

            <span className="realizado-restaurant-count">
              {pedido.items.length}{" "}
              {pedido.items.length === 1 ? "producto" : "productos"}
            </span>
          </div>
        </div>

        <div className="realizado-product-list">
          {pedido.items.map((item, idx) => (
            <div
              key={`${item.nombre_plato}-${idx}`}
              className="realizado-product-row"
            >
              <span className="realizado-product-qty">{item.cantidad}</span>

              <span className="realizado-product-name">
                {item.nombre_plato}
              </span>

              <span className="realizado-product-price">
                {formatXAF(item.precio_unitario * item.cantidad)}
              </span>
            </div>
          ))}
        </div>

        <div className="realizado-totals">
          <div className="realizado-totals-row">
            <span>Subtotal</span>
            <span>{formatXAF(pedido.subtotal)}</span>
          </div>

          <div className="realizado-totals-row">
            <span>Costo de envío</span>
            <span>{formatXAF(pedido.costo_envio)}</span>
          </div>

          <div className="realizado-totals-row realizado-totals-final">
            <span>Total</span>
            <span>{formatXAF(pedido.total)}</span>
          </div>
        </div>
      </section>

      <section className="realizado-address-card">
        <span className="realizado-address-icon">
          <MapPin size={18} />
        </span>

        <div className="realizado-address-text">
          <span className="realizado-address-title">Dirección de entrega</span>

          <span className="realizado-address-line">
            {pedido.direccion_entrega || "Dirección no disponible"}
          </span>
        </div>
      </section>

      <button
        type="button"
        className="realizado-done-btn"
        onClick={() => navigate(`/cliente/pedidos/${pedido.id}`)}
      >
        Seguir mi pedido
      </button>
    </div>
  );
}

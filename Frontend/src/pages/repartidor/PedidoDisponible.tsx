import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Clock,
  UtensilsCrossed,
  MapPinned,
  Phone,
} from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

interface PedidoDetalle {
  id: number;
  codigo: string;
  asignado_a_mi: boolean;
  restaurante_nombre: string;
  restaurante_logo: string | null;
  restaurante_direccion: string | null;
  distancia_km: number | null;
  tiempo_estimado_min: number | null;
  pago: number;
  items: { nombre_plato: string; cantidad: number }[];
  cliente_nombre: string;
  cliente_telefono: string | null;
  direccion_entrega: string | null;
}

function formatXAF(v: number) {
  return `${v.toLocaleString("es-ES")} XAF`;
}

export default function PedidoDisponible() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [tomando, setTomando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/repartidor/pedidos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPedido(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "No se pudo cargar el pedido"),
      )
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const tomarPedido = async () => {
    setTomando(true);
    setError("");
    try {
      await axios.post(
        `${API_URL}/api/repartidor/pedidos/${id}/tomar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate("/repartidor/mi-entrega", { replace: true });
    } catch (err: unknown) {
      let mensaje = "No se pudo tomar el pedido";

      if (axios.isAxiosError(err)) {
        const mensajeServidor: unknown = err.response?.data?.message;

        if (typeof mensajeServidor === "string" && mensajeServidor.trim()) {
          mensaje = mensajeServidor;
        }
      }

      setError(mensaje);
    } finally {
      setTomando(false);
    }
  };

  if (cargando) {
    return (
      <div className="rep-page">
        <p className="rep-status-text">Cargando pedido...</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="rep-page">
        <section className="rep-header">
          <button
            type="button"
            className="rep-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="rep-title">Pedido</h1>
        </section>
        <p className="rep-status-text rep-status-error">{error}</p>
        <button
          type="button"
          className="rep-btn-secondary"
          onClick={() => navigate("/repartidor", { replace: true })}
        >
          Volver a pedidos
        </button>
      </div>
    );
  }

  return (
    <div className="rep-page">
      <section className="rep-header">
        <button
          type="button"
          className="rep-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="rep-title">Pedido {pedido.codigo}</h1>
      </section>

      <div className="rep-card">
        <div className="rep-card-top">
          <img
            src={
              pedido.restaurante_logo ||
              `https://picsum.photos/seed/restaurante-${pedido.id}/80/80`
            }
            alt={pedido.restaurante_nombre}
            className="rep-card-logo"
          />
          <div>
            <div className="rep-card-name">{pedido.restaurante_nombre}</div>
            <span className="rep-badge rep-badge-green">
              ✓ Listo para recoger
            </span>
          </div>
        </div>

        <div className="rep-quick-row">
          {pedido.distancia_km !== null && (
            <span className="rep-quick-item">
              <MapPin size={13} /> {pedido.distancia_km} km
            </span>
          )}
          {pedido.tiempo_estimado_min !== null && (
            <span className="rep-quick-item">
              <Clock size={13} /> ~{pedido.tiempo_estimado_min} min
            </span>
          )}
          <span className="rep-quick-price">{formatXAF(pedido.pago)}</span>
        </div>
      </div>

      <h3 className="rep-section-title-sm">Productos</h3>
      <div className="rep-card rep-product-list">
        {pedido.items.map((item, i) => (
          <div key={i} className="rep-product-item">
            {item.cantidad} x {item.nombre_plato}
          </div>
        ))}
      </div>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <UtensilsCrossed size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Recogida</span>
          <span className="rep-info-value">{pedido.restaurante_nombre}</span>
          {pedido.restaurante_direccion && (
            <span className="rep-info-sub">{pedido.restaurante_direccion}</span>
          )}
        </div>
      </div>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <MapPinned size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Entrega</span>
          <span className="rep-info-value">
            Cliente: {pedido.cliente_nombre}
          </span>
          {pedido.direccion_entrega && (
            <span className="rep-info-sub">{pedido.direccion_entrega}</span>
          )}
          {pedido.cliente_telefono && (
            <button
              type="button"
              className="rep-link-btn"
              onClick={() =>
                (window.location.href = `tel:${pedido.cliente_telefono}`)
              }
            >
              <Phone size={13} /> Llamar
            </button>
          )}
        </div>
      </div>

      {error && <p className="rep-status-text rep-status-error">{error}</p>}

      {pedido.asignado_a_mi ? (
        <button
          type="button"
          className="rep-btn-primary"
          onClick={() => navigate("/repartidor/mi-entrega", { replace: true })}
        >
          Ir a mi entrega
        </button>
      ) : (
        <button
          type="button"
          className="rep-btn-primary"
          onClick={tomarPedido}
          disabled={tomando}
        >
          {tomando ? "Tomando pedido..." : "Tomar pedido"}
        </button>
      )}
    </div>
  );
}

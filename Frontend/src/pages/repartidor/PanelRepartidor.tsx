import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Package, MapPin, ChevronRight } from "lucide-react";
import { getUser } from "../../utils/auth";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

interface PedidoDisponible {
  id: number;
  codigo: string;
  restaurante: string;
  logo: string | null;
  distancia_km: number | null;
  tiempo_estimado_min: number | null;
  pago: number;
}

interface PanelData {
  disponible: boolean;
  pedidos: PedidoDisponible[];
}

function formatXAF(v: number) {
  return `${v.toLocaleString("es-ES")} XAF`;
}

export default function PanelRepartidor() {
  const navigate = useNavigate();
  const user = getUser();

  const [panel, setPanel] = useState<PanelData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const cargarPanel = () => {
      axios
        .get(`${API_URL}/api/repartidor/panel`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setPanel(res.data);
          setError("");
        })
        .catch(() => setError("No se pudieron cargar los pedidos"))
        .finally(() => setCargando(false));
    };

    cargarPanel();
    // Se actualiza solo cada 15 segundos para ver pedidos nuevos
    const intervalo = setInterval(cargarPanel, 15000);
    return () => clearInterval(intervalo);
  }, []);

  if (cargando) {
    return (
      <div className="rep-page">
        <p className="rep-status-text">Cargando pedidos...</p>
      </div>
    );
  }

  if (!panel) {
    return (
      <div className="rep-page">
        <p className="rep-status-text rep-status-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="rep-page">
      <div className="rep-greeting">
        <h2 className="rep-greeting-title">Hola, {user.nombre} 👋</h2>
        <span
          className={
            panel.disponible
              ? "rep-badge rep-badge-green"
              : "rep-badge rep-badge-gray"
          }
        >
          ● {panel.disponible ? "Disponible para entregar" : "No disponible"}
        </span>
      </div>

      <button
        type="button"
        className="rep-card rep-card-green rep-banner-btn"
        onClick={() => navigate("/repartidor/estado-disponibilidad")}
      >
        <span className="rep-info-icon">
          <Package size={18} />
        </span>
        <span className="rep-banner-text">
          {panel.pedidos.length}{" "}
          {panel.pedidos.length === 1
            ? "pedido disponible"
            : "pedidos disponibles"}
        </span>
        <span className="rep-chevron">
          <ChevronRight size={16} />
        </span>
      </button>

      <h3 className="rep-section-title">Pedidos disponibles</h3>

      {error && <p className="rep-status-text rep-status-error">{error}</p>}

      {!panel.disponible && (
        <p className="rep-status-text">
          Estás en modo "No disponible". Actívate para ver y tomar pedidos.
        </p>
      )}

      {panel.disponible && panel.pedidos.length === 0 && (
        <p className="rep-status-text">No hay pedidos disponibles por ahora.</p>
      )}

      <div className="rep-order-list">
        {panel.pedidos.map((p) => (
          <div
            key={p.id}
            className="rep-card rep-order-card"
            onClick={() => navigate(`/repartidor/pedido/${p.id}`)}
          >
            <img
              src={
                p.logo || `https://picsum.photos/seed/restaurante-${p.id}/80/80`
              }
              alt={p.restaurante}
              className="rep-order-img"
            />
            <div className="rep-order-info">
              <div className="rep-order-name">{p.restaurante}</div>
              <div className="rep-order-number">Pedido {p.codigo}</div>
              {p.distancia_km !== null && (
                <div className="rep-order-number">
                  <MapPin size={12} /> {p.distancia_km} km
                </div>
              )}
              {p.tiempo_estimado_min !== null && (
                <div className="rep-order-number">
                  ~{p.tiempo_estimado_min} min
                </div>
              )}
              <div className="rep-order-price">{formatXAF(p.pago)}</div>
            </div>
            <span className="rep-chevron">
              <ChevronRight size={22} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

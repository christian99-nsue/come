import { useNavigate } from "react-router-dom";
import { Package, MapPin, ChevronRight } from "lucide-react";
import { getUser } from "../../utils/auth";
import "../../styles/repartidor/RepartidorShared.css";
import burgerLogo from "../../assets/burger1.png";
import pizza from "../../assets/imagenRestaurante2.jpg";
import africanaComida from "../../assets/imagenRestaurante3.jpg";

interface PedidoDisponible {
  id: string;
  restaurante: string;
  numero: string;
  distancia: string;
  tiempo: string;
  pago: number;
  logo: string;
}

const pedidosMock: PedidoDisponible[] = [
  {
    id: "1",
    restaurante: "Burger House",
    numero: "#FL-2841",
    distancia: "2.4 km",
    tiempo: "20-25 min",
    pago: 8500,
    logo: burgerLogo,
  },
  {
    id: "2",
    restaurante: "Pizza Top",
    numero: "#FL-2842",
    distancia: "1.8 km",
    tiempo: "15-20 min",
    pago: 6200,
    logo: pizza,
  },
  {
    id: "3",
    restaurante: "Sabor Africano",
    numero: "#FL-2843",
    distancia: "2.1 km",
    tiempo: "25-30 min",
    pago: 9300,
    logo: africanaComida,
  },
];

function formatXAF(v: number) {
  return `${v.toLocaleString("es-ES")} XAF`;
}

export default function PanelRepartidor() {
  const navigate = useNavigate();
  const user = getUser();

  return (
    <div className="rep-page">
      <div className="rep-greeting">
        <h2 className="rep-greeting-title">Hola, {user.nombre} 👋</h2>
        <span className="rep-badge rep-badge-green">
          ● Disponible para entregar
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
          {pedidosMock.length} pedidos disponibles
        </span>
        <span className="rep-chevron">
          <ChevronRight size={16} />
        </span>
      </button>

      <h3 className="rep-section-title">Pedidos disponibles</h3>

      <div className="rep-order-list">
        {pedidosMock.map((p) => (
          <div
            key={p.id}
            className="rep-card rep-order-card"
            onClick={() => navigate(`/repartidor/pedido/${p.id}`)}
          >
            <img src={p.logo} alt={p.restaurante} className="rep-order-img" />
            <div className="rep-order-info">
              <div className="rep-order-name">{p.restaurante}</div>
              <div className="rep-order-number">Pedido {p.numero}</div>
              <div className="rep-order-number">
                <MapPin size={12} /> {p.distancia}
              </div>
              <div className="rep-order-number">~{p.tiempo}</div>
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

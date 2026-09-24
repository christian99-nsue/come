import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  UtensilsCrossed,
  MapPinned,
  Phone,
} from "lucide-react";
import burger from "../../assets/burger1.png";
import "../../styles/repartidor/RepartidorShared.css";

const pedidoMock = {
  numero: "#FL-2841",
  restaurante: "Burger House",
  logo: "https://picsum.photos/seed/burger-logo/80/80",
  listo: true,
  distancia: "2.4 km",
  tiempo: "~20-25 min",
  pago: 8500,
  productos: [
    "1 x Hamburguesa clásica",
    "1 x Patatas fritas",
    "1 x Coca-Cola 330ml",
  ],
  recogida: { nombre: "Burger House", direccion: "Avenida Central 10, Malabo" },
};

function formatXAF(v: number) {
  return `${v.toLocaleString("es-ES")} XAF`;
}

export default function PedidoDisponible() {
  const navigate = useNavigate();
  const p = pedidoMock; // luego: buscar por `id`

  const tomarPedido = () => {
    // TODO: POST /api/entregas/:id/tomar
    navigate("/repartidor/mi-entrega");
  };

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
        <h1 className="rep-title">Pedido {p.numero}</h1>
      </section>

      <div className="rep-card">
        <div className="rep-card-top">
          <img src={burger} alt={p.restaurante} className="rep-card-logo" />
          <div>
            <div className="rep-card-name">{p.restaurante}</div>
            {p.listo && (
              <span className="rep-badge rep-badge-green">
                ✓ Listo para recoger
              </span>
            )}
          </div>
        </div>

        <div className="rep-quick-row">
          <span className="rep-quick-item">
            <MapPin size={13} /> {p.distancia}
          </span>
          <span className="rep-quick-item">
            <Clock size={13} /> {p.tiempo}
          </span>
          <span className="rep-quick-price">{formatXAF(p.pago)}</span>
        </div>
      </div>

      <h3 className="rep-section-title-sm">Productos</h3>
      <div className="rep-card rep-product-list">
        {p.productos.map((prod, i) => (
          <div key={i} className="rep-product-item">
            {prod}
          </div>
        ))}
      </div>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <UtensilsCrossed size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Recogida</span>
          <span className="rep-info-value">{p.recogida.nombre}</span>
          <span className="rep-info-sub">{p.recogida.direccion}</span>
        </div>
      </div>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <MapPinned size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Entrega</span>
          <span className="rep-info-value">Cliente: Juan Pérez</span>
          <span className="rep-info-sub">Calle Mayor 12, Piso 2B</span>
          <button type="button" className="rep-link-btn">
            <span className="rep-info-icon">
              <Phone size={18} />
            </span>
            Llamar
          </button>
        </div>
      </div>

      <button type="button" className="rep-btn-primary" onClick={tomarPedido}>
        Tomar pedido
      </button>
    </div>
  );
}

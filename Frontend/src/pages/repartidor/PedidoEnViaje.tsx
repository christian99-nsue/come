import { useNavigate } from "react-router-dom";
import {
  MapPin,
  User,
  Phone,
  MessageCircle,
  Map,
  ArrowLeft,
} from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const viajeMock = {
  numero: "#FL-2841",
  destino: "Calle Mayor 12, Piso 28, Malabo",
  cliente: "Juan Pérez",
};

export default function PedidoEnViaje() {
  const navigate = useNavigate();
  const v = viajeMock;

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
        <div>
          <h1 className="rep-title">En viaje</h1>
          <p className="rep-subtitle">Pedido {v.numero}</p>
        </div>
        <span className="rep-badge rep-badge-green">● En camino</span>
      </section>
      <div className="rep-info-row">
        <span className="rep-info-icon">
          <MapPin size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Destino</span>
          <span className="rep-info-value">{v.destino}</span>
          <button type="button" className="rep-link-btn">
            <MapPin size={14} /> Ver ubicación
          </button>
        </div>
      </div>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <User size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Cliente</span>
          <span className="rep-info-value">{v.cliente}</span>
        </div>
      </div>

      <div className="rep-contact-row">
        <button type="button" className="rep-btn-secondary">
          <Phone size={16} /> Llamar
        </button>
        <button type="button" className="rep-btn-secondary">
          <MessageCircle size={16} /> WhatsApp
        </button>
      </div>

      <button
        type="button"
        className="rep-btn-secondary rep-btn-block-margin"
        onClick={() => navigate("/repartidor/ruta")}
      >
        <Map size={16} /> Ver ubicación en mapa
      </button>

      <button
        type="button"
        className="rep-btn-primary"
        onClick={() => navigate("/repartidor/confirmar-entrega")}
      >
        Marcar como entregado
      </button>
    </div>
  );
}

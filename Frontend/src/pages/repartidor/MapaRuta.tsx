import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Map } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const rutaMock = { destino: "Calle Mayor 12, Piso 28, Malabo" };

export default function MapaRuta() {
  const navigate = useNavigate();

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
        <h1 className="rep-title">Ruta</h1>
      </section>

      <img
        src="https://picsum.photos/seed/mapa-ruta-repartidor/800/500"
        alt="Mapa de la ruta"
        className="rep-hero-img-lg"
      />

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <MapPin size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Destino</span>
          <span className="rep-info-value">{rutaMock.destino}</span>
        </div>
      </div>

      <button type="button" className="rep-btn-primary">
        <Map size={16} /> Abrir en mapas
      </button>
    </div>
  );
}

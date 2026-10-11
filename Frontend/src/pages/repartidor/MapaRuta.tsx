import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, MapPin, Map } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Entrega {
  id: number;
  codigo: string;
  estado: "listo_para_recoger" | "en_entrega";
  restaurante_nombre: string;
  restaurante_direccion: string | null;
  restaurante_lat: number | null;
  restaurante_lng: number | null;
  direccion_entrega: string | null;
  entrega_lat: number | null;
  entrega_lng: number | null;
}

// Coordenadas si existen; si no, la dirección en texto; si no hay nada, null
function punto(
  lat: number | null,
  lng: number | null,
  direccion: string | null,
) {
  if (lat !== null && lng !== null) return `${lat},${lng}`;
  return direccion || null;
}

export default function MapaRuta() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/repartidor/entrega-actual`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEntrega(res.data))
      .catch(() => setError("No se pudo cargar tu ruta"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cargando) {
    return (
      <div className="rep-page">
        <p className="rep-status-text">Cargando ruta...</p>
      </div>
    );
  }

  if (!entrega) {
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
        <p
          className={
            error ? "rep-status-text rep-status-error" : "rep-status-text"
          }
        >
          {error || "No tienes ninguna entrega activa."}
        </p>
        <button
          type="button"
          className="rep-btn-primary"
          onClick={() => navigate("/repartidor", { replace: true })}
        >
          Ver pedidos disponibles
        </button>
      </div>
    );
  }

  const yendoAlRestaurante = entrega.estado === "listo_para_recoger";

  const puntoRestaurante = punto(
    entrega.restaurante_lat,
    entrega.restaurante_lng,
    entrega.restaurante_direccion,
  );
  const puntoCliente = punto(
    entrega.entrega_lat,
    entrega.entrega_lng,
    entrega.direccion_entrega,
  );

  // A dónde hay que ir ahora
  const destino = yendoAlRestaurante ? puntoRestaurante : puntoCliente;

  // Mapa incrustado: antes de recoger, el restaurante; ya en camino, la ruta restaurante -> cliente
  let urlMapa: string | null = null;
  if (destino) {
    if (!yendoAlRestaurante && puntoRestaurante && puntoCliente) {
      urlMapa = `https://maps.google.com/maps?saddr=${encodeURIComponent(puntoRestaurante)}&daddr=${encodeURIComponent(puntoCliente)}&output=embed`;
    } else {
      urlMapa = `https://maps.google.com/maps?q=${encodeURIComponent(destino)}&z=15&output=embed`;
    }
  }

  // Navegación desde donde esté el repartidor hasta el destino
  const urlNavegacion = destino
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}&travelmode=driving`
    : null;

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
          <h1 className="rep-title">Ruta</h1>
          <p className="rep-subtitle">Pedido {entrega.codigo}</p>
        </div>
        <span className="rep-badge rep-badge-green">
          {yendoAlRestaurante ? "Hacia el restaurante" : "En camino al cliente"}
        </span>
      </section>

      {urlMapa ? (
        <iframe
          title="Mapa de la ruta"
          src={urlMapa}
          className="rep-map-frame"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <p className="rep-status-text">
          No hay una ubicación disponible para este pedido.
        </p>
      )}

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <MapPin size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">
            {yendoAlRestaurante ? "Recogida" : "Destino"}
          </span>
          <span className="rep-info-value">
            {yendoAlRestaurante
              ? entrega.restaurante_nombre
              : entrega.direccion_entrega || "Dirección no disponible"}
          </span>
          {yendoAlRestaurante && entrega.restaurante_direccion && (
            <span className="rep-info-sub">
              {entrega.restaurante_direccion}
            </span>
          )}
        </div>
      </div>

      {urlNavegacion && (
        <button
          type="button"
          className="rep-btn-primary"
          onClick={() => window.open(urlNavegacion, "_blank")}
        >
          <Map size={16} /> Abrir en mapas
        </button>
      )}
    </div>
  );
}

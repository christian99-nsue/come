import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Locate,
  User,
  Phone,
  MessageCircle,
  Map,
} from "lucide-react";
import logo from "../../assets/repartidor-logo.jpg";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

// Prefijo que se agrega al abrir WhatsApp cuando el número está guardado sin código de país
const CODIGO_PAIS = "240";

interface Entrega {
  id: number;
  codigo: string;
  estado: "listo_para_recoger" | "en_entrega";
  cliente_nombre: string;
  cliente_telefono: string | null;
  direccion_entrega: string | null;
  entrega_lat: number | null;
  entrega_lng: number | null;
}

function abrirMapa(
  lat: number | null,
  lng: number | null,
  direccion: string | null,
) {
  const query =
    lat !== null && lng !== null
      ? `${lat},${lng}`
      : encodeURIComponent(direccion || "");
  if (!query) return;
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${query}`,
    "_blank",
  );
}

function numeroWhatsApp(telefono: string) {
  const digitos = telefono.replace(/\D/g, "");
  return digitos.length <= 9 ? `${CODIGO_PAIS}${digitos}` : digitos;
}

export default function PedidoEnViaje() {
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
      .then((res) => {
        // Si todavía no recogió el pedido, le corresponde "Mi entrega"
        if (res.data && res.data.estado === "listo_para_recoger") {
          navigate("/repartidor/mi-entrega", { replace: true });
          return;
        }
        setEntrega(res.data);
      })
      .catch(() => setError("No se pudo cargar tu entrega"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cargando) {
    return (
      <div className="rep-page">
        <p className="rep-status-text">Cargando tu entrega...</p>
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
            onClick={() => navigate("/repartidor")}
            aria-label="Volver"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="rep-title">En viaje</h1>
        </section>
        <p
          className={
            error ? "rep-status-text rep-status-error" : "rep-status-text"
          }
        >
          {error || "No tienes ninguna entrega en camino."}
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

  return (
    <div className="rep-page">
      <section className="rep-header">
        <button
          type="button"
          className="rep-back-btn"
          onClick={() => navigate("/repartidor")}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="rep-title">En viaje</h1>
      </section>

      <div className="rep-viaje">
        <img src={logo} alt="Repartidor en camino" className="rep-hero-img" />
        <div className="rep-viaje-ped">
          <p className="rep-subtitle">Pedido {entrega.codigo}</p>
          <span className="rep-badge rep-badge-green">● En camino</span>
        </div>
      </div>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <MapPin size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Destino</span>
          <span className="rep-info-value">
            {entrega.direccion_entrega || "Dirección no disponible"}
          </span>
          <button
            type="button"
            className="rep-link-btn"
            onClick={() =>
              abrirMapa(
                entrega.entrega_lat,
                entrega.entrega_lng,
                entrega.direccion_entrega,
              )
            }
          >
            <Locate size={12} /> Ver ubicación
          </button>
        </div>
      </div>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <User size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Cliente</span>
          <span className="rep-info-value">{entrega.cliente_nombre}</span>
        </div>
      </div>

      {entrega.cliente_telefono && (
        <div className="rep-contact-row">
          <button
            type="button"
            className="rep-btn-secondary"
            onClick={() =>
              (window.location.href = `tel:${entrega.cliente_telefono}`)
            }
          >
            <Phone size={16} /> Llamar
          </button>
          <button
            type="button"
            className="rep-btn-secondary"
            onClick={() =>
              window.open(
                `https://wa.me/${numeroWhatsApp(entrega.cliente_telefono as string)}`,
                "_blank",
              )
            }
          >
            <MessageCircle size={16} /> WhatsApp
          </button>
        </div>
      )}

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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  UtensilsCrossed,
  MapPinned,
  CheckCircle2,
  Phone,
  Locate,
} from "lucide-react";
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
  cliente_nombre: string;
  cliente_telefono: string | null;
  direccion_entrega: string | null;
  entrega_lat: number | null;
  entrega_lng: number | null;
}

const pasos = ["Pedido asignado", "Recoger pedido", "En viaje", "Entregado"];

// Si hay coordenadas abre el punto exacto; si no, busca por dirección
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

export default function MiEntregaActual() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/repartidor/entrega-actual`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Si ya la recogió, la pantalla que corresponde es "En viaje"
        if (res.data && res.data.estado === "en_entrega") {
          navigate("/repartidor/en-viaje", { replace: true });
          return;
        }
        setEntrega(res.data);
      })
      .catch(() => setError("No se pudo cargar tu entrega"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const marcarComoRecogido = async () => {
    if (!entrega) return;
    setProcesando(true);
    setError("");
    try {
      await axios.post(
        `${API_URL}/api/repartidor/pedidos/${entrega.id}/recogido`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate("/repartidor/en-viaje", { replace: true });
    } catch (err: unknown) {
      let mensaje = "No se pudo actualizar la entrega";

      if (axios.isAxiosError(err)) {
        const mensajeServidor: unknown = err.response?.data?.message;

        if (typeof mensajeServidor === "string" && mensajeServidor.trim()) {
          mensaje = mensajeServidor;
        }
      }

      setError(mensaje);
    } finally {
      setProcesando(false);
    }
  };

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
          <h1 className="rep-title">Mi entrega</h1>
        </section>
        <p
          className={
            error ? "rep-status-text rep-status-error" : "rep-status-text"
          }
        >
          {error || "No tienes ninguna entrega activa en este momento."}
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

  // Aquí el pedido siempre está "listo_para_recoger": asignado, falta recogerlo
  const pasoActual = 0;

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
        <div>
          <h1 className="rep-title">Mi entrega</h1>
          <p className="rep-subtitle">Pedido {entrega.codigo}</p>
        </div>
        <span className="rep-badge rep-badge-green">✓ Asignado</span>
      </section>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <UtensilsCrossed size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Recogida</span>
          <span className="rep-info-value">{entrega.restaurante_nombre}</span>
          {entrega.restaurante_direccion && (
            <span className="rep-info-sub">
              {entrega.restaurante_direccion}
            </span>
          )}
          <button
            type="button"
            className="rep-link-btn"
            onClick={() =>
              abrirMapa(
                entrega.restaurante_lat,
                entrega.restaurante_lng,
                entrega.restaurante_direccion,
              )
            }
          >
            <Locate size={12} /> Ver ubicación
          </button>
        </div>
      </div>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <MapPinned size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Entrega</span>
          <span className="rep-info-value">
            Cliente: {entrega.cliente_nombre}
          </span>
          {entrega.direccion_entrega && (
            <span className="rep-info-sub">{entrega.direccion_entrega}</span>
          )}
          {entrega.cliente_telefono && (
            <span className="rep-info-sub">
              <Phone size={11} /> {entrega.cliente_telefono}
            </span>
          )}
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

      <div className="rep-card-info">
        <div className="rep-stepper">
          {pasos.map((paso, i) => {
            const done = i <= pasoActual;
            return (
              <div className="rep-step" key={paso}>
                <div className={done ? "rep-step-dot done" : "rep-step-dot"}>
                  {done && <CheckCircle2 size={13} />}
                </div>
                {i < pasos.length - 1 && (
                  <div
                    className={
                      i < pasoActual ? "rep-step-line done" : "rep-step-line"
                    }
                  />
                )}
                <span
                  className={done ? "rep-step-label done" : "rep-step-label"}
                >
                  {paso}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="rep-status-text rep-status-error">{error}</p>}

      <button
        type="button"
        className="rep-btn-primary"
        onClick={marcarComoRecogido}
        disabled={procesando}
      >
        {procesando ? "Actualizando..." : "Marcar como recogido"}
      </button>
    </div>
  );
}

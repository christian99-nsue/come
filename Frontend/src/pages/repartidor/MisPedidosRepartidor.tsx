import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, MapPin, Package, CheckCircle2, Map } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

interface PedidoEnCurso {
  id: number;
  codigo: string;
  estado: "listo_para_recoger" | "en_entrega";
  pago: number;
  restaurante_nombre: string;
  restaurante_logo: string | null;
  restaurante_direccion: string | null;
  cliente_nombre: string;
  direccion_entrega: string | null;
  eventos: Record<string, string>;
}

// Línea de tiempo de un pedido, en orden. "pendiente" es cómo se lee mientras aún no ocurre.
const pasos = [
  {
    clave: "aceptado",
    hecho: "El restaurante aceptó el pedido",
    pendiente: "Aceptación del restaurante",
  },
  {
    clave: "listo",
    hecho: "Pedido listo en el restaurante",
    pendiente: "Preparación del pedido",
  },
  {
    clave: "asignado",
    hecho: "Pedido asignado a ti",
    pendiente: "Asignación a un repartidor",
  },
  {
    clave: "recogido",
    hecho: "Recogiste el pedido · en camino al cliente",
    pendiente: "Recoger el pedido en el restaurante",
  },
  {
    clave: "entregado",
    hecho: "Entregado al cliente",
    pendiente: "Entregar al cliente",
  },
];

function formatXAF(v: number) {
  return `${v.toLocaleString("es-ES")} XAF`;
}

// Hora si fue hoy; día y hora si fue otro día
function formatMomento(iso: string) {
  const fecha = new Date(iso);
  const hora = fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (fecha.toDateString() === new Date().toDateString()) return hora;
  return `${fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}, ${hora}`;
}

// Último paso ya cumplido. Si faltan eventos (pedidos anteriores al registro de eventos),
// se deduce por el estado: asignado = paso 2, recogido = paso 3.
function ultimoPasoHecho(p: PedidoEnCurso) {
  let ultimo = p.estado === "en_entrega" ? 3 : 2;
  pasos.forEach((paso, i) => {
    if (p.eventos[paso.clave] && i > ultimo) ultimo = i;
  });
  return ultimo;
}

export default function MisPedidosRepartidor() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [pedidos, setPedidos] = useState<PedidoEnCurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = () => {
      axios
        .get(`${API_URL}/api/repartidor/mis-pedidos`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setPedidos(res.data);
          setError("");
        })
        .catch(() => setError("No se pudieron cargar tus pedidos"))
        .finally(() => setCargando(false));
    };

    cargar();
    // Se actualiza solo para ver los cambios de estado sin recargar
    const intervalo = setInterval(cargar, 15000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <h1 className="rep-title">Mis pedidos</h1>
      </section>

      {cargando && <p className="rep-status-text">Cargando tus pedidos...</p>}
      {error && <p className="rep-status-text rep-status-error">{error}</p>}

      {!cargando && !error && pedidos.length === 0 && (
        <div className="rep-mypedido-empty">
          <Package size={30} />
          <p className="rep-status-text">
            No tienes pedidos en curso en este momento.
          </p>
          <button
            type="button"
            className="rep-btn-primary"
            onClick={() => navigate("/repartidor")}
          >
            Ver pedidos disponibles
          </button>
        </div>
      )}

      <div className="rep-mypedido-list">
        {pedidos.map((p) => {
          const ultimo = ultimoPasoHecho(p);

          return (
            <div key={p.id} className="rep-card">
              <div className="rep-mypedido-top">
                <img
                  src={
                    p.restaurante_logo ||
                    `https://picsum.photos/seed/restaurante-${p.id}/80/80`
                  }
                  alt={p.restaurante_nombre}
                  className="rep-order-img"
                />
                <div className="rep-order-info">
                  <div className="rep-order-name">{p.restaurante_nombre}</div>
                  <div className="rep-order-number">Pedido {p.codigo}</div>
                  <div className="rep-order-price">{formatXAF(p.pago)}</div>
                </div>
                <span
                  className={
                    p.estado === "en_entrega"
                      ? "rep-badge rep-badge-green"
                      : "rep-badge rep-badge-orange"
                  }
                >
                  {p.estado === "en_entrega" ? "En camino" : "Por recoger"}
                </span>
              </div>

              <div className="rep-mypedido-line">
                <MapPin size={13} />
                <span>
                  <strong>Recoger:</strong>{" "}
                  {p.restaurante_direccion || p.restaurante_nombre}
                </span>
              </div>
              <div className="rep-mypedido-line">
                <MapPin size={13} />
                <span>
                  <strong>Entregar a {p.cliente_nombre}:</strong>{" "}
                  {p.direccion_entrega || "Dirección no disponible"}
                </span>
              </div>

              <h4 className="rep-mypedido-subtitle">Actualizaciones</h4>
              <div className="rep-stepper">
                {pasos.map((paso, i) => {
                  const hecho = i <= ultimo;
                  const actual = i === ultimo + 1;
                  const momento = p.eventos[paso.clave];

                  return (
                    <div className="rep-step" key={paso.clave}>
                      <div
                        className={
                          hecho
                            ? "rep-step-dot done"
                            : actual
                              ? "rep-step-dot actual"
                              : "rep-step-dot"
                        }
                      >
                        {hecho && <CheckCircle2 size={13} />}
                      </div>
                      {i < pasos.length - 1 && (
                        <div
                          className={
                            i < ultimo ? "rep-step-line done" : "rep-step-line"
                          }
                        />
                      )}
                      <div className="rep-step-text">
                        <span
                          className={
                            hecho
                              ? "rep-step-label done"
                              : actual
                                ? "rep-step-label actual"
                                : "rep-step-label"
                          }
                        >
                          {hecho ? paso.hecho : paso.pendiente}
                        </span>
                        {hecho && momento && (
                          <span className="rep-step-time">
                            {formatMomento(momento)}
                          </span>
                        )}
                        {actual && (
                          <span className="rep-step-time">Siguiente paso</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rep-mypedido-actions">
                <button
                  type="button"
                  className="rep-btn-secondary"
                  onClick={() => navigate("/repartidor/ruta")}
                >
                  <Map size={16} /> Ver ruta
                </button>
                <button
                  type="button"
                  className="rep-btn-primary"
                  onClick={() => navigate("/repartidor/mi-entrega")}
                >
                  Continuar entrega
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {pedidos.length > 0 && (
        <p className="rep-mypedido-hint">
          Completa esta entrega para poder tomar otro pedido.
        </p>
      )}
    </div>
  );
}

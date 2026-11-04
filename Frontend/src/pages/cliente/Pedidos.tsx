import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Clock,
  Ban,
  Check,
  ChefHat,
  Bike,
  PackageCheck,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import { useRepetirPedido } from "../../hooks/useRepetirPedido";
import { formatXAF } from "../../utils/carritoCalculos";
import {
  pasosCompactos,
  completadosCompacto,
  mensajeEstado,
  formatFechaHora,
  type EstadoPedido,
} from "../../utils/seguimientoPedido";
import "../../styles/cliente/Pedidos.css";

const API_URL = import.meta.env.VITE_API_URL;

type Tab = "activos" | "historial" | "cancelados";

interface PedidoLista {
  id: number;
  codigo: string;
  estado: EstadoPedido;
  total: number;
  productos: number;
  restaurante_nombre: string;
  restaurante_logo: string | null;
  repartidor_nombre: string | null;
  fecha_creacion: string;
}

interface Datos {
  activos: PedidoLista[];
  historial: PedidoLista[];
  cancelados: PedidoLista[];
}

const iconosPasos = [Check, ChefHat, Bike, PackageCheck];

function etiquetaFinal(estado: EstadoPedido) {
  if (estado === "entregado") return "Entregado";
  if (estado === "rechazado") return "Rechazado";
  return "Cancelado";
}

function TarjetaActiva({
  p,
  onAbrir,
}: {
  p: PedidoLista;
  onAbrir: () => void;
}) {
  const completados = completadosCompacto(p.estado);

  return (
    <div
      className="active-order-card"
      role="button"
      tabIndex={0}
      onClick={onAbrir}
      onKeyDown={(e) => {
        if (e.key === "Enter") onAbrir();
      }}
    >
      <div className="active-order-top">
        <img
          src={
            p.restaurante_logo ||
            `https://picsum.photos/seed/restaurante-${p.id}/120/120`
          }
          alt={p.restaurante_nombre}
          className="active-order-img"
        />
        <div className="active-order-info">
          <span className="active-order-name">{p.restaurante_nombre}</span>
          <span className="active-order-meta">Pedido {p.codigo}</span>
          <span className="active-order-meta">
            {formatFechaHora(p.fecha_creacion)} · {p.productos}{" "}
            {p.productos === 1 ? "producto" : "productos"}
          </span>
          <span className="active-order-status">
            {mensajeEstado(p.estado, p.repartidor_nombre)}
          </span>
        </div>
      </div>

      <div className="order-stepper">
        {pasosCompactos.map((label, i) => {
          const Icon = iconosPasos[i];
          const hecho = i < completados;
          const enCurso =
            i === completados && completados < pasosCompactos.length;

          return (
            <div className="order-step" key={label}>
              <div
                className={
                  hecho
                    ? "order-step-icon done"
                    : enCurso
                      ? "order-step-icon current"
                      : "order-step-icon"
                }
              >
                <Icon size={14} />
              </div>
              <span
                className={
                  hecho
                    ? "order-step-label done"
                    : enCurso
                      ? "order-step-label current"
                      : "order-step-label"
                }
              >
                {label}
              </span>
              {i < pasosCompactos.length - 1 && (
                <div
                  className={
                    i < completados - 1
                      ? "order-step-line done"
                      : "order-step-line"
                  }
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="active-order-footer">
        <span className="active-order-total">{formatXAF(p.total)}</span>
        <span className="active-order-link">
          Ver seguimiento <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
}

function TarjetaHistorial({
  p,
  onAbrir,
  onRepetir,
  ocupado,
}: {
  p: PedidoLista;
  onAbrir: () => void;
  onRepetir: () => void;
  ocupado: boolean;
}) {
  const entregado = p.estado === "entregado";

  return (
    <div
      className="order-history-card"
      role="button"
      tabIndex={0}
      onClick={onAbrir}
      onKeyDown={(e) => {
        if (e.key === "Enter") onAbrir();
      }}
    >
      <img
        src={
          p.restaurante_logo ||
          `https://picsum.photos/seed/restaurante-${p.id}/120/120`
        }
        alt={p.restaurante_nombre}
        className="order-history-img"
      />
      <div className="order-history-info">
        <span className="order-history-name">{p.restaurante_nombre}</span>
        <span className="order-history-meta">Pedido {p.codigo}</span>
        <span className="order-history-meta">
          {formatFechaHora(p.fecha_creacion)}
        </span>
        <span
          className={
            entregado
              ? "order-history-badge entregado"
              : "order-history-badge cancelado"
          }
        >
          {etiquetaFinal(p.estado)}
        </span>
      </div>
      <div className="order-history-right">
        <span className="order-history-price">
          {formatXAF(p.total)} <ChevronRight size={14} />
        </span>
        {entregado && (
          <button
            type="button"
            className="reorder-btn"
            disabled={ocupado}
            onClick={(e) => {
              e.stopPropagation(); // no abrir el seguimiento al tocar este botón
              onRepetir();
            }}
          >
            <RotateCw size={13} />
            {ocupado ? "Añadiendo..." : "Volver a pedir"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Pedidos() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { repetir, ocupado, aviso, modalConfirmacion } = useRepetirPedido();

  const [tab, setTab] = useState<Tab>("activos");
  const [datos, setDatos] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = () =>
      axios
        .get(`${API_URL}/api/cliente/pedidos`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setDatos(res.data);
          setError("");
        })
        .catch(() => setError("No se pudieron cargar tus pedidos"))
        .finally(() => setCargando(false));

    cargar();
    // Se actualiza sola para ver los cambios de estado sin recargar
    const intervalo = setInterval(cargar, 15000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrir = (id: number) => navigate(`/cliente/pedidos/${id}`);

  const renderHistorial = (lista: PedidoLista[]) =>
    lista.map((p) => (
      <TarjetaHistorial
        key={p.id}
        p={p}
        onAbrir={() => abrir(p.id)}
        onRepetir={() => repetir(p.id)}
        ocupado={ocupado === p.id}
      />
    ));

  return (
    <div className="pedidos-page">
      <section className="pedidos-header">
        <div>
          <h1 className="pedidos-title">Mis pedidos</h1>
          <p className="pedidos-subtitle">
            Consulta el estado actual y el historial de tus pedidos
          </p>
        </div>
      </section>

      <div className="pedidos-tabs">
        <button
          type="button"
          className={tab === "activos" ? "pedidos-tab active" : "pedidos-tab"}
          onClick={() => setTab("activos")}
        >
          <Package size={16} />
          Activos
          {datos && datos.activos.length > 0 && (
            <span className="pedidos-tab-dot" />
          )}
        </button>
        <button
          type="button"
          className={tab === "historial" ? "pedidos-tab active" : "pedidos-tab"}
          onClick={() => setTab("historial")}
        >
          <Clock size={16} />
          Historial
        </button>
        <button
          type="button"
          className={
            tab === "cancelados" ? "pedidos-tab active" : "pedidos-tab"
          }
          onClick={() => setTab("cancelados")}
        >
          <Ban size={16} />
          Cancelados
        </button>
      </div>

      {aviso && <p className="pedidos-warning">{aviso}</p>}
      {cargando && <p className="pedidos-status">Cargando tus pedidos...</p>}
      {!cargando && !datos && error && (
        <p className="pedidos-status error">{error}</p>
      )}

      {datos && tab === "activos" && (
        <>
          {datos.activos.length === 0 ? (
            <div className="pedidos-empty">
              <p className="pedidos-empty-text">
                No tienes pedidos en curso en este momento.
              </p>
              <button
                type="button"
                className="pedidos-empty-btn"
                onClick={() => navigate("/cliente/restaurantes")}
              >
                Ver restaurantes
              </button>
            </div>
          ) : (
            <section className="pedidos-section">
              <div className="pedidos-section-header">
                <h3>
                  {datos.activos.length === 1
                    ? "Pedido en curso"
                    : "Pedidos en curso"}
                </h3>
              </div>
              <div className="active-order-list">
                {datos.activos.map((p) => (
                  <TarjetaActiva key={p.id} p={p} onAbrir={() => abrir(p.id)} />
                ))}
              </div>
            </section>
          )}

          {datos.historial.length > 0 && (
            <section className="pedidos-section pedidos-section-last">
              <div className="pedidos-section-header">
                <h3>Historial reciente</h3>
                <button
                  type="button"
                  className="pedidos-link-btn"
                  onClick={() => setTab("historial")}
                >
                  Ver todo
                </button>
              </div>
              <div className="order-history-list">
                {renderHistorial(datos.historial.slice(0, 3))}
              </div>
            </section>
          )}
        </>
      )}

      {datos && tab === "historial" && (
        <section className="pedidos-section pedidos-section-last">
          {datos.historial.length === 0 ? (
            <p className="pedidos-empty-text">
              Aún no tienes pedidos entregados.
            </p>
          ) : (
            <div className="order-history-list">
              {renderHistorial(datos.historial)}
            </div>
          )}
        </section>
      )}

      {datos && tab === "cancelados" && (
        <section className="pedidos-section pedidos-section-last">
          {datos.cancelados.length === 0 ? (
            <p className="pedidos-empty-text">No tienes pedidos cancelados.</p>
          ) : (
            <div className="order-history-list">
              {renderHistorial(datos.cancelados)}
            </div>
          )}
        </section>
      )}

      {modalConfirmacion}
    </div>
  );
}

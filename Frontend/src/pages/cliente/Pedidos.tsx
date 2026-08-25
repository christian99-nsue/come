import { useState } from "react";
import {
  Package,
  Clock,
  Ban,
  Check,
  Scooter,
  Wallet,
  RotateCw,
  ChevronRight,
  Truck,
} from "lucide-react";
import pizzaTop from "../../assets/pizza-top.jpg";
import wokExpress from "../../assets/wok-express.jpg";
import bites from "../../assets/bites.png";
import chicken from "../../assets/chicken.png";
import combo from "../../assets/combo.png";
import repartidor from "../../assets/repartidor.png";
import "../../styles/pedidos.css";

type Tab = "activos" | "historial" | "cancelados";
type EstadoPedido =
  | "confirmado"
  | "preparando"
  | "en_camino"
  | "entregado"
  | "cancelado";

interface Pedido {
  id: string;
  numero: string;
  restaurante: string;
  imagen: string;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  // solo para el pedido activo destacado
  llegadaEstimada?: string;
  repartidor?: string;
  repartidorImg?: string;
}

const pasosEstado = [
  { key: "confirmado", label: "Confirmado", icon: Check },
  { key: "preparando", label: "Preparando", icon: Package },
  { key: "en_camino", label: "En camino", icon: Scooter },
  { key: "entregado", label: "Entregado", icon: Wallet },
] as const;

const pedidosMock: Pedido[] = [
  {
    id: "1",
    numero: "#12345",
    restaurante: "Burger House",
    imagen: combo,
    fecha: "Hoy, 10:30",
    estado: "en_camino",
    total: 3500,
    llegadaEstimada: "10 - 15 min",
    repartidor: "Marta",
    repartidorImg: repartidor,
  },
  {
    id: "2",
    numero: "#12345",
    restaurante: "Pizza Top",
    imagen: pizzaTop,
    fecha: "Ayer, 20:15",
    estado: "entregado",
    total: 7500,
  },
  {
    id: "3",
    numero: "#12345",
    restaurante: "Wok Express",
    imagen: wokExpress,
    fecha: "15 jul, 20:15",
    estado: "entregado",
    total: 6000,
  },
  {
    id: "4",
    numero: "#12345",
    restaurante: "Chicken Spot",
    imagen: chicken,
    fecha: "20 jun, 20:15",
    estado: "cancelado",
    total: 4500,
  },
  {
    id: "5",
    numero: "#12345",
    restaurante: "Green Bites",
    imagen: bites,
    fecha: "15 jun, 20:15",
    estado: "entregado",
    total: 5200,
  },
  {
    id: "6",
    numero: "#12345",
    restaurante: "Chicken Spot",
    imagen: chicken,
    fecha: "20 jun, 20:15",
    estado: "entregado",
    total: 4500,
  },
];

function formatXAF(valor: number) {
  return `${valor.toLocaleString("es-ES")} XAF`;
}

function estadoLabel(estado: EstadoPedido) {
  switch (estado) {
    case "entregado":
      return "Entregado";
    case "cancelado":
      return "Cancelado";
    case "en_camino":
      return "En camino";
    case "preparando":
      return "Preparando";
    case "confirmado":
      return "Confirmado";
  }
}

const pasoIndexPorEstado: Record<EstadoPedido, number> = {
  confirmado: 0,
  preparando: 1,
  en_camino: 2,
  entregado: 3,
  cancelado: -1,
};

export default function Pedidos() {
  const [tab, setTab] = useState<Tab>("activos");

  const pedidoActivo = pedidosMock.find(
    (p) =>
      p.estado === "en_camino" ||
      p.estado === "preparando" ||
      p.estado === "confirmado",
  );

  const historial = pedidosMock.filter((p) => p.estado === "entregado");
  const cancelados = pedidosMock.filter((p) => p.estado === "cancelado");

  return (
    <div className="pedidos-page">
      {/* Encabezado */}
      <section className="pedidos-header">
        <div>
          <h1 className="pedidos-title">Mis pedidos</h1>
          <p className="pedidos-subtitle">
            Consulta el estado actual y el historial de tus pedidos
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="pedidos-tabs">
        <button
          type="button"
          className={tab === "activos" ? "pedidos-tab active" : "pedidos-tab"}
          onClick={() => setTab("activos")}
        >
          <Package size={16} />
          Activos
          {pedidoActivo && <span className="pedidos-tab-dot" />}
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

      {/* Contenido: Activos */}
      {tab === "activos" && (
        <>
          {pedidoActivo ? (
            <section className="pedidos-section">
              <div className="pedidos-section-header">
                <h3>Pedido en camino</h3>
                <button type="button" className="pedidos-link-btn">
                  Ver detalles
                </button>
              </div>

              <div className="active-order-card">
                <div className="active-order-top">
                  <img
                    src={pedidoActivo.imagen}
                    alt={pedidoActivo.restaurante}
                    className="active-order-img"
                  />
                  <div className="active-order-info">
                    <span className="active-order-name">
                      {pedidoActivo.restaurante}
                    </span>
                    <span className="active-order-meta">
                      Pedido {pedidoActivo.numero}
                    </span>
                    <span className="active-order-meta">
                      {pedidoActivo.fecha}
                    </span>
                    <span className="active-order-status">
                      {estadoLabel(pedidoActivo.estado)}
                    </span>
                  </div>
                </div>

                {/* Stepper de estado */}
                <div className="order-stepper">
                  {pasosEstado.map((paso, i) => {
                    const currentIndex =
                      pasoIndexPorEstado[pedidoActivo.estado];
                    const isDone = i <= currentIndex;
                    const Icon = paso.icon;
                    return (
                      <div className="order-step" key={paso.key}>
                        <div
                          className={
                            isDone ? "order-step-icon done" : "order-step-icon"
                          }
                        >
                          <Icon size={14} />
                        </div>
                        <span
                          className={
                            isDone
                              ? "order-step-label done"
                              : "order-step-label"
                          }
                        >
                          {paso.label}
                        </span>
                        {i < pasosEstado.length - 1 && (
                          <div
                            className={
                              isDone
                                ? "order-step-line done"
                                : "order-step-line"
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Info de entrega + repartidor */}
                {pedidoActivo.llegadaEstimada && (
                  <div className="active-order-delivery">
                    <div className="active-order-delivery-info">
                      <Truck size={16} className="active-order-delivery-icon" />
                      <div className="active-order-delivery-text">
                        <span className="active-order-delivery-label">
                          Llegada estimada
                        </span>
                        <span className="active-order-delivery-value">
                          {pedidoActivo.llegadaEstimada}
                        </span>
                      </div>
                    </div>
                    <div className="active-order-courier">
                      <img
                        src={pedidoActivo.repartidorImg}
                        alt={pedidoActivo.repartidor}
                        className="active-order-courier-img"
                      />
                      <div className="active-order-delivery-text">
                        <span className="active-order-delivery-value">
                          {pedidoActivo.repartidor}
                        </span>
                        <span className="active-order-delivery-label">
                          Tu repartidor
                        </span>
                      </div>
                    </div>
                    <div>
                      <button type="button" className="contact-btn">
                        Contactar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <p className="pedidos-empty-text">
              No tienes pedidos activos en este momento.
            </p>
          )}

          {/* Historial reciente (siempre visible bajo Activos) */}
          <section className="pedidos-section pedidos-section-last">
            <div className="pedidos-section-header">
              <h3>Historial reciente</h3>
              <button type="button" className="pedidos-link-btn">
                Ver todo
              </button>
            </div>
            <div className="order-history-list">
              {pedidosMock
                .filter((p) => p.id !== pedidoActivo?.id)
                .map((p) => (
                  <OrderHistoryCard key={p.id} pedido={p} />
                ))}
            </div>
          </section>
        </>
      )}

      {/* Contenido: Historial */}
      {tab === "historial" && (
        <section className="pedidos-section pedidos-section-last">
          {historial.length > 0 ? (
            <div className="order-history-list">
              {historial.map((p) => (
                <OrderHistoryCard key={p.id} pedido={p} />
              ))}
            </div>
          ) : (
            <p className="pedidos-empty-text">
              Aún no tienes pedidos entregados.
            </p>
          )}
        </section>
      )}

      {/* Contenido: Cancelados */}
      {tab === "cancelados" && (
        <section className="pedidos-section pedidos-section-last">
          {cancelados.length > 0 ? (
            <div className="order-history-list">
              {cancelados.map((p) => (
                <OrderHistoryCard key={p.id} pedido={p} />
              ))}
            </div>
          ) : (
            <p className="pedidos-empty-text">No tienes pedidos cancelados.</p>
          )}
        </section>
      )}
    </div>
  );
}

function OrderHistoryCard({ pedido }: { pedido: Pedido }) {
  const esCancelado = pedido.estado === "cancelado";

  return (
    <div className="order-history-card">
      <img
        src={pedido.imagen}
        alt={pedido.restaurante}
        className="order-history-img"
      />
      <div className="order-history-info">
        <span className="order-history-name">{pedido.restaurante}</span>
        <span className="order-history-meta">Pedido {pedido.numero}</span>
        <span className="order-history-meta">{pedido.fecha}</span>
        <span
          className={
            esCancelado
              ? "order-history-badge cancelado"
              : "order-history-badge entregado"
          }
        >
          {estadoLabel(pedido.estado)}
        </span>
      </div>
      <div className="order-history-right">
        <span className="order-history-price">
          {formatXAF(pedido.total)} <ChevronRight size={14} />
        </span>
        {!esCancelado && (
          <button type="button" className="reorder-btn">
            <RotateCw size={13} />
            Volver a pedir
          </button>
        )}
      </div>
    </div>
  );
}

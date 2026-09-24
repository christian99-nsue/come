import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  ShoppingCart,
  Tag,
  Info,
  ChevronRight,
} from "lucide-react";
import "../../styles/cliente/NotificacionesFeed.css";

type Filtro = "todas" | "pedidos" | "promociones";
type TipoNotif = "pedido" | "promocion" | "info";

interface NotifItem {
  id: string;
  tipo: TipoNotif;
  titulo: string;
  descripcion: string;
  hace: string;
  sinLeer: boolean;
}

const notificacionesMock: NotifItem[] = [
  {
    id: "1",
    tipo: "pedido",
    titulo: "Tu pedido está en camino",
    descripcion:
      "El repartidor ya salió del restaurante y se dirige a tu dirección.",
    hace: "Hace 12 min",
    sinLeer: true,
  },
  {
    id: "2",
    tipo: "pedido",
    titulo: "Pedido confirmado",
    descripcion: "Tu pedido de Burger House ha sido confirmado.",
    hace: "Hace 35 min",
    sinLeer: true,
  },
  {
    id: "3",
    tipo: "promocion",
    titulo: "¡Promoción especial!",
    descripcion:
      "Disfruta de un 20% de descuento en Pizza Top. Válido por 24 horas.",
    hace: "Hace 2 h",
    sinLeer: true,
  },
  {
    id: "4",
    tipo: "info",
    titulo: "Recordatorio de pedido",
    descripcion:
      "No olvides revisar tu pedido antes de que llegue el repartidor.",
    hace: "Hace 4 h",
    sinLeer: false,
  },
  {
    id: "5",
    tipo: "pedido",
    titulo: "Restaurante favorito en oferta",
    descripcion: "Burger House tiene un 15% de descuento en toda su carta.",
    hace: "Hace 6 h",
    sinLeer: false,
  },
  {
    id: "6",
    tipo: "pedido",
    titulo: "Nuevo restaurante disponible",
    descripcion: "Ahora puedes pedir en Café & Más. ¡Descúbrelo!",
    hace: "Hace 1 día",
    sinLeer: false,
  },
  {
    id: "7",
    tipo: "info",
    titulo: "¡Gracias por tu pedido!",
    descripcion:
      "Esperamos que lo disfrutes. Si tienes algún problema, contáctanos.",
    hace: "Hace 1 día",
    sinLeer: false,
  },
];

function iconoPara(tipo: TipoNotif) {
  switch (tipo) {
    case "promocion":
      return <Tag size={18} />;
    case "info":
      return <Info size={18} />;
    default:
      return <ShoppingCart size={18} />;
  }
}

export default function NotificacionesFeed() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const notificacionesFiltradas = notificacionesMock.filter((n) => {
    if (filtro === "todas") return true;
    if (filtro === "pedidos") return n.tipo === "pedido";
    return n.tipo === "promocion";
  });

  return (
    <div className="notif-page">
      <section className="notif-header">
        <button
          type="button"
          className="notif-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="notif-title">Notificaciones</h1>
        <button
          type="button"
          className="notif-settings-btn"
          onClick={() => navigate("/cliente/notificaciones/preferencias")}
          aria-label="Configurar notificaciones"
        >
          <Settings size={20} />
        </button>
      </section>

      <div className="notif-filters">
        <button
          type="button"
          className={
            filtro === "todas"
              ? "notif-filter-chip active"
              : "notif-filter-chip"
          }
          onClick={() => setFiltro("todas")}
        >
          Todas
        </button>
        <button
          type="button"
          className={
            filtro === "pedidos"
              ? "notif-filter-chip active"
              : "notif-filter-chip"
          }
          onClick={() => setFiltro("pedidos")}
        >
          <ShoppingCart size={14} /> Pedidos
        </button>
        <button
          type="button"
          className={
            filtro === "promociones"
              ? "notif-filter-chip active"
              : "notif-filter-chip"
          }
          onClick={() => setFiltro("promociones")}
        >
          <Tag size={14} /> Promociones
        </button>
      </div>

      <div className="notif-list">
        {notificacionesFiltradas.map((n) => (
          <button key={n.id} type="button" className="notif-item">
            <span className={`notif-item-icon tipo-${n.tipo}`}>
              {iconoPara(n.tipo)}
            </span>
            <div className="notif-item-body">
              <span className="notif-item-title">{n.titulo}</span>
              <span className="notif-item-desc">{n.descripcion}</span>
              <span className="notif-item-time">{n.hace}</span>
            </div>
            <div className="notif-item-right">
              {n.sinLeer && <span className="notif-item-dot" />}
              <ChevronRight size={16} color="#9ca3af" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Clock,
  MapPinCheck,
  CheckCircle2,
  Megaphone,
  ChevronRight,
} from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

interface NotificacionRep {
  id: string;
  icon: typeof Package;
  titulo: string;
  subtitulo: string;
  hace: string;
}

const notificacionesMock: NotificacionRep[] = [
  {
    id: "1",
    icon: Package,
    titulo: "Nuevo pedido disponible",
    subtitulo: "Burger House · #FL-2841",
    hace: "Hace 5 min",
  },
  {
    id: "2",
    icon: Clock,
    titulo: "Pedido listo para recoger",
    subtitulo: "Pizza Top · #FL-2842",
    hace: "Hace 32 min",
  },
  {
    id: "3",
    icon: MapPinCheck,
    titulo: "Cambio en la dirección",
    subtitulo: "Cliente · #FL-2839",
    hace: "Hace 1h",
  },
  {
    id: "4",
    icon: CheckCircle2,
    titulo: "Entrega registrada",
    subtitulo: "#FL-2838",
    hace: "Hace 2h",
  },
  {
    id: "5",
    icon: Megaphone,
    titulo: "Aviso del administrador",
    subtitulo: "Mantenimiento del sistema",
    hace: "Hace 3h",
  },
  {
    id: "6",
    icon: Package,
    titulo: "Nuevo pedido disponible",
    subtitulo: "Sabor Africano · #FL-2837",
    hace: "Hace 4h",
  },
];

export default function NotificacionesRepartidor() {
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
        <h1 className="rep-title">Notificaciones</h1>
      </section>

      <div className="rep-notif-list">
        {notificacionesMock.map((n) => {
          const Icon = n.icon;
          return (
            <button key={n.id} type="button" className="rep-notif-item">
              <span className="rep-info-icon">
                <Icon size={17} />
              </span>
              <div className="rep-notif-info">
                <div className="rep-notif-title">{n.titulo}</div>
                <div className="rep-notif-subtitle">{n.subtitulo}</div>
                <div className="rep-notif-time">{n.hace}</div>
              </div>
              <ChevronRight size={16} color="#9ca3af" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

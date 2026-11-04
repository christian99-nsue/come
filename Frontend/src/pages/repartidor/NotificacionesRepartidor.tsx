import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Megaphone,
  ChevronRight,
  Bell,
  Layers,
  CheckCheck,
} from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

type TipoNotif =
  | "nuevo_pedido"
  | "entrega_registrada"
  | "aviso"
  | "lote_liberado";

interface Notificacion {
  id: number;
  tipo: TipoNotif;
  titulo: string;
  mensaje: string | null;
  leida: boolean;
  pedido_id: number | null;
  fecha_creacion: string;
  reporte_id: number | null;
}

function tiempoRelativo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "Ahora mismo";
  if (min < 60) return `Hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Hace ${horas} h`;
  return `Hace ${Math.floor(horas / 24)} día(s)`;
}

function iconoPara(tipo: TipoNotif) {
  switch (tipo) {
    case "nuevo_pedido":
      return <Package size={17} />;
    case "entrega_registrada":
      return <CheckCircle2 size={17} />;
    case "lote_liberado":
      return <Layers size={17} />;
    default:
      return <Megaphone size={17} />;
  }
}

export default function NotificacionesRepartidor() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarNotificaciones = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/repartidor/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificaciones(res.data);
      setError("");
    } catch {
      setError("No se pudieron cargar las notificaciones");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;

    const obtenerNotificaciones = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/repartidor/notificaciones`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!cancelado) {
          setNotificaciones(res.data);
          setError("");
        }
      } catch {
        if (!cancelado) {
          setError("No se pudieron cargar las notificaciones");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    void obtenerNotificaciones();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirNotificacion = (n: Notificacion) => {
    if (!n.leida) {
      // Se marca como leída al instante; si falla no es grave, se corrige al recargar
      setNotificaciones((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)),
      );
      axios
        .patch(
          `${API_URL}/api/repartidor/notificaciones/${n.id}/leida`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        .catch(() => {});
    }

    if (n.reporte_id) {
      navigate(`/repartidor/ayuda/reportes/${n.reporte_id}`);
      return;
    }

    if (n.tipo === "nuevo_pedido" && n.pedido_id) {
      navigate(`/repartidor/pedido/${n.pedido_id}`);
    } else if (n.tipo === "entrega_registrada" && n.pedido_id) {
      navigate(`/repartidor/entrega-completada/${n.pedido_id}`);
    } else if (n.tipo === "lote_liberado") {
      navigate("/repartidor");
      return;
    }
  };

  const marcarTodasLeidas = async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    try {
      await axios.patch(
        `${API_URL}/api/repartidor/notificaciones/leer-todas`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      cargarNotificaciones(); // si falla, se vuelve a lo que dice el servidor
    }
  };

  const hayNoLeidas = notificaciones.some((n) => !n.leida);

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
        {hayNoLeidas && (
          <button
            type="button"
            className="rep-notif-read-all"
            onClick={marcarTodasLeidas}
          >
            <CheckCheck size={15} /> Marcar todas
          </button>
        )}
      </section>

      {cargando && (
        <p className="rep-status-text">Cargando notificaciones...</p>
      )}
      {error && <p className="rep-status-text rep-status-error">{error}</p>}

      {!cargando && !error && notificaciones.length === 0 && (
        <div className="rep-notif-empty">
          <Bell size={28} />
          <p className="rep-status-text">No tienes notificaciones por ahora.</p>
        </div>
      )}

      <div className="rep-notif-list">
        {notificaciones.map((n) => (
          <button
            key={n.id}
            type="button"
            className={n.leida ? "rep-notif-item" : "rep-notif-item unread"}
            onClick={() => abrirNotificacion(n)}
          >
            <span className="rep-info-icon">{iconoPara(n.tipo)}</span>
            <div className="rep-notif-info">
              <div className="rep-notif-title">{n.titulo}</div>
              {n.mensaje && (
                <div className="rep-notif-subtitle">{n.mensaje}</div>
              )}
              <div className="rep-notif-time">
                {tiempoRelativo(n.fecha_creacion)}
              </div>
            </div>
            {!n.leida && <span className="rep-notif-dot" />}
            {(n.pedido_id || n.reporte_id || n.tipo === "lote_liberado") && (
              <ChevronRight size={16} color="#9ca3af" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

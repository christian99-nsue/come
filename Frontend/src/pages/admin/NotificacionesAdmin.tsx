import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, ShoppingCart, Megaphone, Boxes, CheckCheck } from "lucide-react";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/NotificacionesAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

type Tab = "todas" | "pedido" | "sistema";
type TipoNotif = "pedido" | "sistema" | "abastecimiento";

interface Notificacion {
  id: number;
  tipo: TipoNotif;
  titulo: string;
  mensaje: string | null;
  leida: boolean;
  referencia_id: number | null;
  fecha_creacion: string;
}

function tiempoRelativo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);

  if (min < 1) return "Ahora mismo";
  if (min < 60) return `Hace ${min} min`;

  const horas = Math.floor(min / 60);

  if (horas < 24) return `Hace ${horas} h`;

  return `Hace ${Math.floor(horas / 24)} día(s)`;
}

function iconoPara(tipo: TipoNotif) {
  switch (tipo) {
    case "pedido":
      return <ShoppingCart size={17} />;

    case "abastecimiento":
      return <Boxes size={17} />;

    default:
      return <Megaphone size={17} />;
  }
}

export default function NotificacionesAdmin() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("todas");
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const cargarNotificaciones = async () => {
    setCargando(true);
    setError("");

    try {
      const res = await axios.get(`${API_URL}/api/admin/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` },
        params: tab !== "todas" ? { tipo: tab } : {},
      });

      setNotificaciones(res.data);
    } catch {
      setError("No se pudieron cargar las notificaciones");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const cargarNotificacionesInicial = async () => {
      setCargando(true);
      setError("");

      try {
        const res = await axios.get(`${API_URL}/api/admin/notificaciones`, {
          headers: { Authorization: `Bearer ${token}` },
          params: tab !== "todas" ? { tipo: tab } : {},
        });

        setNotificaciones(res.data);
      } catch {
        setError("No se pudieron cargar las notificaciones");
      } finally {
        setCargando(false);
      }
    };

    cargarNotificacionesInicial();
  }, [tab, token]);

  const abrirNotificacion = async (n: Notificacion) => {
    if (!n.leida) {
      // actualización optimista
      setNotificaciones((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)),
      );

      axios
        .patch(
          `${API_URL}/api/admin/notificaciones/${n.id}/leida`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        .catch(() => {});
    }

    if (n.tipo === "pedido" && n.referencia_id) {
      navigate(`/admin/pedidos/${n.referencia_id}`);
    } else if (n.tipo === "abastecimiento" && n.referencia_id) {
      navigate("/admin/abastecimiento");
    }
  };

  const marcarTodasLeidas = async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));

    try {
      await axios.patch(
        `${API_URL}/api/admin/notificaciones/leer-todas`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch {
      cargarNotificaciones();
    }
  };

  const hayNoLeidas = notificaciones.some((n) => !n.leida);

  return (
    <div className="admin-page">
      <section className="admin-header">
        <h1 className="admin-title">Notificaciones</h1>

        {hayNoLeidas && (
          <button
            type="button"
            className="notif-admin-read-all"
            onClick={marcarTodasLeidas}
          >
            <CheckCheck size={15} /> Marcar todas
          </button>
        )}
      </section>

      <div className="notif-admin-tabs">
        <button
          type="button"
          className={
            tab === "todas" ? "notif-admin-tab active" : "notif-admin-tab"
          }
          onClick={() => setTab("todas")}
        >
          Todas
        </button>

        <button
          type="button"
          className={
            tab === "pedido" ? "notif-admin-tab active" : "notif-admin-tab"
          }
          onClick={() => setTab("pedido")}
        >
          Pedidos
        </button>

        <button
          type="button"
          className={
            tab === "sistema" ? "notif-admin-tab active" : "notif-admin-tab"
          }
          onClick={() => setTab("sistema")}
        >
          Sistema
        </button>
      </div>

      {cargando && (
        <p className="pedidos-status-text">Cargando notificaciones...</p>
      )}

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      {!cargando && !error && notificaciones.length === 0 && (
        <div className="notif-admin-empty">
          <Bell size={28} className="notif-admin-empty-icon" />

          <p className="notif-admin-empty-text">
            No tienes notificaciones por ahora.
          </p>
        </div>
      )}

      <div className="notif-admin-list">
        {notificaciones.map((n) => (
          <button
            key={n.id}
            type="button"
            className={n.leida ? "notif-admin-item" : "notif-admin-item unread"}
            onClick={() => abrirNotificacion(n)}
          >
            <span className={`notif-admin-icon tipo-${n.tipo}`}>
              {iconoPara(n.tipo)}
            </span>

            <div className="notif-admin-body">
              <span className="notif-admin-title">{n.titulo}</span>

              {n.mensaje && (
                <span className="notif-admin-desc">{n.mensaje}</span>
              )}

              <span className="notif-admin-time">
                {tiempoRelativo(n.fecha_creacion)}
              </span>
            </div>

            {!n.leida && <span className="notif-admin-dot" />}
          </button>
        ))}
      </div>
    </div>
  );
}

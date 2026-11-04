import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Settings,
  ShoppingCart,
  Tag,
  Info,
  ChevronRight,
  Bell,
  CheckCheck,
} from "lucide-react";
import "../../styles/cliente/NotificacionesFeed.css";

const API_URL = import.meta.env.VITE_API_URL;

type Filtro = "todas" | "sin_leer";
type TipoNotif = "pedido" | "promocion" | "info";

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
  const dias = Math.floor(horas / 24);
  return dias === 1 ? "Hace 1 día" : `Hace ${dias} días`;
}

function icono(tipo: TipoNotif) {
  if (tipo === "promocion") return <Tag size={18} />;
  if (tipo === "info") return <Info size={18} />;
  return <ShoppingCart size={18} />;
}

export default function NotificacionesFeed() {
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [lista, setLista] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Avisa al contador de la campana y del menú para que se actualice al instante
  const avisarCambio = () =>
    window.dispatchEvent(new Event("notificaciones-cliente"));

  const cargar = () =>
    axios
      .get(`${API_URL}/api/cliente/notificaciones`, { headers })
      .then((res) => {
        setLista(res.data);
        setError("");
      })
      .catch(() => setError("No se pudieron cargar tus notificaciones"))
      .finally(() => setCargando(false));

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrir = (n: Notificacion) => {
    if (!n.leida) {
      // Se marca como leída al instante; si el servidor falla, se vuelve a lo que él dice
      setLista((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)),
      );
      axios
        .patch(
          `${API_URL}/api/cliente/notificaciones/${n.id}/leida`,
          {},
          { headers },
        )
        .then(avisarCambio)
        .catch(() => cargar());
    }

    if (n.reporte_id) navigate(`/cliente/mis-reportes/${n.reporte_id}`);
    else if (n.pedido_id) navigate(`/cliente/pedidos/${n.pedido_id}`);
  };

  const marcarTodasLeidas = () => {
    setLista((prev) => prev.map((n) => ({ ...n, leida: true })));
    axios
      .patch(
        `${API_URL}/api/cliente/notificaciones/leer-todas`,
        {},
        { headers },
      )
      .then(avisarCambio)
      .catch(() => cargar());
  };

  const hayNoLeidas = lista.some((n) => !n.leida);
  const visibles =
    filtro === "sin_leer" ? lista.filter((n) => !n.leida) : lista;

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
            filtro === "sin_leer"
              ? "notif-filter-chip active"
              : "notif-filter-chip"
          }
          onClick={() => setFiltro("sin_leer")}
        >
          Sin leer
        </button>
      </div>

      {hayNoLeidas && (
        <div className="notif-toolbar">
          <button
            type="button"
            className="notif-read-all"
            onClick={marcarTodasLeidas}
          >
            <CheckCheck size={15} /> Marcar todas como leídas
          </button>
        </div>
      )}

      {cargando && (
        <p className="notif-status">Cargando tus notificaciones...</p>
      )}
      {!cargando && error && lista.length === 0 && (
        <p className="notif-status error">{error}</p>
      )}

      {!cargando && !error && visibles.length === 0 && (
        <div className="notif-empty">
          <Bell size={28} />
          <p className="notif-status">
            {filtro === "sin_leer"
              ? "No tienes notificaciones sin leer."
              : "No tienes notificaciones por ahora."}
          </p>
        </div>
      )}

      <div className="notif-list">
        {visibles.map((n) => (
          <button
            key={n.id}
            type="button"
            className={n.leida ? "notif-item" : "notif-item unread"}
            onClick={() => abrir(n)}
          >
            <span className={`notif-item-icon tipo-${n.tipo}`}>
              {icono(n.tipo)}
            </span>
            <div className="notif-item-body">
              <span className="notif-item-title">{n.titulo}</span>
              {n.mensaje && (
                <span className="notif-item-desc">{n.mensaje}</span>
              )}
              <span className="notif-item-time">
                {tiempoRelativo(n.fecha_creacion)}
              </span>
            </div>
            <div className="notif-item-right">
              {!n.leida && <span className="notif-item-dot" />}
              {(n.pedido_id || n.reporte_id) && (
                <ChevronRight size={16} color="#9ca3af" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

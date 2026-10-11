import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sparkles,
  ChefHat,
  CheckCircle2,
  Bike,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { getUser } from "../../utils/auth";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/DashboardAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

interface PedidoAtencion {
  id: number;
  codigo: string;
  cliente_nombre: string;
  estado: "nuevo" | "en_preparacion" | "listo_para_recoger";
  total: number;
  fecha_creacion: string;
}

interface DashboardData {
  resumenHoy: {
    pedidosNuevos: number;
    enPreparacion: number;
    listosParaRecoger: number;
    enEntrega: number;
  };
  pedidosAtencion: PedidoAtencion[];
  comparativaVentas: {
    ventasHoy: number;
    ventasAyer: number;
    variacionPorcentaje: number;
  };
}

function formatXAF(v: number) {
  return `${Number(v).toLocaleString("es-ES")} XAF`;
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function estadoInfo(estado: PedidoAtencion["estado"]) {
  switch (estado) {
    case "nuevo":
      return {
        label: "Nuevo",
        clase: "admin-badge-red",
        icon: <AlertCircle size={14} />,
      };
    case "en_preparacion":
      return {
        label: "En preparación",
        clase: "admin-badge-orange",
        icon: <ChefHat size={14} />,
      };
    default:
      return {
        label: "Listo para recoger",
        clase: "admin-badge-green",
        icon: <CheckCircle2 size={14} />,
      };
  }
}

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const user = getUser();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch(() => setError("No se pudo cargar el panel"))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <div className="admin-page">
        <p className="pedidos-status-text">Cargando panel...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="admin-page">
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      </div>
    );
  }

  const { resumenHoy, pedidosAtencion, comparativaVentas } = data;

  return (
    <div className="admin-page">
      <div className="dash-greeting">
        <h2 className="dash-greeting-title">¡Hola! {user?.nombre} 👋</h2>
        <p className="dash-greeting-subtitle">
          Gestiona tu restaurante y mantén tus pedidos al día.
        </p>
      </div>

      <h3 className="admin-section-title-sm">Resumen de hoy</h3>
      <div className="dash-stats-grid">
        <div className="dash-stat-card dash-stat-red">
          <span className="dash-stat-icon">
            <AlertCircle size={18} />
          </span>
          <span className="dash-stat-value">{resumenHoy.pedidosNuevos}</span>
          <span className="dash-stat-label">Pedidos nuevos</span>
        </div>
        <div className="dash-stat-card dash-stat-orange">
          <span className="dash-stat-icon">
            <ChefHat size={18} />
          </span>
          <span className="dash-stat-value">{resumenHoy.enPreparacion}</span>
          <span className="dash-stat-label">En preparación</span>
        </div>
        <div className="dash-stat-card dash-stat-green">
          <span className="dash-stat-icon">
            <CheckCircle2 size={18} />
          </span>
          <span className="dash-stat-value">
            {resumenHoy.listosParaRecoger}
          </span>
          <span className="dash-stat-label">Listos para recoger</span>
        </div>
        <div className="dash-stat-card dash-stat-blue">
          <span className="dash-stat-icon">
            <Bike size={18} />
          </span>
          <span className="dash-stat-value">{resumenHoy.enEntrega}</span>
          <span className="dash-stat-label">En entrega</span>
        </div>
      </div>

      <h3 className="admin-section-title-sm">Pedidos que requieren atención</h3>

      {pedidosAtencion.length === 0 ? (
        <p className="pedidos-status-text">
          No tienes pedidos pendientes por ahora.
        </p>
      ) : (
        <div className="admin-menu-list">
          {pedidosAtencion.map((p) => {
            const info = estadoInfo(p.estado);
            return (
              <button
                key={p.id}
                type="button"
                className="admin-menu-row"
                onClick={() => navigate(`/admin/pedidos/${p.id}`)}
              >
                <span className={`dash-order-icon ${info.clase}`}>
                  {info.icon}
                </span>
                <div className="admin-menu-label-col">
                  <span className="admin-menu-label">
                    {p.codigo}{" "}
                    <span className="dash-order-cliente">
                      · {p.cliente_nombre}
                    </span>
                  </span>
                  <span className="admin-menu-sublabel">
                    {formatXAF(p.total)} · {formatHora(p.fecha_creacion)}
                  </span>
                </div>
                <ChevronRight size={17} color="#9ca3af" />
              </button>
            );
          })}
        </div>
      )}

      {comparativaVentas.ventasAyer > 0 && (
        <button
          type="button"
          className="dash-tip-banner"
          onClick={() => navigate("/admin/ventas")}
        >
          <Sparkles size={18} className="dash-tip-icon" />
          <span>
            Tus ventas de hoy van un{" "}
            {comparativaVentas.variacionPorcentaje >= 0 ? "+" : ""}
            {comparativaVentas.variacionPorcentaje}%{" "}
            {comparativaVentas.variacionPorcentaje >= 0 ? "mejor" : "peor"} que
            ayer.
          </span>
        </button>
      )}
    </div>
  );
}

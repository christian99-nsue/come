import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  ChevronRight,
  AlertCircle,
  ChefHat,
  CheckCircle2,
  Bike,
  Check,
  XCircle,
} from "lucide-react";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/PedidosAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

type EstadoPedido =
  | "nuevo"
  | "en_preparacion"
  | "listo_para_recoger"
  | "en_entrega"
  | "entregado"
  | "cancelado"
  | "rechazado";

type Tab = "todos" | "nuevos" | "en_preparacion";

interface Pedido {
  id: number;
  codigo: string;
  cliente_nombre: string;
  estado: EstadoPedido;
  total: number;
  fecha_creacion: string;
}

function formatXAF(v: number) {
  return `${Number(v).toLocaleString("es-ES")} XAF`;
}

function formatHora(fechaIso: string) {
  return new Date(fechaIso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function estadoInfo(estado: EstadoPedido) {
  switch (estado) {
    case "nuevo":
      return {
        label: "Nuevo",
        clase: "admin-badge-red",
        icon: <AlertCircle size={13} />,
      };
    case "en_preparacion":
      return {
        label: "En preparación",
        clase: "admin-badge-orange",
        icon: <ChefHat size={13} />,
      };
    case "listo_para_recoger":
      return {
        label: "Listo para recoger",
        clase: "admin-badge-green",
        icon: <CheckCircle2 size={13} />,
      };
    case "en_entrega":
      return {
        label: "En entrega",
        clase: "admin-badge-blue",
        icon: <Bike size={13} />,
      };
    case "entregado":
      return {
        label: "Entregado",
        clase: "admin-badge-green",
        icon: <Check size={13} />,
      };
    default:
      return {
        label: "Cancelado",
        clase: "admin-badge-gray",
        icon: <XCircle size={13} />,
      };
  }
}

export default function PedidosAdmin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPedidos = async () => {
      setCargando(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        console.log("TOKEN:", token);

        const filtro =
          tab === "nuevos"
            ? "nuevo"
            : tab === "en_preparacion"
              ? "en_preparacion"
              : undefined;

        const res = await axios.get(`${API_URL}/api/admin/pedidos`, {
          headers: { Authorization: `Bearer ${token}` },
          params: filtro ? { estado: filtro } : {},
        });

        setPedidos(res.data);
      } catch {
        setError("No se pudieron cargar los pedidos");
      } finally {
        setCargando(false);
      }
    };

    cargarPedidos();
  }, [tab]);

  const nuevosCount = pedidos.filter((p) => p.estado === "nuevo").length;

  const enPreparacionCount = pedidos.filter(
    (p) => p.estado === "en_preparacion",
  ).length;

  const pedidosFiltrados = pedidos.filter((p) =>
    busqueda
      ? p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase())
      : true,
  );

  return (
    <div className="admin-page">
      <section className="admin-header">
        <h1 className="admin-title">Pedidos</h1>
        <button type="button" className="admin-icon-btn" aria-label="Buscar">
          <Search size={20} />
        </button>
      </section>

      <div className="pedidos-search-wrapper">
        <Search size={16} className="pedidos-search-icon" />

        <input
          type="text"
          placeholder="Buscar por código o cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pedidos-search-input"
        />
      </div>

      <div className="pedidos-tabs">
        <button
          type="button"
          className={tab === "todos" ? "pedidos-tab active" : "pedidos-tab"}
          onClick={() => setTab("todos")}
        >
          Todos
        </button>

        <button
          type="button"
          className={tab === "nuevos" ? "pedidos-tab active" : "pedidos-tab"}
          onClick={() => setTab("nuevos")}
        >
          Nuevos {nuevosCount > 0 && `(${nuevosCount})`}
        </button>

        <button
          type="button"
          className={
            tab === "en_preparacion" ? "pedidos-tab active" : "pedidos-tab"
          }
          onClick={() => setTab("en_preparacion")}
        >
          En preparación {enPreparacionCount > 0 && `(${enPreparacionCount})`}
        </button>
      </div>

      {cargando && <p className="pedidos-status-text">Cargando pedidos...</p>}

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      {!cargando && !error && pedidosFiltrados.length === 0 && (
        <p className="pedidos-status-text">No hay pedidos en esta categoría.</p>
      )}

      <div className="pedidos-list">
        {pedidosFiltrados.map((p) => {
          const info = estadoInfo(p.estado);

          return (
            <button
              key={p.id}
              type="button"
              className="pedido-card"
              onClick={() => navigate(`/admin/pedidos/${p.id}`)}
            >
              <div className="pedido-card-header">
                <span className={`pedido-card-badge ${info.clase}`}>
                  {info.icon} {info.label}
                </span>
                <div className="pedido-card-body">
                  <span className="pedido-card-codigo">{p.codigo}</span>
                  <span className="pedido-card-cliente">
                    {p.cliente_nombre}
                  </span>
                  <span className="pedido-card-meta">
                    {formatXAF(p.total)} · {formatHora(p.fecha_creacion)}
                  </span>
                </div>
              </div>

              <span className="pedido-card-link">
                Ver detalle <ChevronRight size={15} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

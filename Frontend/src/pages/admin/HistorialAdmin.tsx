import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Check, XCircle, Banknote, Landmark, CreditCard } from "lucide-react";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/HistorialAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

type Tab = "todos" | "entregado" | "cancelado";
type EstadoHistorial = "entregado" | "cancelado" | "rechazado";
type MetodoPago = "efectivo" | "transferencia" | "tarjeta";

interface PedidoHistorial {
  id: number;
  codigo: string;
  cliente_nombre: string;
  estado: EstadoHistorial;
  total: number;
  metodo_pago: MetodoPago;
  fecha_creacion: string;
}

function formatXAF(v: number) {
  return `${Number(v).toLocaleString("es-ES")} XAF`;
}

function formatFechaHora(iso: string) {
  const fecha = new Date(iso);

  return `${fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  })} · ${fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function estadoInfo(estado: EstadoHistorial) {
  switch (estado) {
    case "entregado":
      return {
        label: "Entregado",
        clase: "admin-badge-green",
        icon: <Check size={13} />,
      };

    default:
      return {
        label: estado === "rechazado" ? "Rechazado" : "Cancelado",
        clase: "admin-badge-gray",
        icon: <XCircle size={13} />,
      };
  }
}

function metodoPagoIcono(metodo: MetodoPago) {
  switch (metodo) {
    case "transferencia":
      return <Landmark size={13} />;
    case "tarjeta":
      return <CreditCard size={13} />;
    default:
      return <Banknote size={13} />;
  }
}

function metodoPagoLabel(metodo: MetodoPago) {
  switch (metodo) {
    case "transferencia":
      return "Transferencia";
    case "tarjeta":
      return "Tarjeta";
    default:
      return "Efectivo";
  }
}

export default function HistorialAdmin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("todos");
  const [pedidos, setPedidos] = useState<PedidoHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarHistorialInicial = async () => {
      setCargando(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/api/admin/historial`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { estado: tab },
        });

        setPedidos(res.data);
      } catch {
        setError("No se pudo cargar el historial");
      } finally {
        setCargando(false);
      }
    };

    cargarHistorialInicial();
  }, [tab]);

  return (
    <div className="admin-page">
      <section className="admin-header">
        <h1 className="admin-title">Historial de pedidos</h1>
      </section>

      <div className="historial-tabs">
        <button
          type="button"
          className={tab === "todos" ? "historial-tab active" : "historial-tab"}
          onClick={() => setTab("todos")}
        >
          Todos
        </button>

        <button
          type="button"
          className={
            tab === "entregado" ? "historial-tab active" : "historial-tab"
          }
          onClick={() => setTab("entregado")}
        >
          Completados
        </button>

        <button
          type="button"
          className={
            tab === "cancelado" ? "historial-tab active" : "historial-tab"
          }
          onClick={() => setTab("cancelado")}
        >
          Cancelados
        </button>
      </div>

      {cargando && <p className="pedidos-status-text">Cargando historial...</p>}

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      {!cargando && !error && pedidos.length === 0 && (
        <p className="pedidos-status-text">No hay pedidos en esta categoría.</p>
      )}

      <div className="historial-list">
        {pedidos.map((p) => {
          const info = estadoInfo(p.estado);

          return (
            <button
              key={p.id}
              type="button"
              className="historial-card"
              onClick={() => navigate(`/admin/pedidos/${p.id}`)}
            >
              <div className="historial-card-top">
                <span className="historial-card-codigo">{p.codigo}</span>

                <span className={`admin-badge ${info.clase}`}>
                  {info.icon} {info.label}
                </span>
              </div>

              <span className="historial-card-cliente">{p.cliente_nombre}</span>

              <div className="historial-card-bottom">
                <span className="historial-card-metodo">
                  {metodoPagoIcono(p.metodo_pago)}{" "}
                  {metodoPagoLabel(p.metodo_pago)}
                </span>

                <span className="historial-card-fecha">
                  {formatFechaHora(p.fecha_creacion)}
                </span>

                <span className="historial-card-total">
                  {formatXAF(p.total)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

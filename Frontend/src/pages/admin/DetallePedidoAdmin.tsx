import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MoreVertical,
  User,
  Phone,
  Clock,
  CreditCard,
  Pencil,
  AlertCircle,
  ChefHat,
  CheckCircle2,
  Bike,
  Check,
  XCircle,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/DetallePedidoAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

type EstadoPedido =
  | "nuevo"
  | "en_preparacion"
  | "listo_para_recoger"
  | "en_entrega"
  | "entregado"
  | "cancelado"
  | "rechazado";

interface ItemPedido {
  nombre_plato: string;
  cantidad: number;
  precio_unitario: number;
}

interface DetallePedido {
  id: number;
  codigo: string;
  estado: EstadoPedido;
  cliente_nombre: string;
  cliente_telefono: string;
  subtotal: number;
  costo_envio: number;
  total: number;
  metodo_pago: string;
  ventana: { etiqueta_dia: string; inicio: string; fin: string } | null;
  fecha_creacion: string;
  items: ItemPedido[];
}

function formatXAF(v: number) {
  return `${Number(v).toLocaleString("es-ES")} XAF`;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatHora(iso: string | null) {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString("es-ES", {
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
    case "rechazado":
      return {
        label: "Rechazado",
        clase: "admin-badge-gray",
        icon: <XCircle size={13} />,
      };
    default:
      return {
        label: "Cancelado",
        clase: "admin-badge-gray",
        icon: <XCircle size={13} />,
      };
  }
}

export default function DetallePedidoAdmin() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [pedido, setPedido] = useState<DetallePedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [mostrarRechazo, setMostrarRechazo] = useState(false);

  const token = localStorage.getItem("token");

  const cargarPedido = async () => {
    setCargando(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/pedidos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPedido(res.data);
    } catch {
      setError("No se pudo cargar el pedido");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const cargarPedidoInicial = async () => {
      setCargando(true);
      setError("");

      try {
        const res = await axios.get(`${API_URL}/api/admin/pedidos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPedido(res.data);
      } catch {
        setError("No se pudo cargar el pedido");
      } finally {
        setCargando(false);
      }
    };

    cargarPedidoInicial();
  }, [id, token]);

  const aceptarPedido = async () => {
    setProcesando(true);
    try {
      await axios.patch(
        `${API_URL}/api/admin/pedidos/${id}/aceptar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await cargarPedido(); // recarga para reflejar el nuevo estado real, sin salir de la pantalla
    } catch {
      setError("No se pudo aceptar el pedido");
    } finally {
      setProcesando(false);
    }
  };

  const rechazarPedido = async () => {
    setProcesando(true);
    try {
      await axios.patch(
        `${API_URL}/api/admin/pedidos/${id}/rechazar`,
        { motivo: "Rechazado por el restaurante" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMostrarRechazo(false);
      navigate("/admin/pedidos", { replace: true });
    } catch {
      setError("No se pudo rechazar el pedido");
    } finally {
      setProcesando(false);
    }
  };

  const cambiarEstado = async (nuevoEstado: EstadoPedido) => {
    setProcesando(true);
    try {
      await axios.patch(
        `${API_URL}/api/admin/pedidos/${id}/estado`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await cargarPedido();
    } catch {
      setError("No se pudo actualizar el estado del pedido");
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="admin-page">
        <p className="pedidos-status-text">Cargando pedido...</p>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="admin-page">
        <p className="pedidos-status-text pedidos-status-error">
          {error || "Pedido no encontrado"}
        </p>
      </div>
    );
  }

  const info = estadoInfo(pedido.estado);

  return (
    <div className="admin-page">
      <section className="admin-header">
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="admin-title">Detalle del pedido</h1>
        <button
          type="button"
          className="admin-icon-btn"
          aria-label="Más opciones"
        >
          <MoreVertical size={20} />
        </button>
      </section>

      <div className="detalle-pedido-top">
        <span className={`admin-badge ${info.clase}`}>
          {info.icon} {info.label}
        </span>
        <div>
          <span className="detalle-pedido-codigo">{pedido.codigo}</span>
          <span className="detalle-pedido-fecha">
            {formatFecha(pedido.fecha_creacion)} ·{" "}
            {formatHora(pedido.fecha_creacion)}
          </span>
        </div>
      </div>

      <div className="admin-card">
        <div className="detalle-pedido-cliente-row">
          <span className="admin-icon-box">
            <User size={17} />
          </span>
          <span className="detalle-pedido-cliente-nombre">
            {pedido.cliente_nombre}
          </span>
        </div>
        <a
          href={`tel:${pedido.cliente_telefono}`}
          className="detalle-pedido-cliente-tel"
        >
          <Phone size={13} /> {pedido.cliente_telefono}
        </a>
      </div>

      <h3 className="admin-section-title-sm">Productos</h3>
      <div className="admin-card detalle-pedido-items">
        {pedido.items.map((item, i) => (
          <div key={i} className="detalle-pedido-item-row">
            <span className="detalle-pedido-item-nombre">
              {item.cantidad} x {item.nombre_plato}
            </span>
            <span className="detalle-pedido-item-precio">
              {formatXAF(item.precio_unitario * item.cantidad)}
            </span>
          </div>
        ))}

        <div className="detalle-pedido-totales">
          <div className="detalle-pedido-total-row">
            <span>Subtotal</span>
            <span>{formatXAF(pedido.subtotal)}</span>
          </div>
          <div className="detalle-pedido-total-row">
            <span>Entrega</span>
            <span>{formatXAF(pedido.costo_envio)}</span>
          </div>
          <div className="detalle-pedido-total-row detalle-pedido-total-final">
            <span>Total</span>
            <span>{formatXAF(pedido.total)}</span>
          </div>
        </div>
      </div>

      <button type="button" className="admin-menu-row detalle-pedido-info-row">
        <span className="admin-icon-box">
          <Clock size={17} />
        </span>
        <div className="admin-menu-label-col">
          <span className="admin-menu-label">Ventana de entrega</span>
          <span className="admin-menu-sublabel">
            {pedido.ventana
              ? `${pedido.ventana.etiqueta_dia}, ${pedido.ventana.inicio} – ${pedido.ventana.fin}`
              : "—"}
          </span>
        </div>
        <span className="detalle-pedido-cambiar">
          <Pencil size={13} /> Cambiar
        </span>
      </button>

      <div className="admin-menu-row detalle-pedido-info-row">
        <span className="admin-icon-box">
          <CreditCard size={17} />
        </span>
        <div className="admin-menu-label-col">
          <span className="admin-menu-label">Método de pago</span>
          <span
            className="admin-menu-sublabel"
            style={{ textTransform: "capitalize" }}
          >
            {pedido.metodo_pago}
          </span>
        </div>
      </div>

      {/* Acciones según el estado real del pedido */}
      {pedido.estado === "nuevo" && (
        <div className="detalle-pedido-actions">
          <button
            type="button"
            className="admin-btn-danger"
            disabled={procesando}
            onClick={() => setMostrarRechazo(true)}
          >
            Rechazar pedido
          </button>
          <button
            type="button"
            className="admin-btn-primary"
            disabled={procesando}
            onClick={aceptarPedido}
          >
            Aceptar pedido
          </button>
        </div>
      )}

      {pedido.estado === "en_preparacion" && (
        <button
          type="button"
          className="admin-btn-primary detalle-pedido-single-action"
          disabled={procesando}
          onClick={() => cambiarEstado("listo_para_recoger")}
        >
          {procesando ? "Actualizando..." : "Marcar como listo para recoger"}
        </button>
      )}

      {pedido.estado === "listo_para_recoger" && (
        <p className="detalle-pedido-waiting-note">
          Esperando a que un repartidor recoja el pedido.
        </p>
      )}

      {pedido.estado === "en_entrega" && (
        <p className="detalle-pedido-waiting-note">
          El pedido está en camino hacia el cliente.
        </p>
      )}

      {["entregado", "cancelado", "rechazado"].includes(pedido.estado) && (
        <p className="detalle-pedido-waiting-note">
          Este pedido ya está cerrado y no admite más cambios.
        </p>
      )}

      <ConfirmModal
        open={mostrarRechazo}
        title="¿Rechazar este pedido?"
        message={`El cliente será notificado de que ${pedido.codigo} no pudo ser procesado.`}
        confirmLabel="Rechazar pedido"
        cancelLabel="Cancelar"
        danger
        onConfirm={rechazarPedido}
        onCancel={() => setMostrarRechazo(false)}
      />
    </div>
  );
}

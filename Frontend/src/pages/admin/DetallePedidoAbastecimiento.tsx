import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  Check,
} from "lucide-react";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/DetallePedidoAbastecimiento.css";

const API_URL = import.meta.env.VITE_API_URL;

type Estado = "pendiente" | "confirmado" | "entregado" | "cancelado";

interface Detalle {
  id: number;
  estado: Estado;
  total: number;
  turno_entrega: string | null;
  hora_entrega: string | null;
  motivo_cancelacion: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  items: {
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    nombre: string;
    imagen: string | null;
  }[];
  eventos: { estado: Estado; nota: string | null; fecha: string }[];
}

interface Paso {
  clave: string;
  texto: string;
  hecho: boolean;
  actual: boolean;
  negativo: boolean;
  fecha: string | null;
  nota: string | null;
}

const formatXAF = (v: number) => `${Number(v).toLocaleString("es-ES")} XAF`;

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function DetallePedidoAbastecimiento() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [d, setD] = useState<Detalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    axios
      .get(`${API_URL}/api/admin/abastecimiento/pedidos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setD(res.data);
        setError("");
      })
      .catch((err) =>
        setError(err.response?.data?.message || "No se pudo cargar el pedido"),
      )
      .finally(() => setCargando(false));
  }, [id, token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Mientras el pedido está en curso se actualiza solo; al terminar deja de consultar
  const activo = d?.estado === "pendiente" || d?.estado === "confirmado";

  useEffect(() => {
    if (!activo) return;
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, [activo, cargar]);

  const volver = () => navigate("/admin/abastecimiento?tab=mis_pedidos");

  const cabecera = (
    <section className="admin-header">
      <button
        type="button"
        className="admin-back-btn"
        onClick={volver}
        aria-label="Volver"
      >
        <ArrowLeft size={22} />
      </button>
      <h1 className="admin-title">{d ? `Pedido #${d.id}` : "Pedido"}</h1>
    </section>
  );

  if (cargando) {
    return (
      <div className="admin-page">
        {cabecera}
        <p className="pedidos-status-text">Cargando pedido...</p>
      </div>
    );
  }

  if (!d) {
    return (
      <div className="admin-page">
        {cabecera}
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      </div>
    );
  }

  const evento = (estado: Estado) => d.eventos.find((e) => e.estado === estado);

  const banner = {
    pendiente: {
      icono: Clock,
      titulo: "Pendiente de confirmación",
      texto: "Estamos revisando tu pedido. Te avisaremos cuando se confirme.",
    },
    confirmado: {
      icono: Truck,
      titulo: "Pedido confirmado",
      texto: d.hora_entrega
        ? `Entrega estimada a las ${d.hora_entrega}.`
        : "Te avisaremos cuando se entregue.",
    },
    entregado: {
      icono: PackageCheck,
      titulo: "Pedido entregado",
      texto: "Tu pedido ya llegó.",
    },
    cancelado: {
      icono: XCircle,
      titulo: "Pedido cancelado",
      texto: d.motivo_cancelacion
        ? `Motivo: ${d.motivo_cancelacion}`
        : "Este pedido fue cancelado.",
    },
  }[d.estado];
  const IconoBanner = banner.icono;

  // Seguimiento. Si un pedido es anterior al historial, se deduce del estado.
  const confirmado = evento("confirmado");
  const hayConfirmacion =
    d.estado === "confirmado" || d.estado === "entregado" || !!confirmado;

  const pasos: Paso[] = [
    {
      clave: "creado",
      texto: "Pedido enviado",
      hecho: true,
      actual: false,
      negativo: false,
      fecha: d.fecha_creacion,
      nota: null,
    },
  ];

  if (d.estado !== "cancelado" || hayConfirmacion) {
    pasos.push({
      clave: "confirmado",
      texto: "Pedido confirmado",
      hecho: hayConfirmacion,
      actual: false,
      negativo: false,
      fecha: confirmado?.fecha ?? null,
      nota: confirmado?.nota ?? null,
    });
  }

  if (d.estado === "cancelado") {
    pasos.push({
      clave: "cancelado",
      texto: "Pedido cancelado",
      hecho: true,
      actual: false,
      negativo: true,
      fecha: evento("cancelado")?.fecha ?? d.fecha_actualizacion,
      nota: d.motivo_cancelacion,
    });
  } else {
    pasos.push({
      clave: "entregado",
      texto: "Pedido entregado",
      hecho: d.estado === "entregado",
      actual: false,
      negativo: false,
      fecha: evento("entregado")?.fecha ?? null,
      nota: null,
    });
  }

  // El primer paso sin cumplir es el que está en curso
  if (d.estado === "pendiente" || d.estado === "confirmado") {
    const siguiente = pasos.find((p) => !p.hecho);
    if (siguiente) siguiente.actual = true;
  }

  return (
    <div className="admin-page">
      {cabecera}

      <div className={`abast-det-banner ${d.estado}`}>
        <IconoBanner size={22} />
        <div className="abast-det-banner-text">
          <strong>{banner.titulo}</strong>
          <span>{banner.texto}</span>
        </div>
      </div>

      <section className="abast-det-card">
        <h3 className="abast-det-title">Seguimiento</h3>
        <div className="abast-det-timeline">
          {pasos.map((p, i) => (
            <div key={p.clave} className="abast-det-step">
              <div
                className={
                  p.negativo
                    ? "abast-det-dot negativo"
                    : p.hecho
                      ? "abast-det-dot hecho"
                      : p.actual
                        ? "abast-det-dot actual"
                        : "abast-det-dot"
                }
              >
                {p.hecho && !p.negativo && <Check size={12} />}
                {p.negativo && <XCircle size={14} />}
              </div>
              {i < pasos.length - 1 && (
                <div
                  className={
                    p.hecho ? "abast-det-line hecho" : "abast-det-line"
                  }
                />
              )}
              <div className="abast-det-step-text">
                <span
                  className={
                    p.hecho || p.actual
                      ? "abast-det-step-label hecho"
                      : "abast-det-step-label"
                  }
                >
                  {p.texto}
                </span>
                {p.fecha && (
                  <span className="abast-det-step-sub">
                    {fechaHora(p.fecha)}
                  </span>
                )}
                {p.actual && !p.fecha && (
                  <span className="abast-det-step-sub">En curso</span>
                )}
                {p.nota && <span className="abast-det-step-sub">{p.nota}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="abast-det-card">
        <h3 className="abast-det-title">Entrega</h3>
        <div className="abast-det-row">
          <span>Turno</span>
          <strong>{d.turno_entrega || "—"}</strong>
        </div>
        <div className="abast-det-row">
          <span>Hora estimada</span>
          <strong>{d.hora_entrega || "Por confirmar"}</strong>
        </div>
      </section>

      <section className="abast-det-card">
        <h3 className="abast-det-title">Productos</h3>
        {d.items.map((i, idx) => (
          <div key={idx} className="abast-det-item">
            <img
              src={
                i.imagen ||
                "https://picsum.photos/seed/abast-placeholder/100/100"
              }
              alt={i.nombre}
              className="abast-det-item-img"
            />
            <div className="abast-det-item-info">
              <span className="abast-det-item-name">
                {i.cantidad} × {i.nombre}
              </span>
              <span className="abast-det-item-sub">
                {formatXAF(i.precio_unitario)} c/u
              </span>
            </div>
            <span className="abast-det-item-total">
              {formatXAF(i.subtotal)}
            </span>
          </div>
        ))}

        <div className="abast-det-total">
          <span>Total</span>
          <span>{formatXAF(d.total)}</span>
        </div>
      </section>
    </div>
  );
}

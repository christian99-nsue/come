import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Crown,
  Calendar,
  RefreshCw,
  CreditCard,
  Check,
  Minus,
  Banknote,
  Landmark,
} from "lucide-react";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/SuscripcionAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

type Plan = "semanal" | "mensual";
type MetodoPago = "efectivo" | "transferencia" | "tarjeta";

interface Solicitud {
  id: number;
  plan: Plan;
  monto: number;
  metodo_pago: MetodoPago;
  referencia: string | null;
  estado: "pendiente" | "confirmado" | "rechazado";
  motivo_rechazo: string | null;
  fecha_solicitud: string;
}
interface Suscripcion {
  plan: Plan | null;
  estado: "activa" | "vencida" | "cancelada" | null;
  metodo_pago: MetodoPago | null;
  fecha_inicio: string | null;
  fecha_renovacion: string | null;
  restaurante_nombre: string;
  restaurante_logo: string | null;
  solicitud: Solicitud | null;
}

const beneficios: {
  label: string;
  semanal: boolean;
  mensual: boolean;
}[] = [
  {
    label: "Acceso completo a todas las funcionalidades",
    semanal: true,
    mensual: true,
  },
  { label: "Soporte prioritario", semanal: false, mensual: true },
  { label: "Sin límite de pedidos", semanal: false, mensual: true },
  { label: "Gestión de abastecimiento", semanal: true, mensual: true },
];

const planesDisponibles: {
  id: Plan;
  label: string;
  renovacion: string;
  precio: string;
  masPopular?: boolean;
}[] = [
  {
    id: "semanal",
    label: "Plan semanal",
    renovacion: "Renovación cada 7 días",
    precio: "5.000 XAF / semana",
  },
  {
    id: "mensual",
    label: "Plan mensual",
    renovacion: "Renovación cada 30 días",
    precio: "20.000 XAF / mes",
    masPopular: true,
  },
];

const metodosPago: {
  id: MetodoPago;
  label: string;
  icon: typeof Banknote;
}[] = [
  { id: "efectivo", label: "Efectivo", icon: Banknote },
  { id: "transferencia", label: "Transferencia bancaria", icon: Landmark },
  { id: "tarjeta", label: "Tarjeta de débito/crédito", icon: CreditCard },
];

function formatFecha(iso: string | null) {
  if (!iso) return "—";

  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function metodoPagoLabel(metodo: MetodoPago | null) {
  if (!metodo) return "—";
  if (metodo === "tarjeta") return "Tarjeta";
  if (metodo === "efectivo") return "Efectivo";
  return "Transferencia";
}

export default function SuscripcionAdmin() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan>("mensual");
  const [cargando, setCargando] = useState(true);
  const [cambiando, setCambiando] = useState(false);
  const [error, setError] = useState("");
  const [referencia, setReferencia] = useState("");

  const [mostrarSeleccionMetodo, setMostrarSeleccionMetodo] = useState(false);

  const [metodoElegido, setMetodoElegido] =
    useState<MetodoPago>("transferencia");

  const cargarSuscripcion = async () => {
    try {
      setError("");

      const res = await axios.get(`${API_URL}/api/admin/suscripcion`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuscripcion(res.data);

      if (res.data.plan) {
        setPlanSeleccionado(res.data.plan);
      }

      if (res.data.metodo_pago) {
        setMetodoElegido(res.data.metodo_pago);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "No se pudo cargar tu suscripcion",
        );
      } else {
        setError("No se pudo cargartu suscripcion");
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/suscripcion`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cancelado) return;

        setSuscripcion(res.data);

        if (res.data.plan) {
          setPlanSeleccionado(res.data.plan);
        }

        if (res.data.metodo_pago) {
          setMetodoElegido(res.data.metodo_pago);
        }
      } catch {
        if (!cancelado) {
          setError("No se pudo cargar la información de suscripción");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, [token]);

  // 4) Reemplaza la función confirmarCambioPlan completa
  const confirmarCambioPlan = async () => {
    if (!suscripcion) return;
    setCambiando(true);
    setError("");
    try {
      await axios.post(
        `${API_URL}/api/admin/suscripcion/solicitud`,
        { plan: planSeleccionado, metodo_pago: metodoElegido, referencia },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMostrarSeleccionMetodo(false);
      setReferencia("");
      await cargarSuscripcion();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "No se pudo enviar la solicitud",
        );
      } else {
        setError("No se pudo enviar la solicitud");
      }
    } finally {
      setCambiando(false);
    }
  };

  if (cargando) {
    return (
      <div className="admin-page">
        <p className="pedidos-status-text">Cargando suscripción...</p>
      </div>
    );
  }

  if (error && !suscripcion) {
    return (
      <div className="admin-page">
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      </div>
    );
  }

  if (!suscripcion) {
    return (
      <div className="admin-page">
        <p className="pedidos-status-text pedidos-status-error">
          No se pudo obtener la información del restaurante.
        </p>
      </div>
    );
  }

  const tieneSuscripcion = suscripcion.plan !== null;

  const planActual = tieneSuscripcion
    ? planesDisponibles.find((p) => p.id === suscripcion.plan)
    : null;

  const solicitud = suscripcion.solicitud;
  const hayPendiente = solicitud?.estado === "pendiente";
  const esRenovacion = planSeleccionado === suscripcion.plan;

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

        <h1 className="admin-title">Suscripción</h1>
      </section>

      <div className="admin-card susc-restaurante-card">
        <img
          src={
            suscripcion.restaurante_logo ||
            "https://picsum.photos/seed/susc-logo/80/80"
          }
          alt={suscripcion.restaurante_nombre}
          className="susc-restaurante-logo"
        />

        <div className="susc-restaurante-info">
          <span className="susc-restaurante-nombre">
            {suscripcion.restaurante_nombre}
          </span>

          <span className="susc-restaurante-sub">Restaurante</span>
        </div>

        <span
          className={`admin-badge ${
            suscripcion.estado === "activa"
              ? "admin-badge-green"
              : "admin-badge-red"
          }`}
        >
          {suscripcion.estado === "activa" && <Check size={12} />}{" "}
          {suscripcion.estado === "activa" ? "Activa" : "Sin suscripción"}
        </span>
      </div>

      {!tieneSuscripcion && (
        <div className="susc-status-banner">
          <Crown size={18} className="susc-status-icon" />

          <div>
            <span className="susc-status-title">Elige tu plan</span>

            <span className="susc-status-subtitle">
              Selecciona el plan que mejor se adapte a las necesidades de tu
              restaurante.
            </span>
          </div>
        </div>
      )}

      {tieneSuscripcion && suscripcion.estado === "activa" && (
        <div className="susc-status-banner">
          <Crown size={18} className="susc-status-icon" />

          <div>
            <span className="susc-status-title">
              Tu suscripción está activa
            </span>

            <span className="susc-status-subtitle">
              Puedes seguir gestionando tu restaurante sin interrupciones.
            </span>
          </div>
        </div>
      )}

      {tieneSuscripcion && planActual && (
        <>
          {solicitud?.estado === "pendiente" && (
            <div className="susc-solicitud pendiente">
              <strong>Solicitud pendiente de confirmación</strong>
              <span>
                {planesDisponibles.find((p) => p.id === solicitud.plan)?.label}{" "}
                · {solicitud.monto.toLocaleString("es-ES")} XAF ·{" "}
                {metodosPago.find((m) => m.id === solicitud.metodo_pago)?.label}
                {solicitud.referencia ? ` · Ref: ${solicitud.referencia}` : ""}
              </span>
              <span>Activaremos tu plan en cuanto confirmemos tu pago.</span>
            </div>
          )}
          {solicitud?.estado === "rechazado" && (
            <div className="susc-solicitud rechazada">
              <strong>Tu última solicitud fue rechazada</strong>
              {solicitud.motivo_rechazo && (
                <span>Motivo: {solicitud.motivo_rechazo}</span>
              )}
              <span>Puedes enviar una nueva solicitud.</span>
            </div>
          )}
          <h3 className="admin-section-title-sm">Plan actual</h3>
          <div className="susc-plan-actual-card">
            <div className="susc-plan-actual-header">
              <span className="susc-plan-actual-icon">
                <Calendar size={18} />
              </span>

              <div className="susc-plan-actual-title-col">
                <span className="susc-plan-actual-title">
                  {planActual.label}
                </span>

                <span className="susc-plan-actual-renovacion">
                  {planActual.renovacion}
                </span>
              </div>

              {planActual.masPopular && (
                <span className="susc-popular-badge">Más popular</span>
              )}
            </div>

            <span className="susc-plan-actual-precio">{planActual.precio}</span>

            <ul className="susc-beneficios-list">
              {beneficios.map((b) => {
                const incluido =
                  planActual.id === "semanal" ? b.semanal : b.mensual;

                return (
                  <li key={b.label} className={incluido ? "" : "no-incluido"}>
                    {incluido ? <Check size={14} /> : <Minus size={14} />}{" "}
                    {b.label}
                  </li>
                );
              })}
            </ul>

            <div className="susc-info-grid">
              <div className="susc-info-box">
                <Calendar size={16} />

                <span className="susc-info-label">Fecha de inicio</span>

                <span className="susc-info-value">
                  {formatFecha(suscripcion.fecha_inicio)}
                </span>
              </div>

              <div className="susc-info-box">
                <RefreshCw size={16} />

                <span className="susc-info-label">Próxima renovación</span>

                <span className="susc-info-value">
                  {formatFecha(suscripcion.fecha_renovacion)}
                </span>
              </div>

              <div className="susc-info-box">
                <CreditCard size={16} />

                <span className="susc-info-label">Método de pago</span>

                <span className="susc-info-value">
                  {metodoPagoLabel(suscripcion.metodo_pago)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      <h3 className="admin-section-title-sm">
        {tieneSuscripcion ? "Cambiar plan" : "Elige tu plan"}
      </h3>

      <div className="susc-planes-list">
        {planesDisponibles.map((p) => (
          <button
            key={p.id}
            type="button"
            className={
              planSeleccionado === p.id
                ? "susc-plan-option active"
                : "susc-plan-option"
            }
            onClick={() => setPlanSeleccionado(p.id)}
          >
            <span className="susc-plan-option-icon">
              <Calendar size={16} />
            </span>

            <div className="susc-plan-option-text">
              <span className="susc-plan-option-title">{p.label}</span>

              <span className="susc-plan-option-renovacion">
                {p.renovacion}
              </span>

              <span className="susc-plan-option-precio">{p.precio}</span>
            </div>

            <span
              className={
                planSeleccionado === p.id
                  ? "admin-radio-dot active"
                  : "admin-radio-dot"
              }
            />
          </button>
        ))}
      </div>

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      <button
        type="button"
        className="admin-btn-primary"
        onClick={() => setMostrarSeleccionMetodo(true)}
        disabled={hayPendiente}
      >
        <CreditCard size={16} />{" "}
        {hayPendiente
          ? "Solicitud pendiente"
          : esRenovacion
            ? "Renovar plan"
            : "Cambiar plan"}
      </button>

      {mostrarSeleccionMetodo && (
        <div
          className="susc-metodo-overlay"
          onClick={() => setMostrarSeleccionMetodo(false)}
        >
          <div
            className="susc-metodo-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="susc-metodo-title">Elige tu método de pago</h3>
            <p className="susc-metodo-subtitle">
              {planesDisponibles.find((p) => p.id === planSeleccionado)?.label}{" "}
              ·{" "}
              {planesDisponibles.find((p) => p.id === planSeleccionado)?.precio}
            </p>

            <div className="susc-metodo-list">
              {metodosPago.map((m) => {
                const Icon = m.icon;
                const activo = metodoElegido === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={
                      activo ? "admin-radio-card active" : "admin-radio-card"
                    }
                    onClick={() => setMetodoElegido(m.id)}
                  >
                    <span className="admin-icon-box">
                      <Icon size={17} />
                    </span>
                    <span className="admin-menu-label" style={{ flex: 1 }}>
                      {m.label}
                    </span>
                    <span
                      className={
                        activo ? "admin-radio-dot active" : "admin-radio-dot"
                      }
                    />
                  </button>
                );
              })}
            </div>

            <label className="susc-referencia">
              <span className="susc-referencia-label">
                Referencia del pago (opcional)
              </span>
              <input
                className="admin-form-input"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                maxLength={100}
                placeholder="Ej: número de transferencia"
              />
              <span className="admin-form-hint">
                Tu plan se activará cuando confirmemos tu pago. Si ya tienes
                días vigentes, el nuevo periodo se suma al final.
              </span>
            </label>

            {error && (
              <p className="pedidos-status-text pedidos-status-error">
                {error}
              </p>
            )}

            <div className="susc-metodo-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setMostrarSeleccionMetodo(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={confirmarCambioPlan}
                disabled={cambiando}
              >
                {cambiando ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Mail,
  Phone,
  CalendarDays,
  FileText,
  Bike,
  PackageCheck,
  Wallet,
  Bell,
  ChevronRight,
} from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Cuenta {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string;
  foto_perfil: string | null;
  tipo_documento: string | null;
  numero_documento: string | null;
  vehiculo_tipo: "moto" | "bicicleta" | "coche" | null;
  matricula: string | null;
  disponible: boolean;
  notificaciones_activas: boolean;
  fecha_registro: string | null;
  entregas_totales: number;
  ganancias_totales: number;
}

const etiquetasVehiculo = {
  moto: "Moto",
  bicicleta: "Bicicleta",
  coche: "Coche",
};

function formatXAF(v: number) {
  return `${v.toLocaleString("es-ES")} XAF`;
}

function formatFecha(iso: string | null) {
  if (!iso) return "Sin registrar";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function InfoCuentaRepartidor() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardandoPref, setGuardandoPref] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/repartidor/perfil/cuenta`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCuenta(res.data))
      .catch(() => setError("No se pudo cargar la información de tu cuenta"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiarNotificaciones = async () => {
    if (!cuenta || guardandoPref) return;

    const nuevo = !cuenta.notificaciones_activas;
    setCuenta({ ...cuenta, notificaciones_activas: nuevo }); // se refleja al instante
    setGuardandoPref(true);
    setError("");

    try {
      await axios.patch(
        `${API_URL}/api/repartidor/perfil/preferencias`,
        { notificaciones_activas: nuevo },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      // Si falla, vuelve al valor anterior
      setCuenta((c) => (c ? { ...c, notificaciones_activas: !nuevo } : c));
      setError("No se pudo guardar tu preferencia");
    } finally {
      setGuardandoPref(false);
    }
  };

  if (cargando) {
    return (
      <div className="rep-page">
        <p className="rep-status-text">Cargando...</p>
      </div>
    );
  }

  if (!cuenta) {
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
          <h1 className="rep-title">Información de la cuenta</h1>
        </section>
        <p className="rep-status-text rep-status-error">{error}</p>
      </div>
    );
  }

  const documento =
    [cuenta.tipo_documento, cuenta.numero_documento]
      .filter(Boolean)
      .join(" · ") || "Sin registrar";
  const vehiculo =
    [
      cuenta.vehiculo_tipo ? etiquetasVehiculo[cuenta.vehiculo_tipo] : "",
      cuenta.matricula,
    ]
      .filter(Boolean)
      .join(" · ") || "Sin registrar";

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
        <h1 className="rep-title">Información de la cuenta</h1>
      </section>

      <button
        type="button"
        className="rep-card rep-card-green rep-profile-card rep-account-top-card"
        onClick={() => navigate("/repartidor/editar-perfil")}
      >
        {cuenta.foto_perfil ? (
          <img
            src={cuenta.foto_perfil}
            alt={cuenta.nombre}
            className="rep-profile-avatar"
          />
        ) : (
          <div className="rep-profile-avatar-fallback">
            {cuenta.nombre.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="rep-account-top-text">
          <div className="rep-profile-name">{cuenta.nombre}</div>
          <div className="rep-profile-role">Repartidor</div>
          <span
            className={
              cuenta.disponible
                ? "rep-badge rep-badge-green rep-status-badge"
                : "rep-badge rep-badge-gray rep-status-badge"
            }
          >
            ● {cuenta.disponible ? "Disponible" : "No disponible"}
          </span>
        </div>
        <ChevronRight size={18} color="#9ca3af" />
      </button>

      <h3 className="rep-section-title-sm">Detalles de la cuenta</h3>
      <div className="rep-card-info">
        <div className="rep-info-row">
          <span className="rep-info-icon">
            <Mail size={17} />
          </span>
          <div className="rep-info-text">
            <span className="rep-info-label">Correo electrónico</span>
            <span className="rep-info-value">
              {cuenta.email || "Sin registrar"}
            </span>
          </div>
        </div>
        <div className="rep-info-row">
          <span className="rep-info-icon">
            <Phone size={17} />
          </span>
          <div className="rep-info-text">
            <span className="rep-info-label">Teléfono</span>
            <span className="rep-info-value">{cuenta.telefono}</span>
          </div>
        </div>
        <div className="rep-info-row">
          <span className="rep-info-icon">
            <CalendarDays size={17} />
          </span>
          <div className="rep-info-text">
            <span className="rep-info-label">Fecha de registro</span>
            <span className="rep-info-value">
              {formatFecha(cuenta.fecha_registro)}
            </span>
          </div>
        </div>
      </div>

      <div className="rep-section-head">
        <h3 className="rep-section-title-sm">Documento y vehículo</h3>
      </div>
      <div className="rep-card-info">
        <div className="rep-info-row">
          <span className="rep-info-icon">
            <FileText size={17} />
          </span>
          <div className="rep-info-text">
            <span className="rep-info-label">Documento</span>
            <span className="rep-info-value">{documento}</span>
          </div>
        </div>
        <div className="rep-info-row">
          <span className="rep-info-icon">
            <Bike size={17} />
          </span>
          <div className="rep-info-text">
            <span className="rep-info-label">Vehículo</span>
            <span className="rep-info-value">{vehiculo}</span>
          </div>
        </div>
      </div>

      <h3 className="rep-section-title-sm">Actividad</h3>
      <div className="rep-card-info">
        <div className="rep-info-row">
          <span className="rep-info-icon">
            <PackageCheck size={17} />
          </span>
          <div className="rep-info-text">
            <span className="rep-info-label">Entregas completadas</span>
            <span className="rep-info-value">{cuenta.entregas_totales}</span>
          </div>
        </div>
        <div className="rep-info-row">
          <span className="rep-info-icon">
            <Wallet size={17} />
          </span>
          <div className="rep-info-text">
            <span className="rep-info-label">Ganancias totales</span>
            <span className="rep-info-value">
              {formatXAF(cuenta.ganancias_totales)}
            </span>
          </div>
        </div>
      </div>

      <h3 className="rep-section-title-sm">Preferencias de comunicación</h3>
      <div className="rep-toggle-row">
        <span className="rep-info-icon">
          <Bell size={17} />
        </span>
        <div className="rep-menu-label-col">
          <span className="rep-menu-label">Recibir notificaciones</span>
          <span className="rep-menu-sublabel">
            Avisos de pedidos nuevos disponibles
          </span>
        </div>
        <button
          type="button"
          className={
            cuenta.notificaciones_activas
              ? "toggle-switch active"
              : "toggle-switch"
          }
          onClick={cambiarNotificaciones}
          aria-label="Activar o desactivar notificaciones"
          aria-pressed={cuenta.notificaciones_activas}
        >
          <span className="toggle-knob" />
        </button>
      </div>

      {error && <p className="rep-status-text rep-status-error">{error}</p>}
    </div>
  );
}

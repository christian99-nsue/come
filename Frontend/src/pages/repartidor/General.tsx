import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Settings,
  Bell,
  ChevronRight,
} from "lucide-react";
import {
  leerCache,
  cargarPreferencias,
  guardarPreferencias,
} from "../../utils/preferenciasRepartidor";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

interface PerfilBasico {
  nombre: string;
  telefono: string;
  email: string | null;
}

export default function General() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [perfil, setPerfil] = useState<PerfilBasico | null>(null);
  const [disponible, setDisponible] = useState(true);
  const [tieneEntregaActiva, setTieneEntregaActiva] = useState(false);
  const [sonido, setSonido] = useState(leerCache().sonido_notificaciones);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/repartidor/perfil`, { headers }),
      axios.get(`${API_URL}/api/repartidor/disponibilidad`, { headers }),
      cargarPreferencias(),
    ])
      .then(([perfilRes, dispRes, prefs]) => {
        setPerfil(perfilRes.data);
        setDisponible(dispRes.data.disponible);
        setTieneEntregaActiva(dispRes.data.tiene_entrega_activa);
        setSonido(prefs.sonido_notificaciones);
      })
      .catch(() => setError("No se pudo cargar la información"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiarDisponibilidad = async () => {
    const nuevo = !disponible;

    if (!nuevo && tieneEntregaActiva) {
      setError(
        "No puedes ponerte como no disponible mientras tengas una entrega activa",
      );
      return;
    }

    setDisponible(nuevo); // se refleja al instante
    setError("");

    try {
      await axios.patch(
        `${API_URL}/api/repartidor/disponibilidad`,
        { disponible: nuevo },
        { headers },
      );
    } catch (err: unknown) {
      setDisponible(!nuevo);

      let mensaje = "No se pudo cambiar tu estado";

      if (axios.isAxiosError(err)) {
        const mensajeServidor: unknown = err.response?.data?.message;

        if (typeof mensajeServidor === "string" && mensajeServidor.trim()) {
          mensaje = mensajeServidor;
        }
      }

      setError(mensaje);
    }
  };

  const cambiarSonido = async () => {
    const nuevo = !sonido;
    setSonido(nuevo);
    setError("");

    try {
      await guardarPreferencias({ sonido_notificaciones: nuevo });
    } catch {
      setSonido(!nuevo);
      setError("No se pudo guardar tu preferencia");
    }
  };

  if (cargando) {
    return (
      <div className="rep-page">
        <p className="rep-status-text">Cargando...</p>
      </div>
    );
  }

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
        <h1 className="rep-title">General</h1>
      </section>

      <h3 className="rep-section-title-sm">Información personal</h3>
      <div className="rep-menu-list">
        <button
          type="button"
          className="rep-menu-row"
          onClick={() => navigate("/repartidor/editar-perfil")}
        >
          <span className="rep-info-icon">
            <User size={17} />
          </span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Nombre</span>
            <span className="rep-menu-sublabel">{perfil?.nombre}</span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
        <button
          type="button"
          className="rep-menu-row"
          onClick={() => navigate("/repartidor/editar-perfil")}
        >
          <span className="rep-info-icon">
            <Phone size={17} />
          </span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Teléfono</span>
            <span className="rep-menu-sublabel">{perfil?.telefono}</span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
        <button
          type="button"
          className="rep-menu-row"
          onClick={() => navigate("/repartidor/editar-perfil")}
        >
          <span className="rep-info-icon">
            <Mail size={17} />
          </span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Correo electrónico</span>
            <span className="rep-menu-sublabel">
              {perfil?.email || "Sin registrar"}
            </span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
      </div>

      <h3 className="rep-section-title-sm">Disponibilidad</h3>
      <div className="rep-menu-list">
        <div className="rep-toggle-row">
          <span className="rep-info-icon">
            <Settings size={17} />
          </span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Estado de disponibilidad</span>
            <span className="rep-menu-sublabel">
              {disponible
                ? "Recibirás pedidos para entregar"
                : "No recibirás pedidos nuevos"}
            </span>
          </div>
          <button
            type="button"
            className={disponible ? "toggle-switch active" : "toggle-switch"}
            onClick={cambiarDisponibilidad}
            aria-label="Activar o desactivar disponibilidad"
            aria-pressed={disponible}
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      <h3 className="rep-section-title-sm">Notificaciones</h3>
      <div className="rep-menu-list">
        <div className="rep-toggle-row">
          <span className="rep-info-icon">
            <Bell size={17} />
          </span>
          <div className="rep-menu-label-col">
            <span className="rep-menu-label">Sonido de notificaciones</span>
            <span className="rep-menu-sublabel">
              Suena un aviso cuando llega una nueva
            </span>
          </div>
          <button
            type="button"
            className={sonido ? "toggle-switch active" : "toggle-switch"}
            onClick={cambiarSonido}
            aria-label="Activar o desactivar el sonido"
            aria-pressed={sonido}
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      {error && <p className="rep-status-text rep-status-error">{error}</p>}
    </div>
  );
}

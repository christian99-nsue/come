import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, BellRing, Info } from "lucide-react";
import "../../styles/cliente/Notificaciones.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Notificaciones() {
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const [activas, setActivas] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/cliente/notificaciones/preferencias`, { headers })
      .then((res) => setActivas(res.data.notificaciones_activas))
      .catch(() => setError("No se pudo cargar tu preferencia"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiar = async () => {
    if (guardando) return;

    const nuevo = !activas;
    setActivas(nuevo); // se refleja al instante
    setGuardando(true);
    setError("");

    try {
      await axios.patch(
        `${API_URL}/api/cliente/notificaciones/preferencias`,
        { notificaciones_activas: nuevo },
        { headers },
      );
    } catch {
      setActivas(!nuevo); // si falla, vuelve al valor anterior
      setError("No se pudo guardar tu preferencia");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="notificaciones-page">
      <section className="notificaciones-header">
        <button
          type="button"
          className="notificaciones-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="notificaciones-title">Notificaciones</h1>
      </section>

      <h3 className="notificaciones-section-title">Notificaciones de la app</h3>

      {cargando ? (
        <p className="notificaciones-note">Cargando...</p>
      ) : (
        <div className="notificaciones-list">
          <div className="notificacion-row">
            <span className="notificacion-icon">
              <BellRing size={18} />
            </span>
            <div className="notificacion-text">
              <span className="notificacion-title">Pedidos y entregas</span>
              <span className="notificacion-subtitle">
                Avisos cuando tu pedido se confirma, sale hacia tu dirección o
                se entrega.
              </span>
            </div>
            <button
              type="button"
              className={activas ? "toggle-switch active" : "toggle-switch"}
              onClick={cambiar}
              aria-label="Activar o desactivar las notificaciones de pedidos"
              aria-pressed={activas}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>
      )}

      {error && <p className="notificaciones-note">{error}</p>}

      <div className="notificaciones-note">
        <Info size={16} className="notificaciones-note-icon" />
        Aunque las desactives, puedes ver el estado de tus pedidos en la pestaña
        Pedidos.
      </div>
    </div>
  );
}

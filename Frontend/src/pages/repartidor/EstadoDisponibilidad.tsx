import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CheckCircle2, MoonStar, Info } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function EstadoDisponibilidad() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [disponible, setDisponible] = useState(true);
  const [tieneEntregaActiva, setTieneEntregaActiva] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/repartidor/disponibilidad`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setDisponible(res.data.disponible);
        setTieneEntregaActiva(res.data.tiene_entrega_activa);
      })
      .catch(() => setError("No se pudo cargar tu estado"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Se guarda al tocar la opción (no hay botón de guardar)
  const cambiarEstado = async (nuevoValor: boolean) => {
    if (guardando || nuevoValor === disponible) return;
    if (!nuevoValor && tieneEntregaActiva) return;

    const anterior = disponible;
    setDisponible(nuevoValor); // se refleja al instante
    setGuardando(true);
    setError("");

    try {
      await axios.patch(
        `${API_URL}/api/repartidor/disponibilidad`,
        { disponible: nuevoValor },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err: unknown) {
      setDisponible(anterior); // si falla, vuelve al valor anterior

      if (axios.isAxiosError(err)) {
        const mensaje = err.response?.data?.message;

        setError(
          typeof mensaje === "string"
            ? mensaje
            : "No se pudo cambiar tu estado",
        );
      } else {
        setError("Ha ocurrido un error inesperado");
      }
    } finally {
      setGuardando(false);
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
        <h1 className="rep-title">Estado de disponibilidad</h1>
      </section>

      <button
        type="button"
        className={disponible ? "rep-radio-card active" : "rep-radio-card"}
        onClick={() => cambiarEstado(true)}
      >
        <span className="rep-radio-icon">
          <CheckCircle2 size={18} />
        </span>
        <div className="rep-radio-text">
          <span className="rep-radio-title">Disponible</span>
          <span className="rep-radio-subtitle">
            Recibirás pedidos para entregar
          </span>
        </div>
        <span
          className={disponible ? "rep-radio-dot active" : "rep-radio-dot"}
        />
      </button>

      <button
        type="button"
        className={
          (!disponible ? "rep-radio-card active" : "rep-radio-card") +
          (tieneEntregaActiva ? " rep-radio-card-disabled" : "")
        }
        onClick={() => cambiarEstado(false)}
      >
        <span className="rep-radio-icon">
          <MoonStar size={18} />
        </span>
        <div className="rep-radio-text">
          <span className="rep-radio-title">No disponible</span>
          <span className="rep-radio-subtitle">
            No recibirás nuevos pedidos
          </span>
        </div>
        <span
          className={!disponible ? "rep-radio-dot active" : "rep-radio-dot"}
        />
      </button>

      {tieneEntregaActiva && (
        <div className="rep-inline-note">
          <Info size={16} className="rep-inline-note-icon" />
          No podrás cambiar a "No disponible" mientras tengas una entrega
          activa.
        </div>
      )}

      {error && <p className="rep-status-text rep-status-error">{error}</p>}
    </div>
  );
}

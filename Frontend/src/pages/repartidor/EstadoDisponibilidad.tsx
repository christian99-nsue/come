import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MoonStar, Info } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

type Estado = "disponible" | "no_disponible";

const tieneEntregaActiva = true; // TODO: vendrá del backend / estado global

export default function EstadoDisponibilidad() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>("disponible");

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
        className={
          estado === "disponible" ? "rep-radio-card active" : "rep-radio-card"
        }
        onClick={() => setEstado("disponible")}
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
          className={
            estado === "disponible" ? "rep-radio-dot active" : "rep-radio-dot"
          }
        />
      </button>

      <button
        type="button"
        className={
          (estado === "no_disponible"
            ? "rep-radio-card active"
            : "rep-radio-card") +
          (tieneEntregaActiva ? " rep-radio-card-disabled" : "")
        }
        onClick={() => {
          if (tieneEntregaActiva) return;
          setEstado("no_disponible");
        }}
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
          className={
            estado === "no_disponible"
              ? "rep-radio-dot active"
              : "rep-radio-dot"
          }
        />
      </button>

      {tieneEntregaActiva && (
        <div className="rep-inline-note">
          <Info size={16} className="rep-inline-note-icon" />
          No podrás cambiar a "No disponible" mientras tengas una entrega
          activa.
        </div>
      )}
    </div>
  );
}

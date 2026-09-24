import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UtensilsCrossed,
  MapPinned,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const entregaMock = {
  numero: "#FL-2841",
  asignado: true,
  recogida: { nombre: "Burger House", direccion: "Avenida Central 10, Malabo" },
  entrega: {
    cliente: "Juan Pérez",
    direccion: "Calle Mayor 12, Piso 2B",
    telefono: "+240 555 123 456",
  },
  pasoActual: 0,
};

const pasos = ["Pedido asignado", "Recoger pedido", "En viaje", "Entregado"];

export default function MiEntregaActual() {
  const navigate = useNavigate();
  const e = entregaMock;

  const marcarComoRecogido = () => {
    // TODO: PATCH /api/entregas/:id { estado: 'recogido' }
    navigate("/repartidor/en-viaje");
  };

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
        <div>
          <h1 className="rep-title">Mi entrega</h1>
          <p className="rep-subtitle">Pedido {e.numero}</p>
        </div>
        {e.asignado && (
          <span className="rep-badge rep-badge-green">✓ Asignado</span>
        )}
      </section>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <UtensilsCrossed size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Recogida</span>
          <span className="rep-info-value">{e.recogida.nombre}</span>
          <span className="rep-info-sub">{e.recogida.direccion}</span>
          <button type="button" className="rep-link-btn">
            <MapPin size={14} /> Ver ubicación
          </button>
        </div>
      </div>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <MapPinned size={18} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Entrega</span>
          <span className="rep-info-value">Cliente: {e.entrega.cliente}</span>
          <span className="rep-info-sub">{e.entrega.direccion}</span>
          <span className="rep-info-sub">{e.entrega.telefono}</span>
          <button type="button" className="rep-link-btn">
            <MapPin size={14} /> Ver ubicación
          </button>
        </div>
      </div>

      <div className="rep-card">
        <div className="rep-stepper">
          {pasos.map((paso, i) => {
            const done = i <= e.pasoActual;
            return (
              <div className="rep-step" key={paso}>
                <div className={done ? "rep-step-dot done" : "rep-step-dot"}>
                  {done && <CheckCircle2 size={13} />}
                </div>
                {i < pasos.length - 1 && (
                  <div
                    className={
                      i < e.pasoActual ? "rep-step-line done" : "rep-step-line"
                    }
                  />
                )}
                <span
                  className={done ? "rep-step-label done" : "rep-step-label"}
                >
                  {paso}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className="rep-btn-primary"
        onClick={marcarComoRecogido}
      >
        Marcar como recogido
      </button>
    </div>
  );
}

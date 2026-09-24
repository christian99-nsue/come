import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

import "../../styles/repartidor/RepartidorShared.css";

const pedidoMock = { numero: "#FL-2841", pago: 8500 };

function formatXAF(v: number) {
  return `${v.toLocaleString("es-ES")} XAF`;
}

export default function EntregaCompletada() {
  const navigate = useNavigate();
  const p = pedidoMock;

  return (
    <div className="rep-page rep-success-page">
      <div className="rep-success-circle">
        <Check size={40} />
      </div>

      <h1 className="rep-success-title">¡Entrega completada!</h1>
      <p className="rep-success-subtitle">Pedido {p.numero}</p>

      <div className="rep-success-amount">{formatXAF(p.pago)}</div>
      <p className="rep-success-note">Entrega registrada correctamente.</p>

      <button
        type="button"
        className="rep-btn-primary"
        onClick={() => navigate("/repartidor", { replace: true })}
      >
        Volver a pedidos
      </button>
    </div>
  );
}

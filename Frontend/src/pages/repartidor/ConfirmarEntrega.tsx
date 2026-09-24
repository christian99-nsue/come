import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
import "../../styles/repartidor/ConfirmarEntrega.css";
import "../../styles/repartidor/RepartidorShared.css";

const pedidoMock = { numero: "#FL-2841" };

export default function ConfirmarEntrega() {
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(true);

  const confirmar = () => {
    // TODO: PATCH /api/entregas/:id { estado: 'entregado' }
    navigate("/repartidor/entrega-completada", { replace: true });
  };

  const cancelar = () => {
    setModalAbierto(false);
    navigate(-1);
  };

  if (!modalAbierto) return null;

  return (
    <div className="confirmar-entrega-overlay">
      <div className="confirmar-entrega-card">
        <div className="confirmar-entrega-top">
          <h3 className="confirmar-entrega-title">¿Confirmar entrega?</h3>
          <button
            type="button"
            className="confirmar-entrega-close"
            onClick={cancelar}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <p className="confirmar-entrega-subtitle">Pedido {pedidoMock.numero}</p>

        <div className="confirmar-entrega-icon-box">
          <ClipboardCheck size={36} />
        </div>

        <p className="confirmar-entrega-question">
          ¿Has entregado correctamente el pedido al cliente?
        </p>

        <button type="button" className="rep-btn-secondary" onClick={cancelar}>
          Cancelar
        </button>
        <button
          type="button"
          className="rep-btn-primary"
          style={{ marginTop: 10 }}
          onClick={confirmar}
        >
          Confirmar entrega
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Check } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

interface EntregaCompletadaData {
  id: number;
  codigo: string;
  pago: number;
  restaurante_nombre: string;
}

function formatXAF(v: number) {
  return `${v.toLocaleString("es-ES")} XAF`;
}

export default function EntregaCompletada() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [entrega, setEntrega] = useState<EntregaCompletadaData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/repartidor/pedidos/${id}/completado`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEntrega(res.data))
      .catch(() => setError("No se pudo cargar el resumen de la entrega"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (cargando) {
    return (
      <div className="rep-page">
        <p className="rep-status-text">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="rep-page rep-success-page">
      <div className="rep-success-circle">
        <Check size={40} />
      </div>

      <h1 className="rep-success-title">¡Entrega completada!</h1>

      {entrega ? (
        <>
          <p className="rep-success-subtitle">
            Pedido {entrega.codigo} · {entrega.restaurante_nombre}
          </p>
          <div className="rep-success-amount">{formatXAF(entrega.pago)}</div>
          <p className="rep-success-note">Entrega registrada correctamente.</p>
        </>
      ) : (
        <p className="rep-status-text rep-status-error">{error}</p>
      )}

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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ClipboardCheck } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";
import "../../styles/repartidor/ConfirmarEntrega.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ConfirmarEntrega() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [entrega, setEntrega] = useState<{ id: number; codigo: string } | null>(
    null,
  );
  const [cargando, setCargando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/repartidor/entrega-actual`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Solo se puede confirmar una entrega que ya está en camino
        if (!res.data || res.data.estado !== "en_entrega") {
          navigate("/repartidor", { replace: true });
          return;
        }
        setEntrega({ id: res.data.id, codigo: res.data.codigo });
      })
      .catch(() => setError("No se pudo cargar tu entrega"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelar = () => navigate("/repartidor/en-viaje", { replace: true });

  const confirmar = async () => {
    if (!entrega) return;
    setConfirmando(true);
    setError("");
    try {
      await axios.post(
        `${API_URL}/api/repartidor/pedidos/${entrega.id}/entregado`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate(`/repartidor/entrega-completada/${entrega.id}`, {
        replace: true,
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const mensaje = err.response?.data?.message;

        setError(
          typeof mensaje === "string"
            ? mensaje
            : "No se pudo confirmar la entrega",
        );
      } else {
        setError("Ha ocurrido un error inesperado");
      }
    } finally {
      setConfirmando(false);
    }
  };

  if (cargando) {
    return (
      <div className="confirmar-entrega-overlay">
        <div className="confirmar-entrega-card">
          <p className="confirmar-entrega-question">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!entrega) {
    return (
      <div className="confirmar-entrega-overlay">
        <div className="confirmar-entrega-card">
          <p className="confirmar-entrega-question">
            {error || "No hay una entrega para confirmar."}
          </p>
          <button
            type="button"
            className="rep-btn-secondary"
            onClick={() => navigate("/repartidor", { replace: true })}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

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
        <p className="confirmar-entrega-subtitle">Pedido {entrega.codigo}</p>

        <div className="confirmar-entrega-icon-box">
          <ClipboardCheck size={36} />
        </div>

        <p className="confirmar-entrega-question">
          ¿Has entregado correctamente el pedido al cliente?
        </p>

        {error && <p className="rep-status-text rep-status-error">{error}</p>}

        <button
          type="button"
          className="rep-btn-secondary"
          onClick={cancelar}
          disabled={confirmando}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="rep-btn-primary rep-btn-block-margin"
          style={{ marginTop: 10 }}
          onClick={confirmar}
          disabled={confirmando}
        >
          {confirmando ? "Confirmando..." : "Confirmar entrega"}
        </button>
      </div>
    </div>
  );
}

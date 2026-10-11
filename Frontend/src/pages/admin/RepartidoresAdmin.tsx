import { useEffect, useState } from "react";
import axios from "axios";
import { KeyRound, Copy, Check, Bike } from "lucide-react";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/RepartidoresAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

type EstadoRepartidor = "disponible" | "en_entrega" | "no_disponible";

interface Repartidor {
  id: number;
  nombre: string;
  foto_perfil: string | null;
  entregas_totales: number;
  estado: EstadoRepartidor;
  pedido_activo_codigo: string | null;
}

function estadoInfo(estado: EstadoRepartidor, pedidoCodigo: string | null) {
  switch (estado) {
    case "disponible":
      return { label: "Disponible", clase: "admin-badge-green" };
    case "en_entrega":
      return {
        label: `En entrega ${pedidoCodigo || ""}`,
        clase: "admin-badge-blue",
      };
    default:
      return { label: "No disponible", clase: "admin-badge-gray" };
  }
}

export default function RepartidoresAdmin() {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [generandoCodigo, setGenerandoCodigo] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const cargarRepartidores = async () => {
      setCargando(true);
      setError("");

      try {
        const res = await axios.get(`${API_URL}/api/admin/repartidores`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRepartidores(res.data);
      } catch {
        setError("No se pudieron cargar los repartidores");
      } finally {
        setCargando(false);
      }
    };

    cargarRepartidores();
  }, [token]);

  const generarCodigo = async () => {
    setGenerandoCodigo(true);
    setCodigoGenerado(null);
    try {
      const res = await axios.post(
        `${API_URL}/api/admin/repartidores/generar-codigo`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCodigoGenerado(res.data.codigo);
    } catch {
      setError("No se pudo generar el código");
    } finally {
      setGenerandoCodigo(false);
    }
  };

  const copiarCodigo = () => {
    if (!codigoGenerado) return;
    navigator.clipboard.writeText(codigoGenerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="admin-page">
      <section className="admin-header">
        <h1 className="admin-title">Repartidores</h1>
      </section>

      <button
        type="button"
        className="admin-btn-primary rep-admin-generar-btn"
        onClick={generarCodigo}
        disabled={generandoCodigo}
      >
        <KeyRound size={17} />
        {generandoCodigo ? "Generando..." : "Generar código de invitación"}
      </button>

      {codigoGenerado && (
        <div className="rep-admin-codigo-banner">
          <div>
            <span className="rep-admin-codigo-label">Comparte este código</span>
            <span className="rep-admin-codigo-value">{codigoGenerado}</span>
            <span className="rep-admin-codigo-hint">
              Válido por 7 días. El repartidor lo usará para vincularse a tu
              restaurante.
            </span>
          </div>
          <button
            type="button"
            className="rep-admin-codigo-copy-btn"
            onClick={copiarCodigo}
          >
            {copiado ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      )}

      <p className="rep-admin-subtitle">
        Repartidores que ya han entregado pedidos de tu restaurante.
      </p>

      {cargando && (
        <p className="pedidos-status-text">Cargando repartidores...</p>
      )}
      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      {!cargando && !error && repartidores.length === 0 && (
        <div className="rep-admin-empty">
          <Bike size={28} className="rep-admin-empty-icon" />
          <p className="rep-admin-empty-text">
            Aún ningún repartidor ha completado una entrega de tu restaurante.
            Comparte tu código de invitación para que se vinculen.
          </p>
        </div>
      )}

      <div className="rep-admin-list">
        {repartidores.map((r) => {
          const info = estadoInfo(r.estado, r.pedido_activo_codigo);
          return (
            <div key={r.id} className="rep-admin-card">
              <img
                src={
                  r.foto_perfil ||
                  "https://picsum.photos/seed/repartidor-placeholder/80/80"
                }
                alt={r.nombre}
                className="rep-admin-avatar"
              />
              <div className="rep-admin-info">
                <span className="rep-admin-nombre">{r.nombre}</span>
                <span className={`admin-badge ${info.clase}`}>
                  ● {info.label}
                </span>
              </div>
              <span className="rep-admin-entregas">
                {r.entregas_totales} entregas
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

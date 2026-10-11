import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

type Rango = "hoy" | "semana" | "mes";

interface EntregaHistorial {
  id: number;
  codigo: string;
  restaurante_nombre: string;
  restaurante_logo: string | null;
  pago: number;
  fecha: string;
}

interface HistorialData {
  resumen: { entregas: number; ganancias: number };
  entregas: EntregaHistorial[];
}

const etiquetasRango: Record<Rango, string> = {
  hoy: "Hoy",
  semana: "Esta semana",
  mes: "Este mes",
};

function formatXAF(v: number) {
  return `${v.toLocaleString("es-ES")} XAF`;
}

function etiquetaDia(fecha: Date) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dia = new Date(fecha);
  dia.setHours(0, 0, 0, 0);

  const diff = Math.round((hoy.getTime() - dia.getTime()) / 86400000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return dia.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function formatHora(fecha: Date) {
  return fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistorialEntregas() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [rango, setRango] = useState<Rango>("hoy");
  const [rangoCargado, setRangoCargado] = useState<Rango | null>(null);
  const [data, setData] = useState<HistorialData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    axios
      .get(`${API_URL}/api/repartidor/historial`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { rango },
      })
      .then((res) => {
        if (!cancelado) {
          setData(res.data);
          setRangoCargado(rango);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelado) {
          setError("No se pudo cargar el historial");
          setRangoCargado(rango);
        }
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rango]);

  // Las entregas ya vienen ordenadas de más reciente a más antigua,
  // así que las del mismo día quedan juntas.
  const grupos: { titulo: string; items: EntregaHistorial[] }[] = [];
  (data?.entregas || []).forEach((e) => {
    const titulo = etiquetaDia(new Date(e.fecha));
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.titulo === titulo) {
      ultimo.items.push(e);
    } else {
      grupos.push({ titulo, items: [e] });
    }
  });

  const cargandoActual = rangoCargado !== rango;
  const errorActual = cargandoActual ? "" : error;

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
        <h1 className="rep-title">Historial de entregas</h1>
      </section>

      <div className="rep-tabs-row">
        {(["hoy", "semana", "mes"] as Rango[]).map((r) => (
          <button
            key={r}
            type="button"
            className={rango === r ? "rep-tab-btn active" : "rep-tab-btn"}
            onClick={() => setRango(r)}
          >
            {etiquetasRango[r]}
          </button>
        ))}
      </div>

      {cargandoActual && (
        <p className="rep-status-text">Cargando historial...</p>
      )}

      {errorActual && (
        <p className="rep-status-text rep-status-error">{errorActual}</p>
      )}

      {!cargandoActual && !errorActual && data && (
        <>
          <div className="rep-card rep-card-green rep-history-summary">
            <div className="rep-history-summary-col">
              <span className="rep-history-summary-value">
                {data.resumen.entregas}
              </span>
              <span className="rep-history-summary-label">Entregas</span>
            </div>
            <div className="rep-history-summary-col">
              <span className="rep-history-summary-value">
                {formatXAF(data.resumen.ganancias)}
              </span>
              <span className="rep-history-summary-label">Ganado</span>
            </div>
          </div>

          {grupos.length === 0 && (
            <p className="rep-status-text">
              Aún no tienes entregas en este período.
            </p>
          )}

          {grupos.map((grupo) => (
            <div key={grupo.titulo} className="rep-history-group">
              <h3 className="rep-section-title-sm">{grupo.titulo}</h3>
              <div className="rep-history-list">
                {grupo.items.map((e) => (
                  <div
                    key={e.id}
                    className="rep-history-item rep-history-item-static"
                  >
                    <img
                      src={
                        e.restaurante_logo ||
                        `https://picsum.photos/seed/restaurante-${e.id}/60/60`
                      }
                      alt={e.restaurante_nombre}
                      className="rep-history-img"
                    />
                    <div className="rep-history-info">
                      <div className="rep-history-number">{e.codigo}</div>
                      <div className="rep-history-restaurant">
                        {e.restaurante_nombre}
                      </div>
                      <div className="rep-history-meta">
                        {formatHora(new Date(e.fecha))} · Entregado
                      </div>
                    </div>
                    <span className="rep-history-amount">
                      {formatXAF(e.pago)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

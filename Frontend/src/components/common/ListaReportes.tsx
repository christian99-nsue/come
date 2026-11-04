import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ChevronRight, Plus, Inbox } from "lucide-react";
import {
  nombreCategoria,
  etiquetaEstado,
  tiempoRelativo,
} from "./utilesReportes";
import "../../styles/common/MisReportes.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Resumen {
  id: number;
  categoria: string;
  asunto: string;
  estado: "abierto" | "en_revision" | "resuelto";
  ultima_actividad: string;
  pedido_codigo: string | null;
  respuestas: number;
  nueva_respuesta: boolean;
}

interface Props {
  endpoint: string; // por ejemplo "/api/cliente/soporte/reportes"
  rutaDetalle: (id: number) => string;
  rutaNuevo: string; // dónde se envía una consulta nueva
  rutaVolver: string;
}

export default function ListaReportes({
  endpoint,
  rutaDetalle,
  rutaNuevo,
  rutaVolver,
}: Props) {
  const navigate = useNavigate();

  const [reportes, setReportes] = useState<Resumen[] | null>(null);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    axios
      .get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setReportes(res.data);
        setError("");
      })
      .catch(() => setError("No se pudieron cargar tus reportes"));
  }, [endpoint]);

  // Se actualiza sola para ver las respuestas nuevas sin recargar
  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, [cargar]);

  return (
    <div className="misrep-page">
      <section className="misrep-header">
        <button
          type="button"
          className="misrep-back"
          onClick={() => navigate(rutaVolver)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="misrep-title">Mis reportes</h1>
      </section>

      {error && !reportes && <p className="misrep-status error">{error}</p>}
      {!error && !reportes && (
        <p className="misrep-status">Cargando tus reportes...</p>
      )}

      {reportes && reportes.length === 0 && (
        <div className="misrep-vacio">
          <Inbox size={30} />
          <p className="misrep-status">
            Aún no has enviado ningún reporte. Si tienes un problema o una duda,
            cuéntanoslo.
          </p>
        </div>
      )}

      <div className="misrep-list">
        {reportes?.map((r) => {
          const e = etiquetaEstado[r.estado];
          return (
            <button
              key={r.id}
              type="button"
              className={
                r.nueva_respuesta ? "misrep-card nueva" : "misrep-card"
              }
              onClick={() => navigate(rutaDetalle(r.id))}
            >
              <div className="misrep-card-body">
                <span className="misrep-card-asunto">{r.asunto}</span>
                <span className="misrep-card-sub">
                  {nombreCategoria[r.categoria] ?? r.categoria}
                  {r.pedido_codigo ? ` · ${r.pedido_codigo}` : ""}
                </span>
                <div className="misrep-badges">
                  <span className={`misrep-badge ${e.clase}`}>{e.texto}</span>
                  {r.nueva_respuesta && (
                    <span className="misrep-badge nueva">Nueva respuesta</span>
                  )}
                  {r.respuestas > 0 && !r.nueva_respuesta && (
                    <span className="misrep-badge neutra">
                      {r.respuestas}{" "}
                      {r.respuestas === 1 ? "respuesta" : "respuestas"}
                    </span>
                  )}
                </div>
              </div>
              <span className="misrep-time">
                {tiempoRelativo(r.ultima_actividad)}
              </span>
              <ChevronRight size={18} className="misrep-chevron" />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="misrep-btn"
        onClick={() => navigate(rutaNuevo)}
      >
        <Plus size={18} /> Nueva consulta
      </button>
    </div>
  );
}

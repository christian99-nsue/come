import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Send } from "lucide-react";
import {
  nombreCategoria,
  etiquetaEstado,
  fechaHora,
  destinoEstado,
} from "./utilesReportes";
import "../../styles/common/MisReportes.css";

const API_URL = import.meta.env.VITE_API_URL;
const MAX_MENSAJE = 500;

interface Detalle {
  id: number;
  categoria: string;
  asunto: string;
  mensaje: string;
  estado: "abierto" | "en_revision" | "resuelto";
  fecha_creacion: string;
  pedido_codigo: string | null;
  puede_responder: boolean;
  motivo_no_responder: string | null;
  hilo: {
    tipo: "respuesta" | "estado" | "usuario";
    mensaje: string;
    fecha: string;
  }[];
}

interface Props {
  endpoint: string; // la misma de la lista; aquí se le añade el id
  rutaLista: string;
  rutaNuevo: string;
}

export default function DetalleReporte({
  endpoint,
  rutaLista,
  rutaNuevo,
}: Props) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [d, setD] = useState<Detalle | null>(null);
  const [error, setError] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");

  const cabeceras = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const cargar = useCallback(() => {
    axios
      .get(`${API_URL}${endpoint}/${id}`, { headers: cabeceras() })
      .then((res) => {
        setD(res.data);
        setError("");
      })
      .catch((err) =>
        setError(err.response?.data?.message || "No se pudo cargar el reporte"),
      );
  }, [endpoint, id]);

  // Se actualiza sola: si soporte responde mientras lo miras, aparece
  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, [cargar]);

  const enviar = async () => {
    if (texto.trim().length < 2) return;

    setErrorEnvio("");
    setEnviando(true);

    try {
      const res = await axios.post(
        `${API_URL}${endpoint}/${id}/mensajes`,
        { mensaje: texto },
        { headers: cabeceras() },
      );

      setD(res.data);
      setTexto("");
    } catch (err: unknown) {
      const mensajeError = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;

      setErrorEnvio(mensajeError || "No se pudo enviar el mensaje");

      cargar(); // Por si cambió algo, por ejemplo, el límite de mensajes.
    } finally {
      setEnviando(false);
    }
  };

  const cabecera = (
    <section className="misrep-header">
      <button
        type="button"
        className="misrep-back"
        onClick={() => navigate(rutaLista)}
        aria-label="Volver"
      >
        <ArrowLeft size={22} />
      </button>
      <h1 className="misrep-title">{d ? d.asunto : "Reporte"}</h1>
    </section>
  );

  if (!d) {
    return (
      <div className="misrep-page">
        {cabecera}
        {error ? (
          <p className="misrep-status error">{error}</p>
        ) : (
          <p className="misrep-status">Cargando...</p>
        )}
      </div>
    );
  }

  const e = etiquetaEstado[d.estado];

  return (
    <div className="misrep-page">
      {cabecera}

      <div className="misrep-badges" style={{ marginBottom: 16 }}>
        <span className={`misrep-badge ${e.clase}`}>{e.texto}</span>
        <span className="misrep-badge neutra">
          {nombreCategoria[d.categoria] ?? d.categoria}
        </span>
        {d.pedido_codigo && (
          <span className="misrep-badge neutra">Pedido {d.pedido_codigo}</span>
        )}
      </div>

      <div className="misrep-hilo">
        <div className="misrep-burbuja yo">
          <span className="misrep-quien">Tú</span>
          <span className="misrep-texto">{d.mensaje}</span>
          <span className="misrep-fecha">{fechaHora(d.fecha_creacion)}</span>
        </div>

        {d.hilo.map((h, i) =>
          h.tipo === "estado" ? (
            <div key={i} className="misrep-evento">
              Estado: {destinoEstado(h.mensaje)} · {fechaHora(h.fecha)}
            </div>
          ) : (
            <div
              key={i}
              className={
                h.tipo === "usuario"
                  ? "misrep-burbuja yo"
                  : "misrep-burbuja soporte"
              }
            >
              <span className="misrep-quien">
                {h.tipo === "usuario" ? "Tú" : "Equipo de soporte"}
              </span>
              <span className="misrep-texto">{h.mensaje}</span>
              <span className="misrep-fecha">{fechaHora(h.fecha)}</span>
            </div>
          ),
        )}
      </div>

      {d.puede_responder ? (
        <div className="misrep-responder">
          <span className="misrep-responder-label">
            {d.estado === "resuelto"
              ? "¿Sigue el problema? Escribe aquí y reabriremos tu reporte."
              : "Escribe un mensaje al equipo de soporte"}
          </span>

          <textarea
            className="misrep-textarea"
            value={texto}
            onChange={(ev) => setTexto(ev.target.value)}
            maxLength={MAX_MENSAJE}
            placeholder="Tu mensaje..."
            rows={3}
          />

          <div className="misrep-responder-pie">
            <span className="misrep-contador">
              {texto.length}/{MAX_MENSAJE}
            </span>
            <button
              type="button"
              className="misrep-enviar"
              onClick={enviar}
              disabled={enviando || texto.trim().length < 2}
            >
              <Send size={15} /> {enviando ? "Enviando..." : "Enviar"}
            </button>
          </div>

          {errorEnvio && (
            <p className="misrep-status error" style={{ margin: "8px 0 0" }}>
              {errorEnvio}
            </p>
          )}
        </div>
      ) : (
        <div className="misrep-pie">
          {d.motivo_no_responder}
          {d.estado === "resuelto" && (
            <button
              type="button"
              className="misrep-btn"
              onClick={() => navigate(rutaNuevo)}
            >
              Enviar una consulta nueva
            </button>
          )}
        </div>
      )}
    </div>
  );
}

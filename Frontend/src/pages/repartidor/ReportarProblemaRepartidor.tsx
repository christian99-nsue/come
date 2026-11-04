import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Tag, Hash, Type, ChevronDown } from "lucide-react";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ReportarProblemaRepartidor() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [categoria, setCategoria] = useState("");
  const [codigoPedido, setCodigoPedido] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  const enviar = async () => {
    setError("");
    if (!categoria) return setError("Selecciona el tipo de problema");
    if (asunto.trim().length < 3) return setError("Escribe un asunto");
    if (mensaje.trim().length < 10)
      return setError("Describe el problema con un poco más de detalle");

    setEnviando(true);
    try {
      await axios.post(
        `${API_URL}/api/repartidor/soporte/reportes`,
        { categoria, asunto, mensaje, codigo_pedido: codigoPedido },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMostrarExito(true);
    } catch (err: unknown) {
      let mensajeError = "No se pudo enviar el reporte";

      if (axios.isAxiosError(err)) {
        const mensajeServidor: unknown = err.response?.data?.message;

        if (typeof mensajeServidor === "string" && mensajeServidor.trim()) {
          mensajeError = mensajeServidor;
        }
      }

      setError(mensajeError);
    } finally {
      setEnviando(false);
    }
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
        <h1 className="rep-title">Reportar un problema</h1>
      </section>

      <p className="rep-page-subtitle">
        Cuéntanos qué sucede y lo revisaremos.
      </p>

      {error && <p className="rep-status-text rep-status-error">{error}</p>}

      <div className="rep-form">
        <label className="rep-form-field">
          <span className="rep-form-icon">
            <Tag size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Tipo de problema</span>
            <div className="rep-form-select-wrapper">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="rep-form-select"
              >
                <option value="">Selecciona una opción</option>
                <option value="pedido">Un pedido o una entrega</option>
                <option value="app">La aplicación</option>
                <option value="cuenta">Mi cuenta</option>
                <option value="otro">Otro</option>
              </select>
              <ChevronDown size={14} className="rep-form-select-chevron" />
            </div>
          </div>
        </label>

        <label className="rep-form-field">
          <span className="rep-form-icon">
            <Hash size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Código del pedido (opcional)</span>
            <input
              value={codigoPedido}
              onChange={(e) => setCodigoPedido(e.target.value)}
              className="rep-form-input"
              placeholder="Ej: #FL-2841"
            />
          </div>
        </label>

        <label className="rep-form-field">
          <span className="rep-form-icon">
            <Type size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Asunto</span>
            <input
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              className="rep-form-input"
              maxLength={150}
              placeholder="Resumen del problema"
            />
          </div>
        </label>

        <label className="rep-field-block">
          <span className="rep-form-label">Descripción</span>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="rep-textarea"
            maxLength={1000}
            placeholder="Cuéntanos qué pasó, cuándo y cómo podemos ayudarte..."
          />
          <span className="rep-textarea-count">{mensaje.length}/1000</span>
        </label>
      </div>

      <button
        type="button"
        className="rep-btn-primary"
        onClick={enviar}
        disabled={enviando}
      >
        {enviando ? "Enviando..." : "Enviar reporte"}
      </button>

      <CambiosGuardadosOverlay
        open={mostrarExito}
        titulo="Reporte enviado"
        onContinuar={() =>
          navigate("/repartidor/ayuda/reportes", { replace: true })
        }
      />
    </div>
  );
}

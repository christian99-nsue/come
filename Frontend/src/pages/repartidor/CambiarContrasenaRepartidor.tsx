import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function CambiarContrasenaRepartidor() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verActual, setVerActual] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  const reglas = [
    { texto: "Mínimo 8 caracteres", cumple: nueva.length >= 8 },
    { texto: "Una mayúscula", cumple: /[A-Z]/.test(nueva) },
    { texto: "Una minúscula", cumple: /[a-z]/.test(nueva) },
    { texto: "Un número", cumple: /\d/.test(nueva) },
  ];

  const actualizar = async () => {
    setError("");
    if (!actual) return setError("Introduce tu contraseña actual");
    if (!reglas.every((r) => r.cumple))
      return setError("La nueva contraseña no cumple los requisitos");
    if (nueva !== confirmar) return setError("Las contraseñas no coinciden");

    setGuardando(true);
    try {
      await axios.patch(
        `${API_URL}/api/repartidor/perfil/password`,
        { contrasenaActual: actual, contrasenaNueva: nueva },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMostrarExito(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const mensaje = err.response?.data?.message;

        setError(
          typeof mensaje === "string"
            ? mensaje
            : "No se pudo actualizar la contraseña",
        );
      } else {
        setError("Ha ocurrido un error inesperado");
      }
    } finally {
      setGuardando(false);
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
        <h1 className="rep-title">Cambiar contraseña</h1>
      </section>

      <div className="rep-lock-hero">
        <div className="rep-lock-icon">
          <Lock size={28} />
        </div>
        <h2 className="rep-lock-title">Mantén tu cuenta segura</h2>
        <p className="rep-lock-subtitle">
          Cambia tu contraseña regularmente para proteger tu cuenta.
        </p>
      </div>

      {error && <p className="rep-status-text rep-status-error">{error}</p>}

      <div className="rep-form">
        <label className="rep-password-field">
          <span className="rep-form-label">Contraseña actual</span>
          <div className="rep-password-input-wrapper">
            <Lock size={16} className="rep-password-icon" />
            <input
              type={verActual ? "text" : "password"}
              placeholder="Introduce tu contraseña actual"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className="rep-password-input"
            />
            <button
              type="button"
              className="rep-password-eye"
              onClick={() => setVerActual((v) => !v)}
            >
              {verActual ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <label className="rep-password-field">
          <span className="rep-form-label">Nueva contraseña</span>
          <div className="rep-password-input-wrapper">
            <Lock size={16} className="rep-password-icon" />
            <input
              type={verNueva ? "text" : "password"}
              placeholder="Introduce la nueva contraseña"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              className="rep-password-input"
            />
            <button
              type="button"
              className="rep-password-eye"
              onClick={() => setVerNueva((v) => !v)}
            >
              {verNueva ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <label className="rep-password-field">
          <span className="rep-form-label">Confirmar nueva contraseña</span>
          <div className="rep-password-input-wrapper">
            <Lock size={16} className="rep-password-icon" />
            <input
              type={verConfirmar ? "text" : "password"}
              placeholder="Confirma la nueva contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="rep-password-input"
            />
            <button
              type="button"
              className="rep-password-eye"
              onClick={() => setVerConfirmar((v) => !v)}
            >
              {verConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>
      </div>

      <div className="rep-password-rules">
        <span className="rep-password-rules-title">
          <ShieldCheck size={16} /> La contraseña debe tener:
        </span>
        <ul className="rep-password-rules-list">
          {reglas.map((r) => (
            <li key={r.texto} className={r.cumple ? "cumple" : ""}>
              {r.texto}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="rep-btn-primary"
        onClick={actualizar}
        disabled={guardando}
      >
        {guardando ? "Actualizando..." : "Actualizar contraseña"}
      </button>

      <CambiosGuardadosOverlay
        open={mostrarExito}
        onContinuar={() => navigate("/repartidor/perfil", { replace: true })}
      />
    </div>
  );
}

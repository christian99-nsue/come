import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

export default function CambiarContrasenaRepartidor() {
  const navigate = useNavigate();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verActual, setVerActual] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const actualizar = () => {
    if (!actual || !nueva || nueva !== confirmar) return;
    // TODO: PATCH /api/repartidores/:id/password
    navigate(-1);
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
          <li>Mínimo 8 caracteres</li>
          <li>Una mayúscula</li>
          <li>Una minúscula</li>
          <li>Un número</li>
        </ul>
      </div>

      <button type="button" className="rep-btn-primary" onClick={actualizar}>
        Actualizar contraseña
      </button>
    </div>
  );
}

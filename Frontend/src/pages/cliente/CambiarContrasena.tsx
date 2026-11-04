import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import "../../styles/cliente/CambiarContrasena.css";

const API_URL = import.meta.env.VITE_API_URL;

function CampoContrasena({
  etiqueta,
  valor,
  onChange,
  autoComplete,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const [ver, setVer] = useState(false);

  return (
    <label className="pw-field">
      <span className="pw-label">{etiqueta}</span>
      <div className="pw-input-wrapper">
        <Lock size={16} className="pw-icon" />
        <input
          type={ver ? "text" : "password"}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="pw-input"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="pw-eye"
          onClick={() => setVer((v) => !v)}
          aria-label="Mostrar u ocultar"
        >
          {ver ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

export default function CambiarContrasena() {
  const navigate = useNavigate();

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
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
        `${API_URL}/api/cliente/perfil/password`,
        { contrasenaActual: actual, contrasenaNueva: nueva },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setMostrarExito(true);
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "No se pudo actualizar la contraseña",
        );
      } else {
        setError("No se pudo actualizar la contraseña");
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pw-page">
      <section className="pw-header">
        <button
          type="button"
          className="pw-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="pw-title">Cambiar contraseña</h1>
      </section>

      {error && <p className="pw-error">{error}</p>}

      <CampoContrasena
        etiqueta="Contraseña actual"
        valor={actual}
        onChange={setActual}
        autoComplete="current-password"
      />
      <CampoContrasena
        etiqueta="Nueva contraseña"
        valor={nueva}
        onChange={setNueva}
        autoComplete="new-password"
      />
      <CampoContrasena
        etiqueta="Confirmar nueva contraseña"
        valor={confirmar}
        onChange={setConfirmar}
        autoComplete="new-password"
      />

      <div className="pw-rules">
        <span className="pw-rules-title">
          <ShieldCheck size={16} /> La contraseña debe tener:
        </span>
        <ul className="pw-rules-list">
          {reglas.map((r) => (
            <li key={r.texto} className={r.cumple ? "cumple" : ""}>
              {r.texto}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="pw-btn"
        onClick={actualizar}
        disabled={guardando}
      >
        {guardando ? "Actualizando..." : "Actualizar contraseña"}
      </button>

      <CambiosGuardadosOverlay
        open={mostrarExito}
        onContinuar={() => navigate("/cliente/perfil", { replace: true })}
      />
    </div>
  );
}

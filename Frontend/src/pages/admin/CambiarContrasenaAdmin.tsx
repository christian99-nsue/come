import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import "../../styles/admin/AdminShared.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function CambiarContrasenaAdmin() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verActual, setVerActual] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  const actualizar = async () => {
    setError("");

    if (!actual || !nueva) return setError("Completa todos los campos");

    if (nueva.length < 8)
      return setError("La nueva contraseña debe tener mínimo 8 caracteres");

    if (nueva !== confirmar) return setError("Las contraseñas no coinciden");

    setGuardando(true);

    try {
      await axios.patch(
        `${API_URL}/api/admin/cuenta/password`,
        {
          contrasenaActual: actual,
          contrasenaNueva: nueva,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMostrarExito(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
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
    <div className="admin-page">
      <section className="admin-header">
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>

        <h1 className="admin-title">Cambiar contraseña</h1>
      </section>

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      <div className="admin-form-field">
        <span className="admin-form-label">Contraseña actual</span>

        <div style={{ position: "relative" }}>
          <input
            type={verActual ? "text" : "password"}
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            className="admin-form-input"
            style={{ paddingRight: 40 }}
          />

          <button
            type="button"
            onClick={() => setVerActual((v) => !v)}
            style={{
              position: "absolute",
              top: "50%",
              right: 12,
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
            }}
          >
            {verActual ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="admin-form-field">
        <span className="admin-form-label">Nueva contraseña</span>

        <div style={{ position: "relative" }}>
          <input
            type={verNueva ? "text" : "password"}
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            className="admin-form-input"
            style={{ paddingRight: 40 }}
          />

          <button
            type="button"
            onClick={() => setVerNueva((v) => !v)}
            style={{
              position: "absolute",
              top: "50%",
              right: 12,
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
            }}
          >
            {verNueva ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="admin-form-field">
        <span className="admin-form-label">Confirmar nueva contraseña</span>

        <input
          type={verNueva ? "text" : "password"}
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          className="admin-form-input"
        />
      </div>

      <button
        type="button"
        className="admin-btn-primary"
        onClick={actualizar}
        disabled={guardando}
      >
        <Lock size={16} />{" "}
        {guardando ? "Actualizando..." : "Actualizar contraseña"}
      </button>

      <CambiosGuardadosOverlay
        open={mostrarExito}
        onContinuar={() =>
          navigate("/admin/configuracion/cuenta", { replace: true })
        }
      />
    </div>
  );
}

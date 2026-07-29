import { useState } from "react";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import "../../styles/Login.css";
import logo from "../../assets/Logo.png";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Logo placeholder */}
        <div className="login-logo-section">
          <img src={logo} alt="Logo de come" className="login-logo-img" />
          <h1 className="login-title">
            Tu comida favorita,
            <br />
            en <span className="login-title-accent">minutos</span>
          </h1>
          <div className="login-title-divider" />
        </div>

        {/* Formulario */}
        <form className="login-form">
          {/* Teléfono */}
          <div className="login-input-group">
            <Phone size={20} className="login-input-icon" />
            <input
              type="tel"
              inputMode="tel"
              placeholder="Número de teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="login-input"
            />
          </div>

          {/* Contraseña */}
          <div className="login-input-group">
            <Lock size={20} className="login-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="login-eye-btn"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Olvidaste tu contraseña */}
          <div className="login-forgot-wrapper">
            <button type="button" className="login-forgot-link">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón iniciar sesión */}
          <button type="submit" className="login-submit-btn">
            Iniciar sesión
          </button>
        </form>

        {/* Divisor */}
        <div className="login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-text">o</span>
          <div className="login-divider-line" />
        </div>

        {/* Crear cuenta */}
        <p className="login-signup-text">
          ¿No tienes una cuenta?{" "}
          <button type="button" className="login-signup-link">
            Crear cuenta
          </button>
        </p>
      </div>
    </div>
  );
}

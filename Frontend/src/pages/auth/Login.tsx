import { useState } from "react";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "../../styles/cliente/Login.css";
import logo from "../../assets/Logo.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  //Funcion de redirigir por role
  const handleRedirectByRole = (rol: string) => {
    if (rol === "admin") navigate("/admin");
    else if (rol === "repartidor") navigate("/repartidor");
    else navigate("/cliente/inicio");
  };

  //Funcion terminar login que almacena el token en local storage
  const finishLogin = (data: LoginResponse) => {
    const { token, user } = data;

    localStorage.setItem("token", token);
    const rol = user.rol;

    localStorage.setItem("user", JSON.stringify(user));

    handleRedirectByRole(rol);
  };

  type LoginResponse = {
    token: string;
    user: {
      id: number;
      email: string;
      telefono: string;
      rol: string;
      nombre: string;
    };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanIdentifier = telefono.trim();

    if (!cleanIdentifier || !password) {
      setError("Introduce tu telefono y contraseña");
      return;
    }

    if (/^\$2[aby]\$\d{2}\$/.test(password)) {
      setError(
        "Introduce la contrasena real, no el hash guardado en la base de datos",
      );
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        telefono: cleanIdentifier,
        password,
      });

      finishLogin(res.data);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Error inesperado");
    }
  };

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
        <form className="login-form" onSubmit={handleLogin}>
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
            <span className="login-error">{error || "\u00A0"}</span>
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

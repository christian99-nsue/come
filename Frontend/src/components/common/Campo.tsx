import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

interface CampoProps {
  icono: ReactNode;
  etiqueta: string;
  obligatorio?: boolean;
  valor: string;
  onCambio: (valor: string) => void;
  tipo?: "text" | "tel" | "email" | "password";
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  maxLength?: number;
}

export function Campo({
  icono,
  etiqueta,
  obligatorio,
  valor,
  onCambio,
  tipo = "text",
  placeholder,
  error,
  autoComplete,
  maxLength,
}: CampoProps) {
  const [ver, setVer] = useState(false);
  const esPassword = tipo === "password";

  return (
    <label className="reg-campo">
      <span className="reg-etiqueta">
        {icono}
        <span>
          {etiqueta}
          {obligatorio ? (
            " *"
          ) : (
            <span className="reg-opcional"> (opcional)</span>
          )}
        </span>
      </span>

      <span className="reg-input-caja">
        <input
          className={`reg-input${error ? " con-error" : ""}${esPassword ? " con-ojo" : ""}`}
          type={esPassword && ver ? "text" : tipo}
          inputMode={tipo === "tel" ? "tel" : undefined}
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-label={etiqueta}
        />
        {esPassword && (
          <button
            type="button"
            className="reg-ojo"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {ver ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </span>

      {error && <p className="reg-error-campo">{error}</p>}
    </label>
  );
}

interface CampoSelectProps {
  icono: ReactNode;
  etiqueta: string;
  obligatorio?: boolean;
  valor: string;
  onCambio: (valor: string) => void;
  opciones: string[];
  placeholder?: string;
  error?: string;
}

export function CampoSelect({
  icono,
  etiqueta,
  obligatorio,
  valor,
  onCambio,
  opciones,
  placeholder = "Selecciona una opción",
  error,
}: CampoSelectProps) {
  return (
    <label className="reg-campo">
      <span className="reg-etiqueta">
        {icono}
        <span>
          {etiqueta}
          {obligatorio ? (
            " *"
          ) : (
            <span className="reg-opcional"> (opcional)</span>
          )}
        </span>
      </span>

      <select
        className={`reg-input${error ? " con-error" : ""}`}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        aria-label={etiqueta}
      >
        <option value="">{placeholder}</option>
        {opciones.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      {error && <p className="reg-error-campo">{error}</p>}
    </label>
  );
}

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/common/Registro.css";

interface Props {
  titulo?: string;
  atras?: string | (() => void) | null; // null = sin flecha
  icono?: ReactNode;
  color?: "verde" | "naranja" | "azul";
  subtitulo?: string;
  children: ReactNode;
}

export default function RegistroLayout({
  titulo,
  atras = null,
  icono,
  color = "verde",
  subtitulo,
  children,
}: Props) {
  const navigate = useNavigate();

  const volver = () => {
    if (typeof atras === "function") atras();
    else if (typeof atras === "string") navigate(atras);
  };

  return (
    <div className="reg-page">
      <div className="reg-card">
        {(titulo || atras) && (
          <header className="reg-header">
            {atras && (
              <button
                type="button"
                className="reg-back"
                onClick={volver}
                aria-label="Volver"
              >
                <ArrowLeft size={22} />
              </button>
            )}
            {titulo && <h1 className="reg-header-title">{titulo}</h1>}
          </header>
        )}

        {icono && <div className={`reg-icono ${color}`}>{icono}</div>}
        {subtitulo && <p className="reg-subtitulo">{subtitulo}</p>}

        {children}
      </div>
    </div>
  );
}

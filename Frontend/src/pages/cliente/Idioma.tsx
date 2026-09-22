import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";
import "../../styles/cliente/Idioma.css";

interface Idioma {
  id: string;
  nombre: string;
  bandera: string;
}

const idiomasMock: Idioma[] = [
  { id: "es", nombre: "Español", bandera: "🇪🇸" },
  { id: "en", nombre: "Inglés", bandera: "🇬🇧" },
  { id: "fr", nombre: "Francés", bandera: "🇫🇷" },
];

export default function Idioma() {
  const navigate = useNavigate();
  const [idiomaActivo, setIdiomaActivo] = useState("es");

  return (
    <div className="idioma-page">
      <section className="idioma-header">
        <button
          type="button"
          className="idioma-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="idioma-title">Idioma</h1>
      </section>

      <div className="idioma-list">
        {idiomasMock.map((idioma) => (
          <button
            key={idioma.id}
            type="button"
            className="idioma-row"
            onClick={() => setIdiomaActivo(idioma.id)}
          >
            <span className="idioma-flag">{idioma.bandera}</span>
            <span className="idioma-name">{idioma.nombre}</span>
            <span
              className={
                idiomaActivo === idioma.id
                  ? "idioma-radio active"
                  : "idioma-radio"
              }
            />
          </button>
        ))}
      </div>

      <div className="idioma-note">
        <span className="idioma-note-icon">
          <Globe size={16} />
        </span>
        El idioma se aplicará en toda la aplicación y podrás cambiarlo en
        cualquier momento.
      </div>
    </div>
  );
}

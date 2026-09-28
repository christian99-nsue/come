import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

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

export default function IdiomaRepartidor() {
  const navigate = useNavigate();
  const [idiomaActivo, setIdiomaActivo] = useState("es");

  const guardarCambios = () => {
    // TODO: PATCH /api/repartidores/:id/preferencias { idioma: idiomaActivo }
    navigate(-1);
  };

  return (
    <div className="rep-page">
      <section className="rep-header">
        <button type="button" className="rep-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <h1 className="rep-title">Idioma</h1>
      </section>

      <p className="rep-page-subtitle">Selecciona tu idioma</p>

      <div className="rep-menu-list">
        {idiomasMock.map((idioma) => (
          <button
            key={idioma.id}
            type="button"
            className="rep-lang-row"
            onClick={() => setIdiomaActivo(idioma.id)}
          >
            <span className="rep-lang-flag">{idioma.bandera}</span>
            <span className="rep-menu-label">{idioma.nombre}</span>
            <span
              className={idiomaActivo === idioma.id ? "rep-radio-dot active" : "rep-radio-dot"}
            />
          </button>
        ))}
      </div>

      <button type="button" className="rep-btn-primary rep-btn-block-margin" onClick={guardarCambios}>
        Guardar cambios
      </button>
    </div>
  );
}

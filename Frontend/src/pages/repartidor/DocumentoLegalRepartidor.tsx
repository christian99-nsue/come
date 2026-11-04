import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { documentosLegales } from "../../data/documentosLegales";
import "../../styles/repartidor/RepartidorShared.css";

export default function DocumentoLegalRepartidor() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const documento = documentosLegales.find((d) => d.slug === slug);

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
        <h1 className="rep-title">{documento?.titulo ?? "Documento"}</h1>
      </section>

      {!documento && (
        <p className="rep-status-text">No encontramos este documento.</p>
      )}

      {documento?.secciones.map((s) => (
        <div key={s.titulo} className="rep-doc-section">
          <h3 className="rep-doc-section-title">{s.titulo}</h3>
          <p className="rep-doc-section-text">{s.texto}</p>
        </div>
      ))}
    </div>
  );
}

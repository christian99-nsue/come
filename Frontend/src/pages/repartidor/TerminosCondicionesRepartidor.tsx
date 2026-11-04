import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Bike,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { documentosLegales } from "../../data/documentosLegales";
import "../../styles/repartidor/RepartidorShared.css";

const iconos: Record<string, typeof FileText> = {
  "terminos-de-uso": FileText,
  "politica-de-privacidad": ShieldCheck,
  "condiciones-repartidores": Bike,
  "uso-de-la-aplicacion": Smartphone,
};

export default function TerminosCondicionesRepartidor() {
  const navigate = useNavigate();

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
        <h1 className="rep-title">Términos y condiciones</h1>
      </section>

      <div className="rep-menu-list">
        {documentosLegales.map((doc) => {
          const Icon = iconos[doc.slug] || FileText;
          return (
            <button
              key={doc.slug}
              type="button"
              className="rep-menu-row"
              onClick={() => navigate(`/repartidor/terminos/${doc.slug}`)}
            >
              <span className="rep-info-icon">
                <Icon size={17} />
              </span>
              <div className="rep-menu-label-col">
                <span className="rep-menu-label">{doc.titulo}</span>
                <span className="rep-menu-sublabel">{doc.subtitulo}</span>
              </div>
              <ChevronRight size={17} color="#9ca3af" />
            </button>
          );
        })}
      </div>

      <div className="rep-terms-banner">
        <ShieldCheck size={18} className="rep-terms-banner-icon" />
        Al utilizar esta aplicación aceptas nuestros términos y condiciones.
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Bike,
  Smartphone,
  ShieldCheck as ShieldIcon,
} from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

const documentos = [
  {
    icon: FileText,
    titulo: "Términos de uso",
    subtitulo: "Lee nuestros términos de uso",
  },
  {
    icon: ShieldCheck,
    titulo: "Política de privacidad",
    subtitulo: "Cómo protegemos tus datos",
  },
  {
    icon: Bike,
    titulo: "Condiciones para repartidores",
    subtitulo: "Normas y responsabilidades",
  },
  {
    icon: Smartphone,
    titulo: "Uso de la aplicación",
    subtitulo: "Información importante",
  },
];

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
        {documentos.map((doc) => {
          const Icon = doc.icon;
          return (
            <button key={doc.titulo} type="button" className="rep-menu-row">
              <span className="rep-info-icon">
                <Icon size={17} />
              </span>
              <div className="rep-menu-label-col">
                <span className="rep-menu-label">{doc.titulo}</span>
                <span className="rep-menu-sublabel">{doc.subtitulo}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rep-terms-banner">
        <ShieldIcon size={18} className="rep-terms-banner-icon" />
        Al utilizar esta aplicación aceptas nuestros términos y condiciones.
      </div>
    </div>
  );
}

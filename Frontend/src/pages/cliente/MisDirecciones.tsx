import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Briefcase,
  Home,
  Users,
  ChevronRight,
} from "lucide-react";
import "../../styles/cliente/MisDirecciones.css";

type IconoDireccion = "principal" | "trabajo" | "casa" | "amigos";

interface Direccion {
  id: string;
  titulo: string;
  icono: IconoDireccion;
  porDefecto?: boolean;
  etiqueta?: string;
  linea1: string;
  linea2: string;
}

const direccionesMock: Direccion[] = [
  {
    id: "1",
    titulo: "Dirección de entrega principal",
    icono: "principal",
    porDefecto: true,
    etiqueta: "Casa",
    linea1: "Calle Mayor 12, Piso 2B",
    linea2: "Malabo, Guinea Ecuatorial",
  },
  {
    id: "2",
    titulo: "Trabajo",
    icono: "trabajo",
    linea1: "Edificio blanco, timbre 2B",
    linea2: "Malabo, Guinea Ecuatorial",
  },
  {
    id: "3",
    titulo: "Casa de mis padres",
    icono: "casa",
    linea1: "Calle Libertad 45",
    linea2: "Malabo, Guinea Ecuatorial",
  },
  {
    id: "4",
    titulo: "Amigos",
    icono: "amigos",
    linea1: "Avenida Central 10",
    linea2: "Malabo, Guinea Ecuatorial",
  },
];

function iconoPara(tipo: IconoDireccion) {
  switch (tipo) {
    case "trabajo":
      return <Briefcase size={18} />;
    case "casa":
      return <Home size={18} />;
    case "amigos":
      return <Users size={18} />;
    default:
      return <MapPin size={18} />;
  }
}

export default function MisDirecciones() {
  const navigate = useNavigate();
  const [direcciones] = useState<Direccion[]>(direccionesMock);

  return (
    <div className="direcciones-page">
      <section className="direcciones-header">
        <button
          type="button"
          className="direcciones-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="direcciones-title">Mis direcciones</h1>
        <button
          type="button"
          className="direcciones-add-btn"
          aria-label="Añadir dirección"
        >
          <Plus size={20} />
        </button>
      </section>

      <div className="direcciones-list">
        {direcciones.map((d) => (
          <button key={d.id} type="button" className="direccion-item">
            <span className="direccion-item-icon">{iconoPara(d.icono)}</span>
            <div className="direccion-item-body">
              <div className="direccion-item-top">
                <span className="direccion-item-title">{d.titulo}</span>
              </div>
              <div className="direccion-item-badges">
                {d.porDefecto && (
                  <span className="direccion-item-badge default">
                    Por defecto
                  </span>
                )}
                {d.etiqueta && (
                  <span className="direccion-item-badge">{d.etiqueta}</span>
                )}
              </div>
              <span className="direccion-item-line">{d.linea1}</span>
              <span className="direccion-item-line">{d.linea2}</span>
            </div>
            <ChevronRight size={18} className="direccion-item-chevron" />
          </button>
        ))}
      </div>

      <button type="button" className="direcciones-add-new-btn">
        <span className="direcciones-add-new-icon">
          <Plus size={18} />
        </span>
        Añadir nueva dirección
      </button>
    </div>
  );
}

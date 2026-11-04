import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon, MonitorSmartphone, Battery } from "lucide-react";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import {
  aplicarPreferencias,
  leerCache,
  cargarPreferencias,
  guardarPreferencias,
  type Tema,
} from "../../utils/preferenciasCliente";
import "../../styles/cliente/TemaAplicacion.css";

const opciones: {
  id: Tema;
  titulo: string;
  detalle: string;
  icon: typeof Sun;
  oscuro: boolean;
}[] = [
  {
    id: "claro",
    titulo: "Claro",
    detalle: "El tema clásico, con fondo claro y textos oscuros.",
    icon: Sun,
    oscuro: false,
  },
  {
    id: "oscuro",
    titulo: "Oscuro",
    detalle: "Reduce la fatiga visual, ideal para la noche.",
    icon: Moon,
    oscuro: true,
  },
  {
    id: "automatico",
    titulo: "Automático",
    detalle: "Se adapta al tema de tu dispositivo.",
    icon: MonitorSmartphone,
    oscuro: true,
  },
];

export default function TemaAplicacion() {
  const navigate = useNavigate();

  const [guardado, setGuardado] = useState<Tema>(leerCache().tema);
  const [tema, setTema] = useState<Tema>(leerCache().tema);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPreferencias()
      .then((p) => {
        setGuardado(p.tema);
        setTema(p.tema);
      })
      .catch(() => {});

    // Si sales sin guardar, la app vuelve al tema que tenías guardado
    return () => aplicarPreferencias(leerCache());
  }, []);

  // Se ve en vivo al elegir, antes de guardar
  const elegir = (nuevo: Tema) => {
    setTema(nuevo);
    aplicarPreferencias({ ...leerCache(), tema: nuevo });
  };

  const guardarCambios = async () => {
    setGuardando(true);
    setError("");
    try {
      await guardarPreferencias({ tema });
      setMostrarExito(true);
    } catch {
      setError("No se pudo guardar el tema");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="tema-page">
      <section className="tema-header">
        <button
          type="button"
          className="tema-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="tema-title">Tema de aplicación</h1>
      </section>

      <div className="tema-list">
        {opciones.map((o) => {
          const Icon = o.icon;
          return (
            <button
              key={o.id}
              type="button"
              className={tema === o.id ? "tema-option active" : "tema-option"}
              onClick={() => elegir(o.id)}
            >
              <span className="tema-option-icon">
                <Icon size={18} />
              </span>
              <div className="tema-option-text">
                <span className="tema-option-title">{o.titulo}</span>
                <span className="tema-option-subtitle">{o.detalle}</span>
                <div
                  className={
                    o.oscuro
                      ? "tema-preview tema-preview-oscuro"
                      : "tema-preview tema-preview-claro"
                  }
                >
                  <span className="tema-preview-dot" />
                  <span className="tema-preview-line" />
                </div>
              </div>
              <span
                className={tema === o.id ? "tema-radio active" : "tema-radio"}
              />
            </button>
          );
        })}
      </div>

      <div className="tema-note">
        <Battery size={16} className="tema-note-icon" />
        El tema oscuro puede ayudar a ahorrar batería en algunos dispositivos.
      </div>

      {error && <p className="tema-note">{error}</p>}

      <button
        type="button"
        className="tema-save-btn"
        onClick={guardarCambios}
        disabled={guardando || tema === guardado}
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>

      <CambiosGuardadosOverlay
        open={mostrarExito}
        onContinuar={() => navigate("/cliente/perfil", { replace: true })}
      />
    </div>
  );
}

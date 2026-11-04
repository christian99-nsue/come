import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Globe,
  Moon,
  Navigation,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  leerCache,
  cargarPreferencias,
  etiquetaIdioma,
  etiquetaTema,
  etiquetaNavegacion,
  type Preferencias,
} from "../../utils/preferenciasRepartidor";
import "../../styles/repartidor/RepartidorShared.css";

export default function ConfiguracionRepartidor() {
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState<Preferencias>(leerCache());
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    cargarPreferencias()
      .then(setPrefs)
      .catch(() => {});
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMostrarConfirmacion(false);
    navigate("/", { replace: true });
  };

  const filas = [
    {
      icon: Settings,
      titulo: "General",
      sub: "Datos personales y disponibilidad",
      ruta: "/repartidor/configuracion/general",
    },
    {
      icon: Globe,
      titulo: "Idioma",
      sub: etiquetaIdioma[prefs.idioma],
      ruta: "/repartidor/configuracion/idioma",
    },
    {
      icon: Moon,
      titulo: "Tema de aplicación",
      sub: etiquetaTema[prefs.tema],
      ruta: "/repartidor/configuracion/tema",
    },
    {
      icon: Navigation,
      titulo: "Navegación externa",
      sub: etiquetaNavegacion[prefs.navegacion_externa],
      ruta: "/repartidor/configuracion/navegacion-externa",
    },
    {
      icon: HelpCircle,
      titulo: "Ayuda y soporte",
      sub: "Preguntas, reportes y contacto",
      ruta: "/repartidor/centro-ayuda",
    },
    {
      icon: FileText,
      titulo: "Términos y condiciones",
      sub: "Políticas y condiciones de uso",
      ruta: "/repartidor/terminos-condiciones",
    },
  ];

  return (
    <div className="rep-page">
      <h1 className="rep-title rep-title-block">Configuración</h1>

      <div className="rep-menu-list">
        {filas.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.titulo}
              type="button"
              className="rep-menu-row"
              onClick={() => navigate(f.ruta)}
            >
              <span className="rep-info-icon">
                <Icon size={17} />
              </span>
              <div className="rep-menu-label-col">
                <span className="rep-menu-label">{f.titulo}</span>
                <span className="rep-menu-sublabel">{f.sub}</span>
              </div>
              <ChevronRight size={17} color="#9ca3af" />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="rep-menu-row rep-logout-row"
        onClick={() => setMostrarConfirmacion(true)}
      >
        <span className="rep-info-icon rep-logout-icon">
          <LogOut size={17} />
        </span>
        <span className="rep-logout-label">Cerrar sesión</span>
        <ChevronRight size={17} color="#dc2626" />
      </button>

      <ConfirmModal
        open={mostrarConfirmacion}
        title="¿Cerrar sesión?"
        message="Tendrás que volver a iniciar sesión con tu número de teléfono y contraseña para acceder de nuevo."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        danger
        onConfirm={cerrarSesion}
        onCancel={() => setMostrarConfirmacion(false)}
      />
    </div>
  );
}

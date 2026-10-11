import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, KeyRound, FileText, LogOut, ChevronRight } from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Perfil {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string;
  foto_perfil: string | null;
  vehiculo_tipo: "moto" | "bicicleta" | "coche" | null;
  matricula: string | null;
  disponible: boolean;
}

export default function MiPerfilRepartidor() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/repartidor/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPerfil(res.data))
      .catch(() => setError("No se pudo cargar tu perfil"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMostrarConfirmacion(false);
    navigate("/", { replace: true });
  };

  if (cargando) {
    return (
      <div className="rep-page">
        <p className="rep-status-text">Cargando perfil...</p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="rep-page">
        <p className="rep-status-text rep-status-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="rep-page">
      <h1 className="rep-title rep-title-block">Mi perfil</h1>

      <button
        type="button"
        className="rep-card rep-card-green rep-profile-card rep-account-top-card"
        onClick={() => navigate("/repartidor/editar-perfil")}
      >
        {perfil.foto_perfil ? (
          <img
            src={perfil.foto_perfil}
            alt={perfil.nombre}
            className="rep-profile-avatar"
          />
        ) : (
          <div className="rep-profile-avatar-fallback">
            {perfil.nombre.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="rep-account-top-text">
          <div className="rep-profile-name">{perfil.nombre}</div>
          <div className="rep-profile-role">Repartidor</div>
          <span
            className={
              perfil.disponible
                ? "rep-badge rep-badge-green rep-status-badge"
                : "rep-badge rep-badge-gray rep-status-badge"
            }
          >
            ● {perfil.disponible ? "Disponible" : "No disponible"}
          </span>
        </div>
        <ChevronRight size={18} color="#9ca3af" />
      </button>

      <div className="rep-menu-list">
        <button
          type="button"
          className="rep-menu-row"
          onClick={() => navigate("/repartidor/info-cuenta")}
        >
          <span className="rep-info-icon">
            <FileText size={17} />
          </span>
          <span className="rep-menu-label">Información de la cuenta</span>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
        <button
          type="button"
          className="rep-menu-row"
          onClick={() => navigate("/repartidor/editar-perfil")}
        >
          <span className="rep-info-icon">
            <User size={17} />
          </span>
          <span className="rep-menu-label">Editar perfil</span>
          <ChevronRight size={17} color="#9ca3af" />
        </button>

        <button
          type="button"
          className="rep-menu-row"
          onClick={() => navigate("/repartidor/cambiar-contrasena")}
        >
          <span className="rep-info-icon">
            <KeyRound size={17} />
          </span>
          <span className="rep-menu-label">Cambiar contraseña</span>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
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

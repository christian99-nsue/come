import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import {
  Phone,
  Mail,
  Bike,
  ShieldCheck,
  User,
  KeyRound,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import "../../styles/repartidor/RepartidorShared.css";
import avatar from "../../assets/pilar.jpg";

const repartidorMock = {
  nombre: "Carlos Martínez",
  rol: "Repartidor",
  avatar: avatar,
  telefono: "+240 555 123 456",
  correo: "carlos@gmail.com",
  vehiculo: "Moto · HM-1234",
  disponible: true,
};

export default function MiPerfilRepartidor() {
  const navigate = useNavigate();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const r = repartidorMock;
  const user = getUser();

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMostrarConfirmacion(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="rep-page">
      <h1 className="rep-title" style={{ marginBottom: 18 }}>
        Mi perfil
      </h1>

      <div className="rep-card rep-card-green rep-profile-card">
        <img src={r.avatar} alt={r.nombre} className="rep-profile-avatar" />
        <div>
          <div className="rep-profile-name">{user.nombre}</div>
          <div className="rep-profile-role">{user.rol}</div>
        </div>
      </div>
      <div className="rep-info-row">
        <span className="rep-info-icon">
          <Phone size={17} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Teléfono</span>
          <span className="rep-info-value">{user.telefono}</span>
        </div>
      </div>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <Mail size={17} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Correo</span>
          <span className="rep-info-value">{user.correo}</span>
        </div>
      </div>

      <div className="rep-info-row">
        <span className="rep-info-icon">
          <Bike size={17} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Vehículo</span>
          <span className="rep-info-value">{r.vehiculo}</span>
        </div>
      </div>

      <div className="rep-info-row rep-info-row-last">
        <span className="rep-info-icon">
          <ShieldCheck size={17} />
        </span>
        <div className="rep-info-text">
          <span className="rep-info-label">Estado</span>
          <span className="rep-badge rep-badge-green rep-status-badge">
            ✓ {r.disponible ? "Disponible" : "No disponible"}
          </span>
        </div>
      </div>

      <div className="rep-menu-list">
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

import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, KeyRound, ChevronRight } from "lucide-react";
import "../../styles/admin/AdminShared.css";

export default function CuentaAdmin() {
  const navigate = useNavigate();

  return (
    <div className="admin-page">
      <section className="admin-header">
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="admin-title">Cuenta</h1>
      </section>

      <div className="admin-menu-list">
        <button
          type="button"
          className="admin-menu-row"
          onClick={() => navigate("/admin/configuracion/cuenta/editar-perfil")}
        >
          <span className="admin-icon-box">
            <User size={17} />
          </span>
          <div className="admin-menu-label-col">
            <span className="admin-menu-label">Editar perfil</span>
            <span className="admin-menu-sublabel">
              Nombre, correo y teléfono
            </span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>

        <button
          type="button"
          className="admin-menu-row"
          onClick={() =>
            navigate("/admin/configuracion/cuenta/cambiar-contrasena")
          }
        >
          <span className="admin-icon-box">
            <KeyRound size={17} />
          </span>
          <div className="admin-menu-label-col">
            <span className="admin-menu-label">Cambiar contraseña</span>
            <span className="admin-menu-sublabel">
              Actualiza tu contraseña de acceso
            </span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>
      </div>
    </div>
  );
}

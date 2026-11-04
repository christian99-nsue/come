import { Check } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import RegistroLayout from "../../components/common/RegistroLayout";

export default function RegistroCompletado() {
  const navigate = useNavigate();
  const rol = (useLocation().state as { rol?: string } | null)?.rol;

  const texto =
    rol === "repartidor"
      ? "Tu cuenta de repartidor ha sido creada correctamente. Ya puedes iniciar sesión y empezar a recibir pedidos."
      : rol === "administrador"
        ? "Tu cuenta y tu restaurante han sido creados correctamente. Inicia sesión para configurar tu menú y abrir tu restaurante."
        : "Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión y disfrutar de todos los beneficios.";

  return (
    <RegistroLayout>
      <div className="reg-estado">
        <div className="reg-estado-icono">
          <Check size={52} />
        </div>
        <h1 className="reg-estado-titulo">¡Registro completado!</h1>
        <p className="reg-estado-texto">{texto}</p>
      </div>

      <div className="reg-acciones">
        <button type="button" className="reg-btn" onClick={() => navigate("/")}>
          Ir al inicio
        </button>
      </div>
    </RegistroLayout>
  );
}

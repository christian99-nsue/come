import { Bike, Store, KeyRound, Send } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import RegistroLayout from "../../components/common/RegistroLayout";
import { nombreRol, rolDeUrl } from "../../utils/registro";

export default function TieneCodigo() {
  const navigate = useNavigate();
  const rol = rolDeUrl(useParams().rol);

  if (!rol) return <Navigate to="/crear-cuenta" replace />;

  return (
    <RegistroLayout
      titulo={
        rol === "repartidor"
          ? "Cuenta de repartidor"
          : "Cuenta de administrador"
      }
      atras="/crear-cuenta"
      icono={rol === "repartidor" ? <Bike size={30} /> : <Store size={30} />}
      color={rol === "repartidor" ? "naranja" : "azul"}
      subtitulo={`Las cuentas de ${nombreRol[rol]} necesitan una invitación del equipo.`}
    >
      <h2
        className="reg-titulo-grande"
        style={{ fontSize: 20, textAlign: "center" }}
      >
        ¿Tienes un código de invitación?
      </h2>
      <p className="reg-texto" style={{ textAlign: "center" }}>
        Si ya te dieron uno, podrás crear tu cuenta ahora mismo. Si no, puedes
        pedir acceso y el equipo revisará tu solicitud.
      </p>

      <div className="reg-opciones">
        <button
          type="button"
          className="reg-opcion"
          onClick={() => navigate(`/crear-cuenta/${rol}/codigo`)}
        >
          <span className="reg-opcion-icono verde">
            <KeyRound size={22} />
          </span>
          <span className="reg-opcion-texto">
            <span className="reg-opcion-titulo">Sí, tengo un código</span>
            <span className="reg-opcion-desc">
              Crea tu cuenta y empieza a usarla enseguida.
            </span>
          </span>
        </button>

        <button
          type="button"
          className="reg-opcion"
          onClick={() => navigate(`/crear-cuenta/${rol}/solicitud`)}
        >
          <span className="reg-opcion-icono naranja">
            <Send size={22} />
          </span>
          <span className="reg-opcion-texto">
            <span className="reg-opcion-titulo">No, solicitar acceso</span>
            <span className="reg-opcion-desc">
              El equipo revisará tu solicitud y te responderá.
            </span>
          </span>
        </button>
      </div>

      <p className="reg-pie">
        ¿Ya enviaste una solicitud?{" "}
        <button
          type="button"
          className="reg-enlace"
          onClick={() => navigate("/consultar-solicitud")}
        >
          Consulta cómo va
        </button>
      </p>
    </RegistroLayout>
  );
}

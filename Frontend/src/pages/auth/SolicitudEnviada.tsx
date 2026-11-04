import { useState } from "react";
import { Info, Send } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import RegistroLayout from "../../components/common/RegistroLayout";
import {
  leerSolicitudGuardada,
  rolDeUrl,
  type SolicitudGuardada,
} from "../../utils/registro";

export default function SolicitudEnviada() {
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(false);

  const estado = useLocation().state as Partial<SolicitudGuardada> | null;
  const datos: Partial<SolicitudGuardada> | null =
    estado?.seguimiento && rolDeUrl(estado.rol)
      ? estado
      : leerSolicitudGuardada();

  // Sin datos de una solicitud (por ejemplo, entrando directo a esta dirección), no hay nada que enseñar
  if (!datos || !datos.seguimiento || !rolDeUrl(datos.rol))
    return <Navigate to="/crear-cuenta" replace />;

  const esRepartidor = datos.rol === "repartidor";

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(datos.seguimiento!);
      setCopiado(true);
    } catch {
      /* si el navegador no deja copiar, la persona puede anotarlo: está en pantalla */
    }
  };

  return (
    <RegistroLayout>
      <div className="reg-estado">
        <div className="reg-estado-icono">
          <Send size={44} />
        </div>
        <h1 className="reg-estado-titulo">Solicitud enviada</h1>
        <p className="reg-estado-texto">
          {esRepartidor
            ? "Tu solicitud de acceso como repartidor ha sido enviada al equipo."
            : "Tu solicitud para registrar un nuevo restaurante ha sido enviada al equipo."}
        </p>

        <div className="reg-seguimiento">
          <span className="reg-seguimiento-texto">
            <span className="reg-seguimiento-etiqueta">
              Tu código de seguimiento
            </span>
            <code>{datos.seguimiento}</code>
          </span>
          <button type="button" className="reg-copiar" onClick={copiar}>
            {copiado ? "Copiado" : "Copiar"}
          </button>
        </div>

        <div className="reg-aviso">
          <Info size={18} />
          <span>
            Guarda este código: junto con tu teléfono te permite consultar cómo
            va tu solicitud (también lo hemos guardado en este dispositivo).{" "}
            {esRepartidor
              ? "Si la aprobamos, te enviaremos un enlace personal al teléfono que indicaste para crear tu contraseña. Este proceso puede tardar un poco."
              : "Revisaremos los datos del restaurante y te avisaremos al teléfono que indicaste cuando se apruebe o se rechace la solicitud."}
          </span>
        </div>
      </div>

      <div className="reg-acciones">
        <button
          type="button"
          className="reg-btn"
          onClick={() => navigate("/consultar-solicitud")}
        >
          Consultar mi solicitud
        </button>
        <button
          type="button"
          className="reg-btn secundario"
          onClick={() => navigate("/")}
        >
          Volver al inicio
        </button>
      </div>
    </RegistroLayout>
  );
}

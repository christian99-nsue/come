import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Clock,
  Hash,
  Info,
  Phone,
  Search,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RegistroLayout from "../../components/common/RegistroLayout";
import { Campo } from "../../components/common/Campo";
import {
  errorDeApi,
  leerSolicitudGuardada,
  rolDesdeApi,
  telefonoValido,
} from "../../utils/registro";

const API_URL = import.meta.env.VITE_API_URL;

const ESTADOS = ["pendiente", "aprobada", "completada", "rechazada"];

interface Resultado {
  rol: "repartidor" | "admin";
  estado: "pendiente" | "aprobada" | "completada" | "rechazada";
  enlace_caducado: boolean;
  motivo_rechazo: string | null;
}

export default function ConsultarSolicitud() {
  const navigate = useNavigate();
  const guardada = leerSolicitudGuardada();
  const telefonoGuardado = guardada?.telefono ?? null;
  const seguimientoGuardado = guardada?.seguimiento ?? null;

  const [telefono, setTelefono] = useState(guardada?.telefono ?? "");
  const [seguimiento, setSeguimiento] = useState(guardada?.seguimiento ?? "");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const consultar = useCallback(async (tel: string, seg: string) => {
    setError("");

    if (!telefonoValido(tel))
      return setError("Escribe el teléfono con el que enviaste la solicitud");
    if (seg.replace(/[^A-Za-z0-9]/g, "").length !== 8)
      return setError(
        "El código de seguimiento tiene 8 caracteres (por ejemplo, K7M2-9QXP)",
      );

    setCargando(true);
    try {
      const res = await axios.post(`${API_URL}/api/registro/solicitud/estado`, {
        telefono: tel,
        seguimiento: seg,
      });

      // Si el servidor contesta algo que no es un estado conocido, se avisa en vez de romper la pantalla
      if (!res.data || !ESTADOS.includes(res.data.estado)) {
        setResultado(null);
        setError(
          "No se pudo leer la respuesta del servidor. Inténtalo de nuevo en un momento.",
        );
        return;
      }
      setResultado(res.data);
    } catch (err) {
      setResultado(null);
      setError(errorDeApi(err).mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  // Si la solicitud se envió desde este dispositivo, se consulta sola
  useEffect(() => {
    if (!telefonoGuardado || !seguimientoGuardado) return;

    void Promise.resolve().then(() => {
      consultar(telefonoGuardado, seguimientoGuardado);
    });
  }, [consultar, telefonoGuardado, seguimientoGuardado]);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    consultar(telefono, seguimiento);
  };

  if (resultado) {
    const rolUrl = rolDesdeApi(resultado.rol);

    const vista = {
      pendiente: {
        icono: <Clock size={44} />,
        clase: "",
        titulo: "Solicitud pendiente de aprobación",
        texto:
          "Tu solicitud está en revisión por parte del equipo. Este proceso puede tardar un poco.",
        aviso:
          "Cuando se resuelva te avisaremos al teléfono que indicaste. También puedes volver aquí para ver cómo va.",
        avisoClase: "",
      },
      aprobada: {
        icono: <CheckCircle2 size={44} />,
        clase: "",
        titulo: "¡Solicitud aprobada!",
        texto:
          "El equipo te enviará (o ya te envió) un enlace personal al teléfono que indicaste. Ábrelo para completar tu registro y crear tu contraseña.",
        aviso: resultado.enlace_caducado
          ? "El enlace que te enviamos ya caducó. Pide uno nuevo al equipo."
          : "El enlace es personal y tiene una validez limitada: complétalo cuanto antes.",
        avisoClase: resultado.enlace_caducado ? "ambar" : "",
      },
      completada: {
        icono: <CheckCircle2 size={44} />,
        clase: "",
        titulo: "Tu cuenta ya está creada",
        texto: "Ya puedes iniciar sesión con tu teléfono y tu contraseña.",
        aviso: "",
        avisoClase: "",
      },
      rechazada: {
        icono: <XCircle size={44} />,
        clase: "rojo",
        titulo: "Solicitud rechazada",
        texto: "El equipo no ha podido aprobar tu solicitud.",
        aviso: resultado.motivo_rechazo
          ? `Motivo: ${resultado.motivo_rechazo}`
          : "",
        avisoClase: "rojo",
      },
    }[resultado.estado];

    return (
      <RegistroLayout>
        <div className="reg-estado">
          <div
            className={`reg-estado-icono ${resultado.estado === "pendiente" ? "ambar" : vista.clase}`}
          >
            {vista.icono}
          </div>
          <h1 className="reg-estado-titulo">{vista.titulo}</h1>
          <p className="reg-estado-texto">{vista.texto}</p>
          {vista.aviso && (
            <div className={`reg-aviso ${vista.avisoClase}`}>
              <Info size={18} />
              <span>{vista.aviso}</span>
            </div>
          )}
        </div>

        <div className="reg-acciones">
          {resultado.estado === "completada" && (
            <button
              type="button"
              className="reg-btn"
              onClick={() => navigate("/")}
            >
              Iniciar sesión
            </button>
          )}
          {resultado.estado === "rechazada" && (
            <button
              type="button"
              className="reg-btn"
              onClick={() => navigate(`/crear-cuenta/${rolUrl}/solicitud`)}
            >
              Enviar una nueva solicitud
            </button>
          )}
          {(resultado.estado === "pendiente" ||
            resultado.estado === "aprobada") && (
            <button
              type="button"
              className="reg-btn"
              onClick={() => consultar(telefono, seguimiento)}
              disabled={cargando}
            >
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
          )}
          {resultado.estado !== "completada" && (
            <button
              type="button"
              className="reg-btn secundario"
              onClick={() => navigate("/")}
            >
              Volver al inicio
            </button>
          )}
        </div>
      </RegistroLayout>
    );
  }

  return (
    <RegistroLayout
      titulo="Consultar mi solicitud"
      atras="/crear-cuenta"
      icono={<Search size={30} />}
      subtitulo="Escribe el teléfono con el que enviaste tu solicitud y el código de seguimiento que te dimos al enviarla."
    >
      {cargando && !error ? (
        <p className="reg-texto" style={{ textAlign: "center" }}>
          Consultando tu solicitud...
        </p>
      ) : (
        <form className="reg-form" onSubmit={enviar} noValidate>
          <Campo
            icono={<Phone size={16} />}
            etiqueta="Teléfono móvil"
            obligatorio
            tipo="tel"
            valor={telefono}
            onCambio={setTelefono}
            placeholder="+240 222 123 456"
            autoComplete="tel"
          />
          <Campo
            icono={<Hash size={16} />}
            etiqueta="Código de seguimiento"
            obligatorio
            valor={seguimiento}
            onCambio={setSeguimiento}
            placeholder="XXXX-XXXX"
            maxLength={12}
          />

          {error && <p className="reg-error">{error}</p>}

          <button type="submit" className="reg-btn" disabled={cargando}>
            Consultar
          </button>
        </form>
      )}

      <p className="reg-pie">
        <button
          type="button"
          className="reg-enlace"
          onClick={() => navigate("/")}
        >
          Volver al inicio
        </button>
      </p>
    </RegistroLayout>
  );
}

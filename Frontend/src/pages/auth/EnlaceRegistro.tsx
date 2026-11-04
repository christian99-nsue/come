import { useEffect, useState } from "react";
import {
  Check,
  Lock,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
  Bike,
  MailCheck,
  LinkIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import RegistroLayout from "../../components/common/RegistroLayout";
import { Campo, CampoSelect } from "../../components/common/Campo";
import { emailValido, errorDeApi, passwordValida } from "../../utils/registro";

const API_URL = import.meta.env.VITE_API_URL;
const VEHICULOS = ["Bicicleta", "Moto", "Coche", "A pie"];
const PASOS = ["Datos", "Contraseña", "Finalizar"];

interface Info {
  rol: "repartidor" | "admin";
  nombre: string;
  telefono: string; // viene tapado: ***456
  email: string | null;
  tipo_vehiculo: string | null;
  nombre_restaurante: string | null;
  direccion_restaurante: string | null;
}

export default function EnlaceRegistro() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [info, setInfo] = useState<Info | null>(null);
  const [errorEnlace, setErrorEnlace] = useState("");
  const [paso, setPaso] = useState(0); // 0 = bienvenida; 1, 2, 3 = pasos
  const [v, setV] = useState({
    nombre: "",
    email: "",
    tipo_vehiculo: "",
    nombre_restaurante: "",
    direccion_restaurante: "",
    password: "",
    confirmar: "",
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/registro/enlace/${token}`)
      .then((res) => {
        const d: Info = res.data;
        setInfo(d);
        setV((a) => ({
          ...a,
          nombre: d.nombre,
          email: d.email ?? "",
          tipo_vehiculo: d.tipo_vehiculo ?? "",
          nombre_restaurante: d.nombre_restaurante ?? "",
          direccion_restaurante: d.direccion_restaurante ?? "",
        }));
      })
      .catch((err) => setErrorEnlace(errorDeApi(err).mensaje));
  }, [token]);

  const cambiar = (campo: keyof typeof v) => (valor: string) => {
    setV((a) => ({ ...a, [campo]: valor }));
    setErrores((a) => ({ ...a, [campo]: "" }));
  };

  // ---------- Enlace que no sirve ----------
  if (errorEnlace) {
    return (
      <RegistroLayout>
        <div className="reg-estado">
          <div className="reg-estado-icono rojo">
            <LinkIcon size={44} />
          </div>
          <h1 className="reg-estado-titulo">Enlace no válido</h1>
          <p className="reg-estado-texto">{errorEnlace}</p>
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

  if (!info) {
    return (
      <RegistroLayout>
        <p className="reg-texto" style={{ textAlign: "center", marginTop: 40 }}>
          Comprobando tu enlace...
        </p>
      </RegistroLayout>
    );
  }

  const esAdmin = info.rol === "admin";

  // ---------- Paso 0: bienvenida (pantalla 7) ----------
  if (paso === 0) {
    return (
      <RegistroLayout>
        <div className="reg-estado">
          <div className="reg-estado-icono">
            <MailCheck size={48} />
          </div>
          <h1 className="reg-estado-titulo">Enlace de aprobación</h1>
          <p className="reg-estado-texto">
            Hola, {info.nombre}. Tu solicitud fue aprobada y has recibido un
            enlace para completar tu registro.
          </p>
          <p className="reg-estado-texto">
            Completa el formulario para establecer tu contraseña y activar tu
            cuenta.
          </p>
        </div>
        <div className="reg-acciones">
          <button type="button" className="reg-btn" onClick={() => setPaso(1)}>
            Completar registro
          </button>
          <p className="reg-pie" style={{ margin: 0 }}>
            Este enlace es personal y tiene una validez limitada.
          </p>
        </div>
      </RegistroLayout>
    );
  }

  const validarPaso = (n: number) => {
    const e: Record<string, string> = {};
    if (n === 1) {
      if (v.nombre.trim().length < 2) e.nombre = "Escribe tu nombre completo";
      if (!emailValido(v.email)) e.email = "El correo no es válido";
      if (esAdmin) {
        if (v.nombre_restaurante.trim().length < 2)
          e.nombre_restaurante = "Escribe el nombre del restaurante";
        if (v.direccion_restaurante.trim().length < 5)
          e.direccion_restaurante = "Escribe la dirección del restaurante";
      }
    }
    if (n === 2) {
      if (!passwordValida(v.password))
        e.password = "La contraseña debe tener al menos 8 caracteres";
      else if (v.password !== v.confirmar)
        e.confirmar = "Las contraseñas no coinciden";
    }
    setErrores(e);
    return !Object.values(e).some(Boolean);
  };

  const siguiente = () => {
    if (validarPaso(paso)) setPaso(paso + 1);
  };

  const crear = async () => {
    setGeneral("");
    setEnviando(true);
    try {
      await axios.post(`${API_URL}/api/registro/enlace/${token}/completar`, {
        nombre: v.nombre.trim(),
        email: v.email.trim(),
        tipo_vehiculo: v.tipo_vehiculo,
        nombre_restaurante: v.nombre_restaurante.trim(),
        direccion_restaurante: v.direccion_restaurante.trim(),
        password: v.password,
      });
      navigate("/registro-completado", {
        replace: true,
        state: { rol: esAdmin ? "administrador" : "repartidor" },
      });
    } catch (err) {
      const { mensaje, campo, estado } = errorDeApi(err);
      if (estado === 404) return setErrorEnlace(mensaje); // el enlace caducó o ya se usó mientras tanto
      if (campo === "password") {
        setErrores({ password: mensaje });
        setPaso(2);
      } else if (campo && campo in v) {
        setErrores({ [campo]: mensaje });
        setPaso(1);
      } else {
        setGeneral(mensaje);
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <RegistroLayout
      titulo="Completa tu registro"
      atras={() => (paso === 1 ? setPaso(0) : setPaso(paso - 1))}
    >
      <div className="reg-pasos">
        <div className="reg-linea-pasos" />
        {PASOS.map((nombre, i) => (
          <div
            key={nombre}
            className={`reg-paso${paso === i + 1 ? " actual" : paso > i + 1 ? " hecho" : ""}`}
          >
            <span className="reg-paso-num">
              {paso > i + 1 ? <Check size={14} /> : i + 1}
            </span>
            <span className="reg-paso-nombre">{nombre}</span>
          </div>
        ))}
      </div>

      {paso === 1 && (
        <div className="reg-form">
          <h2 className="reg-titulo-grande" style={{ fontSize: 18 }}>
            Confirma tus datos
          </h2>
          <p className="reg-leido">
            Tu teléfono ({info.telefono}) es el que aprobó el equipo y no se
            puede cambiar.
          </p>
          <Campo
            icono={<User size={16} />}
            etiqueta="Nombre completo"
            obligatorio
            valor={v.nombre}
            onCambio={cambiar("nombre")}
            error={errores.nombre}
            maxLength={120}
            autoComplete="name"
          />
          <Campo
            icono={<Mail size={16} />}
            etiqueta="Correo electrónico"
            tipo="email"
            valor={v.email}
            onCambio={cambiar("email")}
            error={errores.email}
            autoComplete="email"
          />
          {esAdmin ? (
            <>
              <Campo
                icono={<Store size={16} />}
                etiqueta="Nombre del restaurante"
                obligatorio
                valor={v.nombre_restaurante}
                onCambio={cambiar("nombre_restaurante")}
                error={errores.nombre_restaurante}
                maxLength={150}
              />
              <Campo
                icono={<MapPin size={16} />}
                etiqueta="Dirección del restaurante"
                obligatorio
                valor={v.direccion_restaurante}
                onCambio={cambiar("direccion_restaurante")}
                error={errores.direccion_restaurante}
                maxLength={255}
              />
            </>
          ) : (
            <CampoSelect
              icono={<Bike size={16} />}
              etiqueta="Tipo de vehículo"
              valor={v.tipo_vehiculo}
              onCambio={cambiar("tipo_vehiculo")}
              opciones={VEHICULOS}
            />
          )}
          <button type="button" className="reg-btn" onClick={siguiente}>
            Continuar
          </button>
        </div>
      )}

      {paso === 2 && (
        <div className="reg-form">
          <h2 className="reg-titulo-grande" style={{ fontSize: 18 }}>
            Establece tu contraseña
          </h2>
          <p className="reg-leido">
            Crea una contraseña segura para tu cuenta.
          </p>
          <Campo
            icono={<Lock size={16} />}
            etiqueta="Contraseña"
            obligatorio
            tipo="password"
            valor={v.password}
            onCambio={cambiar("password")}
            error={errores.password}
            placeholder="Mín. 8 caracteres"
            autoComplete="new-password"
          />
          <Campo
            icono={<Lock size={16} />}
            etiqueta="Confirmar contraseña"
            obligatorio
            tipo="password"
            valor={v.confirmar}
            onCambio={cambiar("confirmar")}
            error={errores.confirmar}
            placeholder="Repite la contraseña"
            autoComplete="new-password"
          />
          <button type="button" className="reg-btn" onClick={siguiente}>
            Continuar
          </button>
        </div>
      )}

      {paso === 3 && (
        <div className="reg-form">
          <h2 className="reg-titulo-grande" style={{ fontSize: 18 }}>
            Todo listo
          </h2>
          <p className="reg-leido">Revisa tus datos y crea tu cuenta.</p>
          <div className="reg-resumen">
            <div className="reg-resumen-fila">
              <span>Nombre</span>
              <span>{v.nombre}</span>
            </div>
            <div className="reg-resumen-fila">
              <span>
                <Phone size={12} /> Teléfono
              </span>
              <span>{info.telefono}</span>
            </div>
            <div className="reg-resumen-fila">
              <span>Correo</span>
              <span>{v.email || "—"}</span>
            </div>
            {esAdmin ? (
              <>
                <div className="reg-resumen-fila">
                  <span>Restaurante</span>
                  <span>{v.nombre_restaurante}</span>
                </div>
                <div className="reg-resumen-fila">
                  <span>Dirección</span>
                  <span>{v.direccion_restaurante}</span>
                </div>
              </>
            ) : (
              <div className="reg-resumen-fila">
                <span>Vehículo</span>
                <span>{v.tipo_vehiculo || "—"}</span>
              </div>
            )}
          </div>
          {general && <p className="reg-error">{general}</p>}
          {Object.values(errores).some(Boolean) && (
            <p className="reg-error">{Object.values(errores).find(Boolean)}</p>
          )}
          <button
            type="button"
            className="reg-btn"
            onClick={crear}
            disabled={enviando}
          >
            {enviando ? "Creando tu cuenta..." : "Crear mi cuenta"}
          </button>
        </div>
      )}
    </RegistroLayout>
  );
}

import { useState, type FormEvent, type ReactNode } from "react";
import {
  Bike,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
  Briefcase,
  MessageCircle,
} from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import RegistroLayout from "../../components/common/RegistroLayout";
import { Campo, CampoSelect } from "../../components/common/Campo";
import {
  emailValido,
  errorDeApi,
  guardarSolicitud,
  nombreRol,
  passwordValida,
  rolApi,
  rolDeUrl,
  telefonoValido,
} from "../../utils/registro";

const API_URL = import.meta.env.VITE_API_URL;

export type ModoRegistro = "cliente" | "codigo" | "solicitud";

interface Definicion {
  nombre: string;
  etiqueta: string;
  icono: ReactNode;
  obligatorio?: boolean;
  tipo?: "text" | "tel" | "email" | "password";
  placeholder?: string;
  opciones?: string[];
  autoComplete?: string;
  maxLength?: number;
}

const VEHICULOS = ["Bicicleta", "Moto", "Coche", "A pie"];
const CONTACTOS = ["Llamada", "Whatsapp", "Mensaje"];

export default function RegistroFormulario({ modo }: { modo: ModoRegistro }) {
  const navigate = useNavigate();
  const rolParam = useParams().rol;
  const rol = modo === "cliente" ? null : rolDeUrl(rolParam);

  const [valores, setValores] = useState<Record<string, string>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (modo !== "cliente" && !rol)
    return <Navigate to="/crear-cuenta" replace />;

  const cambiar = (nombre: string) => (v: string) => {
    setValores((a) => ({ ...a, [nombre]: v }));
    setErrores((a) => ({ ...a, [nombre]: "" }));
  };

  const nombre: Definicion = {
    nombre: "nombre",
    etiqueta: "Nombre completo",
    icono: <User size={16} />,
    obligatorio: true,
    placeholder: "Ej. Ana García López",
    autoComplete: "name",
    maxLength: 120,
  };
  const telefono: Definicion = {
    nombre: "telefono",
    etiqueta: "Teléfono móvil",
    icono: <Phone size={16} />,
    obligatorio: true,
    tipo: "tel",
    placeholder: "+240 222 123 456",
    autoComplete: "tel",
  };
  const correo: Definicion = {
    nombre: "email",
    etiqueta: "Correo electrónico",
    icono: <Mail size={16} />,
    tipo: "email",
    placeholder: "ejemplo@correo.com",
    autoComplete: "email",
  };
  const clave: Definicion = {
    nombre: "password",
    etiqueta: "Contraseña",
    icono: <Lock size={16} />,
    obligatorio: true,
    tipo: "password",
    placeholder: "Mín. 8 caracteres",
    autoComplete: "new-password",
  };
  const repetir: Definicion = {
    nombre: "confirmar",
    etiqueta: "Confirmar contraseña",
    icono: <Lock size={16} />,
    obligatorio: true,
    tipo: "password",
    placeholder: "Repite la contraseña",
    autoComplete: "new-password",
  };
  const codigo: Definicion = {
    nombre: "codigo",
    etiqueta: "Código de invitación",
    icono: <KeyRound size={16} />,
    obligatorio: true,
    placeholder: "XXXX-XXXX-XXXX",
    maxLength: 20,
  };
  const vehiculo: Definicion = {
    nombre: "tipo_vehiculo",
    etiqueta: "Tipo de vehículo",
    icono: <Bike size={16} />,
    opciones: VEHICULOS,
  };
  const restaurante: Definicion = {
    nombre: "nombre_restaurante",
    etiqueta: "Nombre del restaurante",
    icono: <Store size={16} />,
    obligatorio: true,
    placeholder: "Ej. La Esquina del Sabor",
    maxLength: 150,
  };
  const direccion: Definicion = {
    nombre: "direccion_restaurante",
    etiqueta: "Dirección del restaurante",
    icono: <MapPin size={16} />,
    obligatorio: true,
    placeholder: "Ej. Calle Mayor 123",
    maxLength: 255,
  };
  const trabajo: Definicion = {
    nombre: "lugar_trabajo",
    etiqueta: "Lugar de trabajo",
    icono: <Briefcase size={16} />,
    placeholder: "Ej. Empresa, edificio, planta",
    maxLength: 150,
  };
  const contacto: Definicion = {
    nombre: "tipo_contacto",
    etiqueta: "Tipo de contacto preferido",
    icono: <MessageCircle size={16} />,
    opciones: CONTACTOS,
  };

  const delRol = rol === "repartidor" ? [vehiculo] : [restaurante, direccion];
  const principales: Definicion[] =
    modo === "cliente"
      ? [nombre, telefono, correo, clave, repetir]
      : modo === "codigo"
        ? [codigo, nombre, telefono, correo, clave, repetir, ...delRol]
        : [nombre, telefono, correo, ...delRol];
  const opcionales: Definicion[] =
    modo === "cliente" ? [trabajo, contacto] : [];

  const validar = () => {
    const e: Record<string, string> = {};
    for (const d of [...principales, ...opcionales]) {
      const v = (valores[d.nombre] ?? "").trim();
      if (d.obligatorio && !v && d.tipo !== "password")
        e[d.nombre] = "Este dato es obligatorio";
    }
    if (valores.telefono && !telefonoValido(valores.telefono))
      e.telefono =
        "Escribe un teléfono válido (solo números, con el prefijo del país si lo tienes)";
    if (valores.email && !emailValido(valores.email))
      e.email = "El correo no es válido";
    if (principales.some((d) => d.nombre === "password")) {
      if (!passwordValida(valores.password ?? ""))
        e.password = "La contraseña debe tener al menos 8 caracteres";
      else if (valores.password !== valores.confirmar)
        e.confirmar = "Las contraseñas no coinciden";
    }
    return e;
  };

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    setGeneral("");

    const e = validar();
    setErrores(e);
    if (Object.values(e).some(Boolean)) return;

    // Solo se envía lo que se ha escrito; la confirmación de la contraseña nunca sale del teléfono
    const cuerpo: Record<string, string> = {};
    for (const d of [...principales, ...opcionales]) {
      const v =
        d.tipo === "password"
          ? (valores[d.nombre] ?? "")
          : (valores[d.nombre] ?? "").trim();
      if (v && d.nombre !== "confirmar") cuerpo[d.nombre] = v;
    }

    const ruta =
      modo === "cliente"
        ? "cliente"
        : modo === "codigo"
          ? "con-codigo"
          : "solicitud";
    if (rol) cuerpo.rol = rolApi(rol);

    setEnviando(true);
    try {
      const res = await axios.post(`${API_URL}/api/registro/${ruta}`, cuerpo);

      if (modo === "solicitud" && rol) {
        guardarSolicitud({
          telefono: cuerpo.telefono,
          seguimiento: res.data.seguimiento,
          rol,
        });
        navigate("/solicitud-enviada", {
          replace: true,
          state: {
            telefono: cuerpo.telefono,
            seguimiento: res.data.seguimiento,
            rol,
          },
        });
      } else {
        navigate("/registro-completado", {
          replace: true,
          state: { rol: rol ?? "cliente" },
        });
      }
    } catch (err) {
      const { mensaje, campo } = errorDeApi(err);
      const conocido =
        campo &&
        [...principales, ...opcionales].some((d) => d.nombre === campo);
      if (conocido) setErrores((a) => ({ ...a, [campo as string]: mensaje }));
      else setGeneral(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  const pintar = (d: Definicion) =>
    d.opciones ? (
      <CampoSelect
        key={d.nombre}
        icono={d.icono}
        etiqueta={d.etiqueta}
        obligatorio={d.obligatorio}
        valor={valores[d.nombre] ?? ""}
        onCambio={cambiar(d.nombre)}
        opciones={d.opciones}
        error={errores[d.nombre]}
      />
    ) : (
      <Campo
        key={d.nombre}
        icono={d.icono}
        etiqueta={d.etiqueta}
        obligatorio={d.obligatorio}
        tipo={d.tipo}
        valor={valores[d.nombre] ?? ""}
        onCambio={cambiar(d.nombre)}
        placeholder={d.placeholder}
        autoComplete={d.autoComplete}
        maxLength={d.maxLength}
        error={errores[d.nombre]}
      />
    );

  const titulo =
    modo === "cliente"
      ? "Crear cuenta de cliente"
      : rol === "repartidor"
        ? "Crear cuenta de repartidor"
        : "Crear cuenta de administrador";
  const subtitulo =
    modo === "cliente"
      ? "Completa tus datos para crear tu cuenta. Es rápido y seguro."
      : modo === "codigo"
        ? `Introduce tu código de invitación y completa tus datos para crear tu cuenta de ${nombreRol[rol!]}.`
        : "Cuéntanos quién eres. El equipo revisará tu solicitud y, si la aprueba, te enviará un enlace personal para crear tu contraseña.";

  return (
    <RegistroLayout
      titulo={titulo}
      atras={modo === "cliente" ? "/crear-cuenta" : `/crear-cuenta/${rol}`}
      icono={
        modo === "cliente" ? (
          <User size={30} />
        ) : rol === "repartidor" ? (
          <Bike size={30} />
        ) : (
          <Store size={30} />
        )
      }
      color={
        modo === "cliente" ? "verde" : rol === "repartidor" ? "naranja" : "azul"
      }
      subtitulo={subtitulo}
    >
      <form className="reg-form" onSubmit={enviar} noValidate>
        {principales.map(pintar)}

        {opcionales.length > 0 && (
          <>
            <p className="reg-seccion">Datos opcionales</p>
            {opcionales.map(pintar)}
          </>
        )}

        {general && <p className="reg-error">{general}</p>}

        <button type="submit" className="reg-btn" disabled={enviando}>
          {enviando
            ? "Enviando..."
            : modo === "solicitud"
              ? "Enviar solicitud"
              : "Crear cuenta"}
        </button>
      </form>

      {modo === "codigo" && (
        <p className="reg-pie">
          ¿No tienes código?{" "}
          <button
            type="button"
            className="reg-enlace"
            onClick={() => navigate(`/crear-cuenta/${rol}/solicitud`)}
          >
            Solicita acceso
          </button>
        </p>
      )}
      {modo === "solicitud" && (
        <p className="reg-pie">
          ¿Ya tienes un código?{" "}
          <button
            type="button"
            className="reg-enlace"
            onClick={() => navigate(`/crear-cuenta/${rol}/codigo`)}
          >
            Úsalo aquí
          </button>
          <br />
          ¿Ya enviaste una solicitud?{" "}
          <button
            type="button"
            className="reg-enlace"
            onClick={() => navigate("/consultar-solicitud")}
          >
            Consulta cómo va
          </button>
        </p>
      )}
    </RegistroLayout>
  );
}

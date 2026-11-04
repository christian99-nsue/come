import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Pencil, Briefcase, ChevronDown } from "lucide-react";
import ImageUploadBox from "../../components/common/ImageUploadBox";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import "../../styles/cliente/EditarPerfil.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditarPerfil() {
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const [foto, setFoto] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [lugarTrabajo, setLugarTrabajo] = useState("");
  const [tipoContacto, setTipoContacto] = useState("Whatsapp");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/cliente/perfil`, { headers })
      .then((res) => {
        const p = res.data;
        setFoto(p.foto_perfil);
        setNombre(p.nombre || "");
        setTelefono(p.telefono || "");
        setEmail(p.email || "");
        setLugarTrabajo(p.lugar_trabajo || "");
        setTipoContacto(p.tipo_contacto || "Whatsapp");
      })
      .catch(() => setError("No se pudo cargar tu perfil"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarCambios = async () => {
    setError("");
    if (!nombre.trim()) return setError("El nombre es obligatorio");
    if (!telefono.trim()) return setError("El teléfono es obligatorio");

    setGuardando(true);
    try {
      const res = await axios.patch(
        `${API_URL}/api/cliente/perfil`,
        {
          foto_perfil: foto,
          nombre,
          telefono,
          email,
          lugar_trabajo: lugarTrabajo,
          tipo_contacto: tipoContacto,
        },
        { headers },
      );

      // Mantiene al día el usuario guardado en el navegador (lo usan el saludo y el menú lateral)
      const guardado = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...guardado,
          nombre: res.data.nombre,
          email: res.data.email,
          telefono: res.data.telefono,
        }),
      );

      setMostrarExito(true);
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message || "No se pudo guardar tu perfil");
      } else {
        setError("No se pudo guardar tu perfil");
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="editar-perfil-page">
        <p className="editar-perfil-status">Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="editar-perfil-page">
      <section className="editar-perfil-header">
        <button
          type="button"
          className="editar-perfil-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="editar-perfil-title">Editar perfil</h1>
      </section>

      <div className="editar-perfil-avatar-wrapper">
        <ImageUploadBox
          carpeta="perfiles-cliente"
          endpoint="/api/cliente/uploads"
          valueUrl={foto}
          onUploaded={(url) => setFoto(url)}
          shape="circle"
          size={96}
        />
        <span className="editar-perfil-avatar-label">Cambiar foto</span>
      </div>

      {error && <p className="editar-perfil-error">{error}</p>}

      <div className="editar-perfil-form">
        <label className="editar-perfil-field">
          <span className="editar-perfil-label">Nombre completo *</span>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="editar-perfil-input"
            maxLength={120}
          />
        </label>

        <label className="editar-perfil-field">
          <span className="editar-perfil-label">Teléfono *</span>
          <div className="editar-perfil-input-with-icon">
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="editar-perfil-input"
              maxLength={20}
            />
            <Pencil size={16} className="editar-perfil-input-icon" />
          </div>
          <span className="editar-perfil-hint">
            Con este número inicias sesión. Si lo cambias, usa el nuevo para
            entrar.
          </span>
        </label>

        <label className="editar-perfil-field">
          <span className="editar-perfil-label">
            Correo electrónico (opcional)
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="editar-perfil-input"
            maxLength={150}
          />
        </label>

        <label className="editar-perfil-field">
          <span className="editar-perfil-label">
            Lugar de trabajo (opcional)
          </span>
          <div className="editar-perfil-input-with-icon">
            <input
              type="text"
              value={lugarTrabajo}
              onChange={(e) => setLugarTrabajo(e.target.value)}
              className="editar-perfil-input"
              maxLength={150}
            />
            <Briefcase size={16} className="editar-perfil-input-icon" />
          </div>
        </label>

        <label className="editar-perfil-field">
          <span className="editar-perfil-label">
            Tipo de contacto preferido
          </span>
          <div className="editar-perfil-select-wrapper">
            <select
              value={tipoContacto}
              onChange={(e) => setTipoContacto(e.target.value)}
              className="editar-perfil-select"
            >
              <option value="Llamada">Llamada</option>
              <option value="Whatsapp">Whatsapp</option>
              <option value="Mensaje">Mensaje</option>
            </select>
            <ChevronDown size={16} className="editar-perfil-select-chevron" />
          </div>
          <span className="editar-perfil-hint">
            Tu repartidor verá primero esta opción cuando lleve tu pedido.
          </span>
        </label>
      </div>

      <button
        type="button"
        className="editar-perfil-save-btn"
        onClick={guardarCambios}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>

      <CambiosGuardadosOverlay
        open={mostrarExito}
        onContinuar={() => navigate("/cliente/perfil", { replace: true })}
      />
    </div>
  );
}

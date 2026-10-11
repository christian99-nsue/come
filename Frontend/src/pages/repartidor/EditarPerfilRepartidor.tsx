import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  Hash,
  Bike,
  ChevronDown,
} from "lucide-react";
import ImageUploadBox from "../../components/common/ImageUploadBox";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import "../../styles/repartidor/RepartidorShared.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditarPerfilRepartidor() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [foto, setFoto] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [vehiculoTipo, setVehiculoTipo] = useState("");
  const [matricula, setMatricula] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/repartidor/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const p = res.data;
        setFoto(p.foto_perfil);
        setNombre(p.nombre || "");
        setEmail(p.email || "");
        setTelefono(p.telefono || "");
        setTipoDocumento(p.tipo_documento || "");
        setNumeroDocumento(p.numero_documento || "");
        setVehiculoTipo(p.vehiculo_tipo || "");
        setMatricula(p.matricula || "");
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
        `${API_URL}/api/repartidor/perfil`,
        {
          foto_perfil: foto,
          nombre,
          email,
          telefono,
          tipo_documento: tipoDocumento,
          numero_documento: numeroDocumento,
          vehiculo_tipo: vehiculoTipo,
          matricula,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Mantiene al día el usuario guardado en el navegador (lo usa el saludo del panel)
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
      if (axios.isAxiosError(err)) {
        const mensaje = err.response?.data?.message;

        setError(
          typeof mensaje === "string"
            ? mensaje
            : "No se pudo guardar el perfil",
        );
      } else {
        setError("Ha ocurrido un error inesperado");
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="rep-page">
        <p className="rep-status-text">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="rep-page">
      <section className="rep-header">
        <button
          type="button"
          className="rep-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="rep-title">Editar perfil</h1>
      </section>

      <div className="rep-avatar-wrapper">
        <ImageUploadBox
          carpeta="perfiles-repartidor"
          endpoint="/api/repartidor/uploads"
          valueUrl={foto}
          onUploaded={(url) => setFoto(url)}
          shape="circle"
          size={96}
        />
      </div>

      {error && <p className="rep-status-text rep-status-error">{error}</p>}

      <div className="rep-form">
        <label className="rep-form-field">
          <span className="rep-form-icon">
            <User size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Nombre completo</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="rep-form-input"
            />
          </div>
        </label>

        <label className="rep-form-field">
          <span className="rep-form-icon">
            <Mail size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rep-form-input"
              placeholder="Opcional"
            />
          </div>
        </label>

        <label className="rep-form-field">
          <span className="rep-form-icon">
            <Phone size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Teléfono</span>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="rep-form-input"
            />
          </div>
        </label>
        <p className="rep-form-hint">
          Con este número inicias sesión. Si lo cambias, usa el nuevo para
          entrar.
        </p>

        <label className="rep-form-field">
          <span className="rep-form-icon">
            <FileText size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Tipo de documento</span>
            <div className="rep-form-select-wrapper">
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="rep-form-select"
              >
                <option value="">Sin especificar</option>
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Carnet de conducir">Carnet de conducir</option>
              </select>
              <ChevronDown size={14} className="rep-form-select-chevron" />
            </div>
          </div>
        </label>

        <label className="rep-form-field">
          <span className="rep-form-icon">
            <Hash size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Número de documento</span>
            <input
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
              className="rep-form-input"
              placeholder="Opcional"
            />
          </div>
        </label>

        <label className="rep-form-field">
          <span className="rep-form-icon">
            <Bike size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Vehículo</span>
            <div className="rep-form-select-wrapper">
              <select
                value={vehiculoTipo}
                onChange={(e) => setVehiculoTipo(e.target.value)}
                className="rep-form-select"
              >
                <option value="">Sin especificar</option>
                <option value="moto">Moto</option>
                <option value="bicicleta">Bicicleta</option>
                <option value="coche">Coche</option>
              </select>
              <ChevronDown size={14} className="rep-form-select-chevron" />
            </div>
          </div>
        </label>

        <label className="rep-form-field">
          <span className="rep-form-icon">
            <Hash size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Matrícula</span>
            <input
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              className="rep-form-input"
              placeholder="Opcional"
            />
          </div>
        </label>
      </div>

      <button
        type="button"
        className="rep-btn-primary"
        onClick={guardarCambios}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>

      <CambiosGuardadosOverlay
        open={mostrarExito}
        onContinuar={() => navigate("/repartidor/perfil", { replace: true })}
      />
    </div>
  );
}

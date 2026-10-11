import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import ImageUploadBox from "../../components/common/ImageUploadBox";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import "../../styles/admin/AdminShared.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditarPerfilAdmin() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/cuenta`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNombre(res.data.nombre || "");
        setEmail(res.data.email || "");
        setTelefono(res.data.telefono || "");
        setFotoPerfil(res.data.foto_perfil || null);
      })
      .catch(() => setError("No se pudo cargar tu perfil"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarCambios = async () => {
    setError("");
    if (!nombre.trim()) return setError("El nombre es obligatorio");

    setGuardando(true);
    try {
      await axios.patch(
        `${API_URL}/api/admin/cuenta`,
        {
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: telefono.trim(),
          foto_perfil: fotoPerfil,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMostrarExito(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "No se pudo guardar");
      } else {
        setError("No se pudo guardar");
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="admin-page">
        <p className="pedidos-status-text">Cargando...</p>
      </div>
    );
  }

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
        <h1 className="admin-title">Editar perfil</h1>
      </section>

      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}
      >
        <ImageUploadBox
          carpeta="perfiles-admin"
          valueUrl={fotoPerfil}
          onUploaded={(url) => setFotoPerfil(url)}
          shape="circle"
          size={90}
        />
      </div>

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      <div className="admin-form-field">
        <span className="admin-form-label">Nombre completo *</span>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="admin-form-input"
        />
      </div>

      <div className="admin-form-field">
        <span className="admin-form-label">Correo electrónico</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="admin-form-input"
        />
      </div>

      <div className="admin-form-field">
        <span className="admin-form-label">Teléfono</span>
        <input
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="admin-form-input"
        />
      </div>

      <button
        type="button"
        className="admin-btn-primary"
        onClick={guardarCambios}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>

      <CambiosGuardadosOverlay
        open={mostrarExito}
        onContinuar={() =>
          navigate("/admin/configuracion/cuenta", { replace: true })
        }
      />
    </div>
  );
}

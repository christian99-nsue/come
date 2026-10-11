import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import ImageUploadBox from "../../components/common/ImageUploadBox";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/InformacionRestaurante.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function InformacionRestaurante() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarExito, setMostrarExito] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/restaurante`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNombre(res.data.nombre || "");
        setTelefono(res.data.telefono || "");
        setDireccion(res.data.direccion || "");
        setLogo(res.data.logo);
      })
      .catch(() => setError("No se pudo cargar la información"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarCambios = async () => {
    setError("");
    if (!nombre.trim())
      return setError("El nombre del restaurante es obligatorio");

    setGuardando(true);
    try {
      await axios.patch(
        `${API_URL}/api/admin/restaurante`,
        {
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
          logo,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMostrarExito(true);
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
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
        <h1 className="admin-title">Información del restaurante</h1>
      </section>

      <div className="info-rest-logo-wrapper">
        <ImageUploadBox
          carpeta="logos-restaurante"
          valueUrl={logo}
          onUploaded={(url) => setLogo(url)}
          size={90}
        />
      </div>

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      <div className="admin-form-field">
        <span className="admin-form-label">Nombre del restaurante *</span>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
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

      <div className="admin-form-field">
        <span className="admin-form-label">Dirección</span>
        <input
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
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
        onContinuar={() => navigate("/admin/configuracion", { replace: true })}
      />
    </div>
  );
}

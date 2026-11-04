import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import ImageUploadBox from "../../components/common/ImageUploadBox";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import { useRestauranteAdmin } from "../../hooks/useRestauranteAdmin";
import "../../styles/admin/AdminShared.css";
import UbicacionRestaurante from "../../components/common/UbicacionRestaurante";

const API_URL = import.meta.env.VITE_API_URL;

export default function InformacionRestaurante() {
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const { actualizar } = useRestauranteAdmin();

  const [logo, setLogo] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [tipoCocina, setTipoCocina] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/restaurante`, { headers })
      .then((res) => {
        const r = res.data;
        setLogo(r.logo);
        setNombre(r.nombre || "");
        setTipoCocina(r.categorias_texto || "");
        setTelefono(r.telefono || "");
        setDireccion(r.direccion || "");
      })
      .catch(() => setError("No se pudo cargar la información del restaurante"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarCambios = async () => {
    setError("");
    if (nombre.trim().length < 2)
      return setError("El nombre del restaurante es obligatorio");

    setGuardando(true);
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/restaurante`,
        { logo, nombre, categorias_texto: tipoCocina, telefono, direccion },
        { headers },
      );
      actualizar(res.data); // el nombre y el logo del encabezado se ponen al día
      setMostrarExito(true);
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "No se pudo guardar la información",
        );
      } else {
        setError("No se pudo guardar la información");
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

      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
      >
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
          maxLength={150}
        />
      </div>

      <div className="admin-form-field">
        <span className="admin-form-label">Tipo de cocina</span>
        <input
          value={tipoCocina}
          onChange={(e) => setTipoCocina(e.target.value)}
          className="admin-form-input"
          placeholder="Ej: Hamburguesas · Americana"
          maxLength={150}
        />
        <span className="admin-form-hint">
          Los clientes te encuentran por estas palabras. Usa las de las
          categorías de la app: Hamburguesas, Pizzas, Pollo, Africana, Asiática,
          Postres.
        </span>
      </div>

      <div className="admin-form-field">
        <span className="admin-form-label">Teléfono</span>
        <input
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="admin-form-input"
          maxLength={20}
        />
      </div>

      <div className="admin-form-field">
        <span className="admin-form-label">Dirección</span>
        <input
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          className="admin-form-input"
          maxLength={255}
        />
      </div>

      <UbicacionRestaurante />

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

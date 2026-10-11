import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ChevronDown } from "lucide-react";
import ImageUploadBox from "../../components/common/ImageUploadBox";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/CrearPlato.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Categoria {
  id: number;
  nombre: string;
}

export default function CrearPlato() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagen, setImagen] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [precio, setPrecio] = useState("");
  const [tiempoPreparacion, setTiempoPreparacion] = useState("15");
  const [disponible, setDisponible] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/menu/categorias`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategorias(res.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarPlato = async () => {
    setError("");

    if (!nombre.trim()) return setError("El nombre del plato es obligatorio");
    if (!descripcion.trim()) return setError("La descripción es obligatoria");
    if (!categoriaId) return setError("Selecciona una categoría");
    if (!precio || Number(precio) <= 0)
      return setError("Introduce un precio válido");

    setGuardando(true);
    try {
      await axios.post(
        `${API_URL}/api/admin/menu/platos`,
        {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          categoria_id: Number(categoriaId),
          precio: Number(precio),
          tiempo_preparacion_min: Number(tiempoPreparacion) || 15,
          disponible,
          imagen,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate("/admin/menu", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message || "No se pudo guardar el plato");
      } else {
        setError("No se pudo guardar el plato");
      }
    } finally {
      setGuardando(false);
    }
  };

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
        <h1 className="admin-title">Crear plato</h1>
      </section>

      <div className="crear-image-wrapper">
        <ImageUploadBox
          carpeta="platos"
          onUploaded={(url) => setImagen(url)}
          size={90}
        />
        <span className="crear-image-label">Añadir foto</span>
        <span className="crear-image-hint">JPG, PNG (máx. 5 MB)</span>
      </div>

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      <div className="crear-form">
        <label className="crear-field">
          <span className="crear-label">Nombre del plato *</span>
          <input
            type="text"
            placeholder="Ej: Hamburguesa clásica"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="crear-input"
          />
        </label>

        <label className="crear-field">
          <span className="crear-label">Descripción *</span>
          <textarea
            placeholder="Describe los ingredientes y características..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="crear-textarea"
            maxLength={500}
          />
          <span className="crear-textarea-count">{descripcion.length}/500</span>
        </label>

        <label className="crear-field">
          <span className="crear-label">Categoría *</span>
          <div className="crear-select-wrapper">
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="crear-select"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="crear-select-chevron" />
          </div>
        </label>

        <label className="crear-field">
          <span className="crear-label">Precio *</span>
          <div className="crear-input-with-suffix">
            <input
              type="number"
              placeholder="Ej: 6.000"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="crear-input"
            />
            <span className="crear-input-suffix">XAF</span>
          </div>
        </label>

        <label className="crear-field">
          <span className="crear-label">Tiempo de preparación (min)</span>
          <input
            type="number"
            placeholder="Ej: 15"
            value={tiempoPreparacion}
            onChange={(e) => setTiempoPreparacion(e.target.value)}
            className="crear-input"
          />
        </label>

        <div className="crear-toggle-row">
          <span className="crear-label" style={{ marginBottom: 0 }}>
            Disponibilidad
          </span>
          <div className="crear-toggle-inline">
            <span className="crear-toggle-text">
              {disponible ? "Disponible" : "No disponible"}
            </span>
            <button
              type="button"
              className={disponible ? "toggle-switch active" : "toggle-switch"}
              onClick={() => setDisponible((v) => !v)}
              aria-label="Activar/desactivar disponibilidad"
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="admin-btn-primary crear-submit-btn"
        onClick={guardarPlato}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar plato"}
      </button>
    </div>
  );
}

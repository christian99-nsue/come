import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ChevronDown, Trash2 } from "lucide-react";
import ImageUploadBox from "../../components/common/ImageUploadBox";
import ConfirmModal from "../../components/common/ConfirmModal";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/CrearPlato.css";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";

const API_URL = import.meta.env.VITE_API_URL;

interface Categoria {
  id: number;
  nombre: string;
}

export default function EditarPlato() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagen, setImagen] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [precio, setPrecio] = useState("");
  const [tiempoPreparacion, setTiempoPreparacion] = useState("15");
  const [disponible, setDisponible] = useState(true);
  const [mostrarExito, setMostrarExito] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/admin/menu/categorias`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_URL}/api/admin/menu/platos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([catRes, platoRes]) => {
        setCategorias(catRes.data);

        const p = platoRes.data;

        setNombre(p.nombre);
        setDescripcion(p.descripcion || "");
        setCategoriaId(p.categoria_id ? String(p.categoria_id) : "");
        setPrecio(String(p.precio));
        setTiempoPreparacion(String(p.tiempo_preparacion_min));
        setDisponible(!!p.disponible);
        setImagen(p.imagen);
      })
      .catch(() => setError("No se pudo cargar el plato"))
      .finally(() => setCargando(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const guardarCambios = async () => {
    setError("");

    if (!nombre.trim()) {
      setError("El nombre del plato es obligatorio");
      return;
    }

    if (!descripcion.trim()) {
      setError("La descripción es obligatoria");
      return;
    }

    if (!categoriaId) {
      setError("Selecciona una categoría");
      return;
    }

    if (!precio || Number(precio) <= 0) {
      setError("Introduce un precio válido");
      return;
    }

    setGuardando(true);

    try {
      await axios.patch(
        `${API_URL}/api/admin/menu/platos/${id}`,
        {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          categoria_id: Number(categoriaId),
          precio: Number(precio),
          tiempo_preparacion_min: Number(tiempoPreparacion) || 15,
          imagen,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // La disponibilidad usa su propio endpoint dedicado
      // (igual que en la lista del Menú).
      await axios.patch(
        `${API_URL}/api/admin/menu/platos/${id}/disponibilidad`,
        { disponible },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMostrarExito(true);
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

  const eliminarPlato = async () => {
    try {
      await axios.delete(`${API_URL}/api/admin/menu/platos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/admin/menu", { replace: true });
    } catch {
      setError("No se pudo eliminar el plato");
      setMostrarEliminar(false);
    }
  };

  if (cargando) {
    return (
      <div className="admin-page">
        <p className="pedidos-status-text">Cargando plato...</p>
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

        <h1 className="admin-title">Editar plato</h1>

        <button
          type="button"
          className="admin-icon-btn"
          onClick={() => setMostrarEliminar(true)}
          aria-label="Eliminar plato"
          style={{ color: "#dc2626" }}
        >
          <Trash2 size={20} />
        </button>
      </section>

      <div className="crear-image-wrapper">
        <ImageUploadBox
          carpeta="platos"
          valueUrl={imagen}
          onUploaded={(url) => setImagen(url)}
          size={90}
        />

        <span className="crear-image-label">Cambiar foto</span>
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
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="crear-input"
          />
        </label>

        <label className="crear-field">
          <span className="crear-label">Descripción *</span>

          <textarea
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
        onClick={guardarCambios}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>

      <ConfirmModal
        open={mostrarEliminar}
        title="¿Eliminar este plato?"
        message={`"${nombre}" se eliminará del menú permanentemente. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar plato"
        cancelLabel="Cancelar"
        danger
        onConfirm={eliminarPlato}
        onCancel={() => setMostrarEliminar(false)}
      />

      <CambiosGuardadosOverlay
        open={mostrarExito}
        onContinuar={() => navigate("/admin/menu", { replace: true })}
      />
    </div>
  );
}

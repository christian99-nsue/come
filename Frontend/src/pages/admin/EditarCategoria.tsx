import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Trash2 } from "lucide-react";
import ImageUploadBox from "../../components/common/ImageUploadBox";
import ConfirmModal from "../../components/common/ConfirmModal";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/CrearPlato.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditarCategoria() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [imagen, setImagen] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mostrarExito, setMostrarExito] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/menu/categorias/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNombre(res.data.nombre);
        setDescripcion(res.data.descripcion || "");
        setImagen(res.data.imagen);
      })
      .catch(() => setError("No se pudo cargar la categoría"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const guardarCambios = async () => {
    setError("");

    if (!nombre.trim()) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }

    setGuardando(true);

    try {
      await axios.patch(
        `${API_URL}/api/admin/menu/categorias/${id}`,
        {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          imagen,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMostrarExito(true);
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "No se pudo guardar la categoría",
        );
      } else {
        setError("No se pudo guardar la categoría");
      }
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCategoria = async () => {
    try {
      await axios.delete(`${API_URL}/api/admin/menu/categorias/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/admin/menu", { replace: true });
    } catch {
      setError("No se pudo eliminar la categoría");
      setMostrarEliminar(false);
    }
  };

  if (cargando) {
    return (
      <div className="admin-page">
        <p className="pedidos-status-text">Cargando categoría...</p>
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

        <h1 className="admin-title">Editar categoría</h1>

        <button
          type="button"
          className="admin-icon-btn"
          onClick={() => setMostrarEliminar(true)}
          aria-label="Eliminar categoría"
          style={{ color: "#dc2626" }}
        >
          <Trash2 size={20} />
        </button>
      </section>

      <div className="crear-image-wrapper">
        <ImageUploadBox
          carpeta="categorias"
          valueUrl={imagen}
          onUploaded={(url) => setImagen(url)}
          size={90}
        />

        <span className="crear-image-label">Cambiar imagen</span>
        <span className="crear-image-hint">JPG, PNG (máx. 5 MB)</span>
      </div>

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      <div className="crear-form">
        <label className="crear-field">
          <span className="crear-label">Nombre de la categoría *</span>

          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="crear-input"
          />
        </label>

        <label className="crear-field">
          <span className="crear-label">Descripción (opcional)</span>

          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="crear-textarea"
            maxLength={200}
          />

          <span className="crear-textarea-count">{descripcion.length}/200</span>
        </label>
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
        title="¿Eliminar esta categoría?"
        message={`"${nombre}" se eliminará permanentemente. Los platos que tenía asignados quedarán sin categoría.`}
        confirmLabel="Eliminar categoría"
        cancelLabel="Cancelar"
        danger
        onConfirm={eliminarCategoria}
        onCancel={() => setMostrarEliminar(false)}
      />
      <CambiosGuardadosOverlay
        open={mostrarExito}
        onContinuar={() => navigate("/admin/menu", { replace: true })}
      />
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import ImageUploadBox from "../../components/common/ImageUploadBox";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/CrearPlato.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function CrearCategoria() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [imagen, setImagen] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardarCategoria = async () => {
    setError("");

    if (!nombre.trim()) {
      return setError("El nombre de la categoría es obligatorio");
    }

    setGuardando(true);

    try {
      await axios.post(
        `${API_URL}/api/admin/menu/categorias`,
        {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          imagen,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate("/admin/menu", { replace: true });
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

        <h1 className="admin-title">Crear categoría</h1>
      </section>

      <div className="crear-image-wrapper">
        <ImageUploadBox
          carpeta="categorias"
          onUploaded={(url) => setImagen(url)}
          size={90}
        />

        <span className="crear-image-label">Añadir imagen</span>
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
            placeholder="Ej: Hamburguesas"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="crear-input"
          />
        </label>

        <label className="crear-field">
          <span className="crear-label">Descripción (opcional)</span>

          <textarea
            placeholder="Breve descripción..."
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
        onClick={guardarCategoria}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar categoría"}
      </button>
    </div>
  );
}

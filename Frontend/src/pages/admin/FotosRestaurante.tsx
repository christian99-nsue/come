import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Plus, Trash2, ImageOff } from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/FotosRestaurante.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Foto {
  id: number;
  url: string;
  fecha_creacion: string;
}

export default function FotosRestaurante() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const inputRef = useRef<HTMLInputElement>(null);

  const [fotos, setFotos] = useState<Foto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const [fotoAEliminar, setFotoAEliminar] = useState<number | null>(null);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/restaurante/fotos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!cancelado) {
          setFotos(res.data);
        }
      } catch {
        if (!cancelado) {
          setError("No se pudieron cargar las fotos");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, [token]);

  const subirFoto = async (file: File) => {
    setError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Solo se permiten JPG, PNG o WEBP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5 MB");
      return;
    }

    setSubiendo(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("carpeta", "fotos-restaurante");

      const uploadRes = await axios.post(
        `${API_URL}/api/admin/uploads`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const fotoRes = await axios.post(
        `${API_URL}/api/admin/restaurante/fotos`,
        {
          url: uploadRes.data.url,
          path: uploadRes.data.path,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setFotos((prev) => [
        {
          id: fotoRes.data.id,
          url: fotoRes.data.url,
          fecha_creacion: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message || "No se pudo subir la foto");
      } else {
        setError("No se pudo subir la foto");
      }
    } finally {
      setSubiendo(false);
    }
  };

  const eliminarFoto = async (fotoId: number) => {
    const fotosAntes = fotos;

    setFotoAEliminar(null);
    setFotos((prev) => prev.filter((f) => f.id !== fotoId));

    try {
      await axios.delete(`${API_URL}/api/admin/restaurante/fotos/${fotoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      setFotos(fotosAntes);
      setError("No se pudo eliminar la foto");
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

        <h1 className="admin-title">Fotos del restaurante</h1>
      </section>

      <p
        className="pedidos-status-text"
        style={{ textAlign: "left", margin: "0 0 16px" }}
      >
        Sube fotos de tu local, tu equipo o tus platos destacados para mostrar
        en tu perfil.
      </p>

      <button
        type="button"
        className="admin-btn-primary fotos-rest-upload-btn"
        onClick={() => inputRef.current?.click()}
        disabled={subiendo}
      >
        <Plus size={17} />
        {subiendo ? "Subiendo..." : "Subir foto"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            subirFoto(file);
          }

          e.target.value = "";
        }}
      />

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      {cargando && <p className="pedidos-status-text">Cargando fotos...</p>}

      {!cargando && fotos.length === 0 && (
        <div className="fotos-rest-empty">
          <ImageOff size={28} className="fotos-rest-empty-icon" />

          <p className="fotos-rest-empty-text">
            Aún no has subido fotos de tu restaurante.
          </p>
        </div>
      )}

      <div className="fotos-rest-grid">
        {fotos.map((foto) => (
          <div key={foto.id} className="fotos-rest-item">
            <img
              src={foto.url}
              alt="Foto del restaurante"
              className="fotos-rest-img"
            />

            <button
              type="button"
              className="fotos-rest-delete-btn"
              onClick={() => setFotoAEliminar(foto.id)}
              aria-label="Eliminar foto"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={fotoAEliminar !== null}
        title="Eliminar foto"
        message="¿Estás seguro de que quieres eliminar esta foto? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        danger
        onConfirm={() => {
          if (fotoAEliminar !== null) {
            eliminarFoto(fotoAEliminar);
          }
        }}
        onCancel={() => setFotoAEliminar(null)}
      />
    </div>
  );
}

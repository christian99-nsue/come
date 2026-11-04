import { useRef, useState } from "react";
import axios from "axios";
import { Camera, Loader2 } from "lucide-react";
import "../../styles/common/ImageUploadBox.css";

const API_URL = import.meta.env.VITE_API_URL;

interface ErrorRespuesta {
  message?: string;
}

type Carpeta =
  | "platos"
  | "categorias"
  | "logos-restaurante"
  | "perfiles-admin"
  | "fotos-restaurante"
  | "perfiles-repartidor"
  | "perfiles-cliente";

interface ImageUploadBoxProps {
  carpeta: Carpeta;
  endpoint?: string; // por defecto la subida del admin
  valueUrl?: string | null;
  onUploaded: (url: string, path: string) => void;
  shape?: "circle" | "square";
  size?: number;
  placeholder?: string;
}

export default function ImageUploadBox({
  carpeta,
  endpoint = "/api/admin/uploads",
  valueUrl,
  onUploaded,
  shape = "square",
  size = 90,
  placeholder,
}: ImageUploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(valueUrl || null);

  const token = localStorage.getItem("token");

  const manejarArchivo = async (file: File) => {
    setError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Solo se permiten JPG, PNG o WEBP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5 MB");
      return;
    }

    // Vista previa instantánea mientras sube, usando el propio archivo local
    const previewLocal = URL.createObjectURL(file);
    setPreview(previewLocal);
    setSubiendo(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("carpeta", carpeta);

      const res = await axios.post(`${API_URL}${endpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPreview(res.data.url);
      onUploaded(res.data.url, res.data.path);
    } catch (err: unknown) {
      if (axios.isAxiosError<ErrorRespuesta>(err)) {
        setError(err.response?.data?.message || "No se pudo subir la imagen");
      } else {
        setError("No se pudo subir la imagen");
      }

      setPreview(valueUrl || null);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="image-upload-wrapper">
      <button
        type="button"
        className={`image-upload-box ${
          shape === "circle" ? "circle" : "square"
        }`}
        style={{ width: size, height: size }}
        onClick={() => inputRef.current?.click()}
        disabled={subiendo}
      >
        {preview ? (
          <img
            src={preview}
            alt="Vista previa"
            className="image-upload-preview"
          />
        ) : (
          <Camera size={size * 0.3} />
        )}

        {subiendo && (
          <div className="image-upload-overlay">
            <Loader2 size={20} className="image-upload-spinner" />
          </div>
        )}

        {!preview && !subiendo && placeholder && (
          <span className="image-upload-placeholder-text">{placeholder}</span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="image-upload-input-hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            manejarArchivo(file);
          }

          // Permite volver a elegir el mismo archivo si falló
          e.target.value = "";
        }}
      />

      {error && <span className="image-upload-error">{error}</span>}
    </div>
  );
}

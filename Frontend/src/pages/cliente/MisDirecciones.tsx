import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Briefcase,
  Home,
  ChevronRight,
  LocateFixed,
  Trash2,
  Star,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import "../../styles/cliente/MisDirecciones.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Direccion {
  id: number;
  etiqueta: string;
  direccion: string;
  referencia: string | null;
  latitud: number | null;
  longitud: number | null;
  es_principal: boolean;
}

type TipoEtiqueta = "Casa" | "Trabajo" | "Otra";

interface Editor {
  id: number | null; // null = dirección nueva
  tipo: TipoEtiqueta;
  nombre: string; // solo cuando el tipo es "Otra"
  direccion: string;
  referencia: string;
  latitud: number | null;
  longitud: number | null;
  esPrincipal: boolean;
}

const tipos: TipoEtiqueta[] = ["Casa", "Trabajo", "Otra"];

function IconoDireccion({ etiqueta }: { etiqueta: string }) {
  if (etiqueta === "Casa") return <Home size={18} />;
  if (etiqueta === "Trabajo") return <Briefcase size={18} />;
  return <MapPin size={18} />;
}

const editorNuevo: Editor = {
  id: null,
  tipo: "Casa",
  nombre: "",
  direccion: "",
  referencia: "",
  latitud: null,
  longitud: null,
  esPrincipal: false,
};

export default function MisDirecciones() {
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [editor, setEditor] = useState<Editor | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [ubicando, setUbicando] = useState(false);
  const [aEliminar, setAEliminar] = useState<Direccion | null>(null);

  const cargar = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cliente/direcciones`, {
        headers,
      });
      setDirecciones(res.data);
      setError("");
    } catch {
      setError("No se pudieron cargar tus direcciones");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const res = await axios.get<Direccion[]>(
          `${API_URL}/api/cliente/direcciones`,
          { headers },
        );
        setDirecciones(res.data);
        setError("");
      } catch {
        setError("No se pudieron cargar tus direcciones");
      } finally {
        setCargando(false);
      }
    };

    void cargarInicial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirNueva = () => {
    setError("");
    setEditor(editorNuevo);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const abrirEdicion = (d: Direccion) => {
    setError("");
    const esTipoFijo = d.etiqueta === "Casa" || d.etiqueta === "Trabajo";
    setEditor({
      id: d.id,
      tipo: esTipoFijo ? (d.etiqueta as TipoEtiqueta) : "Otra",
      nombre: esTipoFijo ? "" : d.etiqueta,
      direccion: d.direccion,
      referencia: d.referencia || "",
      latitud: d.latitud,
      longitud: d.longitud,
      esPrincipal: d.es_principal,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const usarUbicacion = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Tu dispositivo no permite obtener la ubicación");
      return;
    }

    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEditor((e) =>
          e
            ? {
                ...e,
                latitud: pos.coords.latitude,
                longitud: pos.coords.longitude,
              }
            : e,
        );
        setUbicando(false);
      },
      () => {
        setUbicando(false);
        setError(
          "No se pudo obtener tu ubicación. Revisa el permiso de ubicación del navegador.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const guardar = async () => {
    if (!editor) return;
    setError("");

    if (editor.direccion.trim().length < 5)
      return setError("Escribe tu dirección completa");

    const etiqueta =
      editor.tipo === "Otra" ? editor.nombre.trim() || "Otra" : editor.tipo;
    const cuerpo = {
      etiqueta,
      direccion: editor.direccion,
      referencia: editor.referencia,
      latitud: editor.latitud,
      longitud: editor.longitud,
    };

    setGuardando(true);
    try {
      if (editor.id === null) {
        await axios.post(`${API_URL}/api/cliente/direcciones`, cuerpo, {
          headers,
        });
      } else {
        await axios.patch(
          `${API_URL}/api/cliente/direcciones/${editor.id}`,
          cuerpo,
          { headers },
        );
      }
      setEditor(null);
      await cargar();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "No se pudo guardar la dirección",
        );
      } else {
        setError("No se pudo guardar la dirección");
      }
    } finally {
      setGuardando(false);
    }
  };

  const hacerPrincipal = async () => {
    if (!editor || editor.id === null) return;
    setError("");
    try {
      await axios.patch(
        `${API_URL}/api/cliente/direcciones/${editor.id}/principal`,
        {},
        { headers },
      );
      setEditor(null);
      await cargar();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message ||
            "No se pudo cambiar la dirección principal",
        );
      } else {
        setError("No se pudo cambiar la dirección principal");
      }
    }
  };

  const eliminar = async () => {
    if (!aEliminar) return;
    const id = aEliminar.id;
    setAEliminar(null);
    setError("");

    try {
      await axios.delete(`${API_URL}/api/cliente/direcciones/${id}`, {
        headers,
      });
      setEditor(null);
      await cargar();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "No se pudo eliminar la dirección",
        );
      } else {
        setError("No se pudo eliminar la dirección");
      }
    }
  };

  const direccionEnEdicion =
    editor?.id != null
      ? direcciones.find((d) => d.id === editor.id)
      : undefined;

  return (
    <div className="direcciones-page">
      <section className="direcciones-header">
        <button
          type="button"
          className="direcciones-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="direcciones-title">Mis direcciones</h1>
        {!editor && (
          <button
            type="button"
            className="direcciones-add-btn"
            onClick={abrirNueva}
            aria-label="Añadir dirección"
          >
            <Plus size={20} />
          </button>
        )}
      </section>

      {error && <p className="direcciones-status error">{error}</p>}

      {editor && (
        <section className="direcciones-form">
          <h3 className="direcciones-form-title">
            {editor.id === null ? "Nueva dirección" : "Editar dirección"}
          </h3>

          <div className="direcciones-chips">
            {tipos.map((t) => (
              <button
                key={t}
                type="button"
                className={
                  editor.tipo === t
                    ? "direcciones-chip active"
                    : "direcciones-chip"
                }
                onClick={() => setEditor({ ...editor, tipo: t })}
              >
                {t}
              </button>
            ))}
          </div>

          {editor.tipo === "Otra" && (
            <label className="direcciones-field">
              <span className="direcciones-field-label">
                Nombre de la dirección
              </span>
              <input
                className="direcciones-input"
                value={editor.nombre}
                onChange={(e) =>
                  setEditor({ ...editor, nombre: e.target.value })
                }
                placeholder="Ej: Casa de mis padres"
                maxLength={40}
              />
            </label>
          )}

          <label className="direcciones-field">
            <span className="direcciones-field-label">Dirección *</span>
            <input
              className="direcciones-input"
              value={editor.direccion}
              onChange={(e) =>
                setEditor({ ...editor, direccion: e.target.value })
              }
              placeholder="Calle, número, barrio, ciudad"
              maxLength={255}
            />
          </label>

          <label className="direcciones-field">
            <span className="direcciones-field-label">
              Referencia (opcional)
            </span>
            <input
              className="direcciones-input"
              value={editor.referencia}
              onChange={(e) =>
                setEditor({ ...editor, referencia: e.target.value })
              }
              placeholder="Ej: Edificio blanco, timbre 2B"
              maxLength={255}
            />
          </label>

          <button
            type="button"
            className="direcciones-loc-btn"
            onClick={usarUbicacion}
            disabled={ubicando}
          >
            <LocateFixed size={16} />
            {ubicando
              ? "Obteniendo ubicación..."
              : editor.latitud !== null
                ? "Ubicación guardada ✓ (tocar para actualizar)"
                : "Usar mi ubicación actual"}
          </button>
          <p className="direcciones-hint">
            Ayuda al repartidor a llegar. Es opcional.
          </p>

          {editor.id !== null && (
            <div className="direcciones-extra-actions">
              {!editor.esPrincipal && (
                <button
                  type="button"
                  className="direcciones-extra-btn"
                  onClick={hacerPrincipal}
                >
                  <Star size={15} /> Establecer como principal
                </button>
              )}
              {direccionEnEdicion && (
                <button
                  type="button"
                  className="direcciones-extra-btn danger"
                  onClick={() => setAEliminar(direccionEnEdicion)}
                >
                  <Trash2 size={15} /> Eliminar dirección
                </button>
              )}
            </div>
          )}

          <div className="direcciones-form-actions">
            <button
              type="button"
              className="direcciones-cancel-btn"
              onClick={() => setEditor(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="direcciones-save-btn"
              onClick={guardar}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </section>
      )}

      {cargando && (
        <p className="direcciones-status">Cargando tus direcciones...</p>
      )}

      {!cargando && !error && direcciones.length === 0 && !editor && (
        <p className="direcciones-status">
          Aún no tienes direcciones guardadas.
        </p>
      )}

      <div className="direcciones-list">
        {direcciones.map((d) => (
          <button
            key={d.id}
            type="button"
            className="direccion-item"
            onClick={() => abrirEdicion(d)}
          >
            <span className="direccion-item-icon">
              <IconoDireccion etiqueta={d.etiqueta} />
            </span>
            <div className="direccion-item-body">
              <div className="direccion-item-top">
                <span className="direccion-item-title">{d.etiqueta}</span>
              </div>
              {d.es_principal && (
                <div className="direccion-item-badges">
                  <span className="direccion-item-badge default">
                    Principal
                  </span>
                </div>
              )}
              <span className="direccion-item-line">{d.direccion}</span>
              {d.referencia && (
                <span className="direccion-item-line">Ref: {d.referencia}</span>
              )}
            </div>
            <ChevronRight size={18} className="direccion-item-chevron" />
          </button>
        ))}
      </div>

      {!cargando && !editor && (
        <button
          type="button"
          className="direcciones-add-new-btn"
          onClick={abrirNueva}
        >
          <span className="direcciones-add-new-icon">
            <Plus size={18} />
          </span>
          Añadir nueva dirección
        </button>
      )}

      <ConfirmModal
        open={aEliminar !== null}
        title="¿Eliminar esta dirección?"
        message={
          aEliminar
            ? `"${aEliminar.etiqueta}" se eliminará de tus direcciones guardadas.`
            : ""
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        danger
        onConfirm={eliminar}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  );
}

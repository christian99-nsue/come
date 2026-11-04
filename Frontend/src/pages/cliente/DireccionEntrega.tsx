import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Home,
  Briefcase,
  Plus,
  LocateFixed,
} from "lucide-react";
import { useCarrito } from "../../context/useCarrito";
import "../../styles/cliente/DireccionEntrega.css";

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

const etiquetas = ["Casa", "Trabajo", "Otra"];

function IconoDireccion({ etiqueta }: { etiqueta: string }) {
  if (etiqueta === "Casa") return <Home size={18} />;
  if (etiqueta === "Trabajo") return <Briefcase size={18} />;
  return <MapPin size={18} />;
}

export default function DireccionEntrega() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const { items, direccionId, setDireccionId } = useCarrito();

  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [mostrarForm, setMostrarForm] = useState(false);
  const [etiqueta, setEtiqueta] = useState("Casa");
  const [direccion, setDireccion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [ubicando, setUbicando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Sin productos no hay nada que entregar
  useEffect(() => {
    if (items.length === 0) navigate("/cliente/carrito", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/cliente/direcciones`, { headers })
      .then((res) => {
        const lista: Direccion[] = res.data;
        setDirecciones(lista);

        if (lista.length === 0) {
          setMostrarForm(true);
          setDireccionId(null);
        } else if (!lista.some((d) => d.id === direccionId)) {
          // Si no hay una elegida (o ya no existe) se propone la principal
          setDireccionId((lista.find((d) => d.es_principal) ?? lista[0]).id);
        }
      })
      .catch(() => setError("No se pudieron cargar tus direcciones"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usarUbicacion = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Tu dispositivo no permite obtener la ubicación");
      return;
    }

    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
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

  const guardarDireccion = async () => {
    setError("");
    if (direccion.trim().length < 5)
      return setError("Escribe tu dirección completa");

    setGuardando(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/cliente/direcciones`,
        {
          etiqueta,
          direccion,
          referencia,
          latitud: coords?.lat ?? null,
          longitud: coords?.lng ?? null,
        },
        { headers },
      );

      const nueva: Direccion = res.data;
      setDirecciones((prev) => [nueva, ...prev]);
      setDireccionId(nueva.id);

      setMostrarForm(false);
      setDireccion("");
      setReferencia("");
      setCoords(null);
      setEtiqueta("Casa");
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "No se pudo guardar la dirección",
        );
      } else {
        setError("No se pudo guardar la dirección");
      }
    }
  };

  return (
    <div className="direccion-page">
      <section className="direccion-header">
        <button
          type="button"
          className="direccion-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="direccion-title">Dirección de entrega</h1>
      </section>

      {cargando && (
        <p className="direccion-status">Cargando tus direcciones...</p>
      )}
      {error && <p className="direccion-status error">{error}</p>}

      {!cargando && direcciones.length > 0 && (
        <section className="direccion-section">
          <h3 className="direccion-section-title">
            Elige dónde recibir tu pedido
          </h3>
          <div className="direccion-list">
            {direcciones.map((d) => (
              <button
                key={d.id}
                type="button"
                className="direccion-card"
                onClick={() => setDireccionId(d.id)}
              >
                <span className="direccion-card-icon">
                  <IconoDireccion etiqueta={d.etiqueta} />
                </span>
                <div className="direccion-card-info">
                  <span className="direccion-card-label">{d.etiqueta}</span>
                  <span className="direccion-card-address">{d.direccion}</span>
                  {d.referencia && (
                    <span className="direccion-card-address">
                      Ref: {d.referencia}
                    </span>
                  )}
                </div>
                <span
                  className={
                    direccionId === d.id
                      ? "direccion-radio active"
                      : "direccion-radio"
                  }
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {!cargando && !mostrarForm && (
        <button
          type="button"
          className="direccion-add-btn"
          onClick={() => setMostrarForm(true)}
        >
          <span className="direccion-add-icon">
            <Plus size={16} />
          </span>
          Añadir nueva dirección
        </button>
      )}

      {mostrarForm && (
        <section className="direccion-form">
          <h3 className="direccion-section-title">Nueva dirección</h3>

          <div className="direccion-chips">
            {etiquetas.map((e) => (
              <button
                key={e}
                type="button"
                className={
                  etiqueta === e ? "direccion-chip active" : "direccion-chip"
                }
                onClick={() => setEtiqueta(e)}
              >
                {e}
              </button>
            ))}
          </div>

          <label className="direccion-field">
            <span className="direccion-field-label">Dirección *</span>
            <input
              className="direccion-input"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Calle, número, barrio, ciudad"
              maxLength={255}
            />
          </label>

          <label className="direccion-field">
            <span className="direccion-field-label">Referencia (opcional)</span>
            <input
              className="direccion-input"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="Ej: Edificio blanco, timbre 2B"
              maxLength={255}
            />
          </label>

          <button
            type="button"
            className="direccion-loc-btn"
            onClick={usarUbicacion}
            disabled={ubicando}
          >
            <LocateFixed size={16} />
            {coords
              ? "Ubicación guardada ✓"
              : ubicando
                ? "Obteniendo ubicación..."
                : "Usar mi ubicación actual"}
          </button>
          <p className="direccion-hint">
            Ayuda al repartidor a llegar. Es opcional.
          </p>

          <div className="direccion-form-actions">
            {direcciones.length > 0 && (
              <button
                type="button"
                className="direccion-cancel-btn"
                onClick={() => setMostrarForm(false)}
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              className="direccion-save-btn"
              onClick={guardarDireccion}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar dirección"}
            </button>
          </div>
        </section>
      )}

      <div className="direccion-bottom-bar">
        <button
          type="button"
          className="direccion-continue-btn full"
          disabled={!direccionId || mostrarForm}
          onClick={() => navigate("/cliente/finalizar-pedido")}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

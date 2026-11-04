import { useEffect, useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import axios from "axios";
import {
  ErrorUbicacion,
  enlaceMapa,
  mensajeDeError,
  pedirPosicion,
  textoCoordenadas,
} from "../../utils/ubicacion";
import "../../styles/ubicacion/Ubicacion.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Guardada {
  latitud: number | null;
  longitud: number | null;
}

// En la información del restaurante: dónde está, para que los repartidores lleguen a recoger los pedidos
export default function UbicacionRestaurante() {
  const [guardada, setGuardada] = useState<Guardada | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState("");

  const cabeceras = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });
  const url = `${API_URL}/api/admin/restaurante/ubicacion`;

  useEffect(() => {
    axios
      .get(url, { headers: cabeceras() })
      .then((res) => setGuardada(res.data))
      .catch(() => setError("No se pudo cargar la ubicación del restaurante."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarAqui = async () => {
    setError("");
    setTrabajando(true);
    try {
      const p = await pedirPosicion();
      const res = await axios.put(
        url,
        { latitud: p.lat, longitud: p.lng },
        { headers: cabeceras() },
      );
      setGuardada(res.data);
    } catch (e) {
      if (e instanceof ErrorUbicacion) setError(mensajeDeError[e.motivo]);
      else
        setError(
          (e as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "No se pudo guardar la ubicación.",
        );
    } finally {
      setTrabajando(false);
    }
  };

  const quitar = async () => {
    setError("");
    setTrabajando(true);
    try {
      const res = await axios.delete(url, { headers: cabeceras() });
      setGuardada(res.data);
    } catch {
      setError("No se pudo quitar la ubicación.");
    } finally {
      setTrabajando(false);
    }
  };

  const tiene =
    guardada && guardada.latitud !== null && guardada.longitud !== null;

  return (
    <section className={tiene ? "ubic-card ok" : "ubic-card aviso"}>
      <h3 className="ubic-titulo">
        <MapPin size={18} /> Ubicación del restaurante
      </h3>

      {tiene ? (
        <p className="ubic-coord">
          {textoCoordenadas({
            lat: guardada!.latitud!,
            lng: guardada!.longitud!,
          })}{" "}
          <a
            href={enlaceMapa({
              lat: guardada!.latitud!,
              lng: guardada!.longitud!,
            })}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver en el mapa
          </a>
        </p>
      ) : (
        <p className="ubic-texto">
          Sin ubicación. Los repartidores la usan para llegar a recoger los
          pedidos y calcular la mejor ruta. Pulsa el botón{" "}
          <strong>estando en el restaurante</strong>.
        </p>
      )}

      {error && <p className="ubic-error">{error}</p>}

      <div className="ubic-acciones">
        <button
          type="button"
          className={tiene ? "ubic-btn suave" : "ubic-btn"}
          onClick={guardarAqui}
          disabled={trabajando}
        >
          <LocateFixed size={15} />{" "}
          {trabajando
            ? "Un momento..."
            : tiene
              ? "Actualizar con mi ubicación actual"
              : "Usar mi ubicación actual"}
        </button>
        {tiene && !trabajando && (
          <button type="button" className="ubic-btn suave" onClick={quitar}>
            Quitar
          </button>
        )}
      </div>
    </section>
  );
}

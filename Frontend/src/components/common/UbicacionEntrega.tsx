import { useState } from "react";
import { Check, LocateFixed, MapPin } from "lucide-react";
import {
  ErrorUbicacion,
  enlaceMapa,
  mensajeDeError,
  pedirPosicion,
  type Ubicacion,
} from "../../utils/ubicacion";
import "../../styles/ubicacion/Ubicacion.css";

interface Props {
  valor: Ubicacion | null;
  onCambio: (ubicacion: Ubicacion | null) => void;
}

// En "Finalizar pedido": el cliente le dice a la app dónde está para que el repartidor llegue a él con la mejor ruta
export default function UbicacionEntrega({ valor, onCambio }: Props) {
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");

  const usarMiUbicacion = async () => {
    setError("");
    setBuscando(true);
    try {
      onCambio(await pedirPosicion());
    } catch (e) {
      setError(
        mensajeDeError[
          e instanceof ErrorUbicacion ? e.motivo : "no_disponible"
        ],
      );
    } finally {
      setBuscando(false);
    }
  };

  return (
    <section className={valor ? "ubic-card ok" : "ubic-card"}>
      <h3 className="ubic-titulo">
        {valor ? <Check size={18} color="#16a34a" /> : <MapPin size={18} />}
        {valor ? "Ubicación de entrega detectada" : "Ubicación de entrega"}
      </h3>

      {valor ? (
        <p className="ubic-coord">
          Recibirás el pedido donde estás ahora
          {valor.precision ? ` (±${valor.precision} m)` : ""}.{" "}
          <a href={enlaceMapa(valor)} target="_blank" rel="noopener noreferrer">
            Ver en el mapa
          </a>
        </p>
      ) : (
        <p className="ubic-texto">
          Ayuda al repartidor a llegar a ti más rápido y a hacer la mejor ruta.
          Úsala solo si estás donde quieres recibir el pedido.
        </p>
      )}

      {error && <p className="ubic-error">{error}</p>}

      <div className="ubic-acciones">
        <button
          type="button"
          className={valor ? "ubic-btn suave" : "ubic-btn"}
          onClick={usarMiUbicacion}
          disabled={buscando}
        >
          <LocateFixed size={15} />{" "}
          {buscando
            ? "Buscando tu ubicación..."
            : valor
              ? "Actualizar"
              : "Usar mi ubicación actual"}
        </button>
        {valor && !buscando && (
          <button
            type="button"
            className="ubic-btn suave"
            onClick={() => onCambio(null)}
          >
            Quitar
          </button>
        )}
      </div>
    </section>
  );
}

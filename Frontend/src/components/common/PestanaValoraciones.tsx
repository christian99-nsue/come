import { useEffect, useState } from "react";
import axios from "axios";
import ValoracionesPanel, {
  type ItemValoracion,
  type ResumenValoraciones,
} from "./ValoracionesPanel";
import "../../styles/common/Valoraciones.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function PestanaValoraciones({
  restauranteId,
}: {
  restauranteId: number;
}) {
  const [datos, setDatos] = useState<{
    resumen: ResumenValoraciones;
    items: ItemValoracion[];
  } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    const cargarValoraciones = async () => {
      try {
        const res = await axios.get<{
          resumen: ResumenValoraciones;
          items: ItemValoracion[];
        }>(
          `${API_URL}/api/cliente/restaurantes/${restauranteId}/valoraciones`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (cancelado) return;

        setDatos(res.data);
        setError("");
      } catch {
        if (!cancelado) {
          setError("No se pudieron cargar las valoraciones");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    void cargarValoraciones();

    return () => {
      cancelado = true;
    };
  }, [restauranteId]);

  if (cargando) return <p className="valp-status">Cargando valoraciones...</p>;
  if (error || !datos) return <p className="valp-status error">{error}</p>;

  return (
    <ValoracionesPanel
      resumen={datos.resumen}
      items={datos.items}
      vacio="Aún no hay valoraciones. Después de recibir tu pedido podrás valorar este restaurante."
    />
  );
}

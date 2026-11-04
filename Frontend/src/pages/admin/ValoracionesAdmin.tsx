import { useEffect, useState } from "react";
import axios from "axios";
import ValoracionesPanel, {
  type ItemValoracion,
  type ResumenValoraciones,
} from "../../components/common/ValoracionesPanel";
import "../../styles/admin/AdminShared.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ValoracionesAdmin() {
  const [datos, setDatos] = useState<{
    resumen: ResumenValoraciones;
    items: ItemValoracion[];
  } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/valoraciones`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setDatos(res.data))
      .catch(() => setError("No se pudieron cargar las valoraciones"))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="admin-page">
      <section className="admin-header">
        <h1 className="admin-title">Valoraciones</h1>
      </section>

      {cargando && (
        <p className="pedidos-status-text">Cargando valoraciones...</p>
      )}
      {!cargando && error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      {datos && (
        <ValoracionesPanel
          resumen={datos.resumen}
          items={datos.items}
          vacio="Aún no tienes valoraciones. Aparecerán cuando tus clientes valoren sus pedidos entregados."
        />
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import "../../styles/admin/AdminShared.css";

const API_URL = import.meta.env.VITE_API_URL;

type Aceptacion = "manual" | "automatica";

export default function PedidosConfigAdmin() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tiempoPreparacion, setTiempoPreparacion] = useState("15");
  const [aceptacion, setAceptacion] = useState<Aceptacion>("manual");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/restaurante`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTiempoPreparacion(String(res.data.tiempo_preparacion_min));
        setAceptacion(res.data.aceptacion_pedidos);
      })
      .catch(() => setError("No se pudo cargar la configuración"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarCambios = async () => {
    setGuardando(true);
    setError("");
    try {
      await axios.patch(
        `${API_URL}/api/admin/restaurante`,
        {
          tiempo_preparacion_min: Number(tiempoPreparacion),
          aceptacion_pedidos: aceptacion,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMostrarExito(true);
    } catch {
      setError("No se pudo guardar la configuración");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="admin-page">
        <p className="pedidos-status-text">Cargando...</p>
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
        <h1 className="admin-title">Pedidos</h1>
      </section>

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      <div className="admin-form-field">
        <span className="admin-form-label">Tiempo de preparación (min)</span>
        <input
          type="number"
          value={tiempoPreparacion}
          onChange={(e) => setTiempoPreparacion(e.target.value)}
          className="admin-form-input"
        />
      </div>

      <h3 className="admin-section-title-sm">Aceptación de pedidos</h3>
      <div className="admin-menu-list">
        <button
          type="button"
          className={
            aceptacion === "manual"
              ? "admin-radio-card active"
              : "admin-radio-card"
          }
          onClick={() => setAceptacion("manual")}
        >
          <div className="admin-menu-label-col">
            <span className="admin-menu-label">Manual</span>
            <span className="admin-menu-sublabel">
              Tú decides si aceptas o rechazas cada pedido
            </span>
          </div>
          <span
            className={
              aceptacion === "manual"
                ? "admin-radio-dot active"
                : "admin-radio-dot"
            }
          />
        </button>

        <button
          type="button"
          className={
            aceptacion === "automatica"
              ? "admin-radio-card active"
              : "admin-radio-card"
          }
          onClick={() => setAceptacion("automatica")}
        >
          <div className="admin-menu-label-col">
            <span className="admin-menu-label">Automática</span>
            <span className="admin-menu-sublabel">
              Los pedidos se aceptan solos al recibirse
            </span>
          </div>
          <span
            className={
              aceptacion === "automatica"
                ? "admin-radio-dot active"
                : "admin-radio-dot"
            }
          />
        </button>
      </div>

      <button
        type="button"
        className="admin-btn-primary"
        onClick={guardarCambios}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>

      <CambiosGuardadosOverlay
        open={mostrarExito}
        onContinuar={() => navigate("/admin/configuracion", { replace: true })}
      />
    </div>
  );
}

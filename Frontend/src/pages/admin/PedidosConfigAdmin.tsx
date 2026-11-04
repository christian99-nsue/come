import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import { useRestauranteAdmin } from "../../hooks/useRestauranteAdmin";
import "../../styles/admin/AdminShared.css";

const API_URL = import.meta.env.VITE_API_URL;

type Aceptacion = "manual" | "automatica";

export default function PedidosConfigAdmin() {
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const { actualizar } = useRestauranteAdmin();

  const [tiempoPreparacion, setTiempoPreparacion] = useState("15");
  const [costoEnvio, setCostoEnvio] = useState("0");
  const [pedidoMinimo, setPedidoMinimo] = useState("0");
  const [aceptacion, setAceptacion] = useState<Aceptacion>("manual");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/restaurante`, { headers })
      .then((res) => {
        setTiempoPreparacion(String(res.data.tiempo_preparacion_min));
        setCostoEnvio(String(res.data.costo_envio));
        setPedidoMinimo(String(res.data.pedido_minimo));
        setAceptacion(res.data.aceptacion_pedidos);
      })
      .catch(() => setError("No se pudo cargar la configuración"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tiempo = Number(tiempoPreparacion);
  const envio = Number(costoEnvio);
  const minimo = Number(pedidoMinimo);

  const guardarCambios = async () => {
    setError("");

    if (!Number.isInteger(tiempo) || tiempo < 5 || tiempo > 180) {
      return setError(
        "El tiempo de preparación debe estar entre 5 y 180 minutos",
      );
    }
    if (costoEnvio === "" || !Number.isFinite(envio) || envio < 0) {
      return setError("Introduce un costo de envío válido (0 o más)");
    }
    if (pedidoMinimo === "" || !Number.isFinite(minimo) || minimo < 0) {
      return setError("Introduce un pedido mínimo válido (0 o más)");
    }

    setGuardando(true);
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/restaurante`,
        {
          tiempo_preparacion_min: tiempo,
          costo_envio: envio,
          pedido_minimo: minimo,
          aceptacion_pedidos: aceptacion,
        },
        { headers },
      );
      actualizar(res.data);
      setMostrarExito(true);
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "No se pudo guardar la configuración",
        );
      } else {
        setError("No se pudo guardar la configuración");
      }
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
          inputMode="numeric"
          min={5}
          max={180}
          value={tiempoPreparacion}
          onChange={(e) => setTiempoPreparacion(e.target.value)}
          className="admin-form-input"
        />
        <span className="admin-form-hint">
          Los clientes verán un rango: de este tiempo a este tiempo más 10
          minutos de reparto.
        </span>
      </div>

      <div className="admin-form-field">
        <span className="admin-form-label">Costo de envío</span>
        <div className="admin-input-suffix-wrap">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={costoEnvio}
            onChange={(e) => setCostoEnvio(e.target.value)}
            className="admin-form-input"
          />
          <span className="admin-input-suffix">XAF</span>
        </div>
        <span className="admin-form-hint">
          Lo paga el cliente y es lo que gana el repartidor por la entrega.
        </span>
        {envio === 0 && (
          <span className="admin-form-warning">
            Con envío gratis el repartidor no gana nada por la entrega, y es
            probable que nadie tome tus pedidos.
          </span>
        )}
      </div>

      <div className="admin-form-field">
        <span className="admin-form-label">Pedido mínimo</span>
        <div className="admin-input-suffix-wrap">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={pedidoMinimo}
            onChange={(e) => setPedidoMinimo(e.target.value)}
            className="admin-form-input"
          />
          <span className="admin-input-suffix">XAF</span>
        </div>
        <span className="admin-form-hint">
          Subtotal mínimo para poder pedir, sin contar el envío. Con 0 no hay
          mínimo.
        </span>
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
              Los pedidos se aceptan solos al recibirse (el cliente ya no podrá
              cancelarlos desde la app)
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

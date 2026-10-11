import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Banknote, Landmark, CreditCard } from "lucide-react";
import CambiosGuardadosOverlay from "../../components/common/CambiosGuardadosOverlay";
import "../../styles/admin/AdminShared.css";

const API_URL = import.meta.env.VITE_API_URL;

type Metodo = "efectivo" | "transferencia" | "tarjeta";

const metodosDisponibles: {
  id: Metodo;
  label: string;
  icon: typeof Banknote;
}[] = [
  { id: "efectivo", label: "Efectivo", icon: Banknote },
  { id: "transferencia", label: "Transferencia bancaria", icon: Landmark },
  { id: "tarjeta", label: "Tarjeta de débito/crédito", icon: CreditCard },
];

export default function PagosConfigAdmin() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [seleccionados, setSeleccionados] = useState<Metodo[]>(["efectivo"]);
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
        if (res.data.metodos_pago_aceptados) {
          setSeleccionados(JSON.parse(res.data.metodos_pago_aceptados));
        }
      })
      .catch(() => setError("No se pudo cargar la configuración"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMetodo = (metodo: Metodo) => {
    setSeleccionados((prev) =>
      prev.includes(metodo)
        ? prev.filter((m) => m !== metodo)
        : [...prev, metodo],
    );
  };

  const guardarCambios = async () => {
    if (seleccionados.length === 0) {
      setError("Debes aceptar al menos un método de pago");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await axios.patch(
        `${API_URL}/api/admin/restaurante`,
        { metodos_pago_aceptados: JSON.stringify(seleccionados) },
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
        <h1 className="admin-title">Pagos</h1>
      </section>

      <p
        className="pedidos-status-text"
        style={{ margin: "0 0 16px", textAlign: "left" }}
      >
        Selecciona los métodos que tu restaurante acepta de los clientes.
      </p>

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      <div className="admin-menu-list">
        {metodosDisponibles.map((m) => {
          const Icon = m.icon;
          const activo = seleccionados.includes(m.id);
          return (
            <div key={m.id} className="admin-toggle-row">
              <span className="admin-icon-box">
                <Icon size={17} />
              </span>
              <span className="admin-menu-label">{m.label}</span>
              <button
                type="button"
                className={activo ? "toggle-switch active" : "toggle-switch"}
                onClick={() => toggleMetodo(m.id)}
                aria-label={`Activar/desactivar ${m.label}`}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          );
        })}
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

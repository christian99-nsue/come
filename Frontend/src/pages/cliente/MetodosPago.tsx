import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Banknote,
  Landmark,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import "../../styles/cliente/MetodosPago.css";

const API_URL = import.meta.env.VITE_API_URL;

type Metodo = "efectivo" | "transferencia" | "tarjeta";

const metodos: {
  id: Metodo;
  titulo: string;
  detalle: string;
  icon: typeof Banknote;
}[] = [
  {
    id: "efectivo",
    titulo: "Efectivo",
    detalle: "Pagas al recibir tu pedido",
    icon: Banknote,
  },
  {
    id: "transferencia",
    titulo: "Transferencia bancaria",
    detalle: "El restaurante te indica los datos para transferir",
    icon: Landmark,
  },
  {
    id: "tarjeta",
    titulo: "Tarjeta de débito/crédito",
    detalle: "El restaurante coordina el cobro contigo",
    icon: CreditCard,
  },
];

export default function MetodosPago() {
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const [preferido, setPreferido] = useState<Metodo>("efectivo");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/cliente/perfil`, { headers })
      .then((res) => setPreferido(res.data.metodo_pago_preferido))
      .catch(() => setError("No se pudo cargar tu preferencia"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Se guarda al tocar la opción (no hay botón de guardar)
  const elegir = async (metodo: Metodo) => {
    if (guardando || metodo === preferido) return;

    const anterior = preferido;
    setPreferido(metodo); // se refleja al instante
    setGuardando(true);
    setError("");

    try {
      await axios.patch(
        `${API_URL}/api/cliente/perfil`,
        { metodo_pago_preferido: metodo },
        { headers },
      );
    } catch (err: unknown) {
      setPreferido(anterior); // Si falla, vuelve al valor anterior

      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "No se pudo guardar tu preferencia",
        );
      } else {
        setError("No se pudo guardar tu preferencia");
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="metodos-page">
      <section className="metodos-header">
        <button
          type="button"
          className="metodos-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="metodos-title">Métodos de pago</h1>
      </section>

      <p className="metodos-intro">
        Elige cómo prefieres pagar. Lo usaremos como opción inicial al finalizar
        un pedido.
      </p>

      {cargando && <p className="metodos-status">Cargando...</p>}
      {error && <p className="metodos-status error">{error}</p>}

      {!cargando && (
        <div className="metodos-list">
          {metodos.map((m) => {
            const Icon = m.icon;
            const activo = preferido === m.id;
            return (
              <button
                key={m.id}
                type="button"
                className={activo ? "metodo-item active" : "metodo-item"}
                onClick={() => elegir(m.id)}
              >
                <span className="metodo-item-icon">
                  <Icon size={18} />
                </span>
                <div className="metodo-item-body">
                  <span className="metodo-item-title">{m.titulo}</span>
                  <span className="metodo-item-detail">{m.detalle}</span>
                </div>
                {activo && <span className="metodo-item-badge">Preferido</span>}
                <span
                  className={
                    activo ? "metodo-item-dot active" : "metodo-item-dot"
                  }
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="metodos-security-banner">
        <span className="metodos-security-icon">
          <ShieldCheck size={20} />
        </span>
        <div className="metodos-security-text">
          <span className="metodos-security-title">
            No guardamos datos de tarjetas ni cuentas
          </span>
          <span className="metodos-security-subtitle">
            El pago se coordina con el restaurante. Si el restaurante no acepta
            tu método preferido, podrás elegir otro al finalizar el pedido.
          </span>
        </div>
      </div>
    </div>
  );
}

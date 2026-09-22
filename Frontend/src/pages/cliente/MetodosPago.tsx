import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Banknote,
  Landmark,
  CreditCard,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import "../../styles/cliente/MetodosPago.css";

type TipoMetodo = "efectivo" | "transferencia" | "tarjeta";

interface Metodo {
  id: string;
  tipo: TipoMetodo;
  titulo: string;
  detalle: string;
  predeterminado?: boolean;
}

const metodosMock: Metodo[] = [
  {
    id: "1",
    tipo: "efectivo",
    titulo: "Efectivo",
    detalle: "Pago contra entrega",
    predeterminado: true,
  },
  {
    id: "2",
    tipo: "transferencia",
    titulo: "Transferencia bancaria",
    detalle: "**** 4582",
  },
  {
    id: "3",
    tipo: "tarjeta",
    titulo: "Tarjeta de débito/crédito",
    detalle: "**** 3241",
  },
];

function iconoPara(tipo: TipoMetodo) {
  switch (tipo) {
    case "transferencia":
      return <Landmark size={18} />;
    case "tarjeta":
      return <CreditCard size={18} />;
    default:
      return <Banknote size={18} />;
  }
}

export default function MetodosPago() {
  const navigate = useNavigate();
  const [metodos] = useState<Metodo[]>(metodosMock);

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
        <button
          type="button"
          className="metodos-add-btn"
          aria-label="Añadir método de pago"
        >
          <Plus size={20} />
        </button>
      </section>

      <div className="metodos-list">
        {metodos.map((m) => (
          <button key={m.id} type="button" className="metodo-item">
            <span className="metodo-item-icon">{iconoPara(m.tipo)}</span>
            <div className="metodo-item-body">
              <span className="metodo-item-title">{m.titulo}</span>
              <span className="metodo-item-detail">{m.detalle}</span>
            </div>
            {m.predeterminado && (
              <span className="metodo-item-badge">Predeterminado</span>
            )}
            <ChevronRight size={18} className="metodo-item-chevron" />
          </button>
        ))}
      </div>

      <button type="button" className="metodos-add-new-btn">
        <span className="metodos-add-new-icon">
          <Plus size={18} />
        </span>
        Añadir método de pago
      </button>

      <div className="metodos-security-banner">
        <span className="metodos-security-icon">
          <ShieldCheck size={20} />
        </span>
        <div className="metodos-security-text">
          <span className="metodos-security-title">
            Tus datos de pago están protegidos
          </span>
          <span className="metodos-security-subtitle">
            Utilizamos tecnología de seguridad para mantener tu información
            segura.
          </span>
        </div>
      </div>
    </div>
  );
}

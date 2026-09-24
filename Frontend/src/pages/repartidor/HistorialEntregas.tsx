import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import burger from "../../assets/burger1.png";
import chicken from "../../assets/chicken.png";
import pizza from "../../assets/shawarma.png";
import "../../styles/repartidor/RepartidorShared.css";

type Rango = "hoy" | "semana" | "mes";

interface EntregaHistorial {
  id: string;
  numero: string;
  restaurante: string;
  logo: string;
  hora: string;
  estado: "Entregado";
  grupo: "Hoy" | "Ayer";
}

const historialMock: EntregaHistorial[] = [
  {
    id: "1",
    numero: "#FL-2841",
    restaurante: "Burger House",
    logo: burger,
    hora: "23:15",
    estado: "Entregado",
    grupo: "Hoy",
  },
  {
    id: "2",
    numero: "#FL-2842",
    restaurante: "Pizza Top",
    logo: pizza,
    hora: "21:42",
    estado: "Entregado",
    grupo: "Hoy",
  },
  {
    id: "3",
    numero: "#FL-2843",
    restaurante: "Sabor Africano",
    logo: chicken,
    hora: "19:30",
    estado: "Entregado",
    grupo: "Hoy",
  },
  {
    id: "4",
    numero: "#FL-2819",
    restaurante: "Chicken Spot",
    logo: chicken,
    hora: "19:12",
    estado: "Entregado",
    grupo: "Ayer",
  },
  {
    id: "5",
    numero: "#FL-2818",
    restaurante: "Pizza Top",
    logo: pizza,
    hora: "17:45",
    estado: "Entregado",
    grupo: "Ayer",
  },
];

export default function HistorialEntregas() {
  const navigate = useNavigate();
  const [rango, setRango] = useState<Rango>("hoy");

  const grupos = Array.from(new Set(historialMock.map((h) => h.grupo)));

  return (
    <div className="rep-page">
      <section className="rep-header">
        <button
          type="button"
          className="rep-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="rep-title">Historial de entregas</h1>
      </section>

      <div className="rep-tabs-row">
        {(["hoy", "semana", "mes"] as Rango[]).map((r) => (
          <button
            key={r}
            type="button"
            className={rango === r ? "rep-tab-btn active" : "rep-tab-btn"}
            onClick={() => setRango(r)}
          >
            {r === "hoy" ? "Hoy" : r === "semana" ? "Esta semana" : "Este mes"}
          </button>
        ))}
      </div>

      {grupos.map((grupo) => (
        <div key={grupo} className="rep-history-group">
          <h3 className="rep-section-title-sm">{grupo}</h3>
          <div className="rep-history-list">
            {historialMock
              .filter((h) => h.grupo === grupo)
              .map((h) => (
                <button key={h.id} type="button" className="rep-history-item">
                  <img
                    src={h.logo}
                    alt={h.restaurante}
                    className="rep-history-img"
                  />
                  <div className="rep-history-info">
                    <div className="rep-history-number">{h.numero}</div>
                    <div className="rep-history-restaurant">
                      {h.restaurante}
                    </div>
                    <div className="rep-history-meta">
                      {h.hora} · {h.estado}
                    </div>
                  </div>
                  <ChevronRight size={16} color="#9ca3af" />
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

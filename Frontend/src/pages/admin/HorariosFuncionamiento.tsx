import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/HorariosFuncionamiento.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Horario {
  dia_semana: number;
  hora_apertura: string;
  hora_cierre: string;
  cerrado: boolean;
}

const nombresDias = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function HorariosFuncionamiento() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/restaurante/horarios`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHorarios(res.data))
      .catch(() => setError("No se pudieron cargar los horarios"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actualizarDia = (dia: number, cambios: Partial<Horario>) => {
    setHorarios((prev) =>
      prev.map((h) => (h.dia_semana === dia ? { ...h, ...cambios } : h)),
    );
  };

  const guardarCambios = async () => {
    setGuardando(true);
    setError("");
    try {
      await axios.put(
        `${API_URL}/api/admin/restaurante/horarios`,
        { horarios },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate(-1);
    } catch {
      setError("No se pudieron guardar los horarios");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="admin-page">
        <p className="pedidos-status-text">Cargando horarios...</p>
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
        <h1 className="admin-title">Horarios de funcionamiento</h1>
      </section>

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      <div className="horarios-list">
        {horarios
          .slice()
          .sort((a, b) => a.dia_semana - b.dia_semana)
          .map((h) => (
            <div key={h.dia_semana} className="horario-row">
              <div className="horario-row-top">
                <span className="horario-dia">{nombresDias[h.dia_semana]}</span>
                <button
                  type="button"
                  className={
                    !h.cerrado ? "toggle-switch active" : "toggle-switch"
                  }
                  onClick={() =>
                    actualizarDia(h.dia_semana, { cerrado: !h.cerrado })
                  }
                  aria-label={`Activar/desactivar ${nombresDias[h.dia_semana]}`}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
              {!h.cerrado ? (
                <div className="horario-inputs">
                  <input
                    type="time"
                    value={h.hora_apertura}
                    onChange={(e) =>
                      actualizarDia(h.dia_semana, {
                        hora_apertura: e.target.value,
                      })
                    }
                    className="horario-time-input"
                  />
                  <span className="horario-dash">—</span>
                  <input
                    type="time"
                    value={h.hora_cierre}
                    onChange={(e) =>
                      actualizarDia(h.dia_semana, {
                        hora_cierre: e.target.value,
                      })
                    }
                    className="horario-time-input"
                  />
                </div>
              ) : (
                <span className="horario-cerrado-label">
                  Cerrado todo el día
                </span>
              )}
            </div>
          ))}
      </div>

      <button
        type="button"
        className="admin-btn-primary"
        onClick={guardarCambios}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar horarios"}
      </button>
    </div>
  );
}

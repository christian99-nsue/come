import { useEffect, useState } from "react";
import axios from "axios";
import { Truck } from "lucide-react";
import "../../styles/common/VentanasEntrega.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Grupo {
  etiqueta: string;
  dias: number[];
  ventanas: { inicio: string; fin: string }[];
}

interface Datos {
  minutos_corte: number;
  dia_hoy: number;
  grupos: Grupo[];
  sin_entregas: string[];
}

const enMinuscula = (texto: string) =>
  texto.charAt(0).toLowerCase() + texto.slice(1);

export default function HorarioEntregas() {
  const [datos, setDatos] = useState<Datos | null>(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/cliente/ventanas/horario`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setDatos(res.data))
      .catch(() => setDatos(null));
  }, []);

  // Si no se pudo cargar, no se enseña nada: no se alarma por algo que no depende de esta pantalla
  if (!datos) return null;

  return (
    <section className="horario-ent">
      <h3 className="horario-ent-title">
        <Truck size={16} /> Horario de entregas
      </h3>

      {datos.grupos.length === 0 ? (
        <p className="horario-ent-vacio">
          Por ahora no hay horarios de entrega publicados.
        </p>
      ) : (
        datos.grupos.map((g) => {
          const esHoy = g.dias.includes(datos.dia_hoy);
          return (
            <div
              key={g.etiqueta}
              className={esHoy ? "horario-ent-grupo hoy" : "horario-ent-grupo"}
            >
              <div className="horario-ent-dias">
                {g.etiqueta}
                {esHoy && <span className="horario-ent-hoy">Hoy</span>}
              </div>
              <div className="horario-ent-rangos">
                {g.ventanas.map((v) => (
                  <span
                    key={`${v.inicio}-${v.fin}`}
                    className="horario-ent-rango"
                  >
                    {v.inicio} – {v.fin}
                  </span>
                ))}
              </div>
            </div>
          );
        })
      )}

      {datos.grupos.length > 0 && datos.sin_entregas.length > 0 && (
        <p className="horario-ent-sin">
          Sin entregas: {datos.sin_entregas.map(enMinuscula).join(", ")}.
        </p>
      )}

      <p className="horario-ent-nota">
        Tu pedido llega dentro de la ventana que elijas. Puedes pedir hasta{" "}
        {datos.minutos_corte} minutos antes de que abra.
      </p>
    </section>
  );
}

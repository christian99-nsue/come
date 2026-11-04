import Estrellas from "./Estrellas";
import "../../styles/common/Valoraciones.css";

export interface ResumenValoraciones {
  promedio: number;
  total: number;
  distribucion: Record<string, number>; // "1" ... "5"
}

export interface ItemValoracion {
  id: number;
  nombre: string;
  estrellas: number;
  comentario: string | null;
  fecha_creacion: string;
  codigo?: string;
}

interface ValoracionesPanelProps {
  resumen: ResumenValoraciones;
  items: ItemValoracion[];
  vacio?: string;
}

function tiempoRelativo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "Ahora mismo";
  if (min < 60) return `Hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "Hace 1 día";
  if (dias < 30) return `Hace ${dias} días`;
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ValoracionesPanel({
  resumen,
  items,
  vacio,
}: ValoracionesPanelProps) {
  if (resumen.total === 0) {
    return <p className="valp-empty">{vacio ?? "Aún no hay valoraciones."}</p>;
  }

  return (
    <div>
      <div className="valp-summary">
        <div className="valp-summary-left">
          <span className="valp-score">{resumen.promedio.toFixed(1)}</span>
          <Estrellas valor={Math.round(resumen.promedio)} size={14} />
          <span className="valp-count">
            {resumen.total}{" "}
            {resumen.total === 1 ? "valoración" : "valoraciones"}
          </span>
        </div>

        <div className="valp-bars">
          {[5, 4, 3, 2, 1].map((n) => {
            const cantidad = resumen.distribucion[String(n)] || 0;
            const porcentaje = (cantidad / resumen.total) * 100;
            return (
              <div className="valp-bar-row" key={n}>
                <span className="valp-bar-label">{n}</span>
                <div className="valp-bar-track">
                  <div
                    className="valp-bar-fill"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <span className="valp-bar-count">{cantidad}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="valp-list">
        {items.map((v) => (
          <div className="valp-item" key={v.id}>
            <div className="valp-avatar">
              {v.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="valp-body">
              <div className="valp-top">
                <span className="valp-name">{v.nombre}</span>
                <span className="valp-date">
                  {tiempoRelativo(v.fecha_creacion)}
                </span>
              </div>
              <Estrellas valor={v.estrellas} size={13} />
              {v.comentario && <p className="valp-comment">{v.comentario}</p>}
              {v.codigo && <span className="valp-code">Pedido {v.codigo}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

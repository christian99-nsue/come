import { Check, Clock } from "lucide-react";
import { useVentanas } from "../../hooks/useVentanas";
import {
  cierraPronto,
  textoCierraEn,
  textoCierre,
  type VentanaOpcion,
} from "../../utils/ventanas";
import "../../styles/common/VentanasEntrega.css";

interface Props {
  ventanas: VentanaOpcion[] | null;
  error: boolean;
  seleccion: { id: number; fecha: string } | null;
  onElegir: (v: VentanaOpcion) => void;
  aviso?: string;
}

export default function VentanasEntrega({
  ventanas,
  error,
  seleccion,
  onElegir,
  aviso,
}: Props) {
  const { hoy } = useVentanas();

  // Las ventanas vienen ordenadas; se agrupan por día
  const grupos: { dia: string; items: VentanaOpcion[] }[] = [];
  for (const v of ventanas ?? []) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.dia === v.etiqueta_dia) ultimo.items.push(v);
    else grupos.push({ dia: v.etiqueta_dia, items: [v] });
  }

  return (
    <section className="vent-section">
      <h3 className="vent-title">Elige tu ventana de entrega</h3>
      <p className="vent-sub">
        Tu pedido llegará dentro de la ventana que elijas. Se puede pedir hasta
        30 minutos antes de que abra.
      </p>

      {aviso && <p className="vent-aviso">{aviso}</p>}
      {error && !ventanas && (
        <p className="vent-vacio">
          No se pudieron cargar las ventanas de entrega.
        </p>
      )}
      {!error && !ventanas && (
        <p className="vent-vacio">Cargando ventanas...</p>
      )}

      {ventanas && ventanas.length === 0 && (
        <p className="vent-vacio">
          Por ahora no hay ventanas de entrega disponibles. Vuelve a intentarlo
          más tarde.
        </p>
      )}

      {grupos.map((g) => (
        <div key={g.dia} className="vent-grupo">
          <span className="vent-dia">{g.dia}</span>

          {g.items.map((v) => {
            const activa =
              seleccion?.id === v.ventana_id && seleccion.fecha === v.fecha;
            return (
              <button
                key={`${v.ventana_id}-${v.fecha}`}
                type="button"
                className={activa ? "vent-card active" : "vent-card"}
                onClick={() => onElegir(v)}
              >
                <Clock size={18} />
                <div className="vent-card-body">
                  <span className="vent-rango">
                    {v.inicio} – {v.fin}
                  </span>
                  <span
                    className={
                      cierraPronto(v) ? "vent-cierre pronto" : "vent-cierre"
                    }
                  >
                    {textoCierre(v, hoy)}
                    {cierraPronto(v) ? ` · ${textoCierraEn(v)}` : ""}
                  </span>
                </div>
                {activa && <Check size={18} />}
              </button>
            );
          })}
        </div>
      ))}
    </section>
  );
}

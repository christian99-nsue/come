import { Clock } from "lucide-react";
import "../../styles/common/VentanasEntrega.css";

export default function EntregaPrevista({
  entrega,
}: {
  entrega:
    | { etiqueta_dia: string; inicio: string; fin: string }
    | null
    | undefined;
}) {
  if (!entrega) return null;

  return (
    <div className="vent-prevista">
      <Clock size={16} />
      <span>
        Entrega prevista:{" "}
        <strong>
          {entrega.etiqueta_dia}, {entrega.inicio} – {entrega.fin}
        </strong>
      </span>
    </div>
  );
}

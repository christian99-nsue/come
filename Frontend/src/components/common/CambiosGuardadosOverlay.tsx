import { Check, ArrowRight } from "lucide-react";
import "../../styles/common/CambiosGuardadosOverlay.css";

interface CambiosGuardadosOverlayProps {
  open: boolean;
  onContinuar: () => void;
  titulo?: string;
}

export default function CambiosGuardadosOverlay({
  open,
  onContinuar,
  titulo = "Cambios guardados correctamente",
}: CambiosGuardadosOverlayProps) {
  if (!open) return null;

  return (
    <div className="cg-overlay">
      <div className="cg-content">
        <div className="cg-check-wrapper">
          <div className="cg-check-ring-outer" />
          <div className="cg-check-ring-inner" />
          <div className="cg-check-circle">
            <Check size={40} strokeWidth={3} />
          </div>
          <span className="cg-ray cg-ray-1" />
          <span className="cg-ray cg-ray-2" />
          <span className="cg-ray cg-ray-3" />
          <span className="cg-ray cg-ray-4" />
        </div>

        <h2 className="cg-title">{titulo}</h2>
      </div>

      <button type="button" className="cg-continue-btn" onClick={onContinuar}>
        Continuar <ArrowRight size={18} />
      </button>
    </div>
  );
}

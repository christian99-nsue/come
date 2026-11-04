import { Star } from "lucide-react";

interface EstrellasProps {
  valor: number; // de 0 a 5
  size?: number;
  onChange?: (nuevo: number) => void; // si se pasa, las estrellas se pueden tocar
}

export default function Estrellas({
  valor,
  size = 16,
  onChange,
}: EstrellasProps) {
  return (
    <div
      className="estrellas"
      role={onChange ? "radiogroup" : "img"}
      aria-label={onChange ? "Elige tu valoración" : `${valor} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const activa = n <= valor;
        const icono = (
          <Star
            size={size}
            fill={activa ? "#f59e0b" : "none"}
            color={activa ? "#f59e0b" : "#d1d5db"}
          />
        );

        return onChange ? (
          <button
            key={n}
            type="button"
            className="estrella-btn"
            role="radio"
            aria-checked={n === valor}
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            onClick={() => onChange(n)}
          >
            {icono}
          </button>
        ) : (
          <span key={n} className="estrella">
            {icono}
          </span>
        );
      })}
    </div>
  );
}

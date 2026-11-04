import { Heart } from "lucide-react";
import "../../styles/common/CorazonFavorito.css";

interface CorazonFavoritoProps {
  activo: boolean;
  onCambiar: (nuevoValor: boolean) => void;
  variante?: "tarjeta" | "hero"; // "hero" es el botón blanco sobre la foto del restaurante
}

export default function CorazonFavorito({
  activo,
  onCambiar,
  variante = "tarjeta",
}: CorazonFavoritoProps) {
  return (
    <button
      type="button"
      className={variante === "hero" ? "detalle-hero-btn" : "corazon-fav"}
      aria-label={activo ? "Quitar de favoritos" : "Guardar en favoritos"}
      aria-pressed={activo}
      onClick={(e) => {
        e.stopPropagation(); // dentro de una tarjeta, no debe abrir el restaurante
        onCambiar(!activo);
      }}
    >
      <Heart
        size={19}
        fill={activo ? "#dc2626" : "none"}
        color={activo ? "#dc2626" : "#6b7280"}
      />
    </button>
  );
}

import { useOutletContext } from "react-router-dom";
import type { ContextoAdmin } from "../types/restauranteAdmin";

// Datos del restaurante ya cargados por el layout, y la forma de actualizarlos
export function useRestauranteAdmin() {
  return useOutletContext<ContextoAdmin>();
}

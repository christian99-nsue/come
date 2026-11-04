import { useContext } from "react";
import { VentanasContext } from "../context/VentanasContext";

export function useVentanas() {
  const contexto = useContext(VentanasContext);

  if (!contexto) {
    throw new Error("useVentanas debe usarse dentro de VentanasProvider");
  }

  return contexto;
}

export type { VentanaOpcion } from "../utils/ventanas";

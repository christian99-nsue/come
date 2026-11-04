import { createContext } from "react";
import type { VentanaOpcion } from "../utils/ventanas";

interface ValorVentanas {
  ventanas: VentanaOpcion[] | null;
  hoy: string | null;
  error: boolean;
  recargar: () => void;
  reemplazar: (ventanas: VentanaOpcion[]) => void;
}

export const VentanasContext = createContext<ValorVentanas | null>(null);

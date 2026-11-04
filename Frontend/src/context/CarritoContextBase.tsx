import { createContext } from "react";
import type { CarritoContextType } from "./CarritoContext";

export const CarritoContext = createContext<CarritoContextType | null>(null);

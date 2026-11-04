import { useCallback, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { VentanasContext } from "./VentanasContext";
import type { VentanaOpcion } from "../utils/ventanas";

const API_URL = import.meta.env.VITE_API_URL;

export function VentanasProvider({ children }: { children: ReactNode }) {
  const [ventanas, setVentanas] = useState<VentanaOpcion[] | null>(null);
  const [hoy, setHoy] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const cargar = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`${API_URL}/api/cliente/ventanas`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setVentanas(res.data.ventanas);
        setHoy(res.data.hoy ?? null);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  // Actualiza las ventanas cada 30 segundos y cuando el usuario vuelve a la pestaña.
  useEffect(() => {
    cargar();

    const intervalo = setInterval(cargar, 30000);

    const alVolver = () => {
      if (document.visibilityState === "visible") {
        cargar();
      }
    };

    document.addEventListener("visibilitychange", alVolver);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [cargar]);

  return (
    <VentanasContext.Provider
      value={{
        ventanas,
        hoy,
        error,
        recargar: cargar,
        reemplazar: setVentanas,
      }}
    >
      {children}
    </VentanasContext.Provider>
  );
}

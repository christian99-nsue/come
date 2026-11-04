import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Cuántas notificaciones sin leer tiene el cliente. Se actualiza al cambiar de pantalla,
// cada 30 segundos y al instante cuando la pantalla de notificaciones avisa de un cambio.
export function useNoLeidasCliente() {
  const location = useLocation();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const cargar = () => {
      axios
        .get(`${API_URL}/api/cliente/notificaciones/no-leidas`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setTotal(res.data.total))
        .catch(() => {});
    };

    cargar();
    const intervalo = setInterval(cargar, 30000);
    window.addEventListener("notificaciones-cliente", cargar);

    return () => {
      clearInterval(intervalo);
      window.removeEventListener("notificaciones-cliente", cargar);
    };
  }, [location.pathname]);

  return total;
}

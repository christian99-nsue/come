import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ConfirmModal from "../components/common/ConfirmModal";
import {
  MAX_POR_PLATO,
  type ItemCarrito,
  type RestauranteCarrito,
} from "../context/CarritoContext";
import { useCarrito } from "../context/useCarrito";

const API_URL = import.meta.env.VITE_API_URL;

interface Preparado {
  restaurante: RestauranteCarrito;
  items: ItemCarrito[];
  noDisponibles: number;
}

interface ItemPedidoRespuesta {
  plato_id: number;
  nombre: string;
  precio: number;
  imagen: string | null;
  cantidad: number;
}

interface PedidoRespuesta {
  restaurante: RestauranteCarrito;
  items: ItemPedidoRespuesta[];
  no_disponibles: number;
}

interface ErrorRespuesta {
  message?: string;
}

export function useRepetirPedido() {
  const navigate = useNavigate();
  const { items: itemsEnCarrito, reemplazarTodo } = useCarrito();

  const [ocupado, setOcupado] = useState<number | null>(null);
  const [aviso, setAviso] = useState("");
  const [pendiente, setPendiente] = useState<Preparado | null>(null);

  const terminar = (p: Preparado) => {
    reemplazarTodo(p.restaurante, p.items);

    const falta = p.noDisponibles;

    navigate("/cliente/carrito", {
      state:
        falta > 0
          ? {
              aviso: `${falta} ${
                falta === 1
                  ? "producto ya no está disponible y no se añadió"
                  : "productos ya no están disponibles y no se añadieron"
              }.`,
            }
          : undefined,
    });
  };

  const repetir = async (pedidoId: number) => {
    setAviso("");
    setOcupado(pedidoId);

    try {
      const res = await axios.get<PedidoRespuesta>(
        `${API_URL}/api/cliente/pedidos/${pedidoId}/repetir`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const datos = res.data;

      if (datos.items.length === 0) {
        setAviso(
          "Ninguno de los productos de este pedido está disponible ahora.",
        );
        return;
      }

      const preparado: Preparado = {
        restaurante: {
          id: datos.restaurante.id,
          nombre: datos.restaurante.nombre,
        },
        items: datos.items.map((i) => ({
          plato_id: i.plato_id,
          nombre: i.nombre,
          precio: i.precio,
          imagen: i.imagen,
          cantidad: Math.min(i.cantidad, MAX_POR_PLATO),
        })),
        noDisponibles: datos.no_disponibles,
      };

      // Si ya hay productos en el carrito, se pregunta antes de reemplazarlos.
      if (itemsEnCarrito.length > 0) {
        setPendiente(preparado);
      } else {
        terminar(preparado);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError<ErrorRespuesta>(err)) {
        setAviso(err.response?.data?.message || "No se pudo repetir el pedido");
      } else {
        setAviso("No se pudo repetir el pedido");
      }
    } finally {
      setOcupado(null);
    }
  };

  const modalConfirmacion = (
    <ConfirmModal
      open={pendiente !== null}
      title="¿Reemplazar tu carrito?"
      message="Tu carrito ya tiene productos. Si sigues, se reemplazarán por los de este pedido."
      confirmLabel="Reemplazar carrito"
      cancelLabel="Cancelar"
      danger
      onConfirm={() => {
        if (pendiente) terminar(pendiente);
        setPendiente(null);
      }}
      onCancel={() => setPendiente(null)}
    />
  );

  return { repetir, ocupado, aviso, modalConfirmacion };
}

import { useEffect, useState, type ReactNode } from "react";
import { CarritoContext } from "./CarritoContextBase";
import { getUser } from "../utils/auth";
import type { Ubicacion } from "../utils/ubicacion";

export const MAX_POR_PLATO = 20;

export interface ItemCarrito {
  plato_id: number;
  nombre: string;
  precio: number;
  imagen: string | null;
  cantidad: number;
}

export interface RestauranteCarrito {
  id: number;
  nombre: string;
}

export interface VentanaCarrito {
  id: number;
  fecha: string;
}

interface EstadoCarrito {
  restaurante: RestauranteCarrito | null;
  items: ItemCarrito[];
  direccionId: number | null;
  metodoPago: string | null;
  ventana: VentanaCarrito | null;
  ubicacion: Ubicacion | null;
}

type NuevoPlato = Omit<ItemCarrito, "cantidad">;

export interface CarritoContextType extends EstadoCarrito {
  cantidadTotal: number;
  subtotalAprox: number;
  agregar: (
    restaurante: RestauranteCarrito,
    plato: NuevoPlato,
  ) => "ok" | "otro_restaurante";
  reemplazarCon: (restaurante: RestauranteCarrito, plato: NuevoPlato) => void;
  reemplazarTodo: (
    restaurante: RestauranteCarrito,
    items: ItemCarrito[],
  ) => void;
  cambiarCantidad: (platoId: number, delta: number) => void;
  quitar: (platoId: number) => void;
  vaciar: () => void;
  setDireccionId: (id: number | null) => void;
  setMetodoPago: (metodo: string | null) => void;
  setVentana: (v: VentanaCarrito | null) => void;
  setUbicacion: (ubicacion: Ubicacion | null) => void;
}

const VACIO: EstadoCarrito = {
  restaurante: null,
  items: [],
  direccionId: null,
  metodoPago: null,
  ventana: null,
  ubicacion: null,
};

interface UsuarioCarrito {
  id?: number | string;
}

// Cada usuario tiene su propio carrito guardado en el navegador.
function claveStorage(): string {
  try {
    const usuario: UsuarioCarrito | null = getUser();
    return `carrito_${usuario?.id ?? "anon"}`;
  } catch {
    return "carrito_anon";
  }
}

function leerGuardado(clave: string): EstadoCarrito {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(clave) || "null");

    if (
      typeof raw === "object" &&
      raw !== null &&
      "items" in raw &&
      Array.isArray(raw.items)
    ) {
      return { ...VACIO, ...raw } as EstadoCarrito;
    }
  } catch {
    // Si lo guardado está dañado, se empieza con un carrito vacío.
  }

  return VACIO;
}

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [clave] = useState(claveStorage);
  const [estado, setEstado] = useState<EstadoCarrito>(() =>
    leerGuardado(clave),
  );

  useEffect(() => {
    localStorage.setItem(clave, JSON.stringify(estado));
  }, [clave, estado]);

  const agregar: CarritoContextType["agregar"] = (restaurante, plato) => {
    // Un carrito solo puede tener productos de un restaurante.
    if (
      estado.restaurante &&
      estado.restaurante.id !== restaurante.id &&
      estado.items.length > 0
    ) {
      return "otro_restaurante";
    }

    setEstado((prev) => {
      const existente = prev.items.find((i) => i.plato_id === plato.plato_id);

      const items = existente
        ? prev.items.map((i) =>
            i.plato_id === plato.plato_id
              ? {
                  ...i,
                  cantidad: Math.min(i.cantidad + 1, MAX_POR_PLATO),
                }
              : i,
          )
        : [...prev.items, { ...plato, cantidad: 1 }];

      return { ...prev, restaurante, items };
    });

    return "ok";
  };

  const reemplazarCon: CarritoContextType["reemplazarCon"] = (
    restaurante,
    plato,
  ) => {
    setEstado((prev) => ({
      ...VACIO,
      direccionId: prev.direccionId,
      restaurante,
      items: [{ ...plato, cantidad: 1 }],
    }));
  };

  const reemplazarTodo: CarritoContextType["reemplazarTodo"] = (
    restaurante,
    items,
  ) => {
    setEstado((prev) => ({
      ...VACIO,
      direccionId: prev.direccionId,
      restaurante,
      items,
    }));
  };

  const cambiarCantidad = (platoId: number, delta: number) => {
    setEstado((prev) => {
      const items = prev.items
        .map((i) =>
          i.plato_id === platoId
            ? {
                ...i,
                cantidad: Math.min(i.cantidad + delta, MAX_POR_PLATO),
              }
            : i,
        )
        .filter((i) => i.cantidad > 0);

      return {
        ...prev,
        items,
        restaurante: items.length > 0 ? prev.restaurante : null,
      };
    });
  };

  const quitar = (platoId: number) => {
    setEstado((prev) => {
      const items = prev.items.filter((i) => i.plato_id !== platoId);

      return {
        ...prev,
        items,
        restaurante: items.length > 0 ? prev.restaurante : null,
      };
    });
  };

  const vaciar = () =>
    setEstado((prev) => ({
      ...VACIO,
      direccionId: prev.direccionId,
    }));

  const setDireccionId = (id: number | null) =>
    setEstado((prev) => ({ ...prev, direccionId: id }));

  const setMetodoPago = (metodo: string | null) =>
    setEstado((prev) => ({ ...prev, metodoPago: metodo }));

  const setVentana = (v: VentanaCarrito | null) =>
    setEstado((prev) => ({ ...prev, ventana: v }));

  const setUbicacion = (ubicacion: Ubicacion | null) =>
    setEstado((prev) => ({ ...prev, ubicacion }));

  const cantidadTotal = estado.items.reduce((acc, i) => acc + i.cantidad, 0);

  const subtotalAprox = estado.items.reduce(
    (acc, i) => acc + i.precio * i.cantidad,
    0,
  );

  return (
    <CarritoContext.Provider
      value={{
        ...estado,
        cantidadTotal,
        subtotalAprox,
        agregar,
        reemplazarCon,
        reemplazarTodo,
        cambiarCantidad,
        quitar,
        vaciar,
        setDireccionId,
        setMetodoPago,
        setVentana,
        setUbicacion,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

import { createContext, useContext, useState, ReactNode } from "react";

export interface ProductoAbastecimiento {
  id: number;
  categoria: "carnes" | "ingredientes" | "bebidas" | "materiales";
  nombre: string;
  imagen: string | null;
  precio: number;
}

export interface ItemCarrito {
  producto: ProductoAbastecimiento;
  cantidad: number;
}

interface CarritoContextValue {
  items: ItemCarrito[];
  agregarProducto: (producto: ProductoAbastecimiento) => void;
  aumentarCantidad: (productoId: number) => void;
  disminuirCantidad: (productoId: number) => void;
  quitarProducto: (productoId: number) => void;
  vaciarCarrito: () => void;
  total: number;
  cantidadTotal: number;
}

const AbastecimientoCartContext = createContext<CarritoContextValue | undefined>(undefined);

export function AbastecimientoCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  const agregarProducto = (producto: ProductoAbastecimiento) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.producto.id === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const aumentarCantidad = (productoId: number) => {
    setItems((prev) =>
      prev.map((i) => (i.producto.id === productoId ? { ...i, cantidad: i.cantidad + 1 } : i))
    );
  };

  const disminuirCantidad = (productoId: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.producto.id === productoId ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0)
    );
  };

  const quitarProducto = (productoId: number) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== productoId));
  };

  const vaciarCarrito = () => setItems([]);

  const total = items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);
  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <AbastecimientoCartContext.Provider
      value={{
        items,
        agregarProducto,
        aumentarCantidad,
        disminuirCantidad,
        quitarProducto,
        vaciarCarrito,
        total,
        cantidadTotal,
      }}
    >
      {children}
    </AbastecimientoCartContext.Provider>
  );
}

export function useAbastecimientoCart() {
  const ctx = useContext(AbastecimientoCartContext);
  if (!ctx) throw new Error("useAbastecimientoCart debe usarse dentro de AbastecimientoCartProvider");
  return ctx;
}

import { createContext } from "react";

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

export interface CarritoContextValue {
  items: ItemCarrito[];
  agregarProducto: (producto: ProductoAbastecimiento) => void;
  aumentarCantidad: (productoId: number) => void;
  disminuirCantidad: (productoId: number) => void;
  quitarProducto: (productoId: number) => void;
  vaciarCarrito: () => void;
  total: number;
  cantidadTotal: number;
}

export const AbastecimientoCartContext = createContext<
  CarritoContextValue | undefined
>(undefined);

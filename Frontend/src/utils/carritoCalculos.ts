import type { ItemCarrito } from "../context/CarritoContext";

export interface PlatoCatalogo {
  id: number;
  nombre: string;
  imagen: string | null;
  precio: number;
  disponible: boolean;
}

export function formatXAF(v: number) {
  return `${v.toLocaleString("es-ES")} XAF`;
}

// Cruza lo que hay en el carrito con los datos actuales del servidor.
// Mientras el catálogo no ha llegado (null) se usan los datos guardados y no se marca ningún problema.
export function calcularLineas(
  items: ItemCarrito[],
  catalogo: PlatoCatalogo[] | null,
) {
  const lineas = items.map((item) => {
    const actual = catalogo?.find((p) => p.id === item.plato_id);

    let problema: string | null = null;
    if (catalogo) {
      if (!actual) problema = "Ya no está disponible";
      else if (!actual.disponible) problema = "Agotado por ahora";
    }

    return {
      item,
      nombre: actual?.nombre ?? item.nombre,
      imagen: actual?.imagen ?? item.imagen,
      precio: actual ? actual.precio : item.precio,
      problema,
    };
  });

  const subtotal = lineas
    .filter((l) => !l.problema)
    .reduce((acc, l) => acc + l.precio * l.item.cantidad, 0);

  return { lineas, subtotal, hayProblemas: lineas.some((l) => l.problema) };
}

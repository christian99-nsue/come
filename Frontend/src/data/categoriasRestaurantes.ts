import type { LucideIcon } from "lucide-react";
import {
  Grid2X2,
  Hamburger,
  Pizza,
  Drumstick,
  CookingPot,
  Soup,
  Cake,
  CupSoda,
  Fish,
} from "lucide-react";

export interface CategoriaRestaurante {
  id: string;
  nombre: string;
  icono: LucideIcon;
  termino: string;
}

export const categoriasRestaurantes: CategoriaRestaurante[] = [
  {
    id: "todos",
    nombre: "Todos",
    icono: Grid2X2,
    termino: "",
  },
  {
    id: "burgers",
    nombre: "Burgers",
    icono: Hamburger,
    termino: "hamburg",
  },
  {
    id: "pizzas",
    nombre: "Pizzas",
    icono: Pizza,
    termino: "pizza",
  },
  {
    id: "pollo",
    nombre: "Pollo",
    icono: Drumstick,
    termino: "pollo",
  },
  {
    id: "africana",
    nombre: "Africana",
    icono: CookingPot,
    termino: "africana",
  },
  {
    id: "asiatica",
    nombre: "Asiática",
    icono: Soup,
    termino: "asiatica",
  },
  {
    id: "postres",
    nombre: "Postres",
    icono: Cake,
    termino: "postre",
  },
  {
    id: "bebidas",
    nombre: "Bebidas",
    icono: CupSoda,
    termino: "bebida",
  },
  {
    id: "pescado",
    nombre: "Pescado",
    icono: Fish,
    termino: "pescado",
  },
];

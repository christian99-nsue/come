import { useState } from "react";
import {
  MapPin,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import banner from "../../assets/banner23.png";
import { useNavigate } from "react-router-dom";
import burgerHouse from "../../assets/burger-house.jpg";
import pizzaTop from "../../assets/pizza-top.jpg";
import wokExpress from "../../assets/wok-express.jpg";
import burger from "../../assets/burger1.png";
import pizza from "../../assets/pizza.png";
import bebida from "../../assets/bebida.jpg";
import postre from "../../assets/postre1.png";
import saludable from "../../assets/saludable.jpg";
import shawarma from "../../assets/shawarma.png";
import bites from "../../assets/bites.png";
import chicken from "../../assets/chicken.png";
import sweet from "../../assets/sweet.png";
import "../../styles/explorar.css";

interface Categoria {
  id: string;
  nombre: string;
  icono: { src: string };
}

interface RestauranteCercano {
  id: string;
  nombre: string;
  categorias: string;
  rating: number;
  reviews: number;
  envio: number;
  pedidoMinimo: number;
  abierto: boolean;
  imagen: string;
}

interface Popular {
  id: string;
  nombre: string;
  rating: number;
  imagen: string;
}

const categoriasMock: Categoria[] = [
  { id: "todos", nombre: "Todos", icono: { src: banner } },
  { id: "burgers", nombre: "Burgers", icono: { src: burger } },
  { id: "pizzas", nombre: "Pizzas", icono: { src: pizza } },
  { id: "bebidas", nombre: "Bebidas", icono: { src: bebida } },
  { id: "postres", nombre: "Postres", icono: { src: postre } },
  { id: "saludable", nombre: "Saludable", icono: { src: saludable } },
];

const cercaDeTiMock: RestauranteCercano[] = [
  {
    id: "1",
    nombre: "Burger House",
    categorias: "Hamburguesas · Americana",
    rating: 4.6,
    reviews: 120,
    envio: 1500,
    pedidoMinimo: 2000,
    abierto: true,
    imagen: burgerHouse,
  },
  {
    id: "2",
    nombre: "Pizza Top",
    categorias: "Pizzas · Italiana",
    rating: 4.6,
    reviews: 120,
    envio: 2000,
    pedidoMinimo: 2000,
    abierto: true,
    imagen: pizzaTop,
  },
  {
    id: "3",
    nombre: "Wok Express",
    categorias: "Asiatica · Wok",
    rating: 4.6,
    reviews: 120,
    envio: 1500,
    pedidoMinimo: 1500,
    abierto: true,
    imagen: wokExpress,
  },
];

const popularesMock: Popular[] = [
  {
    id: "1",
    nombre: "Shawarma King",
    rating: 4.7,
    imagen: shawarma,
  },
  {
    id: "2",
    nombre: "Chicken Spot",
    rating: 4.6,
    imagen: chicken,
  },
  {
    id: "3",
    nombre: "Green Bites",
    rating: 4.5,
    imagen: bites,
  },
  {
    id: "4",
    nombre: "Sweet Time",
    rating: 4.8,
    imagen: sweet,
  },
];

function formatXAF(valor: number) {
  return `${valor.toLocaleString("es-ES")}XAF`;
}

export default function Explorar() {
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [ciudad] = useState("Bata");
  const navigate = useNavigate();

  return (
    <div className="explorar-page">
      {/* Encabezado de la página */}
      <section className="explorar-header">
        <div className="explorar-header-text">
          <h1 className="explorar-title">Explorar</h1>
          <p className="explorar-subtitle">
            Encuentra los mejores restaurantes cerca de ti.
          </p>
        </div>
        <button type="button" className="explorar-location-btn">
          <MapPin size={16} className="explorar-location-icon" />
          <span>{ciudad}</span>
          <ChevronDown size={16} />
        </button>
      </section>

      {/* Buscador */}
      <section className="explorar-search-row">
        <div className="explorar-search-input">
          <Search size={20} className="explorar-search-icon" />
          <input
            type="text"
            placeholder="Busca restaurantes o platos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button type="button" className="explorar-filter-btn">
          <SlidersHorizontal size={18} />
          <span>Filtros</span>
        </button>
      </section>

      {/* Categorías */}
      <section className="explorar-section">
        <div className="explorar-categories-scroll">
          {categoriasMock.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={
                cat.id === categoriaActiva
                  ? "category-chip active"
                  : "category-chip"
              }
              onClick={() => setCategoriaActiva(cat.id)}
            >
              <span className="category-chip-emoji">
                <img src={cat.icono.src} alt="Icono de categoria" />
              </span>
              <span className="category-chip-label">{cat.nombre}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Cerca de ti */}
      <section className="explorar-section">
        <div className="explorar-section-header">
          <h3>Cerca de ti</h3>
          <button type="button" className="explorar-link-btn">
            Ver todos
          </button>
        </div>

        <div className="nearby-list">
          {cercaDeTiMock.map((r) => (
            <div
              key={r.id}
              className="nearby-card"
              onClick={() => navigate(`/cliente/restaurante/${r.id}`)}
            >
              <img src={r.imagen} alt={r.nombre} className="nearby-card-img" />
              <div className="nearby-card-body">
                <div className="nearby-card-top">
                  <span className="nearby-card-name">{r.nombre}</span>
                  {r.abierto && (
                    <span className="nearby-card-badge">Abierto</span>
                  )}
                </div>
                <span className="nearby-card-tags">{r.categorias}</span>
                <span className="nearby-card-rating">
                  <Star size={14} className="nearby-star-icon" />
                  {r.rating} ({r.reviews})
                </span>
                <span className="nearby-card-delivery">
                  Pedido mínimo {formatXAF(r.pedidoMinimo)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Populares */}
      <section className="explorar-section explorar-section-last">
        <div className="explorar-section-header">
          <h3>Populares</h3>
          <button type="button" className="explorar-link-btn">
            Ver todos
          </button>
        </div>

        <div className="popular-grid">
          {popularesMock.map((p) => (
            <div
              key={p.id}
              className="popular-card"
              onClick={() => navigate(`/cliente/restaurante/${p.id}`)}
            >
              <img src={p.imagen} alt={p.nombre} className="popular-card-img" />
              <span className="popular-card-name">{p.nombre}</span>
              <span className="popular-card-rating">
                <Star size={13} className="nearby-star-icon" />
                {p.rating}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

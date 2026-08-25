import { useState } from "react";
import {
  ArrowLeft,
  Map,
  Search,
  SlidersHorizontal,
  Star,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import banner from "../../assets/banner23.png";
import burger from "../../assets/burger1.png";
import pizza from "../../assets/pizza.png";
import bebida from "../../assets/bebida.jpg";
import postre from "../../assets/postre1.png";
import saludable from "../../assets/saludable.jpg";
import burgerHouse from "../../assets/burger-house.jpg";
import pizzaTop from "../../assets/pizza-top.jpg";
import wokExpress from "../../assets/wok-express.jpg";
import shawarma from "../../assets/shawarma.png";
import chicken from "../../assets/chicken.png";
import "../../styles/restaurantes.css";

interface Categoria {
  id: string;
  nombre: string;
  icono: { src: string };
}

interface Restaurante {
  id: string;
  nombre: string;
  categorias: string;
  rating: number;
  reviews: number;
  tiempoMin: number;
  tiempoMax: number;
  pedido_minimo: number;
  abierto: boolean;
  precio: "XAF" | "$$" | "$$$";
  imagen: string;
  promocionado?: boolean;
  descuento?: string;
}

type FiltroRapido =
  | "todos"
  | "abierto"
  | "mejor_valorados"
  | "entrega_rapida"
  | "populares";

const filtrosRapidos: { id: FiltroRapido; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "abierto", label: "Abierto ahora" },
  { id: "mejor_valorados", label: "Mejor valorados" },
  { id: "entrega_rapida", label: "Entrega rápida" },
  { id: "populares", label: "Populares" },
];

const categoriasMock: Categoria[] = [
  { id: "todos", nombre: "Todos", icono: { src: banner } },
  { id: "burgers", nombre: "Burgers", icono: { src: burger } },
  { id: "pizzas", nombre: "Pizzas", icono: { src: pizza } },
  { id: "bebidas", nombre: "Bebidas", icono: { src: bebida } },
  { id: "postres", nombre: "Postres", icono: { src: postre } },
  { id: "saludable", nombre: "Saludable", icono: { src: saludable } },
];

const restaurantesMock: Restaurante[] = [
  {
    id: "1",
    nombre: "Burger House",
    categorias: "Hamburguesas · Americana",
    rating: 4.6,
    reviews: 320,
    tiempoMin: 20,
    tiempoMax: 30,
    pedido_minimo: 1500,
    abierto: true,
    precio: "XAF",
    imagen: burgerHouse,
    promocionado: true,
    descuento: "10% de descuento",
  },
  {
    id: "2",
    nombre: "Pizza Top",
    categorias: "Pizzas · Italiana",
    rating: 4.5,
    reviews: 210,
    tiempoMin: 15,
    tiempoMax: 25,
    pedido_minimo: 1000,
    abierto: true,
    precio: "XAF",
    imagen: pizzaTop,
  },
  {
    id: "3",
    nombre: "Wok Express",
    categorias: "Asiática · Wok",
    rating: 4.4,
    reviews: 189,
    tiempoMin: 25,
    tiempoMax: 35,
    pedido_minimo: 1500,
    abierto: true,
    precio: "XAF",
    imagen: wokExpress,
  },
  {
    id: "4",
    nombre: "Shawarma King",
    categorias: "Árabe · Shawarma",
    rating: 4.7,
    reviews: 280,
    tiempoMin: 20,
    tiempoMax: 30,
    pedido_minimo: 1000,
    abierto: true,
    precio: "XAF",
    imagen: shawarma,
  },
  {
    id: "5",
    nombre: "Chicken Spot",
    categorias: "Pollo · Frito",
    rating: 4.6,
    reviews: 150,
    tiempoMin: 15,
    tiempoMax: 25,
    pedido_minimo: 1000,
    abierto: true,
    precio: "XAF",
    imagen: chicken,
  },
];

function formatXAF(valor: number) {
  return `${valor.toLocaleString("es-ES")} XAF`;
}

export default function Restaurantes() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [filtroActivo, setFiltroActivo] = useState<FiltroRapido>("todos");

  return (
    <div className="restaurantes-page">
      {/* Encabezado */}
      <section className="restaurantes-header">
        <button
          type="button"
          className="restaurantes-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="restaurantes-header-text">
          <h1 className="restaurantes-title">Restaurantes</h1>
          <p className="restaurantes-subtitle">
            Descubre los mejores restaurantes cerca de ti
          </p>
        </div>
        <button
          type="button"
          className="restaurantes-map-btn"
          aria-label="Ver mapa"
        >
          <Map size={20} />
        </button>
      </section>

      {/* Buscador */}
      <section className="restaurantes-search-row">
        <div className="restaurantes-search-input">
          <Search size={20} className="restaurantes-search-icon" />
          <input
            type="text"
            placeholder="Buscar restaurantes o platos"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button type="button" className="restaurantes-filter-btn">
          <SlidersHorizontal size={18} />
          <span>Filtros</span>
          <span className="restaurantes-filter-badge">2</span>
        </button>
      </section>

      {/* Filtros rápidos */}
      <div className="quick-filters-scroll">
        {filtrosRapidos.map((f) => (
          <button
            key={f.id}
            type="button"
            className={
              f.id === filtroActivo
                ? "quick-filter-chip active"
                : "quick-filter-chip"
            }
            onClick={() => setFiltroActivo(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Categorías (mismo estilo usado en Home/Explorar) */}
      <section className="restaurantes-section">
        <div className="restaurantes-section-header">
          <h3>Categorias</h3>
          <button type="button" className="restaurantes-link-btn">
            Ver todas
          </button>
        </div>
        <div className="restaurantes-categories-scroll">
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

      {/* Contador + orden */}
      <div className="restaurantes-results-row">
        <span className="restaurantes-results-count">
          {restaurantesMock.length} restaurantes encontrados
        </span>
        <button type="button" className="restaurantes-sort-btn">
          Ordenar por: <span>Relevancia</span>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Lista de restaurantes */}
      <div className="nearby-list">
        {restaurantesMock.map((r) => (
          <div
            key={r.id}
            className="restaurant-list-card"
            onClick={() => navigate(`/cliente/restaurante/${r.id}`)}
          >
            <img
              src={r.imagen}
              alt={r.nombre}
              className="restaurant-list-img"
            />
            <div className="restaurant-list-body">
              <div className="restaurant-list-top">
                <span className="restaurant-list-name">{r.nombre}</span>
                {r.promocionado && (
                  <span className="restaurant-list-promo">Promocionado</span>
                )}
                <button
                  type="button"
                  className="restaurant-list-fav"
                  aria-label="Guardar en favoritos"
                >
                  <Heart size={18} />
                </button>
              </div>

              <span className="restaurant-list-rating">
                <Star size={13} className="restaurant-star-icon" />
                {r.rating} ({r.reviews}) · {r.categorias}
              </span>

              <span className="restaurant-list-meta">
                {r.tiempoMin}-{r.tiempoMax} min · Pedido minimo{" "}
                {formatXAF(r.pedido_minimo)}
              </span>

              <div className="restaurant-list-bottom">
                <div className="restaurant-list-badges">
                  {r.abierto && (
                    <span className="restaurant-list-badge open">Abierto</span>
                  )}
                  {r.descuento && (
                    <span className="restaurant-list-badge discount">
                      {r.descuento}
                    </span>
                  )}
                </div>
                <span className="restaurant-list-price">{r.precio}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

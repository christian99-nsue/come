import { useState } from "react";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import { getUser } from "../../utils/auth";
import BannerCarousel from "../../components/common/Banner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruckFast } from "@fortawesome/free-solid-svg-icons";
import banner from "../../assets/banner23.png";
import burgerHouse from "../../assets/burger-house.jpg";
import pizzaTop from "../../assets/pizza-top.jpg";
import wokExpress from "../../assets/wok-express.jpg";
import burger from "../../assets/burger1.png";
import pizza from "../../assets/pizza.png";
import bebida from "../../assets/bebida.jpg";
import postre from "../../assets/postre1.png";
import saludable from "../../assets/saludable.jpg";
import "../../styles/inicio.css";

interface Restaurante {
  id: string;
  nombre: string;
  rating: number;
  imagen: string;
}

interface Categoria {
  id: string;
  nombre: string;
  icono: { src: string };
}

const restaurantesMock: Restaurante[] = [
  {
    id: "1",
    nombre: "Burger House",
    rating: 4.6,
    imagen: burgerHouse,
  },
  {
    id: "2",
    nombre: "Pizza Top",
    rating: 3.8,
    imagen: pizzaTop,
  },
  {
    id: "3",
    nombre: "Wok Express",
    rating: 4.8,
    imagen: wokExpress,
  },
];

const categoriasMock: Categoria[] = [
  { id: "todos", nombre: "Todos", icono: { src: banner } },
  { id: "burgers", nombre: "Burgers", icono: { src: burger } },
  { id: "pizzas", nombre: "Pizzas", icono: { src: pizza } },
  { id: "bebidas", nombre: "Bebidas", icono: { src: bebida } },
  { id: "postres", nombre: "Postres", icono: { src: postre } },
  { id: "saludable", nombre: "Saludable", icono: { src: saludable } },
];

export default function Inicio() {
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const user = getUser();

  return (
    <div className="home-page">
      {/* Saludo */}
      <section className="home-greeting">
        <h1 className="home-greeting-title">
          ¡Hola, {user.nombre}! <span className="home-wave">👋</span>
        </h1>
        <p className="home-greeting-subtitle">¿Que vas a pedir hoy?</p>
      </section>

      {/* Buscador */}
      <section className="home-search-row">
        <div className="home-search-input">
          <Search size={20} className="home-search-icon" />
          <input
            type="text"
            placeholder="Busca restaurantes o platos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button type="button" className="home-filter-btn" aria-label="Filtros">
          <SlidersHorizontal size={20} />
        </button>
      </section>

      {/* Banner promocional */}

      <BannerCarousel />
      {/* Restaurantes cerca de ti */}
      <section className="home-section">
        <div className="home-section-header">
          <h3>Restaurantes cerca de ti</h3>
          <button type="button" className="home-link-btn">
            Ver todos
          </button>
        </div>
        <div className="home-restaurants-scroll">
          {restaurantesMock.map((r) => (
            <div key={r.id} className="restaurant-card">
              <img
                src={r.imagen}
                alt={r.nombre}
                className="restaurant-card-img"
              />
              <div className="restaurant-card-info">
                <span className="restaurant-card-name">{r.nombre}</span>
                <span className="restaurant-card-rating">
                  <Star size={14} /> {r.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section className="home-section">
        <div className="home-section-header">
          <h3>Categorias</h3>
        </div>
        <div className="home-categories-scroll">
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

      {/* Tus pedidos */}
      <section className="home-section home-section-last">
        <div className="home-section-header">
          <h3>Tus pedidos</h3>
          <button type="button" className="home-link-btn">
            Ver historial
          </button>
        </div>
        <div className="order-status-card" style={{ cursor: "Pointer" }}>
          <div className="order-status-info">
            <span className="order-status-label">
              Pedido en camino <FontAwesomeIcon icon={faTruckFast} size="sm" />
            </span>
            <span className="order-status-restaurant">Burger House</span>
            <span className="order-status-id">#12345</span>
          </div>
          <img src={burgerHouse} alt="Pedido" className="order-status-img" />
        </div>
      </section>
    </div>
  );
}

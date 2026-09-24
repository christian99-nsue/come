import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Star, Heart } from "lucide-react";
import "../../styles/cliente/Favoritos.css";
import burgerHouse from "../../assets/baconBurger.jfif";
import pizzaTop from "../../assets/chicken.png";
import chicken from "../../assets/combo.png";
import shushi from "../../assets/arosCebolla.jfif";
import cafe from "../../assets/refrescos.jfif";
import trattoria from "../../assets/acompañamientos.jpg";

interface RestauranteFavorito {
  id: string;
  nombre: string;
  categoria: string;
  rating: number;
  reviews: number;
  tiempoMin: number;
  tiempoMax: number;
  imagen: string;
}

const favoritosMock: RestauranteFavorito[] = [
  {
    id: "1",
    nombre: "Burger House",
    categoria: "Hamburguesas",
    rating: 4.6,
    reviews: 320,
    tiempoMin: 20,
    tiempoMax: 30,
    imagen: burgerHouse,
  },
  {
    id: "2",
    nombre: "Pizza Top",
    categoria: "Pizzas",
    rating: 4.5,
    reviews: 210,
    tiempoMin: 15,
    tiempoMax: 25,
    imagen: pizzaTop,
  },
  {
    id: "3",
    nombre: "Chicken Spot",
    categoria: "Pollo",
    rating: 4.4,
    reviews: 189,
    tiempoMin: 20,
    tiempoMax: 35,
    imagen: chicken,
  },
  {
    id: "4",
    nombre: "Sushi & More",
    categoria: "Sushi",
    rating: 4.7,
    reviews: 98,
    tiempoMin: 25,
    tiempoMax: 40,
    imagen: shushi,
  },
  {
    id: "5",
    nombre: "Café & Más",
    categoria: "Cafetería",
    rating: 4.3,
    reviews: 76,
    tiempoMin: 15,
    tiempoMax: 30,
    imagen: cafe,
  },
  {
    id: "6",
    nombre: "La Trattoria",
    categoria: "Italiana",
    rating: 4.6,
    reviews: 142,
    tiempoMin: 20,
    tiempoMax: 40,
    imagen: trattoria,
  },
];

export default function Favoritos() {
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState<string[]>(
    favoritosMock.map((f) => f.id),
  );

  const quitarFavorito = (id: string) => {
    setFavoritos((prev) => prev.filter((f) => f !== id));
  };

  const lista = favoritosMock.filter((f) => favoritos.includes(f.id));

  return (
    <div className="favoritos-page">
      <section className="favoritos-header">
        <button
          type="button"
          className="favoritos-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="favoritos-title">Favoritos</h1>
        <button
          type="button"
          className="favoritos-search-btn"
          aria-label="Buscar en favoritos"
        >
          <Search size={20} />
        </button>
      </section>

      <p className="favoritos-subtitle">
        Tus restaurantes y platos favoritos, siempre a mano.
      </p>

      {lista.length === 0 ? (
        <p className="favoritos-empty">
          Aún no tienes restaurantes favoritos. Toca el corazón en cualquier
          restaurante para guardarlo aquí.
        </p>
      ) : (
        <div className="favoritos-list">
          {lista.map((r) => (
            <button
              key={r.id}
              type="button"
              className="favorito-card"
              onClick={() => navigate(`/cliente/restaurante/${r.id}`)}
            >
              <img src={r.imagen} alt={r.nombre} className="favorito-img" />
              <div className="favorito-info">
                <span className="favorito-name">{r.nombre}</span>
                <span className="favorito-categoria">{r.categoria}</span>
                <span className="favorito-meta">
                  <Star size={13} className="favorito-star" />
                  {r.rating} ({r.reviews}) · {r.tiempoMin}-{r.tiempoMax} min
                </span>
              </div>
              <span
                className="favorito-heart"
                onClick={(e) => {
                  e.stopPropagation();
                  quitarFavorito(r.id);
                }}
              >
                <Heart size={20} fill="#dc2626" color="#dc2626" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Clock,
  Bike,
  Tag,
  MapPin,
  ChevronDown,
  Plus,
  ShoppingBag,
  ChevronRight,
  Phone,
  UtensilsCrossed,
  PackageCheck,
  Wallet,
} from "lucide-react";
import burgerHouse from "../../assets/burger-house.jpg";
import acompañamientos from "../../assets/acompañamientos.jpg";
import baconBurger from "../../assets/baconBurger.jfif";
import spicyBurger from "../../assets/spicyBurger.jfif";
import arosCebolla from "../../assets/arosCebolla.jfif";
import imagenRestaurante1 from "../../assets/imagenRestaurante1.jpg";
import imagenRestaurante2 from "../../assets/imagenRestaurante2.jpg";
import imagenRestaurante3 from "../../assets/imagenRestaurante3.jpg";
import refrescos from "../../assets/refrescos.jfif";
import brownie from "../../assets/brownie.jfif";
import burger from "../../assets/burger1.png";
import bebida from "../../assets/bebida.jpg";
import patatas from "../../assets/patatas.jpg";
import bebidaBurger from "../../assets/bebidaBurger.jpg";
import postre from "../../assets/postre1.png";
import avatar1 from "../../assets/avatar1.png";
import avatar2 from "../../assets/avatar2.png";
import avatar3 from "../../assets/avatar3.png";
import "../../styles/restauranteDetalle.css";

type Tab = "menu" | "informacion" | "valoraciones" | "fotos";

interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  picante?: boolean;
}

interface CategoriaMenu {
  id: string;
  nombre: string;
  icono: { src: string };
}

interface Restaurante {
  id: string;
  nombre: string;
  logo: string;
  portada: string;
  abierto: boolean;
  rating: number;
  reviews: number;
  categorias: string;
  tiempoMin: number;
  tiempoMax: number;
  pedido_minimo: number;
  descuento?: string;
  descripcion: string;
  distancia: string;
  direccion: string;
  ciudad: string;
  horario: string;
  telefono: string;
  tipoCocina: string;
  opciones: string;
  metodosPago: string;
}

interface Resena {
  id: string;
  nombre: string;
  avatar: string;
  estrellas: number;
  fecha: string;
  comentario: string;
}

interface DestacadoRating {
  label: string;
  porcentaje: number;
}

const restauranteMock: Restaurante = {
  id: "1",
  nombre: "Burger House",
  logo: burger,
  portada: burgerHouse,
  abierto: true,
  rating: 4.6,
  reviews: 320,
  categorias: "Hamburguesas · Americana",
  tiempoMin: 20,
  tiempoMax: 30,
  pedido_minimo: 1500,
  descuento: "10% de descuento",
  descripcion:
    "Las mejores hamburguesas 100% caseras, ingredientes frescos y sabor único que te encantará. Preparamos cada pedido al momento con productos seleccionados de proveedores locales, para que disfrutes siempre de la mejor calidad.",
  distancia: "1.2 km",
  direccion: "Calle Mayor 12, Piso 2B — Malabo, Guinea Ecuatorial",
  ciudad: "Malabo, Guinea Ecuatorial",
  horario: "Lunes – Domingo · 10:00 – 13:30",
  telefono: "+240 555 123 456",
  tipoCocina: "Hamburguesas · Americana · Comida rápida",
  opciones: "Para llevar · Entrega a domicilio",
  metodosPago: "Efectivo · Transferencia",
};

const categoriasMenuMock: CategoriaMenu[] = [
  { id: "burgers", nombre: "Burgers", icono: { src: burger } },
  {
    id: "acompañamientos",
    nombre: "Acompañamientos",
    icono: { src: acompañamientos },
  },
  { id: "bebidas", nombre: "Bebidas", icono: { src: bebida } },
  { id: "postres", nombre: "Postres", icono: { src: postre } },
];

const menuMock: MenuItem[] = [
  {
    id: "classic-burger",
    nombre: "Classic Burger",
    descripcion:
      "Carne de res, queso cheddar, lechuga, tomate, cebolla y salsa especial.",
    precio: 4500,
    imagen: burgerHouse,
    categoria: "burgers",
  },
  {
    id: "bacon-cheese-burger",
    nombre: "Bacon Cheese Burger",
    descripcion:
      "Carne de res, bacon crujiente, queso cheddar, lechuga, tomate y salsa BBQ.",
    precio: 5500,
    imagen: baconBurger,
    categoria: "burgers",
  },
  {
    id: "spicy-burger",
    nombre: "Spicy Burger",
    descripcion:
      "Carne de res picante, queso pepper jack, jalapeños, lechuga y salsa picante.",
    precio: 5000,
    imagen: spicyBurger,
    categoria: "burgers",
    picante: true,
  },
  {
    id: "papas-clasicas",
    nombre: "Papas fritas clásicas",
    descripcion: "Papas fritas crocantes con sal marina.",
    precio: 1800,
    imagen: patatas,
    categoria: "acompañamientos",
  },
  {
    id: "aros-cebolla",
    nombre: "Aros de cebolla",
    descripcion: "Aros de cebolla empanizados y fritos.",
    precio: 2200,
    imagen: arosCebolla,
    categoria: "acompañamientos",
  },
  {
    id: "refresco",
    nombre: "Refresco 500ml",
    descripcion: "A elegir entre cola, naranja o limón.",
    precio: 1200,
    imagen: refrescos,
    categoria: "bebidas",
  },
  {
    id: "brownie",
    nombre: "Brownie con helado",
    descripcion: "Brownie de chocolate tibio con bola de helado de vainilla.",
    precio: 2800,
    imagen: brownie,
    categoria: "postres",
  },
];

const desgloseValoracionesMock = [
  { estrellas: 5, cantidad: 198 },
  { estrellas: 4, cantidad: 85 },
  { estrellas: 3, cantidad: 25 },
  { estrellas: 2, cantidad: 7 },
  { estrellas: 1, cantidad: 5 },
];

const destacadosMock: DestacadoRating[] = [
  { label: "Sabor", porcentaje: 96 },
  { label: "Calidad", porcentaje: 94 },
  { label: "Entrega rápida", porcentaje: 92 },
  { label: "Atención", porcentaje: 90 },
];

const resenasMock: Resena[] = [
  {
    id: "1",
    nombre: "Carlos M.",
    avatar: avatar1,
    estrellas: 5,
    fecha: "2 días atrás",
    comentario:
      "Las mejores hamburguesas que he probado en la ciudad. La carne jugosa y las papas deliciosas.",
  },
  {
    id: "2",
    nombre: "María L.",
    avatar: avatar2,
    estrellas: 4,
    fecha: "1 semana atrás",
    comentario:
      "Muy buen servicio y entrega rápida. El bacon burger es mi favorito.",
  },
  {
    id: "3",
    nombre: "Javier P.",
    avatar: avatar3,
    estrellas: 5,
    fecha: "2 semanas atrás",
    comentario:
      "Excelente comida, ingredientes frescos y porciones generosas. 100% recomendado.",
  },
];

const fotosRestauranteMock = [
  imagenRestaurante1,
  imagenRestaurante2,
  imagenRestaurante3,
];

const fotosPlatosMock = [
  burgerHouse,
  baconBurger,
  spicyBurger,
  patatas,
  bebidaBurger,
  arosCebolla,
];

function formatXAF(valor: number) {
  return `${valor.toLocaleString("es-ES")} XAF`;
}

function renderEstrellas(cantidad: number) {
  return "★".repeat(cantidad) + "☆".repeat(5 - cantidad);
}

export default function RestauranteDetalle() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("menu");
  const [categoriaActiva, setCategoriaActiva] = useState("burgers");
  const [descripcionExpandida, setDescripcionExpandida] = useState(false);
  const [carritoItems, setCarritoItems] = useState(3);
  const [carritoTotal, setCarritoTotal] = useState(12000);

  const r = restauranteMock; // luego: buscar por `id` en el backend

  const agregarAlCarrito = (item: MenuItem) => {
    setCarritoItems((prev) => prev + 1);
    setCarritoTotal((prev) => prev + item.precio);
  };

  const menuFiltrado = menuMock.filter((m) => m.categoria === categoriaActiva);
  const totalValoraciones = desgloseValoracionesMock.reduce(
    (acc, v) => acc + v.cantidad,
    0,
  );

  return (
    <div className="detalle-page">
      {/* Portada con botones flotantes */}
      <div className="detalle-hero">
        <img src={r.portada} alt={r.nombre} className="detalle-hero-img" />
        <button
          type="button"
          className="detalle-hero-btn detalle-hero-back"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="detalle-hero-actions">
          <button
            type="button"
            className="detalle-hero-btn"
            aria-label="Guardar en favoritos"
          >
            <Heart size={19} />
          </button>
          <button
            type="button"
            className="detalle-hero-btn"
            aria-label="Compartir"
          >
            <Share2 size={19} />
          </button>
        </div>
        <img
          src={r.logo}
          alt={`Logo de ${r.nombre}`}
          className="detalle-logo"
        />
      </div>

      {/* Info principal */}
      <section className="detalle-info">
        <div className="detalle-name-row">
          <h1 className="detalle-name">{r.nombre}</h1>
          {r.abierto && <span className="detalle-open-badge">Abierto</span>}
        </div>

        <p className="detalle-rating-row">
          <Star size={14} className="detalle-star-icon" />
          <strong>{r.rating}</strong> ({r.reviews}) · {r.categorias}
        </p>

        <div className="detalle-quick-row">
          <span className="detalle-quick-item">
            <Clock size={14} /> {r.tiempoMin}-{r.tiempoMax} min
          </span>
          <span className="detalle-quick-item">
            <Bike size={14} /> Pedido minimo {formatXAF(r.pedido_minimo)}
          </span>
          {r.descuento && (
            <span className="detalle-quick-item detalle-discount">
              <Tag size={14} /> {r.descuento}
            </span>
          )}
        </div>

        {tab === "menu" && (
          <p className="detalle-description">
            {descripcionExpandida
              ? r.descripcion
              : `${r.descripcion.slice(0, 78)}...`}{" "}
            <button
              type="button"
              className="detalle-ver-mas"
              onClick={() => setDescripcionExpandida((v) => !v)}
            >
              {descripcionExpandida ? "Ver menos" : "Ver más"}
              <ChevronDown
                size={14}
                style={{
                  transform: descripcionExpandida ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>
          </p>
        )}

        {/* Stats */}
        {tab === "menu" && (
          <div className="detalle-stats">
            <div className="detalle-stat">
              <Bike size={20} className="detalle-stat-icon" />
              <span className="detalle-stat-title">Entrega</span>
              <span className="detalle-stat-value">
                {r.tiempoMin}-{r.tiempoMax} min
              </span>
            </div>
            <div className="detalle-stat">
              <ShoppingBag size={20} className="detalle-stat-icon" />
              <span className="detalle-stat-title">Costo de envío</span>
              <span className="detalle-stat-value">
                {formatXAF(r.pedido_minimo)}
              </span>
            </div>
            <div className="detalle-stat">
              <Star size={20} className="detalle-stat-icon-star" />
              <span className="detalle-stat-title">Valoración</span>
              <span className="detalle-stat-value">
                {r.rating} ({r.reviews})
              </span>
            </div>
            <div className="detalle-stat">
              <MapPin size={20} className="detalle-stat-icon" />
              <span className="detalle-stat-title">Distancia</span>
              <span className="detalle-stat-value">{r.distancia}</span>
            </div>
          </div>
        )}
      </section>

      {/* Tabs */}
      <div className="detalle-tabs">
        <button
          type="button"
          className={tab === "menu" ? "detalle-tab active" : "detalle-tab"}
          onClick={() => setTab("menu")}
        >
          Menú
        </button>
        <button
          type="button"
          className={
            tab === "informacion" ? "detalle-tab active" : "detalle-tab"
          }
          onClick={() => setTab("informacion")}
        >
          Información
        </button>
        <button
          type="button"
          className={
            tab === "valoraciones" ? "detalle-tab active" : "detalle-tab"
          }
          onClick={() => setTab("valoraciones")}
        >
          Valoraciones <span className="detalle-tab-count">({r.reviews})</span>
        </button>
        <button
          type="button"
          className={tab === "fotos" ? "detalle-tab active" : "detalle-tab"}
          onClick={() => setTab("fotos")}
        >
          Fotos
        </button>
      </div>

      {/* Contenido: Menú */}
      {tab === "menu" && (
        <>
          <div className="detalle-menu-categories-scroll">
            {categoriasMenuMock.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={
                  cat.id === categoriaActiva
                    ? "category-chip-rs active"
                    : "category-chip-rs"
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

          <section className="detalle-menu-section">
            <div className="detalle-menu-section-header">
              <h3>
                {
                  categoriasMenuMock.find((c) => c.id === categoriaActiva)
                    ?.nombre
                }
              </h3>
              <button type="button" className="detalle-link-btn">
                Ver todo
              </button>
            </div>

            <div className="menu-item-list">
              {menuFiltrado.map((item) => (
                <div key={item.id} className="menu-item-row">
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="menu-item-img"
                  />
                  <div className="menu-item-info">
                    <span className="menu-item-name">
                      {item.nombre} {item.picante && "🌶️"}
                    </span>
                    <span className="menu-item-desc">{item.descripcion}</span>
                    <span className="menu-item-price">
                      {formatXAF(item.precio)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="menu-item-add-btn"
                    onClick={() => agregarAlCarrito(item)}
                    aria-label={`Añadir ${item.nombre}`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Contenido: Información */}
      {tab === "informacion" && (
        <section className="detalle-menu-section">
          <h3 className="info-block-title">Sobre nosotros</h3>
          <p className="info-about-text">{r.descripcion}</p>

          <div className="info-row-list">
            <div className="info-row-rs">
              <span className="info-row-icon-rs">
                <MapPin size={18} />
              </span>
              <div className="info-row-text-rs">
                <span className="info-row-title-rs">Dirección</span>
                <span className="info-row-subtitle-rs">{r.direccion}</span>
              </div>
            </div>

            <div className="info-row-rs">
              <span className="info-row-icon-rs">
                <Clock size={18} />
              </span>
              <div className="info-row-text-rs">
                <span className="info-row-title-rs">Horario de atención</span>
                <span className="info-row-subtitle-rs">{r.horario}</span>
              </div>
            </div>

            <div className="info-row-rs">
              <span className="info-row-icon-rs">
                <Phone size={18} />
              </span>
              <div className="info-row-text-rs">
                <span className="info-row-title-rs">Teléfono</span>
                <span className="info-row-subtitle-rs info-row-link-rs">
                  {r.telefono}
                </span>
              </div>
            </div>

            <div className="info-row-rs">
              <span className="info-row-icon-rs">
                <UtensilsCrossed size={18} />
              </span>
              <div className="info-row-text-rs">
                <span className="info-row-title-rs">Tipo de cocina</span>
                <span className="info-row-subtitle-rs">{r.tipoCocina}</span>
              </div>
            </div>

            <div className="info-row-rs">
              <span className="info-row-icon-rs">
                <PackageCheck size={18} />
              </span>
              <div className="info-row-text-rs">
                <span className="info-row-title-rs">Opciones</span>
                <span className="info-row-subtitle-rs">{r.opciones}</span>
              </div>
            </div>

            <div className="info-row-rs">
              <span className="info-row-icon-rs">
                <Wallet size={18} />
              </span>
              <div className="info-row-text-rs">
                <span className="info-row-title-rs">Métodos de pago</span>
                <span className="info-row-subtitle-rs">{r.metodosPago}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contenido: Valoraciones */}
      {tab === "valoraciones" && (
        <section className="detalle-menu-section">
          <h3 className="info-block-title">Resumen de valoraciones</h3>

          <div className="ratings-summary">
            <div className="ratings-summary-left">
              <span className="ratings-summary-score">{r.rating}</span>
              <span className="ratings-summary-stars">
                {renderEstrellas(Math.round(r.rating))}
              </span>
              <span className="ratings-summary-count">
                ({totalValoraciones} valoraciones)
              </span>
            </div>
            <div className="ratings-summary-bars">
              {desgloseValoracionesMock.map((v) => (
                <div className="ratings-bar-row" key={v.estrellas}>
                  <span className="ratings-bar-label">
                    {v.estrellas}{" "}
                    <Star size={11} className="detalle-star-icon" />
                  </span>
                  <div className="ratings-bar-track">
                    <div
                      className="ratings-bar-fill"
                      style={{
                        width: `${(v.cantidad / totalValoraciones) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="ratings-bar-count">{v.cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          <h3 className="info-block-title">Lo que más destacan</h3>
          <div className="highlights-row">
            {destacadosMock.map((d) => (
              <span className="highlight-chip" key={d.label}>
                {d.label} <strong>{d.porcentaje}%</strong>
              </span>
            ))}
          </div>

          <div className="review-list">
            {resenasMock.map((resena) => (
              <div className="review-card" key={resena.id}>
                <img
                  src={resena.avatar}
                  alt={resena.nombre}
                  className="review-avatar"
                />
                <div className="review-body">
                  <div className="review-top">
                    <span className="review-name">{resena.nombre}</span>
                    <span className="review-date">{resena.fecha}</span>
                  </div>
                  <span className="review-stars">
                    {renderEstrellas(resena.estrellas)}
                  </span>
                  <p className="review-comment">{resena.comentario}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contenido: Fotos */}
      {tab === "fotos" && (
        <section className="detalle-menu-section">
          <h3 className="info-block-title">Fotos del restaurante</h3>
          <div className="photo-grid photo-grid-3">
            {fotosRestauranteMock.map((foto, i) => (
              <img
                key={i}
                src={foto}
                alt={`Foto del local ${i + 1}`}
                className="photo-grid-img"
              />
            ))}
          </div>

          <h3 className="info-block-title" style={{ marginTop: 20 }}>
            Fotos de los platos
          </h3>
          <div className="photo-grid photo-grid-3">
            {fotosPlatosMock.map((foto, i) => (
              <img
                key={i}
                src={foto}
                alt={`Foto de plato ${i + 1}`}
                className="photo-grid-img"
              />
            ))}
          </div>
        </section>
      )}

      {/* Barra flotante del carrito */}
      {carritoItems > 0 && (
        <button
          type="button"
          className="floating-cart-bar"
          onClick={() => navigate("/cliente/carrito")}
        >
          <div className="floating-cart-left">
            <span className="floating-cart-icon-wrapper">
              <ShoppingBag size={18} />
              <span className="floating-cart-count">{carritoItems}</span>
            </span>
            <div className="floating-cart-text">
              <span className="floating-cart-title">Ver carrito</span>
              <span className="floating-cart-subtitle">
                {carritoItems} productos · {formatXAF(carritoTotal)}
              </span>
            </div>
          </div>
          <span className="floating-cart-cta">
            Ir al carrito <ChevronRight size={16} />
          </span>
        </button>
      )}
    </div>
  );
}

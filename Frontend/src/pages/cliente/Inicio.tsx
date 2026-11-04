import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Star } from "lucide-react";
import BannerCarousel from "../../components/common/BannerCarousel";
import { getUser } from "../../utils/auth";
import { categoriasRestaurantes } from "../../data/categoriasRestaurantes";
import type { EstadoPedido } from "../../utils/seguimientoPedido";
import "../../styles/cliente/inicio.css";
import BannerVentanas from "../../components/common/BannerVentanas";

const API_URL = import.meta.env.VITE_API_URL;

interface UsuarioInicio {
  nombre?: string | null;
}

interface RestauranteInicio {
  id: number;
  nombre: string;
  logo: string | null;
  foto_portada: string | null;
  rating: number;
  reviews_count: number;
  abierto: boolean;
}

interface PedidoActivo {
  id: number;
  codigo: string;
  estado: EstadoPedido;
  restaurante_nombre: string;
  restaurante_logo: string | null;
}

function tituloEstado(estado: EstadoPedido) {
  switch (estado) {
    case "nuevo":
      return "Pedido enviado";
    case "en_preparacion":
      return "Preparando tu pedido";
    case "listo_para_recoger":
      return "Listo para recoger";
    case "en_entrega":
      return "Pedido en camino";
    default:
      return "Pedido";
  }
}

const categorias = categoriasRestaurantes.filter((c) => c.id !== "todos");

export default function Inicio() {
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const usuario = getUser() as UsuarioInicio | null;

  const primerNombre = String(usuario?.nombre || "")
    .trim()
    .split(/\s+/)[0];

  const [busqueda, setBusqueda] = useState("");
  const [restaurantes, setRestaurantes] = useState<RestauranteInicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pedidos, setPedidos] = useState<PedidoActivo[]>([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/cliente/restaurantes`, {
        headers,
        params: { limite: 8 },
      })
      .then((res) => setRestaurantes(res.data))
      .catch(() => setError("No se pudieron cargar los restaurantes"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pedidos en curso: se actualizan solos para ver los cambios de estado sin recargar
  useEffect(() => {
    const cargar = () =>
      axios
        .get(`${API_URL}/api/cliente/pedidos`, { headers })
        .then((res) => setPedidos(res.data.activos.slice(0, 2)))
        .catch(() => {});

    cargar();
    const intervalo = setInterval(cargar, 15000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    const q = busqueda.trim();
    navigate(
      q
        ? `/cliente/restaurantes?q=${encodeURIComponent(q)}`
        : "/cliente/restaurantes",
    );
  };

  return (
    <div className="home-page">
      <section className="home-greeting">
        <h1 className="home-greeting-title">
          ¡Hola{primerNombre ? `, ${primerNombre}` : ""}!{" "}
          <span className="home-wave">👋</span>
        </h1>
        <p className="home-greeting-subtitle">¿Qué vas a pedir hoy?</p>
      </section>
      <BannerVentanas />
      <form className="home-search-row" onSubmit={buscar}>
        <div className="home-search-input">
          <Search size={20} className="home-search-icon" />
          <input
            type="search"
            placeholder="Busca restaurantes o platos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            maxLength={100}
          />
        </div>
      </form>
      <BannerCarousel />
      <section className="home-section">
        <div className="home-section-header">
          <h3>Restaurantes</h3>
          <button
            type="button"
            className="home-link-btn"
            onClick={() => navigate("/cliente/restaurantes")}
          >
            Ver todos
          </button>
        </div>

        {cargando && <p className="home-status">Cargando restaurantes...</p>}
        {error && <p className="home-status error">{error}</p>}
        {!cargando && !error && restaurantes.length === 0 && (
          <p className="home-status">Aún no hay restaurantes disponibles.</p>
        )}

        <div className="home-restaurants-scroll">
          {restaurantes.map((r) => (
            <div
              key={r.id}
              className={
                r.abierto ? "restaurant-card" : "restaurant-card cerrado"
              }
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/cliente/restaurante/${r.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/cliente/restaurante/${r.id}`);
              }}
            >
              <img
                src={
                  r.foto_portada ||
                  r.logo ||
                  `https://picsum.photos/seed/restaurante-${r.id}/300/200`
                }
                alt={r.nombre}
                className="restaurant-card-img"
              />
              <div className="restaurant-card-info">
                <span className="restaurant-card-name">{r.nombre}</span>
                <span className="restaurant-card-rating">
                  {!r.abierto ? (
                    <span className="restaurant-card-closed">Cerrado</span>
                  ) : r.reviews_count > 0 ? (
                    <span className="restaurant-rating-value">
                      {" "}
                      <Star size={15} className="restaurant-rating-star" />
                      {r.rating.toFixed(1)}{" "}
                    </span>
                  ) : (
                    "Nuevo"
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="home-section">
        <div className="home-section-header">
          <h3>Categorías</h3>
        </div>
        <div className="home-categories-scroll">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className="category-chip"
              onClick={() =>
                navigate(`/cliente/restaurantes?categoria=${cat.id}`)
              }
            >
              <span className="category-chip-emoji">
                <cat.icono size={24} strokeWidth={1.8} />
              </span>
              <span className="category-chip-label">{cat.nombre}</span>
            </button>
          ))}
        </div>
      </section>
      {pedidos.length > 0 && (
        <section className="home-section home-section-last">
          <div className="home-section-header">
            <h3>Tus pedidos</h3>
            <button
              type="button"
              className="home-link-btn"
              onClick={() => navigate("/cliente/pedidos")}
            >
              Ver historial
            </button>
          </div>

          <div className="home-orders-list">
            {pedidos.map((p) => (
              <div
                key={p.id}
                className="order-status-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/cliente/pedidos/${p.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate(`/cliente/pedidos/${p.id}`);
                }}
              >
                <div className="order-status-info">
                  <span className="order-status-label">
                    {tituloEstado(p.estado)}
                  </span>
                  <span className="order-status-restaurant">
                    {p.restaurante_nombre}
                  </span>
                  <span className="order-status-id">{p.codigo}</span>
                </div>
                <img
                  src={
                    p.restaurante_logo ||
                    `https://picsum.photos/seed/restaurante-${p.id}/80/80`
                  }
                  alt={p.restaurante_nombre}
                  className="order-status-img"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

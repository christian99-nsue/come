import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { categoriasRestaurantes as categorias } from "../../data/categoriasRestaurantes";
import axios from "axios";
import { ArrowLeft, Search, Star } from "lucide-react";
import { formatXAF } from "../../utils/carritoCalculos";
import CorazonFavorito from "../../components/common/CorazonFavorito";
import { guardarFavorito } from "../../utils/favoritos";
import BannerVentanas from "../../components/common/BannerVentanas";
import "../../styles/cliente/Restaurantes.css";

const API_URL = import.meta.env.VITE_API_URL;

interface RestauranteLista {
  id: number;
  nombre: string;
  logo: string | null;
  foto_portada: string | null;
  categorias_texto: string | null;
  rating: number;
  reviews_count: number;
  tiempo_min: number;
  tiempo_max: number;
  costo_envio: number;
  pedido_minimo: number;
  abierto: boolean;
  es_favorito: boolean;
  tiene_platos: boolean;
}

interface ErrorRespuesta {
  message?: string;
}

const filtrosRapidos = [
  { id: "todos", label: "Todos" },
  { id: "abierto", label: "Abierto ahora" },
  { id: "mejor_valorados", label: "Mejor valorados" },
  { id: "entrega_rapida", label: "Entrega rápida" },
  { id: "populares", label: "Populares" },
  { id: "nuevos", label: "Nuevos" },
];

export default function Restaurantes() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [params] = useSearchParams();
  const filtroUrl = params.get("filtro") ?? "";
  const categoriaUrl = params.get("categoria") ?? "";
  const busquedaUrl = (params.get("q") ?? "").slice(0, 100);

  const [busqueda, setBusqueda] = useState(busquedaUrl);
  const [termino, setTermino] = useState(busquedaUrl.trim());

  const [filtro, setFiltro] = useState(
    filtrosRapidos.some((f) => f.id === filtroUrl) ? filtroUrl : "todos",
  );

  const [categoriaId, setCategoriaId] = useState(
    categorias.some((c) => c.id === categoriaUrl) ? categoriaUrl : "todos",
  );

  const [restaurantes, setRestaurantes] = useState<RestauranteLista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const alternarFavorito = (id: number, valor: boolean) => {
    const poner = (v: boolean) =>
      setRestaurantes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, es_favorito: v } : r)),
      );

    poner(valor);
    guardarFavorito(id, valor).catch(() => poner(!valor));
  };

  // Espera un momento después de escribir antes de buscar.
  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setTermino(busqueda.trim());
    }, 350);

    return () => window.clearTimeout(temporizador);
  }, [busqueda]);

  useEffect(() => {
    let cancelado = false;
    const controller = new AbortController();

    const categoria = categorias.find((cat) => cat.id === categoriaId)?.termino;

    const cargarRestaurantes = async () => {
      try {
        const respuesta = await axios.get<RestauranteLista[]>(
          `${API_URL}/api/cliente/restaurantes`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              busqueda: termino || undefined,
              categoria: categoria || undefined,
              filtro: filtro !== "todos" ? filtro : undefined,
            },
            signal: controller.signal,
          },
        );

        if (!cancelado) {
          setRestaurantes(respuesta.data);
          setError("");
        }
      } catch (err: unknown) {
        if (cancelado || controller.signal.aborted) return;

        if (axios.isAxiosError<ErrorRespuesta>(err)) {
          setError(
            err.response?.data?.message ||
              "No se pudieron cargar los restaurantes",
          );
        } else {
          setError("No se pudieron cargar los restaurantes");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    void cargarRestaurantes();

    return () => {
      cancelado = true;
      controller.abort();
    };
  }, [termino, filtro, categoriaId, token]);

  return (
    <div className="restaurantes-page">
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
      </section>

      {/* Ventanas de entrega y horarios de pedido */}
      <BannerVentanas />

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
      </section>

      <div className="quick-filters-scroll">
        {filtrosRapidos.map((f) => (
          <button
            key={f.id}
            type="button"
            className={
              f.id === filtro ? "quick-filter-chip active" : "quick-filter-chip"
            }
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="restaurantes-section">
        <div className="restaurantes-section-header">
          <h3>Categorías</h3>
        </div>

        <div className="restaurantes-categories-scroll">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={
                cat.id === categoriaId
                  ? "category-chip active"
                  : "category-chip"
              }
              onClick={() => setCategoriaId(cat.id)}
            >
              <span className="category-chip-emoji">
                <cat.icono size={24} strokeWidth={1.8} />
              </span>

              <span className="category-chip-label">{cat.nombre}</span>
            </button>
          ))}
        </div>
      </section>

      {!cargando && !error && (
        <div className="restaurantes-results-row">
          <span className="restaurantes-results-count">
            {restaurantes.length}{" "}
            {restaurantes.length === 1
              ? "restaurante encontrado"
              : "restaurantes encontrados"}
          </span>
        </div>
      )}

      {cargando && (
        <p className="restaurantes-status">Cargando restaurantes...</p>
      )}

      {error && <p className="restaurantes-status error">{error}</p>}

      {!cargando && !error && restaurantes.length === 0 && (
        <p className="restaurantes-status">
          No encontramos restaurantes con esos filtros.
        </p>
      )}

      <div className="restaurant-list">
        {restaurantes.map((r) => (
          <div
            key={r.id}
            className={
              r.abierto && r.tiene_platos
                ? "restaurant-list-card"
                : "restaurant-list-card cerrado"
            }
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/cliente/restaurante/${r.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(`/cliente/restaurante/${r.id}`);
              }
            }}
          >
            <img
              src={
                r.foto_portada ||
                r.logo ||
                `https://picsum.photos/seed/restaurante-${r.id}/400/200`
              }
              alt={r.nombre}
              className="restaurant-list-img"
            />

            <div className="restaurant-list-body">
              <div className="restaurant-list-top">
                <span className="restaurant-list-name">{r.nombre}</span>

                <CorazonFavorito
                  activo={r.es_favorito}
                  onCambiar={(v) => alternarFavorito(r.id, v)}
                />
              </div>

              <span className="restaurant-list-rating">
                {r.reviews_count > 0 ? (
                  <>
                    <Star size={13} className="restaurant-star-icon" />
                    {r.rating.toFixed(1)} ({r.reviews_count})
                  </>
                ) : (
                  "Nuevo"
                )}

                {r.categorias_texto ? ` · ${r.categorias_texto}` : ""}
              </span>

              <span className="restaurant-list-meta">
                {r.tiempo_min}-{r.tiempo_max} min · Envío{" "}
                {formatXAF(r.costo_envio)}
                {r.pedido_minimo > 0
                  ? ` · Mín. ${formatXAF(r.pedido_minimo)}`
                  : ""}
              </span>

              <div className="restaurant-list-bottom">
                <div className="restaurant-list-badges">
                  {!r.tiene_platos ? (
                    <span className="restaurant-list-badge closed">
                      Sin platos por ahora
                    </span>
                  ) : r.abierto ? (
                    <span className="restaurant-list-badge open">Abierto</span>
                  ) : (
                    <span className="restaurant-list-badge closed">
                      Cerrado
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

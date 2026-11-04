import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Star } from "lucide-react";
import { categoriasRestaurantes } from "../../data/categoriasRestaurantes";
import { formatXAF } from "../../utils/carritoCalculos";
import "../../styles/cliente/explorar.css";

const API_URL = import.meta.env.VITE_API_URL;

interface RestauranteExplorar {
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
}

// Cada sección pide a la lista de restaurantes el filtro que lleva su nombre
const secciones = [
  {
    clave: "populares",
    titulo: "Populares",
    nota: "Lo más pedido en los últimos 30 días",
    formato: "grid",
  },
  {
    clave: "entrega_rapida",
    titulo: "Entrega rápida",
    nota: "Entrega estimada en 30 minutos o menos",
    formato: "lista",
  },
  {
    clave: "nuevos",
    titulo: "Nuevos en COME",
    nota: "Se unieron en el último mes",
    formato: "lista",
  },
] as const;

const categorias = categoriasRestaurantes.filter((c) => c.id !== "todos");

function valoracion(r: RestauranteExplorar) {
  if (r.reviews_count === 0) return "Nuevo";
  return (
    <>
      <Star size={13} className="nearby-star-icon" />
      {r.rating.toFixed(1)} ({r.reviews_count})
    </>
  );
}

export default function Explorar() {
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState<Record<string, RestauranteExplorar[]>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    Promise.all(
      secciones.map(
        (s) =>
          axios
            .get(`${API_URL}/api/cliente/restaurantes`, {
              headers,
              params: { filtro: s.clave, limite: 6 },
            })
            .then((res) => res.data as RestauranteExplorar[])
            .catch(() => null), // si una sección falla, las demás se siguen mostrando
      ),
    ).then((resultados) => {
      if (cancelado) return;

      const nuevo: Record<string, RestauranteExplorar[]> = {};
      let fallos = 0;
      resultados.forEach((lista, i) => {
        if (lista === null) fallos++;
        else nuevo[secciones[i].clave] = lista;
      });

      setDatos(nuevo);
      setError(
        fallos === secciones.length
          ? "No se pudo cargar la información. Revisa tu conexión."
          : "",
      );
      setCargando(false);
    });

    return () => {
      cancelado = true;
    };
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

  const abrir = (id: number) => navigate(`/cliente/restaurante/${id}`);
  const hayContenido = secciones.some((s) => (datos[s.clave] || []).length > 0);

  return (
    <div className="explorar-page">
      <section className="explorar-header">
        <div className="explorar-header-text">
          <h1 className="explorar-title">Explorar</h1>
          <p className="explorar-subtitle">Descubre qué pedir hoy.</p>
        </div>
      </section>

      <form className="explorar-search-row" onSubmit={buscar}>
        <div className="explorar-search-input">
          <Search size={20} className="explorar-search-icon" />
          <input
            type="search"
            placeholder="Busca restaurantes o platos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            maxLength={100}
          />
        </div>
      </form>

      <section className="explorar-section">
        <div className="explorar-categories-scroll">
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
                <cat.icono size={20} />
              </span>
              <span className="category-chip-label">{cat.nombre}</span>
            </button>
          ))}
        </div>
      </section>

      {cargando && <p className="explorar-status">Cargando restaurantes...</p>}
      {!cargando && error && <p className="explorar-status error">{error}</p>}
      {!cargando && !error && !hayContenido && (
        <p className="explorar-status">
          Aún no hay restaurantes destacados. Mira la lista completa.
        </p>
      )}

      {secciones.map((s) => {
        const lista = datos[s.clave] || [];
        if (lista.length === 0) return null; // una sección vacía no se muestra

        return (
          <section key={s.clave} className="explorar-section">
            <div className="explorar-section-header">
              <div>
                <h3>{s.titulo}</h3>
                <span className="explorar-section-note">{s.nota}</span>
              </div>
              <button
                type="button"
                className="explorar-link-btn"
                onClick={() =>
                  navigate(`/cliente/restaurantes?filtro=${s.clave}`)
                }
              >
                Ver todos
              </button>
            </div>

            {s.formato === "grid" ? (
              <div className="popular-grid">
                {lista.map((r) => (
                  <div
                    key={r.id}
                    className={
                      r.abierto ? "popular-card" : "popular-card cerrado"
                    }
                    role="button"
                    tabIndex={0}
                    onClick={() => abrir(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") abrir(r.id);
                    }}
                  >
                    <img
                      src={
                        r.foto_portada ||
                        r.logo ||
                        `https://picsum.photos/seed/restaurante-${r.id}/300/300`
                      }
                      alt={r.nombre}
                      className="popular-card-img"
                    />
                    <span className="popular-card-name">{r.nombre}</span>
                    <span className="popular-card-rating">
                      {r.abierto ? valoracion(r) : "Cerrado"}
                    </span>
                    <span className="popular-card-rating">
                      {r.tiempo_min}-{r.tiempo_max} min
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="nearby-list">
                {lista.map((r) => (
                  <div
                    key={r.id}
                    className={
                      r.abierto ? "nearby-card" : "nearby-card cerrado"
                    }
                    role="button"
                    tabIndex={0}
                    onClick={() => abrir(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") abrir(r.id);
                    }}
                  >
                    <img
                      src={
                        r.foto_portada ||
                        r.logo ||
                        `https://picsum.photos/seed/restaurante-${r.id}/300/200`
                      }
                      alt={r.nombre}
                      className="nearby-card-img"
                    />
                    <div className="nearby-card-body">
                      <div className="nearby-card-top">
                        <span className="nearby-card-name">{r.nombre}</span>
                        <span
                          className={
                            r.abierto
                              ? "nearby-card-badge"
                              : "nearby-card-badge closed"
                          }
                        >
                          {r.abierto ? "Abierto" : "Cerrado"}
                        </span>
                      </div>
                      {r.categorias_texto && (
                        <span className="nearby-card-tags">
                          {r.categorias_texto}
                        </span>
                      )}
                      <span className="nearby-card-rating">
                        {valoracion(r)}
                      </span>
                      <span className="nearby-card-delivery">
                        {r.tiempo_min}-{r.tiempo_max} min · Envío{" "}
                        {formatXAF(r.costo_envio)}
                        {r.pedido_minimo > 0
                          ? ` · Mín. ${formatXAF(r.pedido_minimo)}`
                          : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {!cargando && (
        <button
          type="button"
          className="explorar-all-btn"
          onClick={() => navigate("/cliente/restaurantes")}
        >
          Ver todos los restaurantes
        </button>
      )}
    </div>
  );
}

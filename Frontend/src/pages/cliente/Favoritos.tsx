import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Star } from "lucide-react";
import CorazonFavorito from "../../components/common/CorazonFavorito";
import { guardarFavorito } from "../../utils/favoritos";
import "../../styles/cliente/Favoritos.css";

const API_URL = import.meta.env.VITE_API_URL;

interface RestauranteFavorito {
  id: number;
  nombre: string;
  logo: string | null;
  foto_portada: string | null;
  categorias_texto: string | null;
  rating: number;
  reviews_count: number;
  tiempo_min: number;
  tiempo_max: number;
  abierto: boolean;
  es_favorito: boolean;
}

export default function Favoritos() {
  const navigate = useNavigate();

  const [lista, setLista] = useState<RestauranteFavorito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/cliente/favoritos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setLista(res.data))
      .catch(() => setError("No se pudieron cargar tus favoritos"))
      .finally(() => setCargando(false));
  }, []);

  // El corazón se pinta al instante; si el servidor falla, vuelve al estado anterior.
  // La tarjeta se queda en pantalla hasta que sales, por si lo tocaste sin querer.
  const alternar = (id: number, valor: boolean) => {
    const poner = (v: boolean) =>
      setLista((prev) =>
        prev.map((r) => (r.id === id ? { ...r, es_favorito: v } : r)),
      );

    poner(valor);
    guardarFavorito(id, valor).catch(() => poner(!valor));
  };

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
      </section>

      <p className="favoritos-subtitle">
        Tus restaurantes favoritos, siempre a mano.
      </p>

      {cargando && (
        <p className="favoritos-status">Cargando tus favoritos...</p>
      )}
      {!cargando && error && <p className="favoritos-status error">{error}</p>}

      {!cargando && !error && lista.length === 0 && (
        <div className="favoritos-empty">
          <p className="favoritos-status">
            Aún no tienes restaurantes favoritos. Toca el corazón en un
            restaurante para guardarlo aquí.
          </p>
          <button
            type="button"
            className="favoritos-empty-btn"
            onClick={() => navigate("/cliente/restaurantes")}
          >
            Ver restaurantes
          </button>
        </div>
      )}

      <div className="favoritos-list">
        {lista.map((r) => (
          <div
            key={r.id}
            className={r.abierto ? "favorito-card" : "favorito-card cerrado"}
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
                `https://picsum.photos/seed/restaurante-${r.id}/200/200`
              }
              alt={r.nombre}
              className="favorito-img"
            />
            <div className="favorito-info">
              <span className="favorito-name">{r.nombre}</span>
              {r.categorias_texto && (
                <span className="favorito-categoria">{r.categorias_texto}</span>
              )}
              <span className="favorito-meta">
                {!r.abierto ? (
                  "Cerrado"
                ) : r.reviews_count > 0 ? (
                  <>
                    <Star size={13} className="favorito-star" />
                    {r.rating.toFixed(1)} ({r.reviews_count})
                  </>
                ) : (
                  "Nuevo"
                )}{" "}
                · {r.tiempo_min}-{r.tiempo_max} min
              </span>
            </div>
            <CorazonFavorito
              activo={r.es_favorito}
              onCambiar={(v) => alternar(r.id, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

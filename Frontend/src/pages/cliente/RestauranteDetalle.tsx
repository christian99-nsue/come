import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  ShoppingBag,
  ChevronRight,
  Plus,
  Minus,
  MapPin,
  Phone,
  Wallet,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useCarrito } from "../../context/useCarrito";
import { formatXAF } from "../../utils/carritoCalculos";
import CorazonFavorito from "../../components/common/CorazonFavorito";
import { guardarFavorito } from "../../utils/favoritos";
import PestanaValoraciones from "../../components/common/PestanaValoraciones";
import BannerVentanas from "../../components/common/BannerVentanas";
import "../../styles/cliente/restauranteDetalle.css";
import HorarioEntregas from "../../components/common/HorarioEntregas";

const API_URL = import.meta.env.VITE_API_URL;

type Tab = "menu" | "informacion" | "valoraciones" | "fotos";

interface Plato {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
  precio: number;
  categoria_id: number | null;
  disponible: boolean;
}

interface Detalle {
  restaurante: {
    id: number;
    nombre: string;
    logo: string | null;
    telefono: string | null;
    direccion: string | null;
    categorias_texto: string | null;
    abierto: boolean;
    rating: number;
    reviews_count: number;
    tiempo_min: number;
    tiempo_max: number;
    costo_envio: number;
    pedido_minimo: number;
    metodos_pago: string[];
    es_favorito: boolean;
  };
  categorias: { id: number; nombre: string }[];
  platos: Plato[];
  fotos: { id: number; url: string }[];
}

const nombresMetodos: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};

export default function RestauranteDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const {
    items,
    cantidadTotal,
    subtotalAprox,
    agregar,
    reemplazarCon,
    cambiarCantidad,
  } = useCarrito();

  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("menu");
  const [grupoActivo, setGrupoActivo] = useState<number | "todo">("todo");
  const [pendiente, setPendiente] = useState<Plato | null>(null);
  const [esFavorito, setEsFavorito] = useState(false);

  useEffect(() => {
    let cancelado = false;

    const cargarRestaurante = async () => {
      try {
        const res = await axios.get<Detalle>(
          `${API_URL}/api/cliente/restaurantes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (cancelado) return;

        setDetalle(res.data);
        setEsFavorito(!!res.data.restaurante.es_favorito);
        setError("");
      } catch (err: unknown) {
        if (cancelado) return;

        if (axios.isAxiosError<{ message?: string }>(err)) {
          setError(
            err.response?.data?.message || "No se pudo cargar el restaurante",
          );
        } else {
          setError("No se pudo cargar el restaurante");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    void cargarRestaurante();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (cargando) {
    return (
      <div className="detalle-page">
        <p className="detalle-status">Cargando restaurante...</p>
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className="detalle-page">
        <p className="detalle-status error">{error}</p>
        <button
          type="button"
          className="detalle-back-link"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>
    );
  }

  const r = detalle.restaurante;

  const alternarFavorito = (valor: boolean) => {
    setEsFavorito(valor);
    guardarFavorito(r.id, valor).catch(() => setEsFavorito(!valor));
  };

  const portada = detalle.fotos[0]?.url || r.logo;
  const restauranteCarrito = { id: r.id, nombre: r.nombre };

  const cantidadEn = (platoId: number) =>
    items.find((i) => i.plato_id === platoId)?.cantidad ?? 0;

  const nuevoPlato = (p: Plato) => ({
    plato_id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    imagen: p.imagen,
  });

  const agregarPlato = (p: Plato) => {
    if (agregar(restauranteCarrito, nuevoPlato(p)) === "otro_restaurante") {
      setPendiente(p);
    }
  };

  // Agrupa el menú por categoría; los platos sin categoría van en "Otros".
  const grupos = [
    ...detalle.categorias.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      platos: detalle.platos.filter((p) => p.categoria_id === c.id),
    })),
    {
      id: 0,
      nombre: "Otros",
      platos: detalle.platos.filter(
        (p) =>
          !p.categoria_id ||
          !detalle.categorias.some((c) => c.id === p.categoria_id),
      ),
    },
  ].filter((g) => g.platos.length > 0);

  const gruposVisibles =
    grupoActivo === "todo"
      ? grupos
      : grupos.filter((g) => g.id === grupoActivo);

  return (
    <div className="detalle-page">
      <div className="detalle-hero">
        {portada ? (
          <img src={portada} alt={r.nombre} className="detalle-hero-img" />
        ) : (
          <div className="detalle-hero-placeholder" />
        )}

        <button
          type="button"
          className="detalle-hero-btn detalle-hero-back"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="detalle-hero-actions">
          <CorazonFavorito
            variante="hero"
            activo={esFavorito}
            onCambiar={alternarFavorito}
          />
        </div>

        {r.logo && (
          <img
            src={r.logo}
            alt={`Logo de ${r.nombre}`}
            className="detalle-logo"
          />
        )}
      </div>

      <section className="detalle-info">
        <div className="detalle-name-row">
          <h1 className="detalle-name">{r.nombre}</h1>
          <span
            className={
              r.abierto ? "detalle-open-badge" : "detalle-open-badge closed"
            }
          >
            {r.abierto ? "Abierto" : "Cerrado"}
          </span>
        </div>

        <p className="detalle-rating-row">
          {r.reviews_count > 0 ? (
            <>
              <Star size={14} className="detalle-star-icon" />
              <strong>{r.rating.toFixed(1)}</strong> ({r.reviews_count})
            </>
          ) : (
            <strong>Nuevo</strong>
          )}
          {r.categorias_texto ? ` · ${r.categorias_texto}` : ""}
        </p>

        <div className="detalle-quick-row">
          <span className="detalle-quick-item">
            <Clock size={14} /> {r.tiempo_min}-{r.tiempo_max} min
          </span>
          <span className="detalle-quick-item">
            <Bike size={14} /> Envío {formatXAF(r.costo_envio)}
          </span>
        </div>

        {!r.abierto && (
          <div className="detalle-closed-banner">
            Este restaurante está cerrado ahora. Puedes ver su menú, pero no
            hacer pedidos.
          </div>
        )}

        {tab === "menu" && (
          <div className="detalle-stats">
            <div className="detalle-stat">
              <Clock size={20} className="detalle-stat-icon" />
              <span className="detalle-stat-title">Entrega</span>
              <span className="detalle-stat-value">
                {r.tiempo_min}-{r.tiempo_max} min
              </span>
            </div>

            <div className="detalle-stat">
              <Bike size={20} className="detalle-stat-icon" />
              <span className="detalle-stat-title">Envío</span>
              <span className="detalle-stat-value">
                {formatXAF(r.costo_envio)}
              </span>
            </div>

            <div className="detalle-stat">
              <ShoppingBag size={20} className="detalle-stat-icon" />
              <span className="detalle-stat-title">Mínimo</span>
              <span className="detalle-stat-value">
                {r.pedido_minimo > 0
                  ? formatXAF(r.pedido_minimo)
                  : "Sin mínimo"}
              </span>
            </div>

            <div className="detalle-stat">
              <Star size={20} className="detalle-stat-icon" />
              <span className="detalle-stat-title">Valoración</span>
              <span className="detalle-stat-value">
                {r.reviews_count > 0 ? r.rating.toFixed(1) : "Nuevo"}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Ventanas de entrega y horarios de pedido */}
      <BannerVentanas />

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
          Valoraciones{r.reviews_count > 0 ? ` (${r.reviews_count})` : ""}
        </button>

        <button
          type="button"
          className={tab === "fotos" ? "detalle-tab active" : "detalle-tab"}
          onClick={() => setTab("fotos")}
        >
          Fotos
        </button>
      </div>

      {tab === "menu" && (
        <>
          {grupos.length === 0 && (
            <p className="detalle-status">
              Este restaurante aún no tiene platos.
            </p>
          )}

          {grupos.length > 1 && (
            <div className="detalle-menu-categories-scroll">
              <button
                type="button"
                className={
                  grupoActivo === "todo"
                    ? "quick-filter-chip active"
                    : "quick-filter-chip"
                }
                onClick={() => setGrupoActivo("todo")}
              >
                <span className="category-chip-label">Todo</span>
              </button>

              {grupos.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={
                    grupoActivo === g.id
                      ? "quick-filter-chip active"
                      : "quick-filter-chip"
                  }
                  onClick={() => setGrupoActivo(g.id)}
                >
                  <span className="quick-filter-chip-label">{g.nombre}</span>
                </button>
              ))}
            </div>
          )}

          <section className="detalle-menu-section">
            {gruposVisibles.map((g) => (
              <div key={g.id}>
                <h3 className="menu-group-title">{g.nombre}</h3>

                <div className="menu-item-list">
                  {g.platos.map((p) => {
                    const cantidad = cantidadEn(p.id);
                    const puedePedir = r.abierto && p.disponible;

                    return (
                      <div key={p.id} className="menu-item-row">
                        <img
                          src={
                            p.imagen ||
                            `https://picsum.photos/seed/plato-${p.id}/200/200`
                          }
                          alt={p.nombre}
                          className="menu-item-img"
                        />

                        <div className="menu-item-info">
                          <span className="menu-item-name">{p.nombre}</span>

                          {p.descripcion && (
                            <span className="menu-item-desc">
                              {p.descripcion}
                            </span>
                          )}

                          <span className="menu-item-price">
                            {formatXAF(p.precio)}
                          </span>
                        </div>

                        {!p.disponible ? (
                          <span className="menu-item-soldout">Agotado</span>
                        ) : cantidad > 0 ? (
                          <div className="menu-item-stepper">
                            <button
                              type="button"
                              onClick={() => cambiarCantidad(p.id, -1)}
                              aria-label="Quitar uno"
                            >
                              <Minus size={14} />
                            </button>

                            <span>{cantidad}</span>

                            <button
                              type="button"
                              onClick={() => agregarPlato(p)}
                              disabled={!puedePedir}
                              aria-label="Añadir uno"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="menu-item-add-btn"
                            onClick={() => agregarPlato(p)}
                            disabled={!puedePedir}
                            aria-label={`Añadir ${p.nombre}`}
                          >
                            <Plus size={18} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {tab === "informacion" && (
        <section className="detalle-menu-section">
          <div className="rd-info-block">
            {r.direccion && (
              <div className="rd-info-row">
                <span className="rd-info-icon">
                  <MapPin size={18} />
                </span>

                <div className="rd-info-text">
                  <span className="rd-info-title">Dirección</span>
                  <span className="rd-info-sub">{r.direccion}</span>
                </div>
              </div>
            )}

            {r.telefono && (
              <div className="rd-info-row">
                <span className="rd-info-icon">
                  <Phone size={18} />
                </span>

                <div className="rd-info-text">
                  <span className="rd-info-title">Teléfono</span>
                  <a className="rd-info-link" href={`tel:${r.telefono}`}>
                    {r.telefono}
                  </a>
                </div>
              </div>
            )}

            <div className="rd-info-row">
              <span className="rd-info-icon">
                <Wallet size={18} />
              </span>

              <div className="rd-info-text">
                <span className="rd-info-title">Métodos de pago</span>
                <span className="rd-info-sub">
                  {r.metodos_pago
                    .map((m) => nombresMetodos[m] || m)
                    .join(" · ")}
                </span>
              </div>
            </div>
          </div>
          <HorarioEntregas />
        </section>
      )}

      {tab === "valoraciones" && (
        <section className="detalle-menu-section">
          <PestanaValoraciones restauranteId={r.id} />
        </section>
      )}

      {tab === "fotos" && (
        <section className="detalle-menu-section">
          {detalle.fotos.length === 0 ? (
            <p className="detalle-status">
              Este restaurante aún no ha subido fotos.
            </p>
          ) : (
            <div className="photo-grid photo-grid-3">
              {detalle.fotos.map((f) => (
                <img
                  key={f.id}
                  src={f.url}
                  alt="Foto del restaurante"
                  className="photo-grid-img"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {cantidadTotal > 0 && (
        <button
          type="button"
          className="floating-cart-bar"
          onClick={() => navigate("/cliente/carrito")}
        >
          <div className="floating-cart-left">
            <span className="floating-cart-icon-wrapper">
              <ShoppingBag size={18} />
              <span className="floating-cart-count">{cantidadTotal}</span>
            </span>

            <div className="floating-cart-text">
              <span className="floating-cart-title">Ver carrito</span>
              <span className="floating-cart-subtitle">
                {cantidadTotal} {cantidadTotal === 1 ? "producto" : "productos"}{" "}
                · {formatXAF(subtotalAprox)}
              </span>
            </div>
          </div>

          <span className="floating-cart-cta">
            Ir al carrito <ChevronRight size={16} />
          </span>
        </button>
      )}

      <ConfirmModal
        open={pendiente !== null}
        title="¿Empezar un carrito nuevo?"
        message="Tu carrito tiene productos de otro restaurante. Si sigues, se vaciará y se añadirá este producto."
        confirmLabel="Vaciar y añadir"
        cancelLabel="Cancelar"
        danger
        onConfirm={() => {
          if (pendiente) {
            reemplazarCon(restauranteCarrito, nuevoPlato(pendiente));
          }
          setPendiente(null);
        }}
        onCancel={() => setPendiente(null)}
      />
    </div>
  );
}

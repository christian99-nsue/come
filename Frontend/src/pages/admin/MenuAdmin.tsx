import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Plus } from "lucide-react";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/MenuAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

type Tab = "platos" | "categorias";

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
}

interface Plato {
  id: number;
  nombre: string;
  imagen: string | null;
  precio: number;
  disponible: boolean;
  categoria_id: number | null;
}

function formatXAF(v: number) {
  return `${Number(v).toLocaleString("es-ES")} XAF`;
}

export default function MenuAdmin() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("platos");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState<number | "todos">(
    "todos",
  );

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      if (!cancelado) {
        setCargando(true);
        setError("");
      }

      try {
        const [catRes, platoRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/menu/categorias`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/admin/menu/platos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!cancelado) {
          setCategorias(catRes.data);
          setPlatos(platoRes.data);
        }
      } catch {
        if (!cancelado) {
          setError("No se pudo cargar el menú");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, [token]);

  const toggleDisponibilidad = async (plato: Plato) => {
    const nuevoValor = !plato.disponible;

    // Actualización optimista para que se sienta instantáneo.
    setPlatos((prev) =>
      prev.map((p) =>
        p.id === plato.id ? { ...p, disponible: nuevoValor } : p,
      ),
    );

    try {
      await axios.patch(
        `${API_URL}/api/admin/menu/platos/${plato.id}/disponibilidad`,
        { disponible: nuevoValor },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      // Revertir si falla.
      setPlatos((prev) =>
        prev.map((p) =>
          p.id === plato.id ? { ...p, disponible: plato.disponible } : p,
        ),
      );
    }
  };

  const platosFiltrados = platos.filter((p) => {
    const coincideBusqueda = p.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoriaActiva === "todos" || p.categoria_id === categoriaActiva;

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="admin-page">
      <section className="admin-header">
        <h1 className="admin-title">Menú</h1>
      </section>

      <div className="menu-tabs">
        <button
          type="button"
          className={tab === "platos" ? "menu-tab active" : "menu-tab"}
          onClick={() => setTab("platos")}
        >
          Platos
        </button>

        <button
          type="button"
          className={tab === "categorias" ? "menu-tab active" : "menu-tab"}
          onClick={() => setTab("categorias")}
        >
          Categorías
        </button>
      </div>

      <button
        type="button"
        className="admin-btn-primary menu-create-btn"
        onClick={() =>
          navigate(
            tab === "platos"
              ? "/admin/menu/crear-plato"
              : "/admin/menu/crear-categoria",
          )
        }
      >
        <Plus size={17} />{" "}
        {tab === "platos" ? "Crear plato" : "Crear categoría"}
      </button>

      {cargando && <p className="pedidos-status-text">Cargando menú...</p>}

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      {!cargando && !error && tab === "platos" && (
        <>
          <div className="menu-search-wrapper">
            <Search size={16} className="menu-search-icon" />

            <input
              type="text"
              placeholder="Buscar platos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="menu-search-input"
            />
          </div>

          <div className="menu-categories-scroll">
            <button
              type="button"
              className={
                categoriaActiva === "todos"
                  ? "menu-category-chip active"
                  : "menu-category-chip"
              }
              onClick={() => setCategoriaActiva("todos")}
            >
              Todos
            </button>

            {categorias.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={
                  categoriaActiva === cat.id
                    ? "menu-category-chip active"
                    : "menu-category-chip"
                }
                onClick={() => setCategoriaActiva(cat.id)}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          <div className="menu-platos-list">
            {platosFiltrados.map((plato) => (
              <button
                key={plato.id}
                type="button"
                className="menu-plato-row"
                onClick={() => navigate(`/admin/menu/editar-plato/${plato.id}`)}
              >
                <img
                  src={
                    plato.imagen ||
                    "https://picsum.photos/seed/plato-placeholder/100/100"
                  }
                  alt={plato.nombre}
                  className="menu-plato-img"
                />

                <div className="menu-plato-info">
                  <span className="menu-plato-nombre">{plato.nombre}</span>

                  <span className="menu-plato-precio">
                    {formatXAF(plato.precio)}
                  </span>

                  <span
                    className={
                      plato.disponible
                        ? "menu-plato-estado disponible"
                        : "menu-plato-estado"
                    }
                  >
                    ● {plato.disponible ? "Disponible" : "No disponible"}
                  </span>
                </div>

                <span
                  role="button"
                  tabIndex={0}
                  className={
                    plato.disponible ? "toggle-switch active" : "toggle-switch"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDisponibilidad(plato);
                  }}
                  aria-label={`Activar/desactivar ${plato.nombre}`}
                >
                  <span className="toggle-knob" />
                </span>
              </button>
            ))}

            {platosFiltrados.length === 0 && (
              <p className="pedidos-status-text">
                No hay platos que coincidan.
              </p>
            )}
          </div>
        </>
      )}

      {!cargando && !error && tab === "categorias" && (
        <div className="menu-categorias-list">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className="menu-categoria-card"
              onClick={() => navigate(`/admin/menu/editar-categoria/${cat.id}`)}
            >
              <img
                src={
                  cat.imagen ||
                  "https://picsum.photos/seed/categoria-placeholder/100/100"
                }
                alt={cat.nombre}
                className="menu-categoria-img"
              />

              <div className="menu-categoria-info">
                <span className="menu-categoria-nombre">{cat.nombre}</span>

                {cat.descripcion && (
                  <span className="menu-categoria-desc">{cat.descripcion}</span>
                )}

                <span className="menu-categoria-count">
                  {platos.filter((p) => p.categoria_id === cat.id).length}{" "}
                  platos
                </span>
              </div>
            </button>
          ))}

          {categorias.length === 0 && (
            <p className="pedidos-status-text">
              Aún no tienes categorías creadas.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

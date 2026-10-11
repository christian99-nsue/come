import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Beef, Carrot, CupSoda, Package, Plus } from "lucide-react";
import {
  useAbastecimientoCart,
  type ProductoAbastecimiento,
} from "../../context/AbastecimientoCartContext";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/AbastecimientoAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

type Categoria = "todos" | "carnes" | "ingredientes" | "bebidas" | "materiales";
type Tab = "productos" | "mis_pedidos";

interface PedidoAbastecimiento {
  id: number;
  estado: string;
  total: number;
  turno_entrega: string | null;
  fecha_creacion: string;
}

const categorias: { id: Categoria; label: string; icon: typeof Beef }[] = [
  { id: "todos", label: "Todos", icon: Package },
  { id: "carnes", label: "Carnes", icon: Beef },
  { id: "ingredientes", label: "Ingredientes", icon: Carrot },
  { id: "bebidas", label: "Bebidas", icon: CupSoda },
  { id: "materiales", label: "Material", icon: Package },
];

function formatXAF(v: number) {
  return `${Number(v).toLocaleString("es-ES")} XAF`;
}

export default function AbastecimientoAdmin() {
  const navigate = useNavigate();
  const { agregarProducto, total, cantidadTotal } = useAbastecimientoCart();

  const [tab, setTab] = useState<Tab>("productos");
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState<ProductoAbastecimiento[]>([]);
  const [pedidos, setPedidos] = useState<PedidoAbastecimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (tab !== "productos") return;

    const cargarProductos = async () => {
      setCargando(true);
      setError("");

      try {
        const res = await axios.get(
          `${API_URL}/api/admin/abastecimiento/productos`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              categoria:
                categoriaActiva !== "todos" ? categoriaActiva : undefined,
              busqueda: busqueda || undefined,
            },
          },
        );

        setProductos(res.data);
      } catch {
        setError("No se pudo cargar el catálogo");
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, [tab, categoriaActiva, busqueda, token]);

  useEffect(() => {
    if (tab !== "mis_pedidos") return;

    const cargarPedidos = async () => {
      setCargando(true);
      setError("");

      try {
        const res = await axios.get(
          `${API_URL}/api/admin/abastecimiento/pedidos`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setPedidos(res.data);
      } catch {
        setError("No se pudieron cargar tus pedidos");
      } finally {
        setCargando(false);
      }
    };

    cargarPedidos();
  }, [tab, token]);

  return (
    <div
      className="admin-page"
      style={{ paddingBottom: cantidadTotal > 0 ? 130 : 100 }}
    >
      <section className="admin-header">
        <h1 className="admin-title">Abastecimiento</h1>
      </section>

      <div className="abast-tabs">
        <button
          type="button"
          className={tab === "productos" ? "abast-tab active" : "abast-tab"}
          onClick={() => setTab("productos")}
        >
          Productos
        </button>

        <button
          type="button"
          className={tab === "mis_pedidos" ? "abast-tab active" : "abast-tab"}
          onClick={() => setTab("mis_pedidos")}
        >
          Mis pedidos
        </button>
      </div>

      {tab === "productos" && (
        <>
          <div className="abast-search-wrapper">
            <Search size={16} className="abast-search-icon" />

            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="abast-search-input"
            />
          </div>

          <div className="abast-categories-row">
            {categorias.map((cat) => {
              const Icon = cat.icon;

              return (
                <button
                  key={cat.id}
                  type="button"
                  className={
                    categoriaActiva === cat.id
                      ? "abast-category-chip active"
                      : "abast-category-chip"
                  }
                  onClick={() => setCategoriaActiva(cat.id)}
                >
                  <Icon size={18} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {cargando && (
            <p className="pedidos-status-text">Cargando catálogo...</p>
          )}

          {error && (
            <p className="pedidos-status-text pedidos-status-error">{error}</p>
          )}

          <div className="abast-productos-list">
            {productos.map((prod) => (
              <div key={prod.id} className="abast-producto-row">
                <img
                  src={
                    prod.imagen ||
                    "https://picsum.photos/seed/abast-placeholder/100/100"
                  }
                  alt={prod.nombre}
                  className="abast-producto-img"
                />

                <div className="abast-producto-info">
                  <span className="abast-producto-nombre">{prod.nombre}</span>

                  <span className="abast-producto-precio">
                    {formatXAF(prod.precio)}
                  </span>
                </div>

                <button
                  type="button"
                  className="abast-add-btn"
                  onClick={() => agregarProducto(prod)}
                  aria-label={`Añadir ${prod.nombre}`}
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}

            {!cargando && !error && productos.length === 0 && (
              <p className="pedidos-status-text">
                No hay productos en esta categoría.
              </p>
            )}
          </div>
        </>
      )}

      {tab === "mis_pedidos" && (
        <>
          {cargando && (
            <p className="pedidos-status-text">Cargando tus pedidos...</p>
          )}

          {error && (
            <p className="pedidos-status-text pedidos-status-error">{error}</p>
          )}

          <div className="abast-pedidos-list">
            {pedidos.map((p) => (
              <div key={p.id} className="abast-pedido-card">
                <div className="abast-pedido-top">
                  <span
                    className={`admin-badge admin-badge-${
                      p.estado === "entregado"
                        ? "green"
                        : p.estado === "cancelado"
                          ? "gray"
                          : "orange"
                    }`}
                  >
                    {p.estado}
                  </span>

                  <span className="abast-pedido-fecha">
                    {new Date(p.fecha_creacion).toLocaleDateString("es-ES")}
                  </span>
                </div>

                <span className="abast-pedido-total">{formatXAF(p.total)}</span>

                {p.turno_entrega && (
                  <span className="abast-pedido-turno">{p.turno_entrega}</span>
                )}
              </div>
            ))}

            {!cargando && !error && pedidos.length === 0 && (
              <p className="pedidos-status-text">
                Aún no has hecho pedidos de abastecimiento.
              </p>
            )}
          </div>
        </>
      )}

      {cantidadTotal > 0 && (
        <button
          type="button"
          className="abast-cart-bar"
          onClick={() => navigate("/admin/abastecimiento/carrito")}
        >
          <span>Ver carrito ({cantidadTotal})</span>
          <span>{formatXAF(total)}</span>
        </button>
      )}
    </div>
  );
}

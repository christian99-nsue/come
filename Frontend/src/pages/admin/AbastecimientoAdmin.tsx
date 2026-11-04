import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Beef,
  Carrot,
  CupSoda,
  Package,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useAbastecimientoCart } from "../../context/useAbastecimientoCart";
import type { ProductoAbastecimiento } from "../../context/AbastecimientoCartContextValue";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/AbastecimientoAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

type Categoria = "todos" | "carnes" | "ingredientes" | "bebidas" | "materiales";
type Tab = "productos" | "mis_pedidos";
type EstadoPedido = "pendiente" | "confirmado" | "entregado" | "cancelado";

interface PedidoAbastecimiento {
  id: number;
  estado: EstadoPedido;
  total: number;
  turno_entrega: string | null;
  hora_entrega: string | null;
  motivo_cancelacion: string | null;
  fecha_creacion: string;
  lineas: number;
  unidades: number;
}

const categorias: { id: Categoria; label: string; icon: typeof Beef }[] = [
  { id: "todos", label: "Todos", icon: Package },
  { id: "carnes", label: "Carnes", icon: Beef },
  { id: "ingredientes", label: "Ingredientes", icon: Carrot },
  { id: "bebidas", label: "Bebidas", icon: CupSoda },
  { id: "materiales", label: "Material", icon: Package },
];

const etiquetasEstado: Record<EstadoPedido, { texto: string; clase: string }> =
  {
    pendiente: { texto: "Pendiente", clase: "orange" },
    confirmado: { texto: "Confirmado", clase: "blue" },
    entregado: { texto: "Entregado", clase: "green" },
    cancelado: { texto: "Cancelado", clase: "red" },
  };

function formatXAF(v: number) {
  return `${Number(v).toLocaleString("es-ES")} XAF`;
}

function fechaCorta(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TarjetaPedido({
  p,
  onAbrir,
}: {
  p: PedidoAbastecimiento;
  onAbrir: () => void;
}) {
  const e = etiquetasEstado[p.estado] ?? { texto: p.estado, clase: "gray" };

  return (
    <button type="button" className="abast-pedido-card" onClick={onAbrir}>
      <div className="abast-pedido-top">
        <span className={`admin-badge admin-badge-${e.clase}`}>{e.texto}</span>
        <span className="abast-pedido-fecha">
          {fechaCorta(p.fecha_creacion)}
        </span>
      </div>

      <span className="abast-pedido-numero">
        Pedido #{p.id} · {p.lineas} {p.lineas === 1 ? "producto" : "productos"}{" "}
        · {p.unidades} {p.unidades === 1 ? "unidad" : "unidades"}
      </span>

      <div className="abast-pedido-bottom">
        <span className="abast-pedido-total">{formatXAF(p.total)}</span>
        <ChevronRight size={18} color="#9ca3af" />
      </div>

      {p.estado === "confirmado" && p.hora_entrega && (
        <span className="abast-pedido-turno">
          Entrega estimada: {p.hora_entrega}
        </span>
      )}
      {p.turno_entrega && p.estado !== "cancelado" && (
        <span className="abast-pedido-turno">{p.turno_entrega}</span>
      )}
      {p.estado === "cancelado" && p.motivo_cancelacion && (
        <span className="abast-pedido-motivo">
          Motivo: {p.motivo_cancelacion}
        </span>
      )}
    </button>
  );
}

export default function AbastecimientoAdmin() {
  const navigate = useNavigate();
  const { agregarProducto, total, cantidadTotal } = useAbastecimientoCart();

  // La pestaña vive en la dirección: al volver desde un pedido se regresa a "Mis pedidos"
  const [params, setParams] = useSearchParams();
  const tab: Tab =
    params.get("tab") === "mis_pedidos" ? "mis_pedidos" : "productos";
  const cambiarTab = (t: Tab) =>
    setParams(t === "productos" ? {} : { tab: t }, { replace: true });

  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState<ProductoAbastecimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [pedidos, setPedidos] = useState<PedidoAbastecimiento[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [errorPedidos, setErrorPedidos] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (tab !== "productos") return;

    let cancelado = false;

    const cargarProductos = async () => {
      try {
        const res = await axios.get<ProductoAbastecimiento[]>(
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

        if (!cancelado) {
          setProductos(res.data);
          setError("");
        }
      } catch {
        if (!cancelado) {
          setError("No se pudo cargar el catálogo");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    void cargarProductos();

    return () => {
      cancelado = true;
    };
  }, [tab, categoriaActiva, busqueda, token]);

  // Los pedidos se piden siempre (para el contador de la pestaña) y se actualizan solos
  const cargarPedidos = useCallback(() => {
    axios
      .get(`${API_URL}/api/admin/abastecimiento/pedidos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPedidos(res.data);
        setErrorPedidos("");
      })
      .catch(() => setErrorPedidos("No se pudieron cargar tus pedidos"))
      .finally(() => setCargandoPedidos(false));
  }, [token]);

  useEffect(() => {
    cargarPedidos();
    const intervalo = setInterval(cargarPedidos, 30000);
    return () => clearInterval(intervalo);
  }, [cargarPedidos]);

  const enCurso = pedidos.filter(
    (p) => p.estado === "pendiente" || p.estado === "confirmado",
  );
  const anteriores = pedidos.filter(
    (p) => p.estado !== "pendiente" && p.estado !== "confirmado",
  );

  const abrirPedido = (id: number) =>
    navigate(`/admin/abastecimiento/pedidos/${id}`);

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
          onClick={() => cambiarTab("productos")}
        >
          Productos
        </button>
        <button
          type="button"
          className={tab === "mis_pedidos" ? "abast-tab active" : "abast-tab"}
          onClick={() => cambiarTab("mis_pedidos")}
        >
          Mis pedidos{enCurso.length > 0 ? ` (${enCurso.length})` : ""}
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
          {cargandoPedidos && (
            <p className="pedidos-status-text">Cargando tus pedidos...</p>
          )}
          {errorPedidos && (
            <p className="pedidos-status-text pedidos-status-error">
              {errorPedidos}
            </p>
          )}

          {!cargandoPedidos && !errorPedidos && pedidos.length === 0 && (
            <p className="pedidos-status-text">
              Aún no has hecho pedidos de abastecimiento.
            </p>
          )}

          {enCurso.length > 0 && (
            <>
              <h3 className="admin-section-title-sm">En curso</h3>
              <div className="abast-pedidos-list">
                {enCurso.map((p) => (
                  <TarjetaPedido
                    key={p.id}
                    p={p}
                    onAbrir={() => abrirPedido(p.id)}
                  />
                ))}
              </div>
            </>
          )}

          {anteriores.length > 0 && (
            <>
              <h3 className="admin-section-title-sm">Anteriores</h3>
              <div className="abast-pedidos-list">
                {anteriores.map((p) => (
                  <TarjetaPedido
                    key={p.id}
                    p={p}
                    onAbrir={() => abrirPedido(p.id)}
                  />
                ))}
              </div>
            </>
          )}
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

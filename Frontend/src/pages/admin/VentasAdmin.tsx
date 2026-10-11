import { useEffect, useState } from "react";
import axios from "axios";
import { TrendingUp, ShoppingBag } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/VentasAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

type Rango = "hoy" | "7dias" | "30dias";

interface VentasData {
  resumen: { ingresos: number; pedidos: number };
  serie: { etiqueta: string; ingresos: number }[];
  productosMasVendidos: { nombre: string; unidades: number }[];
}

function formatXAF(v: number) {
  return `${Math.round(v).toLocaleString("es-ES")} XAF`;
}

export default function VentasAdmin() {
  const [rango, setRango] = useState<Rango>("hoy");
  const [data, setData] = useState<VentasData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarVentas = async () => {
      const token = localStorage.getItem("token");

      setCargando(true);
      setError("");

      try {
        const res = await axios.get(`${API_URL}/api/admin/ventas`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { rango },
        });

        setData(res.data);
      } catch {
        setError("No se pudieron cargar las ventas");
      } finally {
        setCargando(false);
      }
    };

    cargarVentas();
  }, [rango]);

  return (
    <div className="admin-page">
      <section className="admin-header">
        <h1 className="admin-title">Ventas</h1>
      </section>

      <div className="ventas-tabs">
        <button
          type="button"
          className={rango === "hoy" ? "ventas-tab active" : "ventas-tab"}
          onClick={() => setRango("hoy")}
        >
          Hoy
        </button>

        <button
          type="button"
          className={rango === "7dias" ? "ventas-tab active" : "ventas-tab"}
          onClick={() => setRango("7dias")}
        >
          7 días
        </button>

        <button
          type="button"
          className={rango === "30dias" ? "ventas-tab active" : "ventas-tab"}
          onClick={() => setRango("30dias")}
        >
          30 días
        </button>
      </div>

      {cargando && <p className="pedidos-status-text">Cargando ventas...</p>}

      {error && (
        <p className="pedidos-status-text pedidos-status-error">{error}</p>
      )}

      {!cargando && !error && data && (
        <>
          <div className="ventas-summary-grid">
            <div className="ventas-summary-card">
              <span className="ventas-summary-icon">
                <TrendingUp size={18} />
              </span>

              <span className="ventas-summary-value">
                {formatXAF(data.resumen.ingresos)}
              </span>

              <span className="ventas-summary-label">Ingresos</span>
            </div>

            <div className="ventas-summary-card">
              <span className="ventas-summary-icon">
                <ShoppingBag size={18} />
              </span>

              <span className="ventas-summary-value">
                {data.resumen.pedidos}
              </span>

              <span className="ventas-summary-label">Pedidos</span>
            </div>
          </div>

          <h3 className="admin-section-title-sm">Ingresos (XAF)</h3>

          <div className="ventas-chart-card">
            {data.serie.length === 0 ? (
              <p className="pedidos-status-text">
                Aún no hay ventas en este período.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.serie}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />

                  <XAxis
                    dataKey="etiqueta"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />

                  <Tooltip
                    formatter={(value) => formatXAF(Number(value ?? 0))}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                  />

                  <Bar
                    dataKey="ingresos"
                    fill="#16a34a"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <h3 className="admin-section-title-sm">Productos más vendidos</h3>

          {data.productosMasVendidos.length === 0 ? (
            <p className="pedidos-status-text">
              Sin datos suficientes todavía.
            </p>
          ) : (
            <div className="ventas-productos-list">
              {data.productosMasVendidos.map((p, i) => (
                <div key={p.nombre} className="ventas-producto-row">
                  <span className="ventas-producto-rank">{i + 1}</span>

                  <span className="ventas-producto-nombre">{p.nombre}</span>

                  <span className="ventas-producto-unidades">
                    {p.unidades} uds.
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

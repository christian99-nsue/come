import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Lock,
  MapPin,
  ChevronRight,
  Banknote,
  Landmark,
  CreditCard,
} from "lucide-react";
import { useCarrito } from "../../context/useCarrito";
import {
  calcularLineas,
  formatXAF,
  type PlatoCatalogo,
} from "../../utils/carritoCalculos";
import { useVentanas } from "../../hooks/useVentanas";
import VentanasEntrega from "../../components/common/VentanasEntrega";
import type { VentanaOpcion } from "../../hooks/useVentanas";
import "../../styles/cliente/FinalizarPedido.css";
import UbicacionEntrega from "../../components/common/UbicacionEntrega";

const API_URL = import.meta.env.VITE_API_URL;

interface DatosRestaurante {
  nombre: string;
  abierto: boolean;
  costo_envio: number;
  pedido_minimo: number;
  tiempo_min: number;
  tiempo_max: number;
  metodos_pago: string[];
}

interface Direccion {
  id: number;
  etiqueta: string;
  direccion: string;
  referencia: string | null;
}

const metodosInfo: Record<
  string,
  { label: string; detalle: string; icon: typeof Banknote }
> = {
  efectivo: {
    label: "Efectivo",
    detalle: "Pagarás al recibir tu pedido",
    icon: Banknote,
  },
  transferencia: {
    label: "Transferencia",
    detalle: "El restaurante te indicará los datos para transferir",
    icon: Landmark,
  },
  tarjeta: {
    label: "Tarjeta",
    detalle: "El restaurante coordinará el cobro contigo",
    icon: CreditCard,
  },
};

export default function FinalizarPedido() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const {
    restaurante,
    items,
    direccionId,
    metodoPago,
    setMetodoPago,
    vaciar,
    ventana,
    setVentana,
  } = useCarrito();

  const {
    ventanas,
    error: errorVentanas,
    recargar,
    reemplazar,
  } = useVentanas();

  const [avisoVentana, setAvisoVentana] = useState("");

  const [catalogo, setCatalogo] = useState<PlatoCatalogo[] | null>(null);
  const [datos, setDatos] = useState<DatosRestaurante | null>(null);
  const [direccion, setDireccion] = useState<Direccion | null>(null);
  const [metodo, setMetodo] = useState<string>("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const { ubicacion, setUbicacion } = useCarrito();

  // Evita redirigir al carrito cuando el pedido se ha completado.
  const completado = useRef(false);

  // Comprueba si la ventana seleccionada sigue disponible.
  useEffect(() => {
    if (!ventanas || !ventana) return;

    const sigueDisponible = ventanas.some(
      (v) => v.ventana_id === ventana.id && v.fecha === ventana.fecha,
    );

    if (!sigueDisponible) {
      // El estado se actualiza de forma asíncrona para evitar
      // una actualización directa durante la ejecución del efecto.
      const temporizador = window.setTimeout(() => {
        setVentana(null);
        setAvisoVentana(
          "La ventana que habías elegido ya no está disponible. Elige otra.",
        );
      }, 0);

      return () => window.clearTimeout(temporizador);
    }
  }, [ventanas, ventana, setVentana]);

  // Comprueba que el carrito y la dirección sean válidos.
  useEffect(() => {
    if (completado.current) return;

    if (items.length === 0) {
      navigate("/cliente/carrito", { replace: true });
    } else if (!direccionId) {
      navigate("/cliente/direccion-entrega", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, direccionId]);

  // Carga los datos del pedido.
  useEffect(() => {
    if (!restaurante || items.length === 0) return;

    let cancelado = false;

    Promise.all([
      axios.post(
        `${API_URL}/api/cliente/carrito/detalle`,
        {
          restaurante_id: restaurante.id,
          items: items.map((i) => ({ plato_id: i.plato_id })),
        },
        { headers },
      ),
      axios.get(`${API_URL}/api/cliente/direcciones`, { headers }),
      axios.get(`${API_URL}/api/cliente/perfil`, { headers }).catch(() => null),
    ])
      .then(([detalleRes, direccionesRes, perfilRes]) => {
        if (cancelado) return;

        const restauranteDatos: DatosRestaurante = detalleRes.data.restaurante;

        setCatalogo(detalleRes.data.platos);
        setDatos(restauranteDatos);

        const elegida = (direccionesRes.data as Direccion[]).find(
          (d) => d.id === direccionId,
        );

        if (!elegida) {
          navigate("/cliente/direccion-entrega", {
            replace: true,
          });
          return;
        }

        setDireccion(elegida);

        const aceptados = restauranteDatos.metodos_pago ?? [];

        const preferido: string | undefined =
          perfilRes?.data?.metodo_pago_preferido;

        if (metodoPago && aceptados.includes(metodoPago)) {
          setMetodo(metodoPago);
        } else if (preferido && aceptados.includes(preferido)) {
          setMetodo(preferido);
        } else {
          setMetodo(aceptados[0] ?? "");
        }
      })
      .catch(() => {
        if (!cancelado) {
          setError(
            "No se pudo preparar tu pedido. Revisa tu conexión e inténtalo de nuevo.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!restaurante || items.length === 0) return null;

  if (cargando) {
    return (
      <div className="finalizar-page">
        <p className="finalizar-status">Preparando tu pedido...</p>
      </div>
    );
  }

  if (!datos || !direccion) {
    return (
      <div className="finalizar-page">
        <p className="finalizar-status error">
          {error || "No se pudieron cargar los datos del pedido."}
        </p>

        <button
          type="button"
          className="finalizar-confirm-btn"
          onClick={() => navigate("/cliente/carrito")}
        >
          Volver al carrito
        </button>
      </div>
    );
  }

  const { lineas, subtotal, hayProblemas } = calcularLineas(items, catalogo);

  const total = subtotal + datos.costo_envio;
  const bajoMinimo = subtotal < datos.pedido_minimo;

  let motivoBloqueo = "";

  if (!datos.abierto) {
    motivoBloqueo = "El restaurante está cerrado en este momento.";
  } else if (hayProblemas) {
    motivoBloqueo =
      "Hay productos que ya no están disponibles. Revisa tu carrito.";
  } else if (bajoMinimo) {
    motivoBloqueo = `El pedido mínimo de este restaurante es ${formatXAF(datos.pedido_minimo)}.`;
  } else if (errorVentanas) {
    motivoBloqueo =
      "No se pudieron cargar las ventanas de entrega. Inténtalo de nuevo.";
  } else if (!ventanas) {
    motivoBloqueo = "Espera a que se carguen las ventanas de entrega.";
  } else if (ventanas.length === 0) {
    motivoBloqueo = "No hay ventanas de entrega disponibles.";
  } else if (!ventana) {
    motivoBloqueo = "Elige una ventana de entrega.";
  }

  const confirmar = async () => {
    if (enviando) return;

    setError("");

    if (!ventana) {
      setAvisoVentana("Elige una ventana de entrega.");
      return;
    }

    if (errorVentanas || !ventanas) {
      setError(
        "No se han podido comprobar las ventanas de entrega. Inténtalo de nuevo.",
      );
      recargar();
      return;
    }

    // Comprueba que la ventana siga presente antes de enviar el pedido.
    const ventanaActual = ventanas.find(
      (v) => v.ventana_id === ventana.id && v.fecha === ventana.fecha,
    );

    if (!ventanaActual) {
      setVentana(null);
      setAvisoVentana(
        "La ventana seleccionada ya no está disponible. Elige otra.",
      );
      recargar();
      return;
    }

    setEnviando(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/cliente/pedidos`,
        {
          restaurante_id: restaurante.id,
          items: items.map((i) => ({
            plato_id: i.plato_id,
            cantidad: i.cantidad,
          })),
          direccion_id: direccion.id,
          metodo_pago: metodo,
          total_esperado: total,
          ventana_id: ventana.id,
          ventana_fecha: ventana.fecha,
          latitud_entrega: ubicacion?.lat ?? null,
          longitud_entrega: ubicacion?.lng ?? null,
        },
        { headers },
      );

      completado.current = true;

      setMetodoPago(metodo);
      vaciar();

      navigate(`/cliente/pedido-realizado/${res.data.id}`, {
        replace: true,
      });
    } catch (err: unknown) {
      // El servidor puede rechazar la ventana si dejó de estar disponible.
      if (
        axios.isAxiosError<{
          codigo?: string;
          message?: string;
          ventanas?: VentanaOpcion[];
        }>(err) &&
        err.response?.data?.codigo === "VENTANA_NO_DISPONIBLE"
      ) {
        const ventanasActualizadas = err.response.data.ventanas;

        if (ventanasActualizadas) {
          reemplazar(ventanasActualizadas);
        } else {
          recargar();
        }

        setVentana(null);
        setAvisoVentana(
          err.response.data.message ||
            "La ventana seleccionada ya no está disponible. Elige otra.",
        );

        return;
      }

      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "No se pudo realizar el pedido.",
        );
      } else {
        setError("No se pudo realizar el pedido.");
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="finalizar-page">
      <section className="finalizar-header">
        <button
          type="button"
          className="finalizar-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="finalizar-header-text">
          <h1 className="finalizar-title">Finalizar pedido</h1>
          <p className="finalizar-subtitle">
            <Lock size={12} /> Tus datos están seguros
          </p>
        </div>
      </section>

      {error && (
        <p className="finalizar-warning" role="alert">
          {error}
        </p>
      )}

      <section className="finalizar-section">
        <div className="finalizar-section-header">
          <h3>{restaurante.nombre}</h3>

          <button
            type="button"
            className="finalizar-edit-btn"
            onClick={() => navigate("/cliente/carrito")}
          >
            Editar
          </button>
        </div>

        <div className="finalizar-product-list">
          {lineas.map((l) => (
            <div key={l.item.plato_id} className="finalizar-product-row">
              <img
                src={
                  l.imagen ||
                  `https://picsum.photos/seed/plato-${l.item.plato_id}/100/100`
                }
                alt={l.nombre}
                className="finalizar-product-img"
              />

              <div className="finalizar-product-info">
                <span className="finalizar-product-name">{l.nombre}</span>

                <span className="finalizar-product-qty">
                  {l.item.cantidad} x {formatXAF(l.precio)}
                </span>
              </div>

              <span className="finalizar-product-price">
                {formatXAF(l.precio * l.item.cantidad)}
              </span>
            </div>
          ))}
        </div>

        <div className="finalizar-totals">
          <div className="finalizar-totals-row">
            <span>Subtotal</span>
            <span>{formatXAF(subtotal)}</span>
          </div>

          <div className="finalizar-totals-row">
            <span>Costo de envío</span>
            <span>{formatXAF(datos.costo_envio)}</span>
          </div>

          <div className="finalizar-totals-row finalizar-totals-final">
            <span>Total a pagar</span>
            <span>{formatXAF(total)}</span>
          </div>
        </div>
      </section>

      {/* Dirección de entrega */}
      <button
        type="button"
        className="finalizar-info-card"
        onClick={() => navigate("/cliente/direccion-entrega")}
      >
        <span className="finalizar-info-icon">
          <MapPin size={18} />
        </span>

        <div className="finalizar-info-text">
          <div className="finalizar-info-top">
            <span className="finalizar-info-title">Dirección de entrega</span>
            <span className="finalizar-edit-btn">Cambiar</span>
          </div>

          <span className="finalizar-info-line">{direccion.direccion}</span>

          {direccion.referencia && (
            <span className="finalizar-info-ref">
              Referencia: {direccion.referencia}
            </span>
          )}
        </div>

        <ChevronRight size={18} className="finalizar-chevron" />
      </button>

      {/* Ubicación exacta de entrega */}
      <UbicacionEntrega valor={ubicacion} onCambio={setUbicacion} />

      {/* Ventanas de entrega */}
      <section className="finalizar-section finalizar-ventanas">
        <VentanasEntrega
          ventanas={ventanas}
          error={errorVentanas}
          seleccion={ventana}
          aviso={avisoVentana}
          onElegir={(v) => {
            setAvisoVentana("");
            setVentana({
              id: v.ventana_id,
              fecha: v.fecha,
            });
          }}
        />
      </section>

      {/* Método de pago */}
      <section className="finalizar-pay">
        <h3 className="finalizar-pay-title">Método de pago</h3>

        <div className="finalizar-pay-list">
          {datos.metodos_pago.map((m) => {
            const info = metodosInfo[m];

            if (!info) return null;

            const Icono = info.icon;

            return (
              <button
                key={m}
                type="button"
                className={
                  metodo === m
                    ? "finalizar-pay-option active"
                    : "finalizar-pay-option"
                }
                onClick={() => setMetodo(m)}
                aria-pressed={metodo === m}
              >
                <span className="finalizar-info-icon">
                  <Icono size={18} />
                </span>

                <div className="finalizar-pay-text">
                  <span className="finalizar-info-title">{info.label}</span>

                  <span className="finalizar-info-line">{info.detalle}</span>
                </div>

                <span
                  className={
                    metodo === m
                      ? "finalizar-pay-dot active"
                      : "finalizar-pay-dot"
                  }
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Confirmación del pedido */}
      <div className="finalizar-bottom-bar">
        <div className="finalizar-bottom-total">
          <span>Total a pagar</span>
          <span>{formatXAF(total)}</span>
        </div>

        {(motivoBloqueo || error) && (
          <p className="finalizar-warning" role="alert">
            {motivoBloqueo || error}
          </p>
        )}

        <button
          type="button"
          className="finalizar-confirm-btn"
          onClick={confirmar}
          disabled={
            enviando || !!motivoBloqueo || !metodo || !ventana || errorVentanas
          }
        >
          <Lock size={16} />

          {enviando ? "Realizando pedido..." : "Confirmar y realizar pedido"}
        </button>

        <p className="finalizar-terms">
          Al confirmar aceptas nuestros{" "}
          <button
            type="button"
            className="finalizar-terms-link"
            onClick={() => navigate("/cliente/terminos-condiciones")}
          >
            Términos y Condiciones
          </button>
        </p>
      </div>
    </div>
  );
}

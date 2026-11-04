import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Phone,
  Check,
  Clock,
  XCircle,
  MapPin,
  Wallet,
  RotateCw,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useRepetirPedido } from "../../hooks/useRepetirPedido";
import { formatXAF } from "../../utils/carritoCalculos";
import {
  ESTADOS_ACTIVOS,
  pasosDetalle,
  ultimoPasoDetalle,
  mensajeEstado,
  formatFechaHora,
  type EstadoPedido,
} from "../../utils/seguimientoPedido";
import ValoracionPedido from "../../components/common/ValoracionPedido";
import EntregaPrevista from "../../components/common/EntregaPrevista";
import "../../styles/cliente/PedidoDetalleCliente.css";

const API_URL = import.meta.env.VITE_API_URL;

interface EntregaPedido {
  fecha: string;
  etiqueta_dia: string;
  inicio: string;
  fin: string;
}

interface Detalle {
  id: number;
  codigo: string;
  estado: EstadoPedido;
  subtotal: number;
  costo_envio: number;
  total: number;
  metodo_pago: "efectivo" | "transferencia" | "tarjeta";
  direccion_entrega: string | null;
  fecha_creacion: string;
  restaurante_nombre: string;
  restaurante_logo: string | null;
  restaurante_telefono: string | null;
  valoracion: {
    estrellas: number;
    comentario: string | null;
  } | null;
  puede_valorar: boolean;
  repartidor: {
    nombre: string;
    foto_perfil: string | null;
    telefono: string | null;
  } | null;
  eventos: Record<string, string>;
  puede_cancelar: boolean;
  entrega: EntregaPedido | null;
  items: {
    nombre_plato: string;
    cantidad: number;
    precio_unitario: number;
  }[];
}

interface ErrorRespuesta {
  message?: string;
}

const nombresMetodo = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};

export default function PedidoDetalleCliente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const {
    repetir,
    ocupado,
    aviso: avisoRepetir,
    modalConfirmacion,
  } = useRepetirPedido();

  const [pedido, setPedido] = useState<Detalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [mostrarCancelar, setMostrarCancelar] = useState(false);

  const cargar = useCallback(
    async (signal?: AbortSignal) => {
      if (!id) {
        setError("No se ha especificado un pedido");
        setCargando(false);
        return;
      }

      try {
        const res = await axios.get<Detalle>(
          `${API_URL}/api/cliente/pedidos/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal,
          },
        );

        setPedido(res.data);
        setError("");
      } catch (err: unknown) {
        if (axios.isCancel(err)) return;

        if (axios.isAxiosError<ErrorRespuesta>(err)) {
          setError(
            err.response?.data?.message || "No se pudo cargar el pedido",
          );
        } else {
          setError("No se pudo cargar el pedido");
        }
      } finally {
        if (!signal?.aborted) {
          setCargando(false);
        }
      }
    },
    [id, token],
  );

  useEffect(() => {
    const controller = new AbortController();

    const cargarInicial = async () => {
      await cargar(controller.signal);
    };

    void cargarInicial();

    return () => {
      controller.abort();
    };
  }, [cargar]);

  // Mientras el pedido está en curso se actualiza automáticamente.
  // Cuando termina, deja de consultar.
  const activo = pedido !== null && ESTADOS_ACTIVOS.includes(pedido.estado);

  useEffect(() => {
    if (!activo) return;

    const intervalo = window.setInterval(() => {
      void cargar();
    }, 15000);

    return () => window.clearInterval(intervalo);
  }, [activo, cargar]);

  const cancelar = async () => {
    setMostrarCancelar(false);
    setAviso("");

    try {
      await axios.post(
        `${API_URL}/api/cliente/pedidos/${id}/cancelar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err: unknown) {
      if (axios.isAxiosError<ErrorRespuesta>(err)) {
        setAviso(
          err.response?.data?.message || "No se pudo cancelar el pedido",
        );
      } else {
        setAviso("No se pudo cancelar el pedido");
      }
    }

    await cargar();
  };

  if (cargando) {
    return (
      <div className="seg-page">
        <p className="seg-status">Cargando tu pedido...</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="seg-page">
        <p className="seg-status error">{error}</p>
        <button
          type="button"
          className="seg-primary-btn"
          onClick={() => navigate("/cliente/pedidos")}
        >
          Volver a mis pedidos
        </button>
      </div>
    );
  }

  const cerradoSinEntrega =
    pedido.estado === "cancelado" || pedido.estado === "rechazado";

  const mostrarLinea = !cerradoSinEntrega;

  const ultimo = ultimoPasoDetalle(
    pedido.estado,
    pedido.repartidor !== null,
    pedido.eventos,
  );

  const enPreparacionOEnCamino = [
    "en_preparacion",
    "listo_para_recoger",
    "en_entrega",
  ].includes(pedido.estado);

  const claseBanner = cerradoSinEntrega
    ? "seg-banner mal"
    : pedido.estado === "entregado"
      ? "seg-banner ok"
      : "seg-banner";

  const IconoBanner = cerradoSinEntrega
    ? XCircle
    : pedido.estado === "entregado"
      ? Check
      : Clock;

  return (
    <div className="seg-page">
      <section className="seg-header">
        <button
          type="button"
          className="seg-back-btn"
          onClick={() => navigate("/cliente/pedidos")}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <h1 className="seg-title">Pedido {pedido.codigo}</h1>
          <p className="seg-subtitle">
            {formatFechaHora(pedido.fecha_creacion)}
          </p>
        </div>
      </section>

      <div className={claseBanner}>
        <IconoBanner size={20} />
        <span>{mensajeEstado(pedido.estado, pedido.repartidor?.nombre)}</span>
      </div>

      {/* Fecha y horario de entrega seleccionados */}
      <EntregaPrevista entrega={pedido.entrega} />

      {aviso && <p className="seg-warning">{aviso}</p>}
      {avisoRepetir && <p className="seg-warning">{avisoRepetir}</p>}

      {mostrarLinea && (
        <section className="seg-card">
          <h3 className="seg-card-title">Seguimiento</h3>

          <div className="seg-timeline">
            {pasosDetalle.map((paso, i) => {
              const hecho = i <= ultimo;
              const enCurso = i === ultimo + 1 && pedido.estado !== "entregado";

              const momento =
                paso.clave === "creado"
                  ? pedido.fecha_creacion
                  : pedido.eventos[paso.clave];

              let texto = hecho ? paso.hecho : paso.pendiente;

              if (hecho && paso.clave === "asignado" && pedido.repartidor) {
                texto = `${pedido.repartidor.nombre} recogerá tu pedido`;
              }

              return (
                <div className="seg-step" key={paso.clave}>
                  <div
                    className={
                      hecho
                        ? "seg-step-dot done"
                        : enCurso
                          ? "seg-step-dot current"
                          : "seg-step-dot"
                    }
                  >
                    {hecho && <Check size={13} />}
                  </div>

                  {i < pasosDetalle.length - 1 && (
                    <div
                      className={
                        i < ultimo ? "seg-step-line done" : "seg-step-line"
                      }
                    />
                  )}

                  <div className="seg-step-text">
                    <span
                      className={
                        hecho
                          ? "seg-step-label done"
                          : enCurso
                            ? "seg-step-label current"
                            : "seg-step-label"
                      }
                    >
                      {texto}
                    </span>

                    {hecho && momento && (
                      <span className="seg-step-time">
                        {formatFechaHora(momento)}
                      </span>
                    )}

                    {enCurso && <span className="seg-step-time">En curso</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {pedido.repartidor && (
        <section className="seg-card seg-courier">
          {pedido.repartidor.foto_perfil ? (
            <img
              src={pedido.repartidor.foto_perfil}
              alt={pedido.repartidor.nombre}
              className="seg-courier-avatar"
            />
          ) : (
            <div className="seg-courier-avatar fallback">
              {pedido.repartidor.nombre.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="seg-courier-info">
            <span className="seg-courier-name">{pedido.repartidor.nombre}</span>
            <span className="seg-courier-role">Tu repartidor</span>
          </div>

          {pedido.repartidor.telefono && (
            <a
              className="seg-call-btn"
              href={`tel:${pedido.repartidor.telefono}`}
            >
              <Phone size={14} /> Llamar
            </a>
          )}
        </section>
      )}

      <section className="seg-card">
        <div className="seg-restaurant">
          <img
            src={
              pedido.restaurante_logo ||
              `https://picsum.photos/seed/restaurante-${pedido.id}/80/80`
            }
            alt={pedido.restaurante_nombre}
            className="seg-restaurant-logo"
          />

          <span className="seg-restaurant-name">
            {pedido.restaurante_nombre}
          </span>

          {pedido.restaurante_telefono && (
            <a
              className="seg-call-btn"
              href={`tel:${pedido.restaurante_telefono}`}
            >
              <Phone size={14} /> Llamar
            </a>
          )}
        </div>

        <div className="seg-items">
          {pedido.items.map((it, i) => (
            <div key={i} className="seg-item-row">
              <span className="seg-item-qty">{it.cantidad}</span>
              <span className="seg-item-name">{it.nombre_plato}</span>
              <span className="seg-item-price">
                {formatXAF(it.precio_unitario * it.cantidad)}
              </span>
            </div>
          ))}
        </div>

        <div className="seg-totals">
          <div className="seg-totals-row">
            <span>Subtotal</span>
            <span>{formatXAF(pedido.subtotal)}</span>
          </div>

          <div className="seg-totals-row">
            <span>Costo de envío</span>
            <span>{formatXAF(pedido.costo_envio)}</span>
          </div>

          <div className="seg-totals-row seg-totals-final">
            <span>Total</span>
            <span>{formatXAF(pedido.total)}</span>
          </div>
        </div>
      </section>

      <section className="seg-card">
        <div className="seg-info-row">
          <span className="seg-info-icon">
            <MapPin size={17} />
          </span>

          <div className="seg-info-text">
            <span className="seg-info-title">Dirección de entrega</span>
            <span className="seg-info-sub">
              {pedido.direccion_entrega || "No disponible"}
            </span>
          </div>
        </div>

        <div className="seg-info-row">
          <span className="seg-info-icon">
            <Wallet size={17} />
          </span>

          <div className="seg-info-text">
            <span className="seg-info-title">Método de pago</span>
            <span className="seg-info-sub">
              {nombresMetodo[pedido.metodo_pago]}
            </span>
          </div>
        </div>
      </section>

      <ValoracionPedido
        pedidoId={pedido.id}
        valoracion={pedido.valoracion}
        puedeValorar={pedido.puede_valorar}
        onEnviada={() => cargar()}
      />

      {pedido.puede_cancelar && (
        <>
          <button
            type="button"
            className="seg-cancel-btn"
            onClick={() => setMostrarCancelar(true)}
          >
            Cancelar pedido
          </button>

          <p className="seg-note">
            Puedes cancelar mientras el restaurante no haya confirmado tu
            pedido.
          </p>
        </>
      )}

      {enPreparacionOEnCamino && pedido.restaurante_telefono && (
        <p className="seg-note">
          ¿Necesitas cambiar algo? Llama al restaurante.
        </p>
      )}

      {pedido.estado === "entregado" && (
        <button
          type="button"
          className="seg-primary-btn"
          onClick={() => repetir(pedido.id)}
          disabled={ocupado === pedido.id}
        >
          <RotateCw size={16} />{" "}
          {ocupado === pedido.id ? "Añadiendo..." : "Volver a pedir"}
        </button>
      )}

      <ConfirmModal
        open={mostrarCancelar}
        title="¿Cancelar este pedido?"
        message="El restaurante será avisado y el pedido no se preparará."
        confirmLabel="Cancelar pedido"
        cancelLabel="Volver"
        danger
        onConfirm={cancelar}
        onCancel={() => setMostrarCancelar(false)}
      />

      {modalConfirmacion}
    </div>
  );
}

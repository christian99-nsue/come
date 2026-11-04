import { useState } from "react";
import axios from "axios";
import Estrellas from "./Estrellas";
import "../../styles/common/Valoraciones.css";

const API_URL = import.meta.env.VITE_API_URL;

interface ValoracionPedidoProps {
  pedidoId: number;
  valoracion: { estrellas: number; comentario: string | null } | null;
  puedeValorar: boolean;
  onEnviada: () => void;
}

const textos = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];

export default function ValoracionPedido({
  pedidoId,
  valoracion,
  puedeValorar,
  onEnviada,
}: ValoracionPedidoProps) {
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Ya valorado: se muestra lo que enviaste
  if (valoracion) {
    return (
      <section className="valpedido-card">
        <h3 className="valpedido-title">Tu valoración</h3>
        <Estrellas valor={valoracion.estrellas} size={20} />
        {valoracion.comentario && (
          <p className="valpedido-comment">{valoracion.comentario}</p>
        )}
        <p className="valpedido-thanks">
          Gracias por contarnos qué tal estuvo.
        </p>
      </section>
    );
  }

  if (!puedeValorar) return null;

  const enviar = async () => {
    setError("");
    if (estrellas < 1) return setError("Elige cuántas estrellas das");

    setEnviando(true);
    try {
      await axios.post(
        `${API_URL}/api/cliente/pedidos/${pedidoId}/valoracion`,
        { estrellas, comentario },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      onEnviada();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "No se pudo enviar tu valoración",
        );
      } else {
        setError("No se pudo enviar tu valoración");
      }
    }
  };

  return (
    <section className="valpedido-card">
      <h3 className="valpedido-title">¿Qué tal estuvo tu pedido?</h3>
      <p className="valpedido-sub">
        Tu opinión ayuda a otros clientes y al restaurante.
      </p>

      <Estrellas valor={estrellas} size={30} onChange={setEstrellas} />
      <span className="valpedido-label">
        {textos[estrellas] || "Toca una estrella"}
      </span>

      <textarea
        className="valpedido-textarea"
        placeholder="Cuéntanos más (opcional)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        maxLength={500}
      />
      <span className="valpedido-count">{comentario.length}/500</span>

      {error && <p className="valpedido-error">{error}</p>}

      <button
        type="button"
        className="valpedido-btn"
        onClick={enviar}
        disabled={enviando || estrellas < 1}
      >
        {enviando ? "Enviando..." : "Enviar valoración"}
      </button>
    </section>
  );
}

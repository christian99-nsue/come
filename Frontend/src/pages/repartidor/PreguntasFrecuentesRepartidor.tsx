import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";

// ⚠️ Texto borrador basado en cómo funciona la app. Revísalo y ajústalo a tu operación.
const preguntas = [
  {
    pregunta: "¿Cómo tomo un pedido?",
    respuesta:
      "En el panel ves los pedidos listos para recoger. Abre uno, revisa los detalles y pulsa «Tomar pedido». Para verlos y tomarlos debes estar disponible.",
  },
  {
    pregunta: "¿Puedo tener más de un pedido a la vez?",
    respuesta:
      "No. Debes completar la entrega en curso antes de tomar otro pedido.",
  },
  {
    pregunta: "¿Por qué no veo pedidos?",
    respuesta:
      "Puede ser que estés en «No disponible» o que todavía no haya pedidos listos. La lista se actualiza sola cada pocos segundos.",
  },
  {
    pregunta: "¿Qué pasa si otro repartidor toma el pedido antes que yo?",
    respuesta:
      "Verás el mensaje «Otro repartidor ya tomó este pedido». Vuelve al panel y elige otro.",
  },
  {
    pregunta: "¿Cómo confirmo una entrega?",
    respuesta:
      "Cuando tengas el pedido pulsa «Marcar como recogido». Al llegar con el cliente, entra a «En viaje», pulsa «Marcar como entregado» y confirma.",
  },
  {
    pregunta: "¿Cómo cambio mi disponibilidad?",
    respuesta:
      "Desde Configuración → General, o desde el panel tocando el aviso de pedidos disponibles. No puedes ponerte como no disponible mientras tengas una entrega activa.",
  },
  {
    pregunta: "¿Cómo cambio mi teléfono?",
    respuesta:
      "En Mi perfil → Editar perfil. Ese número es con el que inicias sesión, así que después de cambiarlo debes usar el nuevo.",
  },
  {
    pregunta: "¿Cómo reporto un problema con un pedido?",
    respuesta:
      "En Ayuda y soporte → Reportar un problema. Puedes indicar el código del pedido para que lo revisemos.",
  },
];

export default function PreguntasFrecuentesRepartidor() {
  const navigate = useNavigate();
  const [abierta, setAbierta] = useState<number | null>(null);

  return (
    <div className="rep-page">
      <section className="rep-header">
        <button
          type="button"
          className="rep-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="rep-title">Preguntas frecuentes</h1>
      </section>

      <div className="rep-menu-list">
        {preguntas.map((p, i) => {
          const estaAbierta = abierta === i;
          return (
            <div key={p.pregunta} className="rep-faq-item">
              <button
                type="button"
                className="rep-faq-question"
                onClick={() => setAbierta(estaAbierta ? null : i)}
                aria-expanded={estaAbierta}
              >
                <span>{p.pregunta}</span>
                <ChevronDown
                  size={16}
                  style={{
                    transform: estaAbierta ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s ease",
                    flexShrink: 0,
                  }}
                />
              </button>
              {estaAbierta && <p className="rep-faq-answer">{p.respuesta}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

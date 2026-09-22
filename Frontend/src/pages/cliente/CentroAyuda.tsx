import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Package,
  CreditCard,
  UserCog,
  Bike,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import "../../styles/cliente/CentroAyuda.css";

interface Categoria {
  id: string;
  nombre: string;
  icon: typeof Package;
}

interface Pregunta {
  id: string;
  categoria: string;
  pregunta: string;
  respuesta: string;
}

const categoriasMock: Categoria[] = [
  { id: "pedidos", nombre: "Pedidos", icon: Package },
  { id: "pagos", nombre: "Pagos", icon: CreditCard },
  { id: "cuenta", nombre: "Mi cuenta", icon: UserCog },
  { id: "entregas", nombre: "Entregas", icon: Bike },
];

const preguntasMock: Pregunta[] = [
  {
    id: "1",
    categoria: "pedidos",
    pregunta: "¿Cómo puedo cancelar un pedido?",
    respuesta:
      "Puedes cancelar tu pedido desde 'Mis pedidos' mientras el restaurante aún no lo haya confirmado. Una vez confirmado, contacta directamente al restaurante o a soporte.",
  },
  {
    id: "2",
    categoria: "pedidos",
    pregunta: "¿Qué hago si mi pedido llegó incompleto?",
    respuesta:
      "Ve a 'Mis pedidos', selecciona el pedido en cuestión y toca 'Reportar un problema'. Nuestro equipo revisará tu caso en menos de 24 horas.",
  },
  {
    id: "3",
    categoria: "pagos",
    pregunta: "¿Qué métodos de pago aceptan?",
    respuesta:
      "Aceptamos efectivo contra entrega, transferencia bancaria y tarjetas de débito/crédito. Puedes gestionarlos desde Perfil → Métodos de pago.",
  },
  {
    id: "4",
    categoria: "pagos",
    pregunta: "¿Puedo pedir factura de mi compra?",
    respuesta:
      "Sí, escríbenos por el Centro de ayuda indicando el número de pedido y te enviaremos la factura correspondiente.",
  },
  {
    id: "5",
    categoria: "cuenta",
    pregunta: "¿Cómo cambio mi número de teléfono?",
    respuesta:
      "Ve a Perfil → Información personal y edita tu número. Te pediremos verificarlo con un código antes de guardar el cambio.",
  },
  {
    id: "6",
    categoria: "entregas",
    pregunta: "¿Cuánto tiempo tarda mi pedido en llegar?",
    respuesta:
      "El tiempo estimado aparece en cada restaurante antes de pedir, normalmente entre 20 y 40 minutos según la distancia y la demanda.",
  },
];

export default function CentroAyuda() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("pedidos");
  const [preguntaAbierta, setPreguntaAbierta] = useState<string | null>(null);

  const preguntasFiltradas = preguntasMock.filter((p) => {
    const coincideCategoria = p.categoria === categoriaActiva;
    const coincideBusqueda = p.pregunta
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    return busqueda ? coincideBusqueda : coincideCategoria;
  });

  return (
    <div className="ayuda-page">
      <section className="ayuda-header">
        <button
          type="button"
          className="ayuda-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="ayuda-title">Centro de ayuda</h1>
      </section>

      <div className="ayuda-search-wrapper">
        <Search size={18} className="ayuda-search-icon" />
        <input
          type="text"
          placeholder="Busca tu pregunta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="ayuda-search-input"
        />
      </div>

      {!busqueda && (
        <div className="ayuda-categories-scroll">
          {categoriasMock.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                className={
                  cat.id === categoriaActiva
                    ? "ayuda-category-chip active"
                    : "ayuda-category-chip"
                }
                onClick={() => setCategoriaActiva(cat.id)}
              >
                <Icon size={16} />
                {cat.nombre}
              </button>
            );
          })}
        </div>
      )}

      <div className="ayuda-faq-list">
        {preguntasFiltradas.length === 0 && (
          <p className="ayuda-empty-text">
            No encontramos preguntas relacionadas. Prueba con otras palabras o
            contáctanos directamente.
          </p>
        )}
        {preguntasFiltradas.map((p) => {
          const abierta = preguntaAbierta === p.id;
          return (
            <div key={p.id} className="ayuda-faq-item">
              <button
                type="button"
                className="ayuda-faq-question"
                onClick={() => setPreguntaAbierta(abierta ? null : p.id)}
              >
                <span>{p.pregunta}</span>
                <ChevronDown
                  size={16}
                  style={{
                    transform: abierta ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s ease",
                    flexShrink: 0,
                  }}
                />
              </button>
              {abierta && <p className="ayuda-faq-answer">{p.respuesta}</p>}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="ayuda-contact-banner"
        onClick={() => navigate("/cliente/perfil/contactanos")}
      >
        <span className="ayuda-contact-icon">
          <MessageCircle size={20} />
        </span>
        <div className="ayuda-contact-text">
          <span className="ayuda-contact-title">
            ¿No encontraste tu respuesta?
          </span>
          <span className="ayuda-contact-subtitle">
            Escríbenos, estamos para ayudarte.
          </span>
        </div>
      </button>
    </div>
  );
}

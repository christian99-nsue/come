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
      "En Pedidos, abre tu pedido y pulsa «Cancelar pedido». Solo es posible mientras el restaurante no lo haya confirmado. Si ya lo confirmó, llama al restaurante desde el seguimiento del pedido.",
  },
  {
    id: "2",
    categoria: "pedidos",
    pregunta: "¿Cómo sigo mi pedido?",
    respuesta:
      "En la pestaña Pedidos ves el estado en tiempo real: confirmado, preparando, en camino y entregado. Al abrir el pedido ves la línea de tiempo con las horas y los datos de tu repartidor.",
  },
  {
    id: "3",
    categoria: "pedidos",
    pregunta: "¿Puedo repetir un pedido anterior?",
    respuesta:
      "Sí. En Pedidos → Historial pulsa «Volver a pedir». Se añaden al carrito los productos que sigan disponibles, con los precios de hoy.",
  },
  {
    id: "4",
    categoria: "pedidos",
    pregunta: "Mi pedido llegó incompleto o con algún problema, ¿qué hago?",
    respuesta:
      "Escríbenos desde Contáctanos indicando el código del pedido, y lo revisamos.",
  },
  {
    id: "5",
    categoria: "pagos",
    pregunta: "¿Qué métodos de pago hay?",
    respuesta:
      "Cada restaurante indica qué métodos acepta (efectivo, transferencia o tarjeta) y los ves al finalizar el pedido. El pago se coordina con el restaurante; la app no guarda datos de tarjetas.",
  },
  {
    id: "6",
    categoria: "pagos",
    pregunta: "¿Cómo cambio mi método de pago preferido?",
    respuesta:
      "En Perfil → Métodos de pago. Se usará como opción inicial al finalizar un pedido, siempre que el restaurante lo acepte.",
  },
  {
    id: "7",
    categoria: "pagos",
    pregunta: "¿Por qué no se creó mi pedido al confirmar?",
    respuesta:
      "Los precios, el costo de envío y la disponibilidad se verifican al confirmar. Si algo cambió desde que lo viste, te pedimos revisar el carrito antes de crear el pedido.",
  },
  {
    id: "8",
    categoria: "cuenta",
    pregunta: "¿Cómo cambio mi número de teléfono?",
    respuesta:
      "En Perfil → Información personal. Ese número es con el que inicias sesión, así que después debes usar el nuevo.",
  },
  {
    id: "9",
    categoria: "cuenta",
    pregunta: "¿Cómo gestiono mis direcciones?",
    respuesta:
      "En Perfil → Mis direcciones puedes añadir, editar y eliminar direcciones, y elegir cuál es la principal.",
  },
  {
    id: "10",
    categoria: "cuenta",
    pregunta: "¿Cómo desactivo las notificaciones?",
    respuesta:
      "En Perfil → Notificaciones. Aunque las desactives, puedes ver el estado de tus pedidos en la pestaña Pedidos.",
  },
  {
    id: "11",
    categoria: "entregas",
    pregunta: "¿Cuánto tarda mi pedido?",
    respuesta:
      "Cada restaurante muestra un tiempo estimado. Es una estimación: el tiempo real depende de la preparación y del reparto.",
  },
  {
    id: "12",
    categoria: "entregas",
    pregunta: "¿Puedo llamar a mi repartidor?",
    respuesta:
      "Sí. Mientras lleva tu pedido aparece el botón «Llamar» en el seguimiento. Cuando se entrega, desaparece.",
  },
  {
    id: "13",
    categoria: "entregas",
    pregunta: "¿Puedo pedir a otra dirección?",
    respuesta:
      "Sí. Al finalizar el pedido elige otra de tus direcciones guardadas o añade una nueva.",
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

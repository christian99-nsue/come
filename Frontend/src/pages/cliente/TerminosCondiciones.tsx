import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../../styles/cliente/TerminosCondiciones.css";

const secciones = [
  {
    titulo: "1. Aceptación de los términos",
    contenido:
      "Al crear una cuenta y usar la aplicación COME, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos no utilizar la aplicación.",
  },
  {
    titulo: "2. Uso del servicio",
    contenido:
      "COME conecta a usuarios con restaurantes y repartidores para la entrega de pedidos de comida. El uso indebido de la plataforma, incluyendo pedidos fraudulentos o abuso hacia repartidores y restaurantes, puede resultar en la suspensión de tu cuenta.",
  },
  {
    titulo: "3. Pedidos y pagos",
    contenido:
      "Los precios mostrados incluyen el costo de los productos y pueden incluir costos de envío y servicio adicionales, mostrados antes de confirmar tu pedido. El pago puede realizarse en efectivo, transferencia o tarjeta, según lo disponible en tu zona.",
  },
  {
    titulo: "4. Cancelaciones y reembolsos",
    contenido:
      "Puedes cancelar un pedido antes de que el restaurante lo confirme sin ningún cargo. Una vez confirmado, la cancelación queda sujeta a la política del restaurante y podría no ser reembolsable.",
  },
  {
    titulo: "5. Responsabilidad",
    contenido:
      "COME actúa como intermediario entre usuarios, restaurantes y repartidores. No nos hacemos responsables por la calidad de los alimentos preparados por los restaurantes, aunque gestionamos activamente cualquier reclamo relacionado con el servicio de entrega.",
  },
  {
    titulo: "6. Privacidad de datos",
    contenido:
      "Tu información personal se utiliza únicamente para procesar tus pedidos, mejorar tu experiencia y comunicarnos contigo. No compartimos tus datos con terceros sin tu consentimiento, salvo lo necesario para completar la entrega de tu pedido.",
  },
  {
    titulo: "7. Modificaciones",
    contenido:
      "Podemos actualizar estos Términos y Condiciones ocasionalmente. Te notificaremos sobre cambios importantes a través de la aplicación antes de que entren en vigor.",
  },
];

export default function TerminosCondiciones() {
  const navigate = useNavigate();

  return (
    <div className="terminos-page">
      <section className="terminos-header">
        <button
          type="button"
          className="terminos-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="terminos-title">Términos y condiciones</h1>
      </section>

      <p className="terminos-updated">
        Última actualización: 1 de septiembre de 2026
      </p>

      <div className="terminos-content">
        {secciones.map((s) => (
          <div key={s.titulo} className="terminos-section">
            <h3 className="terminos-section-title">{s.titulo}</h3>
            <p className="terminos-section-text">{s.contenido}</p>
          </div>
        ))}
      </div>

      <p className="terminos-footer">
        Si tienes dudas sobre estos términos, puedes escribirnos desde{" "}
        <button
          type="button"
          className="terminos-footer-link"
          onClick={() => navigate("/cliente/contactanos")}
        >
          Contáctanos
        </button>
        .
      </p>
    </div>
  );
}

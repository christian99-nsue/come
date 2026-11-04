import { ChevronRight, User, Bike, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RegistroLayout from "../../components/common/RegistroLayout";
import logo from "../../assets/Logo.png";

const opciones = [
  {
    titulo: "Cliente",
    texto: "Haz tus pedidos fácilmente y disfruta de la mejor comida.",
    icono: <User size={24} />,
    color: "verde",
    ruta: "/crear-cuenta/cliente",
  },
  {
    titulo: "Repartidor",
    texto: "Forma parte de nuestro equipo de repartidores.",
    icono: <Bike size={24} />,
    color: "naranja",
    ruta: "/crear-cuenta/repartidor",
  },
  {
    titulo: "Administrador del restaurante",
    texto: "Gestiona tu restaurante y recibe pedidos.",
    icono: <Store size={24} />,
    color: "azul",
    ruta: "/crear-cuenta/administrador",
  },
];

export default function CrearCuenta() {
  const navigate = useNavigate();

  return (
    <RegistroLayout atras="/">
      <img src={logo} alt="Logo" className="reg-logo" />
      <h1 className="reg-titulo-grande">¡Únete a nuestra comunidad!</h1>
      <p className="reg-texto">
        Selecciona el tipo de cuenta que deseas crear para comenzar.
      </p>

      <div className="reg-opciones">
        {opciones.map((o) => (
          <button
            key={o.titulo}
            type="button"
            className="reg-opcion"
            onClick={() => navigate(o.ruta)}
          >
            <span className={`reg-opcion-icono ${o.color}`}>{o.icono}</span>
            <span className="reg-opcion-texto">
              <span className="reg-opcion-titulo">{o.titulo}</span>
              <span className="reg-opcion-desc">{o.texto}</span>
            </span>
            <ChevronRight size={20} color="#9ca3af" />
          </button>
        ))}
      </div>

      <p className="reg-pie">
        ¿Ya tienes una cuenta?{" "}
        <button
          type="button"
          className="reg-enlace"
          onClick={() => navigate("/")}
        >
          Inicia sesión
        </button>
      </p>
    </RegistroLayout>
  );
}

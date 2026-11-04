import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Store,
  Images,
  ClipboardList,
  CreditCard,
  UserCog,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import "../../styles/admin/AdminShared.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Restaurante {
  nombre: string;
  direccion: string | null;
  tiempo_preparacion_min: number;
}

export default function ConfiguracionAdmin() {
  const navigate = useNavigate();
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_URL}/api/admin/restaurante`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRestaurante(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="admin-page">
      <section className="admin-header">
        <h1 className="admin-title">Configuración</h1>
      </section>

      <div className="admin-menu-list">
        <button
          type="button"
          className="admin-menu-row"
          onClick={() => navigate("/admin/configuracion/restaurante")}
        >
          <span className="admin-icon-box">
            <Store size={17} />
          </span>
          <div className="admin-menu-label-col">
            <span className="admin-menu-label">
              Información del restaurante
            </span>
            <span className="admin-menu-sublabel">
              {restaurante?.nombre || "Nombre, dirección y teléfono"}
            </span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>

        <button
          type="button"
          className="admin-menu-row"
          onClick={() => navigate("/admin/configuracion/fotos")}
        >
          <span className="admin-icon-box">
            <Images size={17} />
          </span>
          <div className="admin-menu-label-col">
            <span className="admin-menu-label">Fotos del restaurante</span>
            <span className="admin-menu-sublabel">
              Galería de imágenes de tu local
            </span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>

        <button
          type="button"
          className="admin-menu-row"
          onClick={() => navigate("/admin/configuracion/pedidos")}
        >
          <span className="admin-icon-box">
            <ClipboardList size={17} />
          </span>
          <div className="admin-menu-label-col">
            <span className="admin-menu-label">Pedidos</span>
            <span className="admin-menu-sublabel">
              {restaurante
                ? `Tiempo de preparación: ${restaurante.tiempo_preparacion_min} min`
                : "Aceptación manual"}
            </span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>

        <button
          type="button"
          className="admin-menu-row"
          onClick={() => navigate("/admin/configuracion/pagos")}
        >
          <span className="admin-icon-box">
            <CreditCard size={17} />
          </span>
          <div className="admin-menu-label-col">
            <span className="admin-menu-label">Pagos</span>
            <span className="admin-menu-sublabel">Métodos aceptados</span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>

        <button
          type="button"
          className="admin-menu-row"
          onClick={() => navigate("/admin/configuracion/cuenta")}
        >
          <span className="admin-icon-box">
            <UserCog size={17} />
          </span>
          <div className="admin-menu-label-col">
            <span className="admin-menu-label">Cuenta</span>
            <span className="admin-menu-sublabel">
              Editar perfil / Cambiar contraseña
            </span>
          </div>
          <ChevronRight size={17} color="#9ca3af" />
        </button>

        <button
          type="button"
          className="admin-menu-row"
          onClick={() => navigate("/admin/ayuda-soporte")}
        >
          <span className="admin-icon-box">
            <HelpCircle size={17} />
          </span>
          <span className="admin-menu-label">Ayuda y soporte</span>
          <ChevronRight className="cv-right" size={17} color="#9ca3af" />
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Pencil,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import avatar from "../../assets/6.jpg";
import "../../styles/cliente/EditarPerfil.css";

type TipoContacto = "Llamada" | "Whatsapp" | "Mensaje";

export default function EditarPerfil() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("Christian Nsue");
  const [telefono, setTelefono] = useState("+240 222 123 456");
  const [correo, setCorreo] = useState("christian.nsuе00@gmail.com");
  const [lugarTrabajo, setLugarTrabajo] = useState("Edificio bantu");
  const [tipoContacto, setTipoContacto] = useState<TipoContacto>("Llamada");

  const guardarCambios = () => {
    // TODO: conectar con PUT /api/usuarios/:id
    navigate("/cliente/perfil");
  };

  return (
    <div className="editar-perfil-page">
      <section className="editar-perfil-header">
        <button
          type="button"
          className="editar-perfil-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="editar-perfil-title">Editar perfil</h1>
      </section>

      <div className="editar-perfil-avatar-wrapper">
        <div className="editar-perfil-avatar">
          <img src={avatar} alt="Foto de perfil" />
          <button
            type="button"
            className="editar-perfil-avatar-btn"
            aria-label="Cambiar foto"
          >
            <Camera size={16} />
          </button>
        </div>
        <span className="editar-perfil-avatar-label">Cambiar foto</span>
      </div>

      <div className="editar-perfil-form">
        <label className="editar-perfil-field">
          <span className="editar-perfil-label">Nombre completo</span>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="editar-perfil-input"
          />
        </label>

        <label className="editar-perfil-field">
          <span className="editar-perfil-label">Teléfono</span>
          <div className="editar-perfil-input-with-icon">
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="editar-perfil-input"
            />
            <Pencil size={16} className="editar-perfil-input-icon" />
          </div>
        </label>

        <label className="editar-perfil-field">
          <span className="editar-perfil-label">Correo electrónico</span>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="editar-perfil-input"
          />
        </label>

        <label className="editar-perfil-field">
          <span className="editar-perfil-label">Lugar de trabajo</span>
          <div className="editar-perfil-input-with-icon">
            <input
              type="text"
              value={lugarTrabajo}
              onChange={(e) => setLugarTrabajo(e.target.value)}
              className="editar-perfil-input"
            />
            <Briefcase size={16} className="editar-perfil-input-icon" />
          </div>
        </label>

        <label className="editar-perfil-field">
          <span className="editar-perfil-label">Tipo de contacto</span>
          <div className="editar-perfil-select-wrapper">
            <select
              value={tipoContacto}
              onChange={(e) => setTipoContacto(e.target.value as TipoContacto)}
              className="editar-perfil-select"
            >
              <option value="Llamada">Llamada</option>
              <option value="Whatsapp">Whatsapp</option>
              <option value="Mensaje">Mensaje</option>
            </select>
            <ChevronDown size={16} className="editar-perfil-select-chevron" />
          </div>
        </label>
      </div>

      <button
        type="button"
        className="editar-perfil-save-btn"
        onClick={guardarCambios}
      >
        Guardar cambios
      </button>
    </div>
  );
}

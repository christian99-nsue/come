import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Phone,
  FileText,
  Hash,
  ChevronDown,
} from "lucide-react";
import "../../styles/repartidor/RepartidorShared.css";
import avatar from "../../assets/pilar.jpg";

export default function EditarPerfilRepartidor() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("Carlos Martínez");
  const [correo, setCorreo] = useState("carlos.martinez@ejemplo.com");
  const [telefono, setTelefono] = useState("+240 555 987 654");
  const [tipoDocumento, setTipoDocumento] = useState("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("12345678A");

  const guardarCambios = () => {
    // TODO: PUT /api/repartidores/:id
    navigate(-1);
  };

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
        <h1 className="rep-title">Editar perfil</h1>
      </section>

      <div className="rep-avatar-wrapper">
        <div className="rep-avatar-box">
          <img src={avatar} alt="Foto de perfil" />
          <button
            type="button"
            className="rep-avatar-btn"
            aria-label="Cambiar foto"
          >
            <Camera size={16} />
          </button>
        </div>
      </div>

      <div className="rep-form">
        <label className="rep-form-field">
          <span className="rep-form-icon">
            <User size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Nombre completo</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="rep-form-input"
            />
          </div>
        </label>

        <label className="rep-form-field">
          <span className="rep-form-icon">
            <Mail size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Correo electrónico</span>
            <input
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="rep-form-input"
            />
          </div>
        </label>

        <label className="rep-form-field">
          <span className="rep-form-icon">
            <Phone size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Teléfono</span>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="rep-form-input"
            />
          </div>
        </label>

        <label className="rep-form-field">
          <span className="rep-form-icon">
            <FileText size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Tipo de documento</span>
            <div className="rep-form-select-wrapper">
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="rep-form-select"
              >
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Carnet de conducir">Carnet de conducir</option>
              </select>
              <ChevronDown size={14} className="rep-form-select-chevron" />
            </div>
          </div>
        </label>

        <label className="rep-form-field">
          <span className="rep-form-icon">
            <Hash size={16} />
          </span>
          <div className="rep-form-text">
            <span className="rep-form-label">Número de documento</span>
            <input
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
              className="rep-form-input"
            />
          </div>
        </label>
      </div>

      <button
        type="button"
        className="rep-btn-primary rep-btn-block-margin"
        onClick={guardarCambios}
      >
        Guardar cambios
      </button>
    </div>
  );
}

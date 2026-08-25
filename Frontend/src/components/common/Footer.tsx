import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faMagnifyingGlass,
  faShoppingCart,
  faClipboardList,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="inicio"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item active" : "bottom-nav-item"
        }
      >
        <FontAwesomeIcon icon={faHouse} size="lg" className="bottom-nav-icon" />
        <span className="bottom-nav-label">Inicio</span>
      </NavLink>
      <NavLink
        to="explorar"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item active" : "bottom-nav-item"
        }
      >
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          size="lg"
          className="bottom-nav-icon"
        />
        <span className="bottom-nav-label">Explorar</span>
      </NavLink>
      <NavLink
        to="carrito"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item active" : "bottom-nav-item"
        }
      >
        <FontAwesomeIcon
          icon={faShoppingCart}
          size="lg"
          className="bottom-nav-icon"
        />
        <span className="bottom-nav-label">Carrito</span>
      </NavLink>
      <NavLink
        to="pedidos"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item active" : "bottom-nav-item"
        }
      >
        <FontAwesomeIcon
          icon={faClipboardList}
          size="lg"
          className="bottom-nav-icon"
        />
        <span className="bottom-nav-label">Pedidos</span>
      </NavLink>
      <NavLink
        to="perfil"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item active" : "bottom-nav-item"
        }
      >
        <FontAwesomeIcon icon={faUser} size="lg" className="bottom-nav-icon" />
        <span className="bottom-nav-label">Perfil</span>
      </NavLink>
    </nav>
  );
};

export default Footer;

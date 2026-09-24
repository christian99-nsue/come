import { Menu, Bell, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  notificationCount?: number;
  onMenuClick?: () => void;
}

export default function Header({
  notificationCount = 0,
  onMenuClick,
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <button
        type="button"
        className="header-icon-btn"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>

      <div className="header-brand">
        <div className="header-logo-circle">
          <Package size={20} className="header-logo-icon" strokeWidth={2} />
        </div>
        <span className="header-brand-name">COME</span>
      </div>

      <button
        type="button"
        className="header-icon-btn header-notification-btn"
        onClick={() => navigate("/cliente/notificaciones")}
        aria-label="Ver notificaciones"
      >
        <Bell size={24} />
        {notificationCount > 0 && (
          <span className="header-badge">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </button>
    </header>
  );
}

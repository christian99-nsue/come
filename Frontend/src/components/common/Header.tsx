import { Menu, Bell } from "lucide-react";
import logo from "../../assets/logo.png";

interface HeaderProps {
  notificationCount?: number;
  onMenuClick?: () => void;
  onNotificationClick: () => void;
}

export default function Header({
  notificationCount = 0,
  onMenuClick,
  onNotificationClick,
}: HeaderProps) {
  return (
    <header className="header">
      <button
        type="button"
        className="header-icon-btn"
        onClick={onMenuClick}
        aria-label="Arbir menu"
      >
        <Menu size={24} />
      </button>
      <div className="header-center">
        <img src={logo} alt="logo-come" />
        <span className="header-brand-name">
          CO<small>ME</small>
        </span>
      </div>
      <button
        type="button"
        className="header-icon-btn header-notification-btn"
        onClick={onNotificationClick}
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

import Header from "../common/Header";
import Footer from "../common/Footer";
import { Outlet } from "react-router-dom";
import "../../styles/layoutCliente.css";

const LayoutCliente = () => {
  return (
    <div className="layout-cliente">
      <Header
        notificationCount={2}
        onMenuClick={() => console.log("abrir menu")}
        onNotificationClick={() => console.log("ver notificaciones")}
      />
      <main className="center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default LayoutCliente;

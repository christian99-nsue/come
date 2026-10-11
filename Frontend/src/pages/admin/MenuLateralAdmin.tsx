import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Home,
  ClipboardList,
  UtensilsCrossed,
  Bike,
  Boxes,
  BarChart3,
  History,
  Bell,
  Settings,
  HelpCircle,
  Crown,
  LogOut,
} from "lucide-react";
import "../../styles/admin/MenuLateralAdmin.css";
interface MenuLateralAdminProps {
  open: boolean;
  onClose: () => void;
  onLogoutClick: () => void;
  restaurante: { nombre: string; abierto: boolean; logo: string | null };
}
type Plan = "semanal" | "mensual";
interface Suscripcion {
  plan: Plan | null;
  estado: "activa" | "vencida" | "cancelada" | null;
}
const API_URL = import.meta.env.VITE_API_URL;
export default function MenuLateralAdmin({
  open,
  onClose,
  onLogoutClick,
  restaurante,
}: MenuLateralAdminProps) {
  const navigate = useNavigate();
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        if (!cancelado) {
          setSuscripcion(null);
        }
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/api/admin/suscripcion`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelado) {
          setSuscripcion(res.data);
        }
      } catch (error) {
        console.error("No se pudo cargar la suscripción:", error);
        if (!cancelado) {
          setSuscripcion(null);
        }
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, []);
  if (!open) return null;
  const ir = (ruta: string) => {
    onClose();
    navigate(ruta);
  };
  const nombrePlan =
    suscripcion?.plan === "mensual"
      ? "Plan Mensual"
      : suscripcion?.plan === "semanal"
        ? "Plan Semanal"
        : "Sin suscripción";
  const textoEstado =
    suscripcion?.estado === "activa"
      ? "Activa"
      : suscripcion?.estado === "vencida"
        ? "Vencida"
        : suscripcion?.estado === "cancelada"
          ? "Cancelada"
          : "Sin suscripción";
  const claseEstado =
    suscripcion?.estado === "activa"
      ? "activa"
      : suscripcion?.estado === "vencida"
        ? "vencida"
        : suscripcion?.estado === "cancelada"
          ? "cancelada"
          : "sin-suscripcion";
  return (
    <div className="admin-drawer-overlay" onClick={onClose}>
      {" "}
      <div className="admin-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {" "}
        <div className="admin-drawer-header">
          {" "}
          <img
            src={
              restaurante.logo ||
              "https://picsum.photos/seed/restaurante-drawer/60/60"
            }
            alt={restaurante.nombre}
            className="admin-drawer-logo"
          />{" "}
          <div>
            {" "}
            <div className="admin-drawer-name">{restaurante.nombre}</div>{" "}
            <div className="admin-drawer-role">
              {" "}
              Administrador de restaurante{" "}
            </div>{" "}
            <span className="admin-drawer-status">
              {" "}
              ● {restaurante.abierto ? "Abierto" : "Cerrado"}{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
        <nav className="admin-drawer-nav">
          {" "}
          <button
            type="button"
            className="admin-drawer-item"
            onClick={() => ir("/admin")}
          >
            {" "}
            <Home size={18} /> Inicio{" "}
          </button>{" "}
          <button
            type="button"
            className="admin-drawer-item"
            onClick={() => ir("/admin/pedidos")}
          >
            {" "}
            <ClipboardList size={18} /> Pedidos{" "}
          </button>{" "}
          <button
            type="button"
            className="admin-drawer-item"
            onClick={() => ir("/admin/menu")}
          >
            {" "}
            <UtensilsCrossed size={18} /> Menú{" "}
          </button>{" "}
          <button
            type="button"
            className="admin-drawer-item"
            onClick={() => ir("/admin/repartidores")}
          >
            {" "}
            <Bike size={18} /> Repartidores{" "}
          </button>{" "}
          <button
            type="button"
            className="admin-drawer-item"
            onClick={() => ir("/admin/abastecimiento")}
          >
            {" "}
            <Boxes size={18} /> Abastecimiento{" "}
          </button>{" "}
          <button
            type="button"
            className="admin-drawer-item"
            onClick={() => ir("/admin/ventas")}
          >
            {" "}
            <BarChart3 size={18} /> Ventas{" "}
          </button>{" "}
          <button
            type="button"
            className="admin-drawer-item"
            onClick={() => ir("/admin/historial")}
          >
            {" "}
            <History size={18} /> Historial{" "}
          </button>{" "}
          <button
            type="button"
            className="admin-drawer-item"
            onClick={() => ir("/admin/notificaciones")}
          >
            {" "}
            <Bell size={18} /> Notificaciones{" "}
          </button>{" "}
          <button
            type="button"
            className="admin-drawer-item"
            onClick={() => ir("/admin/configuracion")}
          >
            {" "}
            <Settings size={18} /> Configuración{" "}
          </button>{" "}
          <button
            type="button"
            className="admin-drawer-item"
            onClick={() => ir("/admin/ayuda-soporte")}
          >
            {" "}
            <HelpCircle size={18} /> Ayuda y soporte{" "}
          </button>{" "}
        </nav>{" "}
        <button
          type="button"
          className="admin-drawer-subscription"
          onClick={() => ir("/admin/suscripcion")}
        >
          {" "}
          <Crown size={18} className="admin-drawer-subscription-icon" />{" "}
          <div className="admin-drawer-subscription-text">
            {" "}
            <span className="admin-drawer-subscription-title">
              {" "}
              Tu suscripción{" "}
            </span>{" "}
            <span className="admin-drawer-subscription-plan">
              {" "}
              {nombrePlan}{" "}
            </span>{" "}
          </div>{" "}
          <span className={`admin-drawer-subscription-badge ${claseEstado}`}>
            {" "}
            {textoEstado}{" "}
          </span>{" "}
        </button>{" "}
        <button
          type="button"
          className="admin-drawer-logout"
          onClick={() => {
            onClose();
            onLogoutClick();
          }}
        >
          {" "}
          <LogOut size={18} /> Cerrar sesión{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
}

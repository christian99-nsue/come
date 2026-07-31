import Login from "../pages/auth/Login";
import { HashRouter, Routes, Route } from "react-router-dom";
import LayoutCliente from "../components/layouts/LayoutCliente";
import Inicio from "../pages/cliente/Inicio";

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cliente" element={<LayoutCliente />}>
          <Route index element={<Inicio />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

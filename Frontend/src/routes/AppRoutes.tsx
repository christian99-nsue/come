import Login from "../pages/auth/Login";
import { HashRouter, Routes, Route } from "react-router-dom";

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </HashRouter>
  );
}

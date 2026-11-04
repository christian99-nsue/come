import express, { type Request, type Response } from "express";
import authRoutes from "./routes/authRoutes";
import cors from "cors";
import menuAdminRoutes from "./routes/admin/menuAdminRoutes";
import pedidosAdminRoutes from "./routes/admin/pedidosAdminRoutes";
import restauranteAdminRoutes from "./routes/admin/restauranteAdminRoutes";
import dashboardAdminRoutes from "./routes/admin/dashboardAdminRoutes";
import repartidoresAdminRoutes from "./routes/admin/repartidoresAdminRoutes";
import historialAdminRoutes from "./routes/admin/historialAdminRoutes";
import notificacionesAdminRoutes from "./routes/admin/notificacionesAdminRoutes";
import ventasAdminRoutes from "./routes/admin/ventasAdminRoutes";
import abastecimientoAdminRoutes from "./routes/admin/abastecimientoAdminRoutes";
import cuentaAdminRoutes from "./routes/admin/cuentaAdminRoutes";
import suscripcionAdminRoutes from "./routes/admin/suscripcionAdminRoutes";
import uploadsRoutes from "./routes/admin/uploadsRoutes";
import fotosRestauranteAdminRoutes from "./routes/admin/fotosRestauranteAdminRoutes";
import repartidorRoutes from "./routes/repartidor/repartidorRoutes";
import perfilRepartidorRoutes from "./routes/repartidor/perfilRepartidorRoutes";
import uploadsRepartidorRoutes from "./routes/repartidor/uploadsRepartidorRoutes";
import clienteRoutes from "./routes/cliente/clienteRoutes";
import valoracionesAdminRoutes from "./routes/admin/valoracionesAdminRoutes";
import uploadsClienteRoutes from "./routes/cliente/uploadsClienteRoutes";
import superadminRoutes from "./routes/superadminRoutes";
import superadminUploadsRoutes from "./routes/superadminUploadsRoutes";
import registroRoutes from "./routes/registroRoutes";
import ubicacionAdminRoutes from "./routes/admin/ubicacionAdminRoutes";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.HUB_FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  }),
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder_policy", "unsafe-none");
  next();
});

app.use(express.json());

app.use("/api/registro", registroRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/admin/menu", menuAdminRoutes);
app.use("/api/admin/pedidos", pedidosAdminRoutes);
app.use("/api/admin/restaurante", restauranteAdminRoutes);
app.use("/api/admin/dashboard", dashboardAdminRoutes);
app.use("/api/admin/repartidores", repartidoresAdminRoutes);
app.use("/api/admin/historial", historialAdminRoutes);
app.use("/api/admin/notificaciones", notificacionesAdminRoutes);
app.use("/api/admin/ventas", ventasAdminRoutes);
app.use("/api/admin/abastecimiento", abastecimientoAdminRoutes);
app.use("/api/admin/cuenta", cuentaAdminRoutes);
app.use("/api/admin/suscripcion", suscripcionAdminRoutes);
app.use("/api/admin/uploads", uploadsRoutes);
app.use("/api/admin/restaurante/fotos", fotosRestauranteAdminRoutes);
app.use("/api/repartidor/perfil", perfilRepartidorRoutes);
app.use("/api/repartidor/uploads", uploadsRepartidorRoutes);
app.use("/api/repartidor", repartidorRoutes);
app.use("/api/cliente/uploads", uploadsClienteRoutes);
app.use("/api/cliente", clienteRoutes);
app.use("/api/admin/valoraciones", valoracionesAdminRoutes);
app.use("/api/superadmin/uploads", superadminUploadsRoutes);
app.use("/api/superadmin", superadminRoutes);

export default app;

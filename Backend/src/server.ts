import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const server = app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT}`);
});

server.on("error", (err) => {
  console.error("❌ Error al iniciar el servidor:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ unhandledRejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ uncaughtException:", err);
});

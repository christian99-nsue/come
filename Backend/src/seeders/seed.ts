import { db } from "../config/db";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path/win32";

dotenv.config({ path: path.resolve("../../.env") });

const seed = async () => {
  try {
    console.log("🚀 Iniciando seeder...");

    // LIMPIAR TABLAS (opcional pero recomendado en pruebas)
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    await db.query("TRUNCATE TABLE usuarios");
    await db.query("TRUNCATE TABLE codigos_acceso");
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("🧹 Tablas limpiadas");

    // CREAR USUARIOS
    const passwordHash = await bcrypt.hash("123456", 10);

    const [usuarios]: any = await db.query(
      "INSERT INTO usuarios (telefono, password, nombre, rol) VALUES ?",
      [
        [
          ["222783320", passwordHash, "Christian", "cliente"],
          ["222707351", passwordHash, "Benjamin", "cliente"],
          ["222179316", passwordHash, "Eliseo", "cliente"],
          ["222284414", passwordHash, "Pilar", "repartidor"],
        ],
      ],
    );

    console.log("Usuarios creados");

    console.log("SEED COMPLETADO CON ÉXITO");
    process.exit();
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
};

seed();

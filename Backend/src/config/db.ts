import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const usaSufijos = !!process.env.DB_TARGET;
const target = process.env.DB_TARGET === "railway" ? "RAILWAY" : "LOCAL";

const dbHost = usaSufijos
  ? process.env[`DB_HOST_${target}`]
  : process.env.DB_HOST;
const dbUser = usaSufijos
  ? process.env[`DB_USER_${target}`]
  : process.env.DB_USER;
const dbPassword = usaSufijos
  ? process.env[`DB_PASSWORD_${target}`]
  : process.env.DB_PASSWORD;
const dbName = usaSufijos
  ? process.env[`DB_NAME_${target}`]
  : process.env.DB_NAME;
const dbPort = usaSufijos
  ? process.env[`DB_PORT_${target}`]
  : process.env.DB_PORT;

export const db = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: Number(dbPort),
});

console.log(
  `Conectado a la base de datos: ${usaSufijos ? target : "Variables de Railway/entorno directo"}`,
);

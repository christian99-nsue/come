import express from "express";
import { login } from "../controllers/authController";
import rateLimit from "express-rate-limit";

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  },
});

const router = express.Router();

router.post("/login", limiteLogin, login);

export default router;

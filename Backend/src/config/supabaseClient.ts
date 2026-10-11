import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "⚠️  Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env — la subida de imágenes no funcionará.",
  );
}

// La service role key ignora las políticas RLS del bucket — por eso
// SOLO se usa aquí, en el backend, y nunca se expone al frontend.
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "come-uploads";

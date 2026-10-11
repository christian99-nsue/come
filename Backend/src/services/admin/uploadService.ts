import { supabase, SUPABASE_BUCKET } from "../../config/supabaseClient";
import crypto from "crypto";
import path from "path";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB

interface ArchivoSubido {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}

// `carpeta` organiza las imágenes dentro del bucket, ej: "platos", "categorias",
// "logos-restaurante", "perfiles-admin", "fotos-restaurante"
export const subirImagen = async (archivo: ArchivoSubido, carpeta: string) => {
  if (!TIPOS_PERMITIDOS.includes(archivo.mimetype)) {
    throw new Error("Formato no permitido. Usa JPG, PNG o WEBP.");
  }
  if (archivo.size > TAMANO_MAXIMO) {
    throw new Error("La imagen no puede superar los 5 MB.");
  }

  const extension = path.extname(archivo.originalname) || ".jpg";
  const nombreUnico = `${carpeta}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`;

  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(nombreUnico, archivo.buffer, {
      contentType: archivo.mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Error al subir la imagen: ${error.message}`);

  const { data } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(nombreUnico);
  return { url: data.publicUrl, path: nombreUnico };
};

export const eliminarImagen = async (rutaEnBucket: string) => {
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .remove([rutaEnBucket]);
  if (error) throw new Error(`Error al eliminar la imagen: ${error.message}`);
  return { ok: true };
};

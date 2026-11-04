import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Guarda en el servidor si un restaurante es favorito. Falla si el servidor rechaza el cambio.
export async function guardarFavorito(
  restauranteId: number,
  esFavorito: boolean,
) {
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const url = `${API_URL}/api/cliente/favoritos/${restauranteId}`;

  if (esFavorito) await axios.put(url, {}, { headers });
  else await axios.delete(url, { headers });
}

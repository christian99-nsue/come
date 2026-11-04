import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const CLAVE_CACHE = "rep_preferencias";

export type Idioma = "es" | "en" | "fr";
export type Tema = "claro" | "oscuro";
export type Navegacion = "google_maps" | "maps";

export interface Preferencias {
  idioma: Idioma;
  tema: Tema;
  navegacion_externa: Navegacion;
  sonido_notificaciones: boolean;
}

export const POR_DEFECTO: Preferencias = {
  idioma: "es",
  tema: "claro",
  navegacion_externa: "google_maps",
  sonido_notificaciones: true,
};

export const etiquetaIdioma: Record<Idioma, string> = {
  es: "Español",
  en: "Inglés",
  fr: "Francés",
};
export const etiquetaTema: Record<Tema, string> = {
  claro: "Claro",
  oscuro: "Oscuro",
};
export const etiquetaNavegacion: Record<Navegacion, string> = {
  google_maps: "Google Maps",
  maps: "Maps",
};

function idUsuarioActual(): number | null {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").id ?? null;
  } catch {
    return null;
  }
}

// Copia local para pintar al instante, sin esperar al servidor.
// Solo se usa si pertenece al usuario que tiene la sesión abierta.
export function leerCache(): Preferencias {
  try {
    const raw = JSON.parse(localStorage.getItem(CLAVE_CACHE) || "null");
    if (raw && raw.userId === idUsuarioActual()) {
      const prefs = { ...POR_DEFECTO, ...raw };
      delete prefs.userId;

      // Una copia guardada antes del cambio puede traer "waze", que ya no existe
      if (
        prefs.navegacion_externa !== "google_maps" &&
        prefs.navegacion_externa !== "maps"
      ) {
        prefs.navegacion_externa = "google_maps";
      }
      return prefs;
    }
  } catch {
    // si la copia está dañada, se usan los valores por defecto
  }
  return POR_DEFECTO;
}

function guardarCache(p: Preferencias) {
  localStorage.setItem(
    CLAVE_CACHE,
    JSON.stringify({ userId: idUsuarioActual(), ...p }),
  );
}

export function aplicarTema(tema: Tema) {
  if (tema === "oscuro") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function cabeceras() {
  return {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };
}

export async function cargarPreferencias(): Promise<Preferencias> {
  const res = await axios.get<Preferencias>(
    `${API_URL}/api/repartidor/ajustes`,
    cabeceras(),
  );
  guardarCache(res.data);
  aplicarTema(res.data.tema);
  return res.data;
}

export async function guardarPreferencias(
  cambios: Partial<Preferencias>,
): Promise<Preferencias> {
  const res = await axios.patch<Preferencias>(
    `${API_URL}/api/repartidor/ajustes`,
    cambios,
    cabeceras(),
  );
  guardarCache(res.data);
  aplicarTema(res.data.tema);
  return res.data;
}

// Enlace de navegación hacia un destino ("lat,lng" o una dirección en texto)
export function urlNavegacion(destino: string, app: Navegacion) {
  if (app === "maps") {
    return `https://maps.apple.com/?daddr=${encodeURIComponent(destino)}&dirflg=d`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}&travelmode=driving`;
}

// Pitido corto sin archivos de audio
// Pitido corto sin archivos de audio
export function reproducirSonido() {
  try {
    const ventana = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };

    const Contexto = window.AudioContext || ventana.webkitAudioContext;
    if (!Contexto) return;

    const ctx = new Contexto();
    const oscilador = ctx.createOscillator();
    const volumen = ctx.createGain();

    oscilador.type = "sine";
    oscilador.frequency.value = 880;

    volumen.gain.setValueAtTime(0.0001, ctx.currentTime);
    volumen.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    volumen.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    oscilador.connect(volumen);
    volumen.connect(ctx.destination);

    oscilador.start();
    oscilador.stop(ctx.currentTime + 0.4);

    oscilador.onended = () => {
      void ctx.close();
    };
  } catch {
    // El navegador puede bloquear el audio hasta que el usuario interactúe con la página.
  }
}

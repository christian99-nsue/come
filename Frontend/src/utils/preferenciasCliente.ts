import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const CLAVE_CACHE = "cliente_preferencias";

export type Tema = "claro" | "oscuro" | "automatico";
export type TamanoTexto = "pequeno" | "normal" | "grande" | "muy_grande";

export interface PreferenciasCliente {
  tema: Tema;
  tamano_texto: TamanoTexto;
  alto_contraste: boolean;
  reducir_movimiento: boolean;
}

export const POR_DEFECTO: PreferenciasCliente = {
  tema: "claro",
  tamano_texto: "normal",
  alto_contraste: false,
  reducir_movimiento: false,
};

export const etiquetaTema: Record<Tema, string> = {
  claro: "Claro",
  oscuro: "Oscuro",
  automatico: "Automático",
};

const TEMAS: Tema[] = ["claro", "oscuro", "automatico"];
const TAMANOS: TamanoTexto[] = ["pequeno", "normal", "grande", "muy_grande"];

const ZOOM: Record<TamanoTexto, number> = {
  pequeno: 0.92,
  normal: 1,
  grande: 1.1,
  muy_grande: 1.2,
};

interface PreferenciasSinValidar {
  tema?: unknown;
  tamano_texto?: unknown;
  alto_contraste?: unknown;
  reducir_movimiento?: unknown;
  userId?: unknown;
}

interface UsuarioLocal {
  id?: unknown;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

// Se asegura de que los datos del servidor o de la copia local sean válidos.
function sanear(raw: unknown): PreferenciasCliente {
  const datos: PreferenciasSinValidar = esObjeto(raw) ? raw : {};

  const tema: Tema =
    typeof datos.tema === "string" && TEMAS.includes(datos.tema as Tema)
      ? (datos.tema as Tema)
      : POR_DEFECTO.tema;

  const tamanoTexto: TamanoTexto =
    typeof datos.tamano_texto === "string" &&
    TAMANOS.includes(datos.tamano_texto as TamanoTexto)
      ? (datos.tamano_texto as TamanoTexto)
      : POR_DEFECTO.tamano_texto;

  return {
    tema,
    tamano_texto: tamanoTexto,
    alto_contraste: datos.alto_contraste === true,
    reducir_movimiento: datos.reducir_movimiento === true,
  };
}

function idUsuarioActual(): number | null {
  try {
    const usuario: unknown = JSON.parse(localStorage.getItem("user") || "{}");

    if (!esObjeto(usuario)) return null;

    const datos = usuario as UsuarioLocal;

    return typeof datos.id === "number" && Number.isFinite(datos.id)
      ? datos.id
      : null;
  } catch {
    return null;
  }
}

// Copia local para pintar al instante, sin esperar al servidor.
// Solo se usa si pertenece al usuario que tiene la sesión abierta.
export function leerCache(): PreferenciasCliente {
  try {
    const raw: unknown = JSON.parse(
      localStorage.getItem(CLAVE_CACHE) || "null",
    );

    if (esObjeto(raw) && raw.userId === idUsuarioActual()) {
      return sanear(raw);
    }
  } catch {
    // Si la copia está dañada, se usan los valores por defecto.
  }

  return POR_DEFECTO;
}

function guardarCache(p: PreferenciasCliente) {
  localStorage.setItem(
    CLAVE_CACHE,
    JSON.stringify({ userId: idUsuarioActual(), ...p }),
  );
}

function poner(el: HTMLElement, atributo: string, valor: string | null) {
  if (valor === null) el.removeAttribute(atributo);
  else el.setAttribute(atributo, valor);
}

// Aplica las preferencias a la página.
// Los estilos que reaccionan a estos atributos están en ClienteApariencia.css.
export function aplicarPreferencias(p: PreferenciasCliente) {
  const raiz = document.documentElement;

  const oscuro =
    p.tema === "oscuro" ||
    (p.tema === "automatico" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  poner(raiz, "data-cliente-ui", "");
  poner(raiz, "data-cliente-theme", oscuro ? "dark" : null);
  poner(raiz, "data-cliente-contrast", p.alto_contraste ? "high" : null);
  poner(raiz, "data-cliente-reduce", p.reducir_movimiento ? "1" : null);

  // El filtro solo se activa cuando hace falta.
  poner(raiz, "data-cliente-filter", oscuro || p.alto_contraste ? "1" : null);

  const zoom = ZOOM[p.tamano_texto];

  document.body.style.setProperty("zoom", zoom === 1 ? "" : String(zoom));
}

// Deja la página como estaba antes de entrar al panel del cliente.
export function quitarPreferencias() {
  const raiz = document.documentElement;

  for (const atributo of [
    "data-cliente-ui",
    "data-cliente-theme",
    "data-cliente-contrast",
    "data-cliente-reduce",
    "data-cliente-filter",
  ]) {
    raiz.removeAttribute(atributo);
  }

  document.body.style.removeProperty("zoom");
}

function cabeceras() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };
}

export async function cargarPreferencias(): Promise<PreferenciasCliente> {
  const res = await axios.get(`${API_URL}/api/cliente/ajustes`, cabeceras());

  const p = sanear(res.data);

  guardarCache(p);
  aplicarPreferencias(p);

  return p;
}

export async function guardarPreferencias(
  cambios: Partial<PreferenciasCliente>,
): Promise<PreferenciasCliente> {
  const res = await axios.patch(
    `${API_URL}/api/cliente/ajustes`,
    cambios,
    cabeceras(),
  );

  const p = sanear(res.data);

  guardarCache(p);
  aplicarPreferencias(p);

  return p;
}

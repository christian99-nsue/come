import {
  FACTOR_CALLE,
  MINUTOS_POR_PARADA,
  VELOCIDAD_KMH,
} from "../config/carga";
import type { Punto } from "./ubicacion";

export type { Punto };

// Distancia en línea recta entre dos puntos de la Tierra (fórmula de Haversine)
export function distanciaKm(a: Punto, b: Punto): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Una estimación de lo que se recorre de verdad por las calles
export const distanciaCalleKm = (a: Punto, b: Punto) =>
  distanciaKm(a, b) * FACTOR_CALLE;
export const minutosViaje = (km: number) =>
  Math.round((km / VELOCIDAD_KMH) * 60);
export const redondear = (n: number, decimales = 1) =>
  Math.round(n * 10 ** decimales) / 10 ** decimales;

// Con pocas paradas se puede calcular la ruta MÁS CORTA de verdad, no una aproximación:
// se prueban todas las formas de recorrerlas, pero reutilizando lo ya calculado (programación dinámica).
// Es un recorrido abierto: sale de "inicio" y termina en la última entrega, sin volver.
// Si no se sabe desde dónde sale (inicio = null), se escoge también el mejor punto de partida.
// Devuelve el orden en que visitar las paradas (posiciones del arreglo original).
export function ordenOptimo(inicio: Punto | null, paradas: Punto[]): number[] {
  const n = paradas.length;
  if (n === 0) return [];
  if (n === 1) return [0];
  if (n > 12) return vecinoMasCercano(inicio, paradas); // no ocurre (el máximo es 10), pero no se cuelga si cambia

  const entre = (i: number, j: number) =>
    distanciaCalleKm(paradas[i], paradas[j]);
  const desdeInicio = (j: number) =>
    inicio ? distanciaCalleKm(inicio, paradas[j]) : 0;

  const total = 1 << n;
  const coste = new Float64Array(total * n).fill(Infinity); // coste[conjunto][última parada]
  const anterior = new Int8Array(total * n).fill(-1);

  for (let j = 0; j < n; j++) coste[(1 << j) * n + j] = desdeInicio(j);

  for (let conjunto = 1; conjunto < total; conjunto++) {
    for (let j = 0; j < n; j++) {
      if (!(conjunto & (1 << j))) continue;
      const actual = coste[conjunto * n + j];
      if (actual === Infinity) continue;

      for (let k = 0; k < n; k++) {
        if (conjunto & (1 << k)) continue;
        const siguiente = conjunto | (1 << k);
        const nuevo = actual + entre(j, k);
        if (nuevo < coste[siguiente * n + k]) {
          coste[siguiente * n + k] = nuevo;
          anterior[siguiente * n + k] = j;
        }
      }
    }
  }

  const todas = total - 1;
  let ultima = 0;
  for (let j = 1; j < n; j++)
    if (coste[todas * n + j] < coste[todas * n + ultima]) ultima = j;

  const orden: number[] = [];
  let conjunto = todas;
  let j = ultima;
  while (j !== -1) {
    orden.push(j);
    const previa = anterior[conjunto * n + j];
    conjunto &= ~(1 << j);
    j = previa;
  }
  return orden.reverse();
}

// Alternativa sencilla (siempre ir a la parada más cercana) para cuando hubiera demasiadas paradas
function vecinoMasCercano(inicio: Punto | null, paradas: Punto[]): number[] {
  const pendientes = paradas.map((_, i) => i);
  const orden: number[] = [];
  let actual = inicio ?? paradas[0];
  if (!inicio) {
    orden.push(0);
    pendientes.splice(0, 1);
  }
  while (pendientes.length > 0) {
    let mejor = 0;
    for (let k = 1; k < pendientes.length; k++) {
      if (
        distanciaCalleKm(actual, paradas[pendientes[k]]) <
        distanciaCalleKm(actual, paradas[pendientes[mejor]])
      )
        mejor = k;
    }
    const elegida = pendientes.splice(mejor, 1)[0];
    orden.push(elegida);
    actual = paradas[elegida];
  }
  return orden;
}

export interface Tramo {
  km: number; // desde la parada anterior
  minutos: number; // acumulados desde que sale, contando lo que se tarda en cada parada
}

// Los tramos de un recorrido ya ordenado
export function medirRuta(
  inicio: Punto | null,
  paradasEnOrden: Punto[],
): { tramos: Tramo[]; km: number; minutos: number } {
  const tramos: Tramo[] = [];
  let anterior = inicio;
  let km = 0;
  let minutos = 0;

  paradasEnOrden.forEach((p, i) => {
    const tramo = anterior ? distanciaCalleKm(anterior, p) : 0;
    km += tramo;
    minutos += minutosViaje(tramo) + MINUTOS_POR_PARADA;
    tramos.push({
      km: redondear(tramo),
      minutos: i === 0 && !anterior ? MINUTOS_POR_PARADA : minutos,
    });
    anterior = p;
  });

  return { tramos, km: redondear(km), minutos };
}

const coordenada = (p: Punto) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;

// Enlace que abre la ruta, con todas las paradas, en Google Maps. Maps admite como mucho 9 paradas intermedias.
export function urlMapsRuta(
  origen: Punto | null,
  paradasEnOrden: Punto[],
): string | null {
  if (paradasEnOrden.length === 0) return null;

  const destino = paradasEnOrden[paradasEnOrden.length - 1];
  const intermedias = paradasEnOrden.slice(0, -1);
  if (intermedias.length > 9) return null;

  const p = new URLSearchParams({
    api: "1",
    destination: coordenada(destino),
    travelmode: "driving",
  });
  if (origen) p.set("origin", coordenada(origen)); // sin origen, Maps usa donde esté el teléfono
  if (intermedias.length > 0)
    p.set("waypoints", intermedias.map(coordenada).join("|"));
  return `https://www.google.com/maps/dir/?${p.toString()}`;
}

// Enlace para ir a un solo sitio. Si no hay coordenadas, se usa la dirección escrita.
export function urlMapsDestino(punto: Punto | null, direccion: string): string {
  const destino = punto ? coordenada(punto) : direccion;
  return `https://www.google.com/maps/dir/?${new URLSearchParams({ api: "1", destination: destino, travelmode: "driving" }).toString()}`;
}

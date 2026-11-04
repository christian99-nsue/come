// Cuántos pedidos puede llevar un repartidor a la vez (siempre de un mismo restaurante)
export const MAX_PEDIDOS_POR_CARGA = 10;

// Para estimar los tiempos sin un servicio de mapas: los caminos no son línea recta, y en ciudad se va despacio
export const FACTOR_CALLE = 1.3; // un trayecto real mide, de media, un 30 % más que la línea recta
export const VELOCIDAD_KMH = 25;
export const MINUTOS_POR_PARADA = 3; // entregar, saludar, cobrar

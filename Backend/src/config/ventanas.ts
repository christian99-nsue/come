// Zona horaria de la plataforma. Las ventanas se definen en hora local ("de 10:00 a 11:00"),
// y el servidor puede estar en cualquier parte del mundo.
export const ZONA_HORARIA = process.env.ZONA_HORARIA || "Africa/Malabo";

// Los pedidos para una ventana se aceptan hasta tantos minutos antes de que abra
export const MINUTOS_CORTE = 30;

// Hasta cuántos días por delante se ofrecen ventanas, y cuántas como máximo
export const DIAS_VISIBLES = 7;
export const MAX_VENTANAS_OFRECIDAS = 8;

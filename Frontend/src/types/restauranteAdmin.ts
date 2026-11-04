export interface RestauranteAdmin {
  id: number;
  nombre: string;
  logo: string | null;
  telefono: string | null;
  direccion: string | null;
  categorias_texto: string | null;
  estado: "abierto" | "cerrado";
  tiempo_preparacion_min: number;
  aceptacion_pedidos: "manual" | "automatica";
  costo_envio: number;
  pedido_minimo: number;
  platos_disponibles: number;
  pedidos_activos: number;
  suspendido: boolean;
  motivo_suspension: string | null;
  suscripcion_al_dia: boolean;
  suscripcion_estado: string | null;
  suscripcion_dias: number | null;
  suscripcion_aviso: "por_vencer" | "ultimo_dia" | "vencida" | null;
}

// Lo que el layout del admin comparte con todas sus pantallas
export interface ContextoAdmin {
  restaurante: RestauranteAdmin | null;
  actualizar: (restaurante: RestauranteAdmin) => void;
}

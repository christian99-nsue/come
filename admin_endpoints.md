# Endpoints del panel Admin — sigue el patrón de Pedidos (service → controller → route)

Todas bajo `/api/admin/...` y protegidas con `verificarTokenAdmin`.

## Dashboard
- `GET /api/admin/dashboard` → resumen de hoy (pedidos nuevos, en preparación,
  listos para recoger, en entrega, ventas de hoy) + "pedidos que requieren atención"
  (SELECT con COUNT/SUM agrupado por estado sobre la tabla `pedidos` del día)

## Menú
- `GET    /api/admin/menu/categorias`
- `POST   /api/admin/menu/categorias`      body: { nombre, descripcion, imagen }
- `GET    /api/admin/menu/platos?categoria_id=`
- `POST   /api/admin/menu/platos`          body: { nombre, descripcion, categoria_id, precio, tiempo_preparacion_min }
- `PATCH  /api/admin/menu/platos/:id`
- `PATCH  /api/admin/menu/platos/:id/disponibilidad`  body: { disponible: boolean }
- `DELETE /api/admin/menu/platos/:id`

## Repartidores
- `GET  /api/admin/repartidores` → JOIN restaurante_repartidores + usuarios, con
  su estado actual (disponible / en_entrega / no_disponible, derivado de si tiene
  un pedido activo asignado)
- `POST /api/admin/repartidores/generar-codigo` → inserta en `codigos_repartidor`,
  devuelve el código para compartir
- (El repartidor usa ese código desde su app para vincularse — INSERT en
  `restaurante_repartidores` + marcar `usado=true`)

## Abastecimiento
- `GET  /api/admin/abastecimiento/productos?categoria=carnes`
- `GET  /api/admin/abastecimiento/carrito` (carrito en sesión o tabla temporal)
- `POST /api/admin/abastecimiento/carrito/items`  body: { producto_id, cantidad }
- `POST /api/admin/abastecimiento/pedidos`  → confirma el pedido de abastecimiento
  (crea fila en `pedidos_abastecimiento` + `pedido_abastecimiento_items`)
- `GET  /api/admin/abastecimiento/pedidos` (historial "Mis pedidos")

## Ventas
- `GET /api/admin/ventas?rango=hoy|7dias|30dias` → ingresos totales, cantidad de
  pedidos, serie por hora/día para el gráfico, y productos más vendidos
  (agregaciones SQL con SUM/COUNT sobre `pedidos` + `pedido_items`)

## Historial
- `GET /api/admin/historial?estado=&metodo_pago=` → pedidos con estado final
  (entregado/cancelado), paginado

## Notificaciones
- `GET   /api/admin/notificaciones?tipo=pedidos|sistema`
- `PATCH /api/admin/notificaciones/:id/leida`

## Configuración
- `GET   /api/admin/restaurante` → datos del restaurante (nombre, teléfono, dirección, horarios)
- `PATCH /api/admin/restaurante`
- `PATCH /api/admin/restaurante/horarios`
- `GET   /api/admin/suscripcion`
- `PATCH /api/admin/suscripcion/plan`

## Notas de implementación
- El `restauranteId` **nunca** viene del frontend — siempre se resuelve en el
  middleware `verificarTokenAdmin` a partir del token, para que un admin jamás
  pueda leer/editar datos de otro restaurante solo cambiando un id en la URL.
- Los cambios de estado de pedido deberían emitir un evento (Socket.io o
  polling corto) para que el Dashboard y la lista de Pedidos se actualicen en
  tiempo real sin que el admin tenga que refrescar — pendiente para cuando
  quieras esa capa de tiempo real.

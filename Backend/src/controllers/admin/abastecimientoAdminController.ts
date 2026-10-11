import type { Request, Response } from "express";
import * as service from "../../services/admin/abastecimientoAdminService";

export const listarProductos = async (req: Request, res: Response) => {
  try {
    const categoria = req.query.categoria as string | undefined;
    const busqueda = req.query.busqueda as string | undefined;
    const productos = await service.listarProductos(categoria, busqueda);
    res.json(productos);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const listarPedidos = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const pedidos = await service.listarPedidos(restauranteId);
    res.json(pedidos);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const obtenerDetallePedido = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const pedido = await service.obtenerDetallePedido(
      Number(req.params.id),
      restauranteId,
    );
    res.json(pedido);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const crearPedido = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const { items, turno_entrega } = req.body;
    const resultado = await service.crearPedido(
      restauranteId,
      items,
      turno_entrega,
    );
    res.status(201).json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

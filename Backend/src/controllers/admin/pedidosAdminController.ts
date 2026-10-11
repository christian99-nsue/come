import type { Request, Response } from "express";
import * as pedidosService from "../../services/admin/pedidosAdminService";

// El middleware de auth ya debe haber puesto req.restauranteId (del admin logueado)

export const listarPedidos = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const filtro = req.query.estado as any;
    const pedidos = await pedidosService.listarPedidos(restauranteId, filtro);
    res.json(pedidos);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const obtenerDetallePedido = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const pedido = await pedidosService.obtenerDetallePedido(
      Number(req.params.id),
      restauranteId,
    );
    res.json(pedido);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const aceptarPedido = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const resultado = await pedidosService.aceptarPedido(
      Number(req.params.id),
      restauranteId,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rechazarPedido = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const { motivo } = req.body;
    const resultado = await pedidosService.rechazarPedido(
      Number(req.params.id),
      restauranteId,
      motivo,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const cambiarEstadoPedido = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const { estado } = req.body;
    const resultado = await pedidosService.cambiarEstadoPedido(
      Number(req.params.id),
      restauranteId,
      estado,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

import type { Request, Response } from "express";
import * as menuService from "../../services/admin/menuAdminService";

export const listarCategorias = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const categorias = await menuService.listarCategorias(restauranteId);
    res.json(categorias);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const crearCategoria = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const categoria = await menuService.crearCategoria(restauranteId, req.body);
    res.status(201).json(categoria);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const obtenerCategoria = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const categoria = await menuService.obtenerCategoria(
      Number(req.params.id),
      restauranteId,
    );
    res.json(categoria);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const actualizarCategoria = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const resultado = await menuService.actualizarCategoria(
      Number(req.params.id),
      restauranteId,
      req.body,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const eliminarCategoria = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const resultado = await menuService.eliminarCategoria(
      Number(req.params.id),
      restauranteId,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const obtenerPlato = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const plato = await menuService.obtenerPlato(
      Number(req.params.id),
      restauranteId,
    );
    res.json(plato);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const listarPlatos = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const categoriaId = req.query.categoria_id
      ? Number(req.query.categoria_id)
      : undefined;
    const platos = await menuService.listarPlatos(restauranteId, categoriaId);
    res.json(platos);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const crearPlato = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const plato = await menuService.crearPlato(restauranteId, req.body);
    res.status(201).json(plato);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const actualizarPlato = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const resultado = await menuService.actualizarPlato(
      Number(req.params.id),
      restauranteId,
      req.body,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const cambiarDisponibilidad = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const { disponible } = req.body;
    const resultado = await menuService.cambiarDisponibilidad(
      Number(req.params.id),
      restauranteId,
      disponible,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const eliminarPlato = async (req: Request, res: Response) => {
  try {
    const restauranteId = (req as any).restauranteId;
    const resultado = await menuService.eliminarPlato(
      Number(req.params.id),
      restauranteId,
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

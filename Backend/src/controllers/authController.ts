import { Request, Response } from "express";
import { loginUser } from "../services/authService";

//Login Normal
export const login = async (req: Request, res: Response) => {
  try {
    const { telefono, password } = req.body;

    const data = await loginUser(telefono, password);

    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

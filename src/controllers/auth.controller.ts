import { AuthService } from "../services/auth.services.js";
import { type Request, type Response } from "express";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);

      const user = await authService.register(validatedData);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  async login(req: Request, res: Response) {
    try {
      const validatedLogin = loginSchema.parse(req.body);

      const user = await authService.login(validatedLogin);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

import { type Request, type Response } from "express";
import { UserService } from "../services/user.services.js";
import { Role } from "@prisma/client";

const userService = new UserService();

export class UserController {
  async getMe(req: Request, res: Response) {
    try {
      const user = await userService.getById(req.user!.userId);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await userService.getAll(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      // Using 500 for generic errors, though 400 might be appropriate depending on the error
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!Object.values(Role).includes(role)) {
        res.status(400).json({ success: false, message: "Invalid role" });
        return;
      }

      const user = await userService.updateRole(Number(id), role);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = await userService.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.update(Number(id), req.body);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const targetId = Number(id);

      if (req.user?.userId === targetId) {
        res
          .status(400)
          .json({ success: false, message: "Kendi hesabınızı silemezsiniz." });
        return;
      }

      await userService.delete(targetId);
      console.log(`[UserController] User ${targetId} deleted successfully`);
      res.status(200).json({ success: true, message: "Kullanıcı silindi" });
    } catch (error: any) {
      console.error("[UserController] Delete error details:", error);

      // Check for Prisma foreign key constraint error (P2003)
      if (error.code === "P2003") {
        res.status(400).json({
          success: false,
          message:
            "Bu kullanıcıya bağlı veriler (ilerleme kayıtları vb.) olduğu için silinemiyor. Veritabanı Cascade ayarlarını kontrol edin.",
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || "Silme işlemi sırasında sunucu hatası",
      });
    }
  }

  async updateMe(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { name, email } = req.body;
      const user = await userService.update(userId, { name, email });
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { password } = req.body;
      if (!password || password.length < 6) {
        res.status(400).json({
          success: false,
          message: "Şifre en az 6 karakter olmalıdır",
        });
        return;
      }
      await userService.update(userId, { password });
      res
        .status(200)
        .json({ success: true, message: "Şifre başarıyla güncellendi" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

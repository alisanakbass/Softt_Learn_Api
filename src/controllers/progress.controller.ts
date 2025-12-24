import { type Request, type Response } from "express";
import { ProgressService } from "../services/progress.services.js";
import { z } from "zod";

const progressService = new ProgressService();

const startProgressSchema = z.object({
  pathId: z.number().int().positive(),
});

const completeNodeSchema = z.object({
  nodeId: z.number().int().positive(),
});

export class ProgressController {
  // Kullanıcının tüm ilerlemelerini getir
  async getUserProgress(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const progress = await progressService.getUserProgress(userId);
      res.json({ success: true, data: progress });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Belirli bir path için ilerleme
  async getPathProgress(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const pathId = parseInt(req.params.pathId);
      const progress = await progressService.getPathProgress(userId, pathId);
      res.json({ success: true, data: progress });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // İlerleme başlat
  async startProgress(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { pathId } = startProgressSchema.parse(req.body);
      const progress = await progressService.startProgress({ userId, pathId });
      res.status(201).json({ success: true, data: progress });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Node tamamla
  async completeNode(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const pathId = parseInt(req.params.pathId);
      const { nodeId } = completeNodeSchema.parse(req.body);
      const progress = await progressService.completeNode(
        userId,
        pathId,
        nodeId
      );
      res.json({ success: true, data: progress });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // İlerlemeyi sıfırla
  async resetProgress(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const pathId = parseInt(req.params.pathId);
      const progress = await progressService.resetProgress(userId, pathId);
      res.json({ success: true, data: progress });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Kullanıcı istatistikleri
  async getUserStats(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const stats = await progressService.getUserStats(userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

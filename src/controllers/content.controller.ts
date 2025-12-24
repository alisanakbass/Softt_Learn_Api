import { type Request, type Response } from "express";
import { ContentService } from "../services/content.services.js";
import { z } from "zod";

const contentService = new ContentService();

const createContentSchema = z.object({
  type: z.enum(["VIDEO", "ARTICLE", "QUIZ", "EXERCISE"]),
  title: z.string().min(3, "Başlık en az 3 karakter olmalı"),
  description: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().positive().optional(),
  articleText: z.string().optional(),
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()),
        correctAnswer: z.number().int().min(0),
        explanation: z.string().optional(),
      })
    )
    .optional(),
});

const updateContentSchema = createContentSchema.partial();

export class ContentController {
  async getAll(req: Request, res: Response) {
    try {
      const { type } = req.query;

      if (type) {
        const contents = await contentService.getByType(type as any);
        return res.json({ success: true, data: contents });
      }

      const contents = await contentService.getAll();
      res.json({ success: true, data: contents });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const content = await contentService.getById(id);
      res.json({ success: true, data: content });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = createContentSchema.parse(req.body);
      const content = await contentService.create(validatedData);
      res.status(201).json({ success: true, data: content });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const validatedData = updateContentSchema.parse(req.body);
      const content = await contentService.update(id, validatedData as any);
      res.json({ success: true, data: content });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      await contentService.delete(id);
      res.json({ success: true, message: "İçerik silindi" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

import { type Request, type Response } from "express";
import { QuestionService } from "../services/question.services.js";
import { z } from "zod";

const questionService = new QuestionService();

const createQuestionSchema = z.object({
  contentId: z.number().int().positive(),
  question: z.string().min(5, "Soru en az 5 karakter olmalı"),
  options: z.array(z.string()).min(2, "En az 2 şık olmalı"),
  correctAnswer: z.number().int().nonnegative(),
  explanation: z.string().optional(),
});

const updateQuestionSchema = createQuestionSchema
  .partial()
  .omit({ contentId: true });

const checkAnswerSchema = z.object({
  userAnswer: z.number().int().nonnegative(),
});

export class QuestionController {
  async getAll(req: Request, res: Response) {
    try {
      const contentId = parseInt(req.query.contentId as string);

      if (isNaN(contentId)) {
        return res.status(400).json({
          success: false,
          message: "Geçerli bir contentId gerekli",
        });
      }

      const questions = await questionService.getAll(contentId);
      res.json({ success: true, data: questions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const question = await questionService.getById(id);
      res.json({ success: true, data: question });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = createQuestionSchema.parse(req.body);
      const question = await questionService.create(validatedData);
      res.status(201).json({ success: true, data: question });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateQuestionSchema.parse(req.body);
      const question = await questionService.update(id, validatedData);
      res.json({ success: true, data: question });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await questionService.delete(id);
      res.json({ success: true, message: "Soru silindi" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async checkAnswer(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { userAnswer } = checkAnswerSchema.parse(req.body);
      const result = await questionService.checkAnswer(id, userAnswer);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

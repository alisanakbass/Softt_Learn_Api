import { type Request, type Response } from "express";
import { NodeService } from "../services/node.services.js";
import { z } from "zod";

const nodeService = new NodeService();

const createNodeSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalı"),
  description: z.string().optional(),
  order: z.number().int().nonnegative(),
  pathId: z.number().int().positive(),
  parentId: z.number().int().positive().optional(),
  contentId: z.number().int().positive().optional(),
});

const updateNodeSchema = createNodeSchema.partial();

export class NodeController {
  async getAll(req: Request, res: Response) {
    try {
      const pathId = parseInt(req.query.pathId as string);

      if (isNaN(pathId)) {
        return res.status(400).json({
          success: false,
          message: "Geçerli bir pathId gerekli",
        });
      }

      const nodes = await nodeService.getAll(pathId);
      res.json({ success: true, data: nodes });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const node = await nodeService.getById(id);
      res.json({ success: true, data: node });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getTree(req: Request, res: Response) {
    try {
      const pathId = parseInt(req.query.pathId as string);

      if (isNaN(pathId)) {
        return res.status(400).json({
          success: false,
          message: "Geçerli bir pathId gerekli",
        });
      }

      const tree = await nodeService.getTree(pathId);
      res.json({ success: true, data: tree });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = createNodeSchema.parse(req.body);
      const node = await nodeService.create(validatedData);
      res.status(201).json({ success: true, data: node });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const validatedData = updateNodeSchema.parse(req.body);
      const node = await nodeService.update(id, validatedData);
      res.json({ success: true, data: node });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      await nodeService.delete(id);
      res.json({ success: true, message: "Node silindi" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async reorder(req: Request, res: Response) {
    try {
      const reorderSchema = z.object({
        updates: z.array(
          z.object({
            id: z.number().int().positive(),
            order: z.number().int().nonnegative(),
          })
        ),
      });

      const { updates } = reorderSchema.parse(req.body);
      await nodeService.reorder(updates);
      res.json({ success: true, message: "Sıralama güncellendi" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

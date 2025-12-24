import { PathServices } from "../services/path.services.js";
import { type Request, type Response } from "express";
import { schemaId } from "../validations/common.validaton.js";
import {
  createPathSchema,
  updatePathSchema,
} from "../validations/common.validaton.js";

const pathServices = new PathServices();

export class PathController {
  async getAll(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 9;

      const categoryId = req.query.categoryId
        ? schemaId.parse(req.query.categoryId)
        : undefined;
      const result = await pathServices.getAll(categoryId, page, limit);
      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.meta,
      });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = schemaId.parse(req.params.id);
      const path = await pathServices.getById(id);
      res.status(200).json({ success: true, data: path });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validData = createPathSchema.parse(req.body);
      const data = await pathServices.create(validData);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = schemaId.parse(req.params.id);
      const validData = updatePathSchema.parse(req.body);
      const data = await pathServices.update(id, validData);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
  async delete(req: Request, res: Response) {
    try {
      const id = schemaId.parse(req.params.id);
      await pathServices.delete(id);
      return res.status(200).json({ success: true, message: "Basarili Silme" });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async reorder(req: Request, res: Response) {
    try {
      const { updates } = req.body;
      if (!Array.isArray(updates)) {
        return res
          .status(400)
          .json({ success: false, message: "updates array is required" });
      }
      await pathServices.reorder(updates);
      return res
        .status(200)
        .json({ success: true, message: "Siralama guncellendi" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

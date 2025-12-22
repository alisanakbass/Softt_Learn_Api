import { type Request, type Response } from "express";
import { CategoryServices } from "../services/category.services.js";
import { schemaId } from "../validations/common.validaton.js";

const categoryServices = new CategoryServices();

export class CategoryController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await categoryServices.getAll();

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  async getById(req: Request, res: Response) {
    try {
      const id = schemaId.parse(req.params.id);
      const categoy = await categoryServices.getById(id);
      if (!categoy) {
        return res
          .status(404)
          .json({ success: false, message: "Kategori bulunamdi!" });
      }

      res.status(200).json({
        success: true,
        data: categoy,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  async create(req: Request, res: Response) {
    try {
      const data = await categoryServices.create(req.body);
      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

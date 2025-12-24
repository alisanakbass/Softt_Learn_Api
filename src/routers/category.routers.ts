import { CategoryController } from "../controllers/category.controller.js";
import { Router } from "express";
import { authorize } from "../middleware/auth.middleware.js";

const router = Router();
const categoryController = new CategoryController();

router.get("/", categoryController.getAll);

router.get("/:id", categoryController.getById);

router.post("/", categoryController.create);

export default router;

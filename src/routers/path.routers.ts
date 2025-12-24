import { Router } from "express";
import { PathController } from "../controllers/path.controller.js";

const router = Router();
const pathController = new PathController();

router.get("/", pathController.getAll);
router.get("/:id", pathController.getById);
router.post("/", pathController.create);
router.put("/reorder", pathController.reorder);
router.post("/:id", pathController.update);
router.delete("/:id", pathController.delete);
export default router;

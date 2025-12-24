import { Router } from "express";
import { ContentController } from "../controllers/content.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();
const contentController = new ContentController();

// Public routes
router.get("/", contentController.getAll);
router.get("/:id", contentController.getById);

// Protected routes (ADMIN, TEACHER)
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  contentController.create
);
router.post(
  "/:id",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  contentController.update
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  contentController.delete
);

export default router;

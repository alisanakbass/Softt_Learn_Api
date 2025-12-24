import { Router } from "express";
import { QuestionController } from "../controllers/question.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();
const questionController = new QuestionController();

// Public routes
router.get("/", questionController.getAll);
router.get("/:id", questionController.getById);

// Student can check answers
router.post("/:id/check", authenticate, questionController.checkAnswer);

// Protected routes (ADMIN, TEACHER)
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  questionController.create
);
router.post(
  "/:id",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  questionController.update
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  questionController.delete
);

export default router;

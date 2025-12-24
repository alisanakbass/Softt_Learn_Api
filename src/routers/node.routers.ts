import { Router } from "express";
import { NodeController } from "../controllers/node.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();
const nodeController = new NodeController();

// Public routes
router.get("/", nodeController.getAll);
router.get("/tree", nodeController.getTree);
router.get("/:id", nodeController.getById);

// Protected routes (ADMIN, TEACHER)
router.post(
  "/reorder",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  nodeController.reorder
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  nodeController.create
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  nodeController.update
);
router.delete("/:id", authenticate, authorize("ADMIN"), nodeController.delete);

export default router;

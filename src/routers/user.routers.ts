import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();
const userController = new UserController();

router.get("/", authenticate, authorize("ADMIN"), userController.getAll);
router.get("/me", authenticate, userController.getMe);
router.patch("/update-me", authenticate, userController.updateMe);
router.patch("/update-password", authenticate, userController.updatePassword);

router.patch(
  "/:id/role",
  authenticate,
  authorize("ADMIN"),
  userController.updateRole
);
router.post("/", authenticate, authorize("ADMIN"), userController.create);
router.patch("/:id", authenticate, authorize("ADMIN"), userController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), userController.delete);

export default router;

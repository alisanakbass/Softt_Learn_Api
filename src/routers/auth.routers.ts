import { AuthController } from "../controllers/auth.controller.js";
import { Router } from "express";

const router = Router();
const authControl = new AuthController();

router.post("/register", authControl.register);
router.post("/login", authControl.login);

export default router;

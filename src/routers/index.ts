import { Router } from "express";
import authRouter from "./auth.routers.js";
import categoryRouter from "./category.routers.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use("/auth", authRouter);

router.use("/categories", authenticate, categoryRouter);

export default router;

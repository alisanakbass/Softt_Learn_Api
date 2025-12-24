import { Router } from "express";
import authRouter from "./auth.routers.js";
import categoryRouter from "./category.routers.js";
import pathRouters from "./path.routers.js";
import nodeRouters from "./node.routers.js";
import contentRouters from "./content.routers.js";
import questionRouters from "./question.routers.js";
import progressRouters from "./progress.routers.js";
import userRouter from "./user.routers.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/categories", categoryRouter);
router.use("/path", pathRouters);
router.use("/nodes", nodeRouters);
router.use("/content", contentRouters);
router.use("/questions", questionRouters);
router.use("/progress", progressRouters);
router.use("/users", userRouter);

export default router;

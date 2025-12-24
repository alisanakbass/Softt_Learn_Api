import { Router } from "express";
import { ProgressController } from "../controllers/progress.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
const progressController = new ProgressController();

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Kullanıcının tüm ilerlemeleri
router.get("/", progressController.getUserProgress);

// Kullanıcı istatistikleri
router.get("/stats", progressController.getUserStats);

// Belirli bir path için ilerleme
router.get("/:pathId", progressController.getPathProgress);

// İlerleme başlat
router.post("/start", progressController.startProgress);

// Node tamamla
router.post("/:pathId/complete", progressController.completeNode);

// İlerlemeyi sıfırla
router.post("/:pathId/reset", progressController.resetProgress);

// İlerlemeyi tamamen sil (Eğitimi Bırak)
router.delete("/:pathId", progressController.abandonProgress);

export default router;

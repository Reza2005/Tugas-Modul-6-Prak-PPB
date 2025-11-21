// backend/src/routes/thresholdsRoutes.js (FINAL FIX)

import express from "express";
// PERBAIKAN: Gunakan Named Import untuk mencocokkan export controller
import { ThresholdsController } from "../controllers/thresholdsController.js";
import { authMiddleware } from "../auth.js";

const router = express.Router();

router.get("/", ThresholdsController.list);
// Rute POST yang sudah diproteksi
router.post("/", authMiddleware, ThresholdsController.create);
router.get("/latest", ThresholdsController.latest);

export default router;

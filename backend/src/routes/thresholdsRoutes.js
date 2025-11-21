import express from "express";
import { ThresholdsController } from "../controllers/thresholdsController.js";
// PENTING: Impor authMiddleware dari file auth Anda
import { authMiddleware } from "../auth.js"; 

const router = express.Router();

// 1. GET /api/thresholds: (PUBLIK) Untuk mendapatkan riwayat, digunakan di ControlScreen (jika sudah login)
//    Catatan: Anda mungkin ingin ini publik agar ControlScreen bisa menampilkan history meskipun belum login
router.get("/", ThresholdsController.list);

// 2. POST /api/thresholds: (PROTEKSI) Untuk membuat threshold baru
//    WAJIB menyertakan authMiddleware agar hanya bisa diakses oleh user yang login
router.post("/", authMiddleware, ThresholdsController.create);

// 3. GET /api/thresholds/latest: (PUBLIK) Untuk mendapatkan nilai terbaru (digunakan oleh Simulator)
router.get("/latest", ThresholdsController.latest);

export default router;
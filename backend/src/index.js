// backend/src/index.js (KODE FINAL & LENGKAP)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Impor model yang dibutuhkan
import { ReadingsModel } from "./models/readingsModel.js"; // <-- WAJIB
// Impor rute yang tersisa
import thresholdsRoutes from "./routes/thresholdsRoutes.js"; 
import readingsRoutes from "./routes/readingsRoutes.js"; 
import {
  loginHandler,
  logoutHandler,
  authMiddleware,
  listTokens
} from './auth.js';

dotenv.config();

// Konversi __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// RUTE AUTENTIKASI
app.post('/auth/login', loginHandler);
app.post('/auth/logout', logoutHandler);
app.get('/auth/tokens', listTokens); 

// =================================================================
// RUTE MONITORING DAN CONTROL MANUAL (MENGAMBIL DATA DARI DB)
// =================================================================

// Public monitoring with pagination (MENGAMBIL DATA DARI DB)
app.get('/readings', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const size = Math.max(1, parseInt(req.query.size || '10', 10));

  try {
    const { data, total } = await ReadingsModel.listWithPagination(page, size); 

    res.json({
      page,
      size,
      total,
      data
    });
  } catch (error) {
    console.error("Error fetching paginated readings from DB:", error);
    res.status(500).json({ error: "Failed to fetch readings from database." });
  }
});

// Protected control
app.post('/control/do', authMiddleware, (req, res) => {
  const user = req.user;
  console.log('Control requested by', user.email, 'payload:', req.body);

  res.json({
    ok: true,
    by: user,
    received: req.body
  });
});

// =================================================================
// API ROUTES (YANG DIPASANG DARI FOLDER ROUTES)
// =================================================================

// Route API untuk Thresholds
app.use("/api/thresholds", thresholdsRoutes);

// Route API untuk Readings (POST untuk simulator)
app.use("/api/readings", readingsRoutes);


app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
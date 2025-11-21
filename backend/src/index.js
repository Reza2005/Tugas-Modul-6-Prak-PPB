// backend/src/index.js (ES MODULE VERSION)
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import {
  loginHandler,
  logoutHandler,
  authMiddleware,
  listTokens
} from './auth.js';

// Konversi __dirname di ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check
app.get('/', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Auth routes
app.post('/auth/login', loginHandler);
app.post('/auth/logout', logoutHandler);
app.get('/auth/tokens', listTokens); // dev only

// Dummy data untuk monitoring
const DUMMY_READINGS = (() => {
  const arr = [];
  const now = Date.now();
  for (let i = 1; i <= 200; i++) {
    arr.push({
      id: i,
      sensor: 'S' + ((i % 5) + 1),
      value: Math.round(Math.random() * 100),
      ts: new Date(now - i * 1000).toISOString()
    });
  }
  return arr;
})();

// Public monitoring with pagination
app.get('/readings', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const size = Math.max(1, parseInt(req.query.size || '10', 10));

  const start = (page - 1) * size;
  const end = start + size;

  res.json({
    page,
    size,
    total: DUMMY_READINGS.length,
    data: DUMMY_READINGS.slice(start, end)
  });
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

// Auto-mount routes folder if exists
const routesDir = path.join(__dirname, 'routes');

if (fs.existsSync(routesDir)) {
  const files = fs.readdirSync(routesDir);

  for (const file of files) {
    if (!file.endsWith('.js')) continue;

    const routePath = `./routes/${file}`;
    const { default: routeModule } = await import(routePath);

    // route name = filename without extension
    const base = file.replace('.js', '');

    // PERBAIKAN: Hapus if/else block yang sebelumnya salah menerapkan authMiddleware
    // Semua router dipasang secara normal, biarkan file rute (thresholdsRoutes.js) 
    // yang menentukan proteksi per rutenya.
    app.use(`/api/${base}`, routeModule);

    console.log(`Mounted route: /api/${base}`);
  }
}

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
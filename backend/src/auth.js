// backend/src/auth.js (ES MODULE VERSION)
import crypto from 'crypto';

// Dummy users (hardcoded). Ganti jika pakai DB
const USERS = [
  { id: 1, email: 'student@example.com', password: 'password123', name: 'Praktikan A' },
  { id: 2, email: 'alice@example.com', password: 'alicepass', name: 'Alice' }
];

// activeTokens: { tokenString: userObject }
const activeTokens = Object.create(null);

function generateToken() {
  return crypto.randomBytes(24).toString('hex') + Date.now().toString(36);
}

// POST /auth/login
export function loginHandler(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email & password required' });
  }

  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken();

  activeTokens[token] = {
    id: user.id,
    email: user.email,
    name: user.name,
    issuedAt: Date.now()
  };

  return res.json({ token, user: activeTokens[token] });
}

// Middleware untuk protect route
export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const tokenFromBearer = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  const token = tokenFromBearer || req.headers['token'] || req.query.token;

  if (!token || !activeTokens[token]) {
    return res.status(401).json({ error: 'Unauthorized: valid token required' });
  }

  req.user = activeTokens[token];
  next();
}

// Optional logout
export function logoutHandler(req, res) {
  const authHeader = req.headers['authorization'] || '';
  const tokenFromBearer = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  const token = tokenFromBearer || req.headers['token'] || req.body.token;

  if (token && activeTokens[token]) {
    delete activeTokens[token];
  }
  res.json({ ok: true });
}

// Debug token list
export function listTokens(req, res) {
  return res.json({ tokens: activeTokens });
}

export { USERS as _USERS };

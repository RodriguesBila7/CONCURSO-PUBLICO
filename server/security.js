const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

export const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)
  .concat(DEFAULT_ORIGINS);

export function corsOptions() {
  return {
    origin(origin, callback) {
      // Pedidos sem Origin (mesma origem via proxy do Vite, curl) são permitidos
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600
  };
}

export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cache-Control', 'no-store');
  next();
}

export function createRateLimiter({ windowMs, max, keyFn = req => req.ip, message }) {
  const hits = new Map();

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  sweep.unref();

  return function rateLimit(req, res, next) {
    const key = keyFn(req);
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - entry.count)));

    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, message });
    }
    next();
  };
}

export function asTrimmedString(value, maxLength = 200) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const NUIT_REGEX = /^\d{9}$/;
export const BI_REGEX = /^\d{12}[A-Za-z]$/;
export const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export function validatePasswordPolicy(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'A senha deve ter no mínimo 8 caracteres.';
  }
  if (password.length > 128) return 'A senha não pode exceder 128 caracteres.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'A senha deve conter letras e números.';
  }
  return null;
}

import crypto from 'crypto';
import db from './db.js';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const IDLE_TIMEOUT_MS = 60 * 60 * 1000;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export function isGestorRole(role) {
  return role === 'admin' || role === 'gestor';
}

export function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  db.prepare(`
    INSERT INTO sessoes (token_hash, user_id, criada_em, expira_em, ultimo_acesso)
    VALUES (?, ?, ?, ?, ?)
  `).run(hashToken(token), userId, now, now + SESSION_TTL_MS, now);
  return token;
}

export function destroySession(token) {
  if (token) db.prepare('DELETE FROM sessoes WHERE token_hash = ?').run(hashToken(token));
}

export function destroyUserSessions(userId, exceptToken) {
  if (exceptToken) {
    db.prepare('DELETE FROM sessoes WHERE user_id = ? AND token_hash != ?').run(userId, hashToken(exceptToken));
  } else {
    db.prepare('DELETE FROM sessoes WHERE user_id = ?').run(userId);
  }
}

function getBearerToken(req) {
  const header = req.get('authorization') || '';
  const match = header.match(/^Bearer ([a-f0-9]{64})$/i);
  return match ? match[1] : null;
}

export function resolveSession(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const now = Date.now();
  const row = db.prepare(`
    SELECT s.token_hash, s.expira_em, s.ultimo_acesso, u.id, u.nuit, u.name, u.email, u.role, u.created_at
    FROM sessoes s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?
  `).get(hashToken(token));

  if (!row) return null;
  if (row.expira_em <= now || now - row.ultimo_acesso > IDLE_TIMEOUT_MS) {
    db.prepare('DELETE FROM sessoes WHERE token_hash = ?').run(row.token_hash);
    return null;
  }

  db.prepare('UPDATE sessoes SET ultimo_acesso = ? WHERE token_hash = ?').run(now, row.token_hash);
  const { token_hash, expira_em, ultimo_acesso, ...user } = row;
  return { token, user };
}

export function requireAuth(req, res, next) {
  const session = resolveSession(req);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada. Inicie sessão novamente.' });
  }
  req.session = session;
  next();
}

export function requireGestor(req, res, next) {
  requireAuth(req, res, () => {
    if (!isGestorRole(req.session.user.role)) {
      return res.status(403).json({ success: false, message: 'Acesso reservado à Direcção de Recursos Humanos e ao Júri.' });
    }
    next();
  });
}

export function purgeExpiredSessions() {
  db.prepare('DELETE FROM sessoes WHERE expira_em <= ? OR ultimo_acesso < ?')
    .run(Date.now(), Date.now() - IDLE_TIMEOUT_MS);
}

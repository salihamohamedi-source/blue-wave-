const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');

const siteRoot = __dirname;
const sessionCookieName = 'bluewave_session';
const sessionLifetimeSeconds = 7 * 24 * 60 * 60;
const resetLifetimeSeconds = 30 * 60;
const bodyLimit = 12 * 1024;
const passwordCost = 12;
const dummyPasswordHash = bcrypt.hashSync('bluewave-invalid-account-password', passwordCost);
const secureCookies = process.env.NODE_ENV === 'production';
const databasePath = process.env.ACCOUNT_DB_PATH
  ? path.resolve(siteRoot, process.env.ACCOUNT_DB_PATH)
  : path.join(siteRoot, 'data', 'accounts.sqlite');
const databaseDirectory = path.dirname(databasePath);
if (!fs.existsSync(databaseDirectory)) fs.mkdirSync(databaseDirectory, { recursive: true });

const database = new Database(databasePath);
database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');
database.pragma('busy_timeout = 5000');
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS account_sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS account_sessions_expiry ON account_sessions(expires_at);
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS password_reset_expiry ON password_reset_tokens(expires_at);
`);

database.prepare('DELETE FROM account_sessions WHERE expires_at <= ?').run(Math.floor(Date.now() / 1000));
database.prepare('DELETE FROM password_reset_tokens WHERE expires_at <= ?').run(Math.floor(Date.now() / 1000));

const rateLimits = new Map();
const rateLimitRules = {
  login: { max: 10, windowMs: 15 * 60 * 1000 },
  signup: { max: 5, windowMs: 60 * 60 * 1000 },
  forgot: { max: 4, windowMs: 60 * 60 * 1000 },
  reset: { max: 8, windowMs: 60 * 60 * 1000 },
  profile: { max: 12, windowMs: 60 * 60 * 1000 }
};

function sendJson(response, status, data, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  response.end(JSON.stringify(data));
}

function fail(response, status, code, error) {
  sendJson(response, status, { code, error });
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bodyBytes = 0;
    let tooLarge = false;
    request.on('data', (chunk) => {
      bodyBytes += chunk.length;
      if (bodyBytes > bodyLimit) {
        chunks.length = 0;
        tooLarge = true;
      } else if (!tooLarge) {
        chunks.push(Buffer.from(chunk));
      }
    });
    request.on('end', () => {
      if (tooLarge) {
        reject(Object.assign(new Error('The request is too large.'), { status: 413 }));
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('The request must contain valid JSON.'), { status: 400 }));
      }
    });
    request.on('error', reject);
  });
}

function getCookies(request) {
  const cookies = new Map();
  for (const item of (request.headers.cookie || '').split(';')) {
    const separator = item.indexOf('=');
    if (separator < 1) continue;
    const name = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    try {
      cookies.set(name, decodeURIComponent(value));
    } catch {
      continue;
    }
  }
  return cookies;
}

function cookieHeader(value, maxAge) {
  const secure = secureCookies ? '; Secure' : '';
  return `${sessionCookieName}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function tokenDigest(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function createSession(response, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  database.prepare(
    'INSERT INTO account_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
  ).run(tokenDigest(token), userId, now + sessionLifetimeSeconds, now);
  response.setHeader('Set-Cookie', cookieHeader(token, sessionLifetimeSeconds));
}

function clearSessionCookie(response) {
  response.setHeader('Set-Cookie', cookieHeader('', 0));
}

function getSession(request) {
  const token = getCookies(request).get(sessionCookieName);
  if (!token || token.length > 128) return null;
  const tokenHash = tokenDigest(token);
  const now = Math.floor(Date.now() / 1000);
  const row = database.prepare(`
    SELECT users.id, users.email, users.display_name, account_sessions.token_hash
    FROM account_sessions
    JOIN users ON users.id = account_sessions.user_id
    WHERE account_sessions.token_hash = ? AND account_sessions.expires_at > ?
  `).get(tokenHash, now);
  return row ? { id: row.id, email: row.email, displayName: row.display_name, tokenHash: row.token_hash } : null;
}

function serializeUser(user) {
  return { id: user.id, email: user.email, displayName: user.displayName };
}

function checkSameOrigin(request) {
  const originHeader = request.headers.origin;
  const hostHeader = request.headers.host;
  if (typeof originHeader !== 'string' || typeof hostHeader !== 'string') return false;
  try {
    const origin = new URL(originHeader);
    if (origin.host.toLowerCase() !== hostHeader.toLowerCase()) return false;
    return !secureCookies || origin.protocol === 'https:';
  } catch {
    return false;
  }
}

function rateLimitKey(request, action, identifier = '') {
  const ip = request.socket.remoteAddress || 'unknown';
  return `${action}:${ip}:${identifier}`;
}

function allowRequest(request, response, action, identifier = '') {
  const rule = rateLimitRules[action];
  const now = Date.now();
  const keys = [rateLimitKey(request, action), rateLimitKey(request, action, identifier)].filter(
    (key, index, all) => all.indexOf(key) === index
  );
  const buckets = keys.map((key) => ({ key, bucket: rateLimits.get(key) }));
  const blocked = buckets.find(({ bucket }) => bucket && bucket.expiresAt > now && bucket.count >= rule.max);
  if (blocked) {
    const retryAfter = Math.max(1, Math.ceil((blocked.bucket.expiresAt - now) / 1000));
    response.setHeader('Retry-After', String(retryAfter));
    fail(response, 429, 'RATE_LIMITED', 'Too many attempts. Please wait and try again.');
    return false;
  }
  for (const { key, bucket } of buckets) {
    if (!bucket || bucket.expiresAt <= now) {
      rateLimits.set(key, { count: 1, expiresAt: now + rule.windowMs });
    } else {
      bucket.count += 1;
    }
  }
  if (rateLimits.size > 10000) {
    for (const [oldKey, value] of rateLimits) {
      if (value.expiresAt <= now) rateLimits.delete(oldKey);
    }
  }
  return true;
}

function validEmail(rawEmail) {
  if (typeof rawEmail !== 'string') return null;
  const email = rawEmail.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) return null;
  return email;
}

function validDisplayName(rawName) {
  if (typeof rawName !== 'string') return null;
  const name = rawName.trim();
  if (Array.from(name).length < 1 || Array.from(name).length > 60 || /[\u0000-\u001f\u007f]/u.test(name)) return null;
  return name;
}

function validPassword(password) {
  return typeof password === 'string'
    && Array.from(password).length >= 12
    && Buffer.byteLength(password, 'utf8') <= 72
    && !/[\u0000-\u001f\u007f]/u.test(password);
}

function mailConfiguration() {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  const siteUrl = process.env.SITE_URL;
  if (!host || !from || !siteUrl) return null;

  let baseUrl;
  try {
    baseUrl = new URL(siteUrl);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(baseUrl.protocol) || baseUrl.username || baseUrl.password
    || baseUrl.pathname !== '/' || baseUrl.search || baseUrl.hash
    || (secureCookies && baseUrl.protocol !== 'https:')) return null;

  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE.toLowerCase() === 'true'
    : port === 465;
  const transportOptions = { host, port, secure, requireTLS: !secure && port !== 25 };
  if (process.env.SMTP_USER || process.env.SMTP_PASSWORD) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) return null;
    transportOptions.auth = { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD };
  }
  return { transport: nodemailer.createTransport(transportOptions), from, baseUrl: baseUrl.origin };
}

async function handleSignup(request, response, input) {
  const displayName = validDisplayName(input && input.displayName);
  const email = validEmail(input && input.email);
  const password = input && input.password;
  if (!displayName || !email || !validPassword(password)) {
    fail(response, 400, 'INVALID_SIGNUP', 'Enter a valid name and email, and a password of at least 12 characters.');
    return;
  }
  if (!allowRequest(request, response, 'signup', email)) return;

  const passwordHash = await bcrypt.hash(password, passwordCost);
  const now = Math.floor(Date.now() / 1000);
  let user;
  try {
    const created = database.prepare(
      'INSERT INTO users (email, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).run(email, displayName, passwordHash, now, now);
    user = { id: Number(created.lastInsertRowid), email, displayName };
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      fail(response, 409, 'EMAIL_IN_USE', 'An account with this email already exists.');
      return;
    }
    throw error;
  }
  createSession(response, user.id);
  sendJson(response, 201, { user: serializeUser(user) });
}

async function handleLogin(request, response, input) {
  const email = validEmail(input && input.email);
  const password = input && input.password;
  if (!email || typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 72) {
    fail(response, 400, 'INVALID_LOGIN', 'Enter a valid email and password.');
    return;
  }
  if (!allowRequest(request, response, 'login', email)) return;

  const user = database.prepare(
    'SELECT id, email, display_name, password_hash FROM users WHERE email = ?'
  ).get(email);
  const passwordMatches = await bcrypt.compare(password, user ? user.password_hash : dummyPasswordHash);
  if (!user || !passwordMatches) {
    fail(response, 401, 'INVALID_CREDENTIALS', 'The email or password is incorrect.');
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  database.prepare('DELETE FROM account_sessions WHERE user_id = ? AND expires_at <= ?').run(user.id, now);
  createSession(response, user.id);
  sendJson(response, 200, {
    user: serializeUser({ id: user.id, email: user.email, displayName: user.display_name })
  });
}

async function handleForgotPassword(request, response, input) {
  const email = validEmail(input && input.email);
  if (!email) {
    fail(response, 400, 'INVALID_EMAIL', 'Enter a valid email address.');
    return;
  }
  if (!allowRequest(request, response, 'forgot', email)) return;
  const mail = mailConfiguration();
  if (!mail) {
    fail(response, 503, 'RESET_EMAIL_UNAVAILABLE', 'Password reset email is not configured on the website server.');
    return;
  }

  const user = database.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) {
    sendJson(response, 200, { ok: true });
    return;
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = tokenDigest(token);
  const now = Math.floor(Date.now() / 1000);
  database.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(user.id);
  database.prepare(
    'INSERT INTO password_reset_tokens (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
  ).run(tokenHash, user.id, now + resetLifetimeSeconds, now);

  const resetUrl = new URL('/', mail.baseUrl);
  resetUrl.searchParams.set('reset', token);
  try {
    await mail.transport.sendMail({
      from: mail.from,
      to: email,
      subject: 'Reset your Bluewave password',
      text: `Use this one-time link to reset your Bluewave password. It expires in 30 minutes:\n\n${resetUrl.href}\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>Use this one-time link to reset your Bluewave password. It expires in 30 minutes:</p><p><a href="${resetUrl.href}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`
    });
  } catch (error) {
    database.prepare('DELETE FROM password_reset_tokens WHERE token_hash = ?').run(tokenHash);
    console.error(`Could not send a password reset email (${error.code || error.name || 'SMTP error'}).`);
    fail(response, 503, 'RESET_EMAIL_FAILED', 'The reset email could not be sent. Please try again later.');
    return;
  }
  sendJson(response, 200, { ok: true });
}

async function handleResetPassword(request, response, input) {
  const token = input && input.token;
  const password = input && input.password;
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{40,60}$/u.test(token)) {
    fail(response, 400, 'INVALID_RESET_TOKEN', 'This reset link is invalid or expired. Request another reset link.');
    return;
  }
  if (!validPassword(password)) {
    fail(response, 400, 'INVALID_PASSWORD', 'Use a password of at least 12 characters and at most 72 UTF-8 bytes.');
    return;
  }
  if (!allowRequest(request, response, 'reset')) return;

  const tokenHash = tokenDigest(token);
  const now = Math.floor(Date.now() / 1000);
  const passwordHash = await bcrypt.hash(password, passwordCost);
  const reset = database.prepare(
    'SELECT user_id FROM password_reset_tokens WHERE token_hash = ? AND expires_at > ?'
  ).get(tokenHash, now);
  if (!reset) {
    fail(response, 400, 'INVALID_RESET_TOKEN', 'This reset link is invalid or expired. Request another reset link.');
    return;
  }

  const completeReset = database.transaction(() => {
    const stillValid = database.prepare(
      'SELECT user_id FROM password_reset_tokens WHERE token_hash = ? AND expires_at > ?'
    ).get(tokenHash, Math.floor(Date.now() / 1000));
    if (!stillValid) return false;
    database.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
      .run(passwordHash, Math.floor(Date.now() / 1000), stillValid.user_id);
    database.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(stillValid.user_id);
    database.prepare('DELETE FROM account_sessions WHERE user_id = ?').run(stillValid.user_id);
    return true;
  });
  if (!completeReset()) {
    fail(response, 400, 'INVALID_RESET_TOKEN', 'This reset link is invalid or expired. Request another reset link.');
    return;
  }
  clearSessionCookie(response);
  sendJson(response, 200, { ok: true });
}

async function handleProfile(request, response, input, user) {
  const displayName = validDisplayName(input && input.displayName);
  if (!displayName) {
    fail(response, 400, 'INVALID_DISPLAY_NAME', 'Enter a display name of 1 to 60 characters.');
    return;
  }
  if (!allowRequest(request, response, 'profile', String(user.id))) return;
  database.prepare('UPDATE users SET display_name = ?, updated_at = ? WHERE id = ?')
    .run(displayName, Math.floor(Date.now() / 1000), user.id);
  sendJson(response, 200, {
    user: serializeUser({ id: user.id, email: user.email, displayName })
  });
}

async function handleChangePassword(request, response, input, user) {
  const currentPassword = input && input.currentPassword;
  const newPassword = input && input.newPassword;
  if (typeof currentPassword !== 'string' || Buffer.byteLength(currentPassword, 'utf8') > 72
    || !validPassword(newPassword)) {
    fail(response, 400, 'INVALID_PASSWORD', 'Enter your current password and a new password of at least 12 characters.');
    return;
  }
  if (!allowRequest(request, response, 'profile', String(user.id))) return;

  const row = database.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id);
  if (!row || !await bcrypt.compare(currentPassword, row.password_hash)) {
    fail(response, 401, 'INVALID_CURRENT_PASSWORD', 'Your current password is incorrect.');
    return;
  }
  const newPasswordHash = await bcrypt.hash(newPassword, passwordCost);
  const replacementSessionToken = crypto.randomBytes(32).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const update = database.transaction(() => {
    database.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
      .run(newPasswordHash, now, user.id);
    database.prepare('DELETE FROM account_sessions WHERE user_id = ?').run(user.id);
    database.prepare(
      'INSERT INTO account_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
    ).run(tokenDigest(replacementSessionToken), user.id, now + sessionLifetimeSeconds, now);
    database.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(user.id);
  });
  update();
  response.setHeader('Set-Cookie', cookieHeader(replacementSessionToken, sessionLifetimeSeconds));
  sendJson(response, 200, { ok: true });
}

async function handleAccountRoute(request, response, pathname) {
  const route = pathname.slice('/api/account/'.length);
  const methods = {
    me: 'GET',
    signup: 'POST',
    login: 'POST',
    logout: 'POST',
    profile: 'POST',
    'change-password': 'POST',
    'forgot-password': 'POST',
    'reset-password': 'POST'
  };
  const expectedMethod = methods[route];
  if (!expectedMethod) {
    fail(response, 404, 'NOT_FOUND', 'Account endpoint not found.');
    return;
  }
  if (request.method !== expectedMethod) {
    response.setHeader('Allow', expectedMethod);
    fail(response, 405, 'METHOD_NOT_ALLOWED', `Use ${expectedMethod} for this account endpoint.`);
    return;
  }

  if (route === 'me') {
    const user = getSession(request);
    if (!user) {
      fail(response, 401, 'NOT_AUTHENTICATED', 'No active account session.');
      return;
    }
    sendJson(response, 200, { user: serializeUser(user) });
    return;
  }

  if (!checkSameOrigin(request)) {
    fail(response, 403, 'INVALID_ORIGIN', 'This request is not allowed.');
    return;
  }

  let input;
  try {
    input = await readJsonBody(request);
  } catch (error) {
    fail(response, error.status || 400, 'INVALID_REQUEST', error.message || 'Invalid request.');
    return;
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    fail(response, 400, 'INVALID_REQUEST', 'The request body must be a JSON object.');
    return;
  }

  if (route === 'signup') {
    await handleSignup(request, response, input);
    return;
  }
  if (route === 'login') {
    await handleLogin(request, response, input);
    return;
  }
  if (route === 'forgot-password') {
    await handleForgotPassword(request, response, input);
    return;
  }
  if (route === 'reset-password') {
    await handleResetPassword(request, response, input);
    return;
  }

  const user = getSession(request);
  if (route === 'logout') {
    if (user) database.prepare('DELETE FROM account_sessions WHERE token_hash = ?').run(user.tokenHash);
    clearSessionCookie(response);
    sendJson(response, 200, { ok: true });
    return;
  }
  if (!user) {
    fail(response, 401, 'NOT_AUTHENTICATED', 'Please log in to continue.');
    return;
  }
  if (route === 'profile') {
    await handleProfile(request, response, input, user);
    return;
  }
  if (route === 'change-password') {
    await handleChangePassword(request, response, input, user);
  }
}

module.exports = { handleAccountRoute };

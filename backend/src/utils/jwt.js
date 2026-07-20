const jwt = require('jsonwebtoken');

// Fail fast at boot rather than silently signing every session with a secret anyone who's seen
// this repo (or its .env.example) already knows. Checks both the placeholder that shipped in
// .env.example historically and the one that ships now, so an old, already-copied .env still
// gets caught.
const KNOWN_PLACEHOLDER_SECRETS = new Set([
  'change-me-to-a-long-random-string',
  'REPLACE_ME_WITH_YOUR_OWN_RANDOM_SECRET',
]);
if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim() || KNOWN_PLACEHOLDER_SECRETS.has(process.env.JWT_SECRET)) {
  throw new Error(
    'JWT_SECRET is missing or still set to the .env.example placeholder. Set a real random ' +
    'value in your .env file before starting the server, e.g.: ' +
    'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
  );
}

const COOKIE_NAME = 'pw_session';

function parseDurationMs(str) {
  const match = /^(\d+)([smhd])$/.exec(String(str).trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return value * unit;
}

function signSession(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verifySession(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function sessionCookieOptions() {
  // Frontend and backend are deployed on different onrender.com subdomains, which browsers
  // treat as cross-site. SameSite=Lax cookies are never sent on cross-site fetch requests
  // (only on top-level navigations), so the session cookie must be SameSite=None in
  // production — which in turn requires Secure. Locally both run on http://localhost, where
  // None+Secure would just get silently dropped over plain HTTP, so we fall back to Lax there.
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    maxAge: parseDurationMs(process.env.JWT_EXPIRES_IN || '7d'),
  };
}

module.exports = { COOKIE_NAME, signSession, verifySession, sessionCookieOptions };

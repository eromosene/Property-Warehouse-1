const { eq } = require('drizzle-orm');
const { db } = require('../db/client');
const { users } = require('../db/schema');
const { COOKIE_NAME, verifySession } = require('../utils/jwt');

function loadUserFromRequest(req) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return null;
  const payload = verifySession(token); // throws if invalid/expired
  return db.select().from(users).where(eq(users.id, payload.sub)).get() || null;
}

// Requires a valid session; 401s otherwise. Populates req.user with the full DB row.
function requireAuth(req, res, next) {
  try {
    const user = loadUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// Populates req.user if a valid session cookie is present, but never rejects the request.
// Used by public endpoints (e.g. GET /api/listings) that behave slightly differently for
// a logged-in tenant/landlord without requiring login.
function optionalAuth(req, res, next) {
  try {
    req.user = loadUserFromRequest(req);
  } catch (err) {
    req.user = null;
  }
  next();
}

// Must be used after requireAuth. Rejects unless req.user.role is one of `roles`.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };

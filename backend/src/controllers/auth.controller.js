const bcrypt = require('bcryptjs');
const { eq } = require('drizzle-orm');
const { db } = require('../db/client');
const { users } = require('../db/schema');
const { COOKIE_NAME, signSession, sessionCookieOptions } = require('../utils/jwt');
const { serializeUser } = require('../utils/serialize');

function normalizePhone(raw) {
  if (!raw) return null;
  // Strip everything except digits and a leading +
  let cleaned = raw.replace(/[^\d+]/g, '');
  // Convert local Nigerian format (0801...) to international (+234801...)
  if (cleaned.startsWith('0')) {
    cleaned = '+234' + cleaned.slice(1);
  }
  // Add + if it starts with 234 but missing the +
  if (cleaned.startsWith('234') && !cleaned.startsWith('+234')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

function isEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

// Sets the session cookie (still used for local dev, where frontend/backend share a site) and
// returns the raw token so callers can also put it in the JSON body for Bearer-header auth —
// needed because the live frontend/backend are on different domains and SameSite cookies alone
// aren't reliable there.
function setSessionCookie(res, user) {
  const token = signSession(user);
  res.cookie(COOKIE_NAME, token, sessionCookieOptions());
  return token;
}

// POST /api/auth/signup
// body: { role: 'tenant'|'landlord', firstName, lastName, email, phone, password,
//         area, budget,        // tenant-only (auth.js #tenant-signup)
//         propType, lga }      // landlord-only (auth.js #landlord-signup)
async function signup(req, res) {
  const { role, firstName, lastName, email, phone, password, area, budget, propType, lga } = req.body;

  if (!['tenant', 'landlord'].includes(role)) {
    return res.status(400).json({ error: "role must be 'tenant' or 'landlord'" });
  }
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'firstName, lastName, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const now = new Date();
  const row = {
    id: crypto.randomUUID(),
    role,
    firstName,
    lastName,
    email,
    phone: normalizePhone(phone),
    passwordHash: bcrypt.hashSync(password, 10),
    area: role === 'tenant' ? area || null : null,
    budget: role === 'tenant' ? budget || null : null,
    propType: role === 'landlord' ? propType || null : null,
    lga: role === 'landlord' ? lga || null : null,
    isVerified: false,
    joinedDate: now,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(users).values(row);

  const token = setSessionCookie(res, row);
  res.status(201).json({ user: serializeUser(row), token });
}

// POST /api/auth/login
// body: { email, password, role? }  — the email field may contain an email address or phone
// number; role is an optional hint matching which tab the frontend form was submitted from.
async function login(req, res) {
  const { email, password, role } = req.body;
  const identifier = email;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/phone number and password are required' });
  }

  let user;
  if (isEmail(identifier)) {
    [user] = await db.select().from(users).where(eq(users.email, identifier));
  } else {
    const normalized = normalizePhone(identifier);
    [user] = await db.select().from(users).where(eq(users.phone, normalized));
  }

  if (!user || user.role === 'admin' || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials. Please sign up first.' });
  }
  if (role && user.role !== role) {
    return res.status(401).json({ error: 'Invalid credentials. Please sign up first.' });
  }

  const token = setSessionCookie(res, user);
  res.json({ user: serializeUser(user), token });
}

// POST /api/auth/admin/login — separate from tenant/landlord login on purpose.
async function adminLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || user.role !== 'admin' || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = setSessionCookie(res, user);
  res.json({ user: serializeUser(user), token });
}

// POST /api/auth/logout
function logout(req, res) {
  res.clearCookie(COOKIE_NAME, sessionCookieOptions());
  res.status(204).end();
}

// GET /api/auth/me
function me(req, res) {
  res.json({ user: serializeUser(req.user) });
}

module.exports = { signup, login, adminLogin, logout, me };

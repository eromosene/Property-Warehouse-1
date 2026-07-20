const bcrypt = require('bcryptjs');
const { eq } = require('drizzle-orm');
const { db } = require('../db/client');
const { users } = require('../db/schema');
const { COOKIE_NAME, signSession, sessionCookieOptions } = require('../utils/jwt');
const { serializeUser } = require('../utils/serialize');

function setSessionCookie(res, user) {
  res.cookie(COOKIE_NAME, signSession(user), sessionCookieOptions());
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
    phone: phone || null,
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

  setSessionCookie(res, row);
  res.status(201).json({ user: serializeUser(row) });
}

// POST /api/auth/login
// body: { email, password, role? }  — role is an optional hint matching which tab
// (tenant/landlord) the frontend form was submitted from.
async function login(req, res) {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || user.role === 'admin' || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials. Please sign up first.' });
  }
  if (role && user.role !== role) {
    return res.status(401).json({ error: 'Invalid credentials. Please sign up first.' });
  }

  setSessionCookie(res, user);
  res.json({ user: serializeUser(user) });
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

  setSessionCookie(res, user);
  res.json({ user: serializeUser(user) });
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

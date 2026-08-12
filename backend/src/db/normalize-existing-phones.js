// One-time backfill for phone numbers saved before phone normalization was added.
// Run via `npm run db:normalize-phones` from the backend directory.
require('dotenv').config();

const { eq, isNotNull } = require('drizzle-orm');
const { db, pool } = require('./client');
const { users } = require('./schema');

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

async function main() {
  let updated = 0;

  try {
    const rows = await db
      .select({ id: users.id, phone: users.phone })
      .from(users)
      .where(isNotNull(users.phone));

    for (const row of rows) {
      const current = row.phone.trim();
      if (/^\+234\d+$/.test(current)) {
        continue;
      }

      const normalized = normalizePhone(current);
      if (!normalized || normalized === current) {
        continue;
      }

      await db.update(users).set({ phone: normalized }).where(eq(users.id, row.id));
      updated += 1;
    }

    console.log(`Phone normalization complete. Updated ${updated} row(s).`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Phone normalization failed:', err);
  process.exitCode = 1;
});
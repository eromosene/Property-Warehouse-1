// Applies any pending SQL migrations in ./drizzle to the Supabase Postgres DB at DATABASE_URL.
// Run via `npm run db:migrate`. Regenerate migrations with `npm run db:generate` after
// changing src/db/schema.js.
require('dotenv').config();
const path = require('path');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { db, pool } = require('./client');

async function main() {
  await migrate(db, { migrationsFolder: path.resolve(__dirname, '../../drizzle') });
  console.log('Migrations applied.');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

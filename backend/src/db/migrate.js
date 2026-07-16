// Applies any pending SQL migrations in ./drizzle to the SQLite DB at DATABASE_URL.
// Run via `npm run db:migrate`. Regenerate migrations with `npm run db:generate` after
// changing src/db/schema.js.
require('dotenv').config();
const path = require('path');
const { migrate } = require('drizzle-orm/better-sqlite3/migrator');
const { db } = require('./client');

migrate(db, { migrationsFolder: path.resolve(__dirname, '../../drizzle') });
console.log('Migrations applied.');

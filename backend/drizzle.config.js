require('dotenv').config();
const { defineConfig } = require('drizzle-kit');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing. Set it in your .env file to your Supabase Postgres connection string.');
}

// See src/db/client.js for why sslmode is stripped from the URL rather than left for
// pg-connection-string to parse.
const url = process.env.DATABASE_URL.replace(/([?&])sslmode=[^&]*&?/, '$1').replace(/[?&]$/, '');

module.exports = defineConfig({
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url,
    ssl: { rejectUnauthorized: false },
  },
});

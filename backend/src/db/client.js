const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is missing. Set it in your .env file to your Supabase Postgres connection ' +
    'string (Session pooler), e.g.: postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres'
  );
}

// pg-connection-string parses a `sslmode=require` query param (as shipped in Supabase's
// copy-paste connection string) into a full certificate-verification ssl config, and that
// parsed value silently overrides the explicit `ssl` option below (see connection-parameters.js
// — connectionString-derived fields are merged in AFTER the explicit config object). Supabase's
// pooler presents a cert Node doesn't trust by default, so verification fails. Stripping the
// query param here keeps the explicit rejectUnauthorized: false in charge regardless of
// whether the pasted URL has sslmode on it.
const connectionString = process.env.DATABASE_URL.replace(/([?&])sslmode=[^&]*&?/, '$1').replace(/[?&]$/, '');

// Supabase's pooler requires TLS but presents a certificate not signed by a CA Node trusts by
// default; rejectUnauthorized: false keeps the connection encrypted without failing that check.
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool);

module.exports = { db, pool };

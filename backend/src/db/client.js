const path = require('path');
const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');

const dbFile = process.env.DATABASE_URL || './dev.db';
const resolvedPath = path.isAbsolute(dbFile) ? dbFile : path.resolve(__dirname, '../../', dbFile);

const sqlite = new Database(resolvedPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite);

module.exports = { db, sqlite };

# Property Warehouse — Backend (Phase 1)

Real auth + listings + uploads API for the Property Warehouse frontend, replacing the
localStorage-backed mock data in `../listings-data.js` and `../auth.js`. See
`../BACKEND-REQUIREMENTS.md` for the full analysis this was built from, and
`../MIGRATION-NOTES.md` for exactly which frontend files need to change (not done yet — this
pass only builds the backend).

This is **Phase 1 only**: auth (signup/login/logout/me, tenant/landlord/admin roles),
listings CRUD (public browse, landlord create/edit/delete, admin moderation), and image/document
upload. Favourites, inquiries, feedback, announcements, heatmap data, and payments are later
phases — see BACKEND-REQUIREMENTS.md's phased build order.

## Stack

- **Node.js + Express**
- **SQLite** (via `better-sqlite3`) for local dev — zero external setup, no Docker/Postgres
  install required. BACKEND-REQUIREMENTS.md recommends **PostgreSQL** for production; see
  "Switching to Postgres later" below for what that swap actually involves.
- **Drizzle ORM** for schema + migrations (not Prisma — see note below).
- **bcryptjs** for password hashing, **jsonwebtoken** for a session token kept in an httpOnly
  cookie (not exposed to frontend JS — mitigates the XSS risk that a localStorage-held token
  would have).
- **multer** for multipart file upload, storing to local disk under `./uploads` for now.

### Why Drizzle instead of Prisma

BACKEND-REQUIREMENTS.md names both Prisma and Drizzle as acceptable ORM choices. This build
started with Prisma, but on this machine Windows Defender flags Prisma's downloaded
`schema-engine-windows.exe` as a false-positive virus and blocks reading it, which breaks
`prisma migrate`/`generate` entirely. Drizzle doesn't spawn a native engine binary for SQLite
migrations, so it was used instead — no functional difference for this API's purposes. If your
machine doesn't have that Defender issue and you'd rather use Prisma, that's a reasonable swap.

## Running locally

```bash
cd backend
npm install
cp .env.example .env      # defaults work as-is for local dev
npm run db:generate       # generate SQL migration from src/db/schema.js (already committed under drizzle/, only needed after schema changes)
npm run db:migrate        # create/update dev.db
npm run seed               # seed admin user + 6 landlord accounts + 6 listings (matches the frontend's DEFAULT_LISTINGS)
npm run dev                 # starts the API on http://localhost:4000
```

The seed script prints the admin login and a shared seed-landlord password to the console —
see its output, or read `src/db/seed.js` directly (`ADMIN_EMAIL`/`ADMIN_PASSWORD` come from
`.env`; default admin is `admin@propertywarehouse.ng` / `PWAdmin2025!`, matching the credentials
that used to be hardcoded in `admin.js`).

The static frontend keeps running exactly as before — `npx serve . -l 5000` from the repo root
(per `.replit`) — on a different port. This backend runs alongside it on port 4000 and does not
touch anything in `.replit` or the frontend files. `FRONTEND_ORIGIN` in `.env` controls CORS and
should match wherever the frontend is actually served from.

## Database

Schema lives in `src/db/schema.js` (Drizzle). Generated SQL migrations are in `drizzle/`.
The dev database is a single file, `dev.db`, created by `npm run db:migrate` (gitignored).

To inspect the DB visually: `npm run db:studio` (opens Drizzle Studio in a browser).

To reset from scratch:
```bash
rm dev.db dev.db-*
npm run db:migrate
npm run seed
```

### Switching to PostgreSQL later

1. Provision a Postgres instance and set `DATABASE_URL` to its connection string.
2. In `src/db/client.js`, swap `drizzle-orm/better-sqlite3` + `better-sqlite3` for
   `drizzle-orm/node-postgres` + `pg` (or `drizzle-orm/postgres-js` + `postgres`).
3. In `drizzle.config.js`, change `dialect: 'sqlite'` to `dialect: 'postgresql'`.
4. Delete `drizzle/` and run `npm run db:generate` again to produce Postgres-flavored migration
   SQL, then `npm run db:migrate` against the real database.

No changes are needed in `src/db/schema.js` itself — amenities/ownership-doc arrays are stored
as JSON text columns specifically so this schema is portable between SQLite and Postgres.

## Environment variables

See `.env.example` for the full list with explanations. The important ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path (dev) or Postgres connection string (prod, after the swap above) |
| `JWT_SECRET` | Signs the session cookie — generate a real random value outside of local dev |
| `JWT_EXPIRES_IN` | Session lifetime, e.g. `7d` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin login (replaces the old hardcoded constants in admin.js) |
| `PORT` | API port (default 4000) |
| `FRONTEND_ORIGIN` | Allowed CORS origin — the static frontend's URL |
| `UPLOAD_DIR` | Local disk root for uploaded images/documents |
| `MAX_UPLOAD_MB` | Per-file upload size limit |

## Project layout

```
backend/
  drizzle/              generated SQL migrations
  drizzle.config.js
  src/
    app.js              Express app (middleware + route mounting)
    index.js             entry point (starts the HTTP server)
    db/
      schema.js          Drizzle table definitions
      client.js           better-sqlite3 connection + drizzle instance
      migrate.js           applies pending migrations
      seed.js               seeds admin + 6 landlords + 6 listings
    middleware/
      auth.js             requireAuth / optionalAuth / requireRole
    routes/               one file per route group, thin — delegates to controllers
    controllers/          request handling + validation
    services/
      listings.service.js  shared listing serialization (used by public/landlord/admin controllers)
    utils/
      jwt.js               session token signing/verification/cookie options
      serialize.js          DB row -> frontend-shaped JSON
      storage.js            multer config for image/document upload
  uploads/               local-disk file storage (gitignored contents, dev only)
```

## API endpoints

See the curl examples the assistant provided when this backend was built for a full runnable
list. Summary:

- `POST /api/auth/signup`, `/login`, `/admin/login`, `/logout`, `GET /api/auth/me`
- `GET /api/listings`, `/api/listings/:id`, `/api/listings/:id/similar`, `POST /api/listings/:id/view`
- `POST /api/listings` (landlord), `PATCH /api/listings/:id` (landlord, own), `DELETE /api/listings/:id` (landlord, own)
- `GET /api/landlord/listings` (landlord, own, any status)
- `GET /api/admin/listings`, `PATCH /api/admin/listings/:id/approve`, `/reject`, `POST /api/admin/listings/bulk-approve`, `PATCH /api/admin/listings/:id`, `DELETE /api/admin/listings/:id`
- `POST /api/uploads/images`, `POST /api/uploads/documents` (landlord, multipart)

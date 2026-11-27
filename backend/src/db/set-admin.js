// Set (or create) the admin account's password in the database at DATABASE_URL.
//
//   cd backend && npm run admin:set
//
// Interactive on purpose: the password is typed in your own terminal (hidden), never passed
// on the command line or stored in a file. Lists existing admin emails first, so you can see
// which account the live database actually has.
require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const { eq } = require('drizzle-orm');
const { db, pool } = require('./client');
const { users } = require('./schema');

function ask(question, { hidden = false } = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    rl._writeToOutput = (text) => {
      // Echo the prompt itself, mask everything typed after it.
      if (text.includes(question)) rl.output.write(text);
      else rl.output.write('*'.repeat(text.length ? 1 : 0));
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    })
  );
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in backend/.env — cannot reach the database.');
    process.exit(1);
  }

  const admins = await db.select({ email: users.email }).from(users).where(eq(users.role, 'admin'));
  console.log(admins.length ? `Admin accounts in this database: ${admins.map((a) => a.email).join(', ')}` : 'No admin account exists in this database yet.');

  const defaultEmail = admins[0]?.email || 'admin@propertywarehouse.ng';
  const email = (await ask(`Admin email [${defaultEmail}]: `)) || defaultEmail;
  const password = await ask('New admin password (min 10 characters, hidden): ', { hidden: true });
  if (password.length < 10) {
    console.error('Password too short — nothing changed.');
    process.exit(1);
  }
  const confirm = await ask('Type it again: ', { hidden: true });
  if (confirm !== password) {
    console.error('Passwords did not match — nothing changed.');
    process.exit(1);
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const now = new Date();
  const [existing] = await db.select().from(users).where(eq(users.email, email));

  if (existing && existing.role !== 'admin') {
    console.error(`${email} belongs to a ${existing.role} account — refusing to turn it into an admin. Nothing changed.`);
    process.exit(1);
  }
  if (existing) {
    await db.update(users).set({ passwordHash, updatedAt: now }).where(eq(users.id, existing.id));
    console.log(`Password updated for admin ${email}.`);
  } else {
    await db.insert(users).values({
      id: crypto.randomUUID(),
      role: 'admin',
      firstName: 'Technology',
      lastName: 'Integration Group',
      email,
      passwordHash,
      isVerified: false,
      joinedDate: now,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Created admin ${email}.`);
  }
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

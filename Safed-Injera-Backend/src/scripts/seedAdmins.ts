import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import logger from '../utils/logger';

// Explicitly set the path to .env for reliability
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL || typeof process.env.DATABASE_URL !== 'string') {
  console.error('DATABASE_URL is not set or not a string!');
  process.exit(1);
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const admins = [
  { username: 'huziadmin', email: 'huziadmin@gmail.com' },
  { username: 'seadadmin', email: 'seadadmin@gmail.com' },
  { username: 'faysaladmin', email: 'faysaladmin@gmai.com' },
];

const password = 'admin123';

const ensureTables = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);
};

const seedAdmins = async () => {
  try {
    await ensureTables();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    for (const admin of admins) {
      const id = randomUUID();
      await pool.query(
        `INSERT INTO users (id, username, email, password, role)
         VALUES ($1, $2, $3, $4, 'admin')
         ON CONFLICT (username) DO NOTHING`,
        [id, admin.username, admin.email, hashedPassword]
      );
      logger.info(`Seeded admin: ${admin.username} (${admin.email})`);
    }
    logger.info('All admins seeded.');
    await pool.end();
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding admins:', error);
    process.exit(1);
  }
};

seedAdmins();
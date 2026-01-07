import dotenv from 'dotenv';
import { Pool } from 'pg';
import logger from '../utils/logger';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  logger.error('PostgreSQL connection error: DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString });

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS stocks (
    id BIGSERIAL PRIMARY KEY,
    product_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'pieces',
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL DEFAULT 'Injera',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    business_type TEXT NOT NULL,
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    total_price NUMERIC(12,2),
    order_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,
];

const ensureSchema = async (): Promise<void> => {
  try {
    logger.info('Ensuring database schema exists...');
    for (let i = 0; i < schemaStatements.length; i++) {
      const statement = schemaStatements[i];
      try {
        await pool.query(statement);
        const tableNames = ['users', 'stocks', 'orders'];
        if (i < tableNames.length) {
          logger.info(`✓ Table '${tableNames[i]}' ensured`);
        }
      } catch (error: any) {
        logger.error(`Error creating table ${i + 1}:`, error.message);
        throw error;
      }
    }
    logger.info('Database schema verified successfully');
  } catch (error) {
    logger.error('Schema creation failed:', error);
    throw error;
  }
};

const connectDB = async (): Promise<void> => {
  try {
    logger.info('Connecting to PostgreSQL database...');
    const client = await pool.connect();
    const version = await client.query('SELECT version()');
    logger.info('PostgreSQL connection established');
    logger.info(`PostgreSQL version: ${version.rows[0].version.split(' ')[0]} ${version.rows[0].version.split(' ')[1]}`);
    client.release();
    
    await ensureSchema();
    logger.info('Database initialization complete');
  } catch (error: any) {
    logger.error('PostgreSQL connection error:', error.message || error);
    logger.error('Failed to connect to database. Please check your DATABASE_URL environment variable.');
    process.exit(1);
  }
};

export { pool };
export default connectDB;



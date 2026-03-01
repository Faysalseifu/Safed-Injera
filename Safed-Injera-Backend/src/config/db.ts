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
    minimum_threshold INTEGER DEFAULT 0,
    is_low_stock BOOLEAN GENERATED ALWAYS AS (quantity < minimum_threshold) STORED,
    last_restocked_by UUID REFERENCES users(id),
    last_restocked_at TIMESTAMPTZ,
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
    updated_by UUID REFERENCES users(id),
    status_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS stock_transactions (
    id BIGSERIAL PRIMARY KEY,
    stock_id BIGINT NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'initial')),
    quantity_change INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    performed_by UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id BIGINT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS stock_settings (
    id BIGSERIAL PRIMARY KEY,
    category TEXT NOT NULL UNIQUE,
    minimum_threshold INTEGER NOT NULL CHECK (minimum_threshold >= 0),
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    is_main_hub BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_branch_id UUID REFERENCES branches(id),
    to_branch_id UUID REFERENCES branches(id),
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_transit', 'received', 'cancelled')),
    dispatched_by UUID REFERENCES users(id),
    dispatched_at TIMESTAMPTZ,
    received_by UUID REFERENCES users(id),
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    delivery_frequency TEXT NOT NULL CHECK (delivery_frequency IN ('daily', 'every_2_days', 'every_3_days', 'weekly', 'biweekly')),
    quantity_per_delivery INTEGER NOT NULL CHECK (quantity_per_delivery > 0),
    product TEXT NOT NULL DEFAULT 'Injera',
    branch_id UUID REFERENCES branches(id) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id) NOT NULL,
    report_date DATE NOT NULL,
    received_injera INTEGER NOT NULL DEFAULT 0,
    sold_injera INTEGER NOT NULL CHECK (sold_injera >= 0),
    remaining_injera INTEGER NOT NULL CHECK (remaining_injera >= 0),
    wasted_injera INTEGER NOT NULL DEFAULT 0 CHECK (wasted_injera >= 0),
    total_revenue NUMERIC(12,2) NOT NULL CHECK (total_revenue >= 0),
    submitted_by UUID REFERENCES users(id) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(branch_id, report_date)
  );`,
  `CREATE TABLE IF NOT EXISTS customer_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    delivered BOOLEAN NOT NULL,
    quantity_delivered INTEGER NOT NULL CHECK (quantity_delivered >= 0),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,
];

const ensureSchema = async (): Promise<void> => {
  try {
    logger.info('Ensuring database schema exists...');
    
    // Create tables
    for (let i = 0; i < schemaStatements.length; i++) {
      const statement = schemaStatements[i];
      try {
        await pool.query(statement);
        const tableNames = ['users', 'stocks', 'orders', 'stock_transactions', 'activity_logs', 'stock_settings', 'branches', 'stock_transfers', 'customers', 'daily_reports', 'customer_checklists'];
        if (i < tableNames.length) {
          logger.info(`✓ Table '${tableNames[i]}' ensured`);
        }
      } catch (error: any) {
        logger.error(`Error creating table ${i + 1}:`, error.message);
        throw error;
      }
    }
    
    // Add new columns to existing tables if they don't exist
    const migrationStatements = [
      // Add columns to stocks table
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stocks' AND column_name='minimum_threshold') THEN
          ALTER TABLE stocks ADD COLUMN minimum_threshold INTEGER DEFAULT 0;
        END IF;
      END $$;`,
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stocks' AND column_name='is_low_stock') THEN
          ALTER TABLE stocks ADD COLUMN is_low_stock BOOLEAN GENERATED ALWAYS AS (quantity < COALESCE(minimum_threshold, 0)) STORED;
        END IF;
      END $$;`,
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stocks' AND column_name='last_restocked_by') THEN
          ALTER TABLE stocks ADD COLUMN last_restocked_by UUID REFERENCES users(id);
        END IF;
      END $$;`,
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stocks' AND column_name='last_restocked_at') THEN
          ALTER TABLE stocks ADD COLUMN last_restocked_at TIMESTAMPTZ;
        END IF;
      END $$;`,
      // Add columns to orders table
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='updated_by') THEN
          ALTER TABLE orders ADD COLUMN updated_by UUID REFERENCES users(id);
        END IF;
      END $$;`,
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='status_history') THEN
          ALTER TABLE orders ADD COLUMN status_history JSONB DEFAULT '[]'::jsonb;
        END IF;
      END $$;`,
      // Add branch_id to users
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='branch_id') THEN
          ALTER TABLE users ADD COLUMN branch_id UUID REFERENCES branches(id);
        END IF;
      END $$;`,
      // Add branch_id to stocks
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stocks' AND column_name='branch_id') THEN
          ALTER TABLE stocks ADD COLUMN branch_id UUID REFERENCES branches(id);
        END IF;
      END $$;`,
      // Add transfer_id to stock_transactions
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stock_transactions' AND column_name='transfer_id') THEN
          ALTER TABLE stock_transactions ADD COLUMN transfer_id UUID REFERENCES stock_transfers(id);
        END IF;
      END $$;`,
    ];
    
    for (const statement of migrationStatements) {
      try {
        await pool.query(statement);
      } catch (error: any) {
        logger.warn(`Migration statement warning:`, error.message);
      }
    }
    
    // Create indexes for better performance
    const indexStatements = [
      `CREATE INDEX IF NOT EXISTS idx_stock_transactions_stock_id ON stock_transactions(stock_id);`,
      `CREATE INDEX IF NOT EXISTS idx_stock_transactions_performed_by ON stock_transactions(performed_by);`,
      `CREATE INDEX IF NOT EXISTS idx_stock_transactions_created_at ON stock_transactions(created_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_stocks_is_low_stock ON stocks(is_low_stock) WHERE is_low_stock = true;`,
      `CREATE INDEX IF NOT EXISTS idx_orders_updated_by ON orders(updated_by);`,
      `CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON customers(branch_id);`,
      `CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active) WHERE is_active = true;`,
      `CREATE INDEX IF NOT EXISTS idx_daily_reports_branch_id ON daily_reports(branch_id);`,
      `CREATE INDEX IF NOT EXISTS idx_daily_reports_report_date ON daily_reports(report_date DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_daily_reports_branch_date ON daily_reports(branch_id, report_date DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_customer_checklists_report_id ON customer_checklists(report_id);`,
      `CREATE INDEX IF NOT EXISTS idx_customer_checklists_customer_id ON customer_checklists(customer_id);`,
    ];
    
    for (const statement of indexStatements) {
      try {
        await pool.query(statement);
      } catch (error: any) {
        logger.warn(`Index creation warning:`, error.message);
      }
    }
    
    // Insert default stock settings if they don't exist
    const defaultSettings = [
      { category: 'Injera', threshold: 200 },
      { category: 'Teff Flour', threshold: 100 },
      { category: 'Pure Teff', threshold: 50 },
      { category: 'Packaging', threshold: 500 },
      { category: 'Other', threshold: 50 },
    ];
    
    for (const setting of defaultSettings) {
      try {
        await pool.query(
          `INSERT INTO stock_settings (category, minimum_threshold)
           VALUES ($1, $2)
           ON CONFLICT (category) DO NOTHING`,
          [setting.category, setting.threshold]
        );
      } catch (error: any) {
        logger.warn(`Default setting insertion warning:`, error.message);
      }
    }

    // Seed default Main Hub branch if none exists
    try {
      const { rows } = await pool.query(`SELECT id FROM branches WHERE is_main_hub = true LIMIT 1`);
      if (rows.length === 0) {
        await pool.query(
          `INSERT INTO branches (name, location, is_main_hub)
           VALUES ('Main Hub', 'Addis Ababa', true)`
        );
        logger.info('Default Main Hub branch seeded');
      }
    } catch (error: any) {
      logger.warn('Main Hub seed warning:', error.message);
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



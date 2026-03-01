import { PoolClient } from 'pg';
import { pool } from '../config/db';

/**
 * Execute a function within a database transaction.
 * On success: COMMIT and return the result.
 * On error: ROLLBACK and rethrow.
 */
export const withTransaction = async <T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

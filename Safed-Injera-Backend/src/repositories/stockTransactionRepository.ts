import { PoolClient } from 'pg';
import { pool } from '../config/db';

export interface StockTransactionRecord {
  id: number;
  stock_id: number;
  transaction_type: 'in' | 'out' | 'adjustment' | 'initial';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  performed_by: string | null;
  reason: string | null;
  created_at: Date;
}

export interface CreateStockTransactionInput {
  stock_id: number;
  transaction_type: 'in' | 'out' | 'adjustment' | 'initial';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  performed_by?: string;
  reason?: string;
}

export const createStockTransaction = async (
  transaction: CreateStockTransactionInput,
  client?: PoolClient
): Promise<StockTransactionRecord> => {
  const db = client ?? pool;
  const { rows } = await db.query<StockTransactionRecord>(
    `INSERT INTO stock_transactions
     (stock_id, transaction_type, quantity_change, quantity_before, quantity_after, performed_by, reason)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      transaction.stock_id,
      transaction.transaction_type,
      transaction.quantity_change,
      transaction.quantity_before,
      transaction.quantity_after,
      transaction.performed_by ?? null,
      transaction.reason ?? null,
    ]
  );
  return rows[0];
};

export const getStockTransactions = async (
  stockId: number,
  limit: number = 50
): Promise<StockTransactionRecord[]> => {
  const { rows } = await pool.query<StockTransactionRecord>(
    `SELECT st.*, u.username as performed_by_username
     FROM stock_transactions st
     LEFT JOIN users u ON st.performed_by = u.id
     WHERE st.stock_id = $1
     ORDER BY st.created_at DESC
     LIMIT $2`,
    [stockId, limit]
  );
  return rows;
};

export const getStockTransactionsByUser = async (
  userId: string,
  limit: number = 50
): Promise<StockTransactionRecord[]> => {
  const { rows } = await pool.query<StockTransactionRecord>(
    `SELECT st.*, s.product_name
     FROM stock_transactions st
     JOIN stocks s ON st.stock_id = s.id
     WHERE st.performed_by = $1
     ORDER BY st.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
};

export const getBranchDailyOutQuantity = async (
  branchId: string,
  date: Date
): Promise<number> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { rows } = await pool.query<{ total: number }>(
    `SELECT COALESCE(SUM(ABS(st.quantity_change)), 0)::int AS total
     FROM stock_transactions st
     JOIN stocks s ON st.stock_id = s.id
     WHERE s.branch_id = $1
       AND st.transaction_type = 'out'
       AND st.created_at >= $2 AND st.created_at <= $3`,
    [branchId, startOfDay, endOfDay]
  );
  return Number(rows[0]?.total ?? 0);
};

import { PoolClient } from 'pg';
import { pool } from '../config/db';

export interface StockTransferRecord {
  id: string;
  from_branch_id: string | null;
  to_branch_id: string | null;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'in_transit' | 'received' | 'cancelled';
  dispatched_by: string | null;
  dispatched_at: Date | null;
  received_by: string | null;
  received_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStockTransferInput {
  from_branch_id: string;
  to_branch_id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  dispatched_by?: string;
}

export const createStockTransfer = async (
  input: CreateStockTransferInput,
  client?: PoolClient
): Promise<StockTransferRecord> => {
  const db = client ?? pool;
  const { rows } = await db.query<StockTransferRecord>(
    `INSERT INTO stock_transfers
     (from_branch_id, to_branch_id, product_name, category, quantity, unit, status, dispatched_by, dispatched_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'in_transit', $7, now())
     RETURNING *`,
    [
      input.from_branch_id,
      input.to_branch_id,
      input.product_name,
      input.category,
      input.quantity,
      input.unit,
      input.dispatched_by ?? null,
    ]
  );
  return rows[0];
};

export const getStockTransferById = async (
  id: string,
  client?: PoolClient
): Promise<StockTransferRecord | null> => {
  const db = client ?? pool;
  const { rows } = await db.query<StockTransferRecord>(
    `SELECT * FROM stock_transfers WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
};

export const getPendingTransfersForBranch = async (
  toBranchId: string
): Promise<StockTransferRecord[]> => {
  const { rows } = await pool.query<StockTransferRecord>(
    `SELECT * FROM stock_transfers
     WHERE to_branch_id = $1 AND status IN ('pending', 'in_transit')
     ORDER BY created_at DESC`,
    [toBranchId]
  );
  return rows;
};

export const getReceivedTransfersForBranchOnDate = async (
  toBranchId: string,
  date: Date
): Promise<StockTransferRecord[]> => {
  const dateStr = date.toISOString().split('T')[0];
  const { rows } = await pool.query<StockTransferRecord>(
    `SELECT * FROM stock_transfers
     WHERE to_branch_id = $1
       AND status = 'received'
       AND received_at::date = $2::date
     ORDER BY received_at DESC`,
    [toBranchId, dateStr]
  );
  return rows;
};

export const updateStockTransferStatus = async (
  id: string,
  status: 'received' | 'cancelled',
  receivedBy?: string,
  client?: PoolClient
): Promise<StockTransferRecord | null> => {
  const db = client ?? pool;
  const updates =
    status === 'received'
      ? `status = 'received', received_by = $2, received_at = now(), updated_at = now()`
      : `status = 'cancelled', updated_at = now()`;
  const values = status === 'received' ? [id, receivedBy ?? null] : [id];
  const { rows } = await db.query<StockTransferRecord>(
    `UPDATE stock_transfers SET ${updates} WHERE id = $1 RETURNING *`,
    values
  );
  return rows[0] ?? null;
};

export const getDispatchedQuantityFromBranchSince = async (
  fromBranchId: string,
  since: Date
): Promise<number> => {
  const { rows } = await pool.query<{ total: number }>(
    `SELECT COALESCE(SUM(quantity), 0)::int AS total
     FROM stock_transfers
     WHERE from_branch_id = $1
       AND status IN ('in_transit', 'received')
       AND dispatched_at >= $2`,
    [fromBranchId, since]
  );
  return Number(rows[0]?.total ?? 0);
};

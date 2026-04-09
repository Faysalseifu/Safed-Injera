import { PoolClient } from 'pg';
import { pool } from '../config/db';

export type DebtStatus = 'open' | 'partial' | 'paid';

export interface DebtRecord {
  id: number;
  customer_name: string;
  phone: string | null;
  reason: string | null;
  original_amount: any;
  expected_repayment_date: string | null;
  status: DebtStatus;
  created_by: string | null;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface DebtWithTotalsRecord extends DebtRecord {
  paid_amount: any;
  remaining_amount: any;
}

export interface DebtListFilters {
  statuses?: DebtStatus[];
  limit?: number;
  offset?: number;
}

export interface CreateDebtInput {
  customer_name: string;
  phone?: string;
  reason?: string;
  original_amount: number;
  expected_repayment_date?: string;
  created_by?: string;
}

export interface UpdateDebtInput {
  customer_name?: string;
  phone?: string;
  reason?: string;
  expected_repayment_date?: string;
}

export const listDebts = async (
  filters: DebtListFilters = {}
): Promise<{ rows: DebtWithTotalsRecord[]; total: number }> => {
  const { statuses, limit = 50, offset = 0 } = filters;

  const conditions: string[] = [];
  const values: any[] = [];

  if (statuses && statuses.length) {
    values.push(statuses);
    conditions.push(`d.status = ANY($${values.length}::text[])`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: countRows } = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM debts d ${whereClause}`,
    values
  );
  const total = countRows[0]?.total ?? 0;

  const pagValues = [...values];
  const baseLen = values.length;
  pagValues.push(limit);
  pagValues.push(offset);

  const { rows } = await pool.query<DebtWithTotalsRecord>(
    `SELECT
       d.*,
       COALESCE(SUM(p.amount), 0) AS paid_amount,
       GREATEST(d.original_amount - COALESCE(SUM(p.amount), 0), 0) AS remaining_amount
     FROM debts d
     LEFT JOIN debt_payments p ON p.debt_id = d.id
     ${whereClause}
     GROUP BY d.id
     ORDER BY d.created_at DESC
     LIMIT $${baseLen + 1} OFFSET $${baseLen + 2}`,
    pagValues
  );

  return { rows, total };
};

export const getDebtById = async (id: number): Promise<DebtWithTotalsRecord | null> => {
  const { rows } = await pool.query<DebtWithTotalsRecord>(
    `SELECT
       d.*,
       COALESCE(SUM(p.amount), 0) AS paid_amount,
       GREATEST(d.original_amount - COALESCE(SUM(p.amount), 0), 0) AS remaining_amount
     FROM debts d
     LEFT JOIN debt_payments p ON p.debt_id = d.id
     WHERE d.id = $1
     GROUP BY d.id
     LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
};

export const createDebt = async (
  input: CreateDebtInput,
  client?: PoolClient
): Promise<DebtRecord> => {
  const db = client ?? pool;
  const { rows } = await db.query<DebtRecord>(
    `INSERT INTO debts
     (customer_name, phone, reason, original_amount, expected_repayment_date, status, created_by)
     VALUES ($1, $2, $3, $4, $5, 'open', $6)
     RETURNING *`,
    [
      input.customer_name,
      input.phone ?? null,
      input.reason ?? null,
      input.original_amount,
      input.expected_repayment_date ?? null,
      input.created_by ?? null,
    ]
  );
  return rows[0];
};

export const updateDebt = async (
  id: number,
  updates: UpdateDebtInput,
  client?: PoolClient
): Promise<DebtRecord | null> => {
  const db = client ?? pool;

  const setClauses: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      values.push(value);
      setClauses.push(`${key} = $${values.length}`);
    }
  });

  if (!setClauses.length) {
    const { rows } = await db.query<DebtRecord>(`SELECT * FROM debts WHERE id = $1 LIMIT 1`, [id]);
    return rows[0] ?? null;
  }

  setClauses.push('updated_at = now()');
  values.push(id);

  const { rows } = await db.query<DebtRecord>(
    `UPDATE debts SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );

  return rows[0] ?? null;
};

export const updateDebtStatus = async (
  id: number,
  status: DebtStatus,
  closedAt: Date | null,
  client?: PoolClient
): Promise<DebtRecord | null> => {
  const db = client ?? pool;
  const { rows } = await db.query<DebtRecord>(
    `UPDATE debts
     SET status = $1,
         closed_at = $2,
         updated_at = now()
     WHERE id = $3
     RETURNING *`,
    [status, closedAt, id]
  );

  return rows[0] ?? null;
};

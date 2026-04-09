import { PoolClient } from 'pg';
import { pool } from '../config/db';

export interface DebtPaymentRecord {
  id: number;
  debt_id: number;
  amount: any;
  payment_date: string;
  note: string | null;
  recorded_by: string | null;
  created_at: Date;
}

export interface CreateDebtPaymentInput {
  debt_id: number;
  amount: number;
  payment_date?: string;
  note?: string;
  recorded_by?: string;
}

export const listPaymentsByDebt = async (debtId: number): Promise<DebtPaymentRecord[]> => {
  const { rows } = await pool.query<DebtPaymentRecord>(
    `SELECT * FROM debt_payments WHERE debt_id = $1 ORDER BY created_at DESC`,
    [debtId]
  );
  return rows;
};

export const createDebtPayment = async (
  input: CreateDebtPaymentInput,
  client?: PoolClient
): Promise<DebtPaymentRecord> => {
  const db = client ?? pool;
  const { rows } = await db.query<DebtPaymentRecord>(
    `INSERT INTO debt_payments
     (debt_id, amount, payment_date, note, recorded_by)
     VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE), $4, $5)
     RETURNING *`,
    [
      input.debt_id,
      input.amount,
      input.payment_date ?? null,
      input.note ?? null,
      input.recorded_by ?? null,
    ]
  );
  return rows[0];
};

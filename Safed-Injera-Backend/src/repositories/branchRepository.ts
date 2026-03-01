import { pool } from '../config/db';

export interface BranchRecord {
  id: string;
  name: string;
  location: string;
  is_main_hub: boolean;
  created_at: Date;
  updated_at: Date;
}

export const getAllBranches = async (): Promise<BranchRecord[]> => {
  const { rows } = await pool.query<BranchRecord>(
    `SELECT * FROM branches ORDER BY is_main_hub DESC, name ASC`
  );
  return rows;
};

export const getBranchById = async (id: string): Promise<BranchRecord | null> => {
  const { rows } = await pool.query<BranchRecord>(
    `SELECT * FROM branches WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
};

export const getMainHubBranch = async (): Promise<BranchRecord | null> => {
  const { rows } = await pool.query<BranchRecord>(
    `SELECT * FROM branches WHERE is_main_hub = true LIMIT 1`
  );
  return rows[0] ?? null;
};

export const getBranchesExcludingMainHub = async (): Promise<BranchRecord[]> => {
  const { rows } = await pool.query<BranchRecord>(
    `SELECT * FROM branches WHERE is_main_hub = false ORDER BY name ASC`
  );
  return rows;
};

export interface CreateBranchInput {
  name: string;
  location: string;
  is_main_hub?: boolean;
}

export const createBranch = async (input: CreateBranchInput): Promise<BranchRecord> => {
  const { rows } = await pool.query<BranchRecord>(
    `INSERT INTO branches (name, location, is_main_hub)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.name, input.location, input.is_main_hub ?? false]
  );
  return rows[0];
};

export interface BranchStatistics {
  branch_id: string;
  branch_name: string;
  location: string;
  total_stock: number;
  low_stock_count: number;
  total_value: number;
  last_restocked_at: Date | null;
  pending_transfers_count: number;
}

export const getBranchStatistics = async (branchId: string): Promise<BranchStatistics | null> => {
  const { rows } = await pool.query<BranchStatistics>(
    `SELECT 
      b.id as branch_id,
      b.name as branch_name,
      b.location,
      COALESCE(SUM(s.quantity), 0)::int as total_stock,
      COUNT(CASE WHEN s.is_low_stock = true THEN 1 END)::int as low_stock_count,
      COALESCE(SUM(s.quantity * s.price), 0)::numeric(12,2) as total_value,
      MAX(s.last_restocked_at) as last_restocked_at,
      COUNT(CASE WHEN st.status IN ('pending', 'in_transit') AND st.to_branch_id = b.id THEN 1 END)::int as pending_transfers_count
    FROM branches b
    LEFT JOIN stocks s ON s.branch_id = b.id AND s.is_active = true
    LEFT JOIN stock_transfers st ON st.to_branch_id = b.id
    WHERE b.id = $1
    GROUP BY b.id, b.name, b.location`,
    [branchId]
  );
  return rows[0] ?? null;
};

export const getAllBranchesWithStatistics = async (): Promise<BranchStatistics[]> => {
  const { rows } = await pool.query<BranchStatistics>(
    `SELECT 
      b.id as branch_id,
      b.name as branch_name,
      b.location,
      COALESCE(SUM(s.quantity), 0)::int as total_stock,
      COUNT(CASE WHEN s.is_low_stock = true THEN 1 END)::int as low_stock_count,
      COALESCE(SUM(s.quantity * s.price), 0)::numeric(12,2) as total_value,
      MAX(s.last_restocked_at) as last_restocked_at,
      COUNT(CASE WHEN st.status IN ('pending', 'in_transit') AND st.to_branch_id = b.id THEN 1 END)::int as pending_transfers_count
    FROM branches b
    LEFT JOIN stocks s ON s.branch_id = b.id AND s.is_active = true
    LEFT JOIN stock_transfers st ON st.to_branch_id = b.id
    WHERE b.is_main_hub = false
    GROUP BY b.id, b.name, b.location
    ORDER BY b.name ASC`
  );
  return rows;
};

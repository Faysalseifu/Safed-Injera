import { PoolClient } from 'pg';
import { pool } from '../config/db';

export interface StockRecord {
  id: number;
  product_name: string;
  description: string | null;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  is_active: boolean;
  branch_id: string | null;
  minimum_threshold: number;
  last_updated: Date;
  created_at: Date;
  updated_at: Date;
}

export interface StockFilters {
  category?: string;
  isActive?: boolean;
  isLowStock?: boolean;
  branchId?: string | null;
  sortBy?: 'price' | 'created_at';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export const getStocks = async (
  filters: StockFilters = {}
): Promise<{ rows: StockRecord[]; total: number }> => {
  const { category, isActive, isLowStock, branchId, sortBy, sortOrder, limit, offset } = filters;
  const conditions: string[] = [];
  const values: (string | boolean | number)[] = [];

  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  if (typeof isActive === 'boolean') {
    values.push(isActive);
    conditions.push(`is_active = $${values.length}`);
  }

  if (typeof isLowStock === 'boolean' && isLowStock) {
    conditions.push('is_low_stock = true');
  }

  if (branchId !== undefined) {
    if (branchId === null) {
      conditions.push('branch_id IS NULL');
    } else {
      values.push(branchId);
      conditions.push(`branch_id = $${values.length}`);
    }
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = sortBy
    ? `ORDER BY ${sortBy === 'price' ? 'price' : 'created_at'} ${sortOrder ?? 'DESC'}`
    : 'ORDER BY created_at DESC';

  const { rows: countRows } = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM stocks ${whereClause}`,
    values
  );
  const total = countRows[0]?.total ?? 0;

  const pagValues = [...values];
  let paginationClause = '';
  if (limit !== undefined && offset !== undefined) {
    const baseLen = values.length;
    pagValues.push(limit);
    pagValues.push(offset);
    paginationClause = `LIMIT $${baseLen + 1} OFFSET $${baseLen + 2}`;
  }

  const { rows } = await pool.query<StockRecord>(
    `SELECT * FROM stocks ${whereClause} ${orderClause} ${paginationClause}`,
    pagValues
  );

  return { rows, total };
};

export const getLowStockItems = async (branchId?: string | null): Promise<StockRecord[]> => {
  const conditions = ['is_low_stock = true', 'is_active = true'];
  const values: (string | null)[] = [];
  if (branchId !== undefined) {
    if (branchId === null) {
      conditions.push('branch_id IS NULL');
    } else {
      values.push(branchId);
      conditions.push(`branch_id = $${values.length}`);
    }
  }
  const whereClause = conditions.join(' AND ');
  const { rows } = await pool.query<StockRecord>(
    `SELECT * FROM stocks WHERE ${whereClause} ORDER BY quantity ASC`,
    values
  );
  return rows;
};

export const findStockById = async (
  id: number,
  client?: PoolClient
): Promise<StockRecord | null> => {
  const db = client ?? pool;
  const { rows } = await db.query<StockRecord>(
    `SELECT * FROM stocks WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
};

export const findStockByName = async (
  productName: string,
  client?: PoolClient
): Promise<StockRecord | null> => {
  const db = client ?? pool;
  
  // Exact match
  let { rows } = await db.query<StockRecord>(
    `SELECT * FROM stocks WHERE product_name = $1 LIMIT 1`,
    [productName]
  );
  
  if (rows.length === 0) {
    // Fuzzy match (split by words and find something similar like "Mixed Injera" vs "Mixed Grain Injera")
    const shortName = productName.replace(/(Grain|Injera|Pure|Premium|\s)/gi, '').trim() || productName.split(' ')[0];
    const fuzzySearch = await db.query<StockRecord>(
      `SELECT * FROM stocks WHERE product_name ILIKE $1 LIMIT 1`,
      [`%${shortName}%`]
    );
    rows = fuzzySearch.rows;
  }
  
  return rows[0] ?? null;
};

export const findStockByProductAndBranch = async (
  productName: string,
  branchId: string | null,
  client?: PoolClient
): Promise<StockRecord | null> => {
  const db = client ?? pool;
  
  let { rows } = await db.query<StockRecord>(
    branchId === null
      ? `SELECT * FROM stocks WHERE product_name = $1 AND branch_id IS NULL LIMIT 1`
      : `SELECT * FROM stocks WHERE product_name = $1 AND branch_id = $2 LIMIT 1`,
    branchId === null ? [productName] : [productName, branchId]
  );
  
  if (rows.length === 0) {
    const shortName = productName.replace(/(Grain|Injera|Pure|Premium|\s)/gi, '').trim() || productName.split(' ')[0];
    const fuzzySearch = await db.query<StockRecord>(
      branchId === null
        ? `SELECT * FROM stocks WHERE product_name ILIKE $1 AND branch_id IS NULL LIMIT 1`
        : `SELECT * FROM stocks WHERE product_name ILIKE $1 AND branch_id = $2 LIMIT 1`,
      branchId === null ? [`%${shortName}%`] : [`%${shortName}%`, branchId]
    );
    rows = fuzzySearch.rows;
  }
  
  return rows[0] ?? null;
};

export interface CreateStockInput {
  product_name: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  is_active: boolean;
  minimum_threshold?: number;
  branch_id?: string | null;
}

export const createStock = async (
  stock: CreateStockInput,
  client?: PoolClient
): Promise<StockRecord> => {
  const db = client ?? pool;
  const { rows } = await db.query<StockRecord>(
    `INSERT INTO stocks
     (product_name, description, quantity, unit, price, category, is_active, minimum_threshold, branch_id, last_updated)
     VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 0), $9, now())
     RETURNING *`,
    [
      stock.product_name,
      stock.description ?? null,
      stock.quantity,
      stock.unit,
      stock.price,
      stock.category,
      stock.is_active,
      stock.minimum_threshold ?? 0,
      stock.branch_id ?? null,
    ]
  );
  return rows[0];
};

export interface UpdateStockInput {
  product_name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  category?: string;
  is_active?: boolean;
}

export const updateStock = async (
  id: number,
  updates: UpdateStockInput
): Promise<StockRecord | null> => {
  const setClauses: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      // Prevent duplicate assignment to last_updated or updated_at
      if (key !== 'last_updated' && key !== 'updated_at') {
        values.push(value);
        setClauses.push(`${key} = $${values.length}`);
      }
    }
  });

  if (setClauses.length === 0) {
    // Only update timestamps if no other fields are updated
    setClauses.push(`last_updated = now()`);
    setClauses.push(`updated_at = now()`);
    values.push(id);
    const setClause = setClauses.join(', ');
    const { rows } = await pool.query<StockRecord>(
      `UPDATE stocks SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return rows[0] ?? null;
  }

  // Always update timestamps
  setClauses.push(`last_updated = now()`);
  setClauses.push(`updated_at = now()`);
  values.push(id);
  const setClause = setClauses.join(', ');

  const { rows } = await pool.query<StockRecord>(
    `UPDATE stocks SET ${setClause} WHERE id = $${values.length} RETURNING *`,
    values
  );

  return rows[0] ?? null;
};

export const deleteStock = async (id: number): Promise<boolean> => {
  const result = await pool.query(`DELETE FROM stocks WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
};

export const adjustStockQuantity = async (
  id: number,
  adjustment: number,
  client?: PoolClient
): Promise<StockRecord | null> => {
  const db = client ?? pool;
  const { rows } = await db.query<StockRecord>(
    `UPDATE stocks
     SET quantity = quantity + $2,
         last_updated = now(),
         updated_at = now()
     WHERE id = $1 AND quantity + $2 >= 0
     RETURNING *`,
    [id, adjustment]
  );

  return rows[0] ?? null;
};

export interface BranchStockSummary {
  total_stock: number;
  total_value: number;
  low_stock_count: number;
  category_breakdown: Array<{
    category: string;
    total_quantity: number;
    total_value: number;
  }>;
}

export const getBranchStockSummary = async (branchId: string): Promise<BranchStockSummary> => {
  const { rows: summaryRows } = await pool.query<{
    total_stock: number;
    total_value: number;
    low_stock_count: number;
  }>(
    `SELECT 
      COALESCE(SUM(quantity), 0)::int as total_stock,
      COALESCE(SUM(quantity * price), 0)::numeric(12,2) as total_value,
      COUNT(CASE WHEN is_low_stock = true THEN 1 END)::int as low_stock_count
    FROM stocks
    WHERE branch_id = $1 AND is_active = true`,
    [branchId]
  );

  const { rows: categoryRows } = await pool.query<{
    category: string;
    total_quantity: number;
    total_value: number;
  }>(
    `SELECT 
      category,
      COALESCE(SUM(quantity), 0)::int as total_quantity,
      COALESCE(SUM(quantity * price), 0)::numeric(12,2) as total_value
    FROM stocks
    WHERE branch_id = $1 AND is_active = true
    GROUP BY category
    ORDER BY total_quantity DESC`,
    [branchId]
  );

  return {
    total_stock: Number(summaryRows[0]?.total_stock ?? 0),
    total_value: Number(summaryRows[0]?.total_value ?? 0),
    low_stock_count: Number(summaryRows[0]?.low_stock_count ?? 0),
    category_breakdown: categoryRows.map((r) => ({
      category: r.category,
      total_quantity: Number(r.total_quantity),
      total_value: Number(r.total_value),
    })),
  };
};

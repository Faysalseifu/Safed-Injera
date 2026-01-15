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
  minimum_threshold: number;
  last_updated: Date;
  created_at: Date;
  updated_at: Date;
}

export interface StockFilters {
  category?: string;
  isActive?: boolean;
  isLowStock?: boolean;
  sortBy?: 'price' | 'created_at';
  sortOrder?: 'ASC' | 'DESC';
}

export const getStocks = async (filters: StockFilters = {}): Promise<StockRecord[]> => {
  const { category, isActive, isLowStock, sortBy, sortOrder } = filters;
  const conditions: string[] = [];
  const values: (string | boolean)[] = [];

  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  if (typeof isActive === 'boolean') {
    values.push(isActive);
    conditions.push(`is_active = $${values.length}`);
  }

  if (isLowStock) {
    conditions.push(`quantity <= minimum_threshold`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = sortBy
    ? `ORDER BY ${sortBy === 'price' ? 'price' : 'created_at'} ${sortOrder ?? 'DESC'}`
    : 'ORDER BY created_at DESC';

  const { rows } = await pool.query<StockRecord>(
    `SELECT * FROM stocks ${whereClause} ${orderClause}`,
    values
  );

  return rows;
};

export const getLowStockItems = async (): Promise<StockRecord[]> => {
  const { rows } = await pool.query<StockRecord>(
    `SELECT * FROM stocks WHERE quantity <= minimum_threshold AND is_active = true ORDER BY quantity ASC`
  );
  return rows;
};

export const findStockById = async (id: number): Promise<StockRecord | null> => {
  const { rows } = await pool.query<StockRecord>(
    `SELECT * FROM stocks WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
};

export const findStockByName = async (productName: string): Promise<StockRecord | null> => {
  const { rows } = await pool.query<StockRecord>(
    `SELECT * FROM stocks WHERE product_name = $1 LIMIT 1`,
    [productName]
  );
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
}

export const createStock = async (stock: CreateStockInput): Promise<StockRecord> => {
  const { rows } = await pool.query<StockRecord>(
    `INSERT INTO stocks
     (product_name, description, quantity, unit, price, category, is_active, minimum_threshold, last_updated)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
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
  adjustment: number
): Promise<StockRecord | null> => {
  const { rows } = await pool.query<StockRecord>(
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

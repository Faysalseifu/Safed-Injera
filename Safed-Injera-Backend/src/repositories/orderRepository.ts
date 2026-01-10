import { pool } from '../config/db';

export interface OrderRecord {
  id: number;
  customer_name: string;
  email: string;
  phone: string | null;
  business_type: string;
  product: string;
  quantity: number;
  message: string | null;
  status: string;
  total_price: number | null;
  order_date: Date;
  notes: string | null;
  updated_by: string | null;
  status_history: any[] | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderQueryOptions {
  status?: string;
  businessType?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
  _start?: number;
  _end?: number;
}

const sortColumnMap: Record<string, string> = {
  orderDate: 'order_date',
  customerName: 'customer_name',
  businessType: 'business_type',
  createdAt: 'created_at',
  product: 'product',
  quantity: 'quantity',
  status: 'status',
};

export const getOrders = async (
  options: OrderQueryOptions = {}
): Promise<{ rows: OrderRecord[]; total: number }> => {
  const { status, businessType, sort, order, _start, _end } = options;
  const filters: string[] = [];
  const values: (string | number)[] = [];

  if (status) {
    values.push(status);
    filters.push(`status = $${values.length}`);
  }

  if (businessType) {
    values.push(businessType);
    filters.push(`business_type = $${values.length}`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const sortColumn = sort ? sortColumnMap[sort] ?? 'order_date' : 'order_date';
  const sortDirection = order || 'DESC';
  const orderClause = `ORDER BY ${sortColumn} ${sortDirection}`;

  let paginationClause = '';
  const paginationValues = [...values];

  if (_start !== undefined && _end !== undefined) {
    const limit = Math.max(_end - _start, 1);
    const limitIndex = paginationValues.length + 1;
    paginationValues.push(limit);
    const offsetIndex = paginationValues.length + 1;
    paginationValues.push(_start);
    paginationClause = `LIMIT $${limitIndex} OFFSET $${offsetIndex}`;
  }

  const { rows } = await pool.query<OrderRecord>(
    `SELECT * FROM orders ${whereClause} ${orderClause} ${paginationClause}`,
    paginationValues
  );

  const { rows: countRows } = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM orders ${whereClause}`,
    values
  );

  return {
    rows,
    total: countRows[0]?.total ?? 0,
  };
};

export const getOrderById = async (id: number): Promise<OrderRecord | null> => {
  const { rows } = await pool.query<OrderRecord>(
    `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
};

export interface CreateOrderInput {
  customer_name: string;
  email: string;
  phone?: string;
  business_type: string;
  product: string;
  quantity: number;
  message?: string;
  total_price?: number;
  status?: string;
  notes?: string;
}

export const createOrder = async (order: CreateOrderInput): Promise<OrderRecord> => {
  const { rows } = await pool.query<OrderRecord>(
    `INSERT INTO orders
     (customer_name, email, phone, business_type, product, quantity, message, status, total_price, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      order.customer_name,
      order.email,
      order.phone ?? null,
      order.business_type,
      order.product,
      order.quantity,
      order.message ?? null,
      order.status ?? 'pending',
      order.total_price ?? null,
      order.notes ?? null,
    ]
  );
  return rows[0];
};

export interface UpdateOrderInput {
  customer_name?: string;
  email?: string;
  phone?: string;
  business_type?: string;
  product?: string;
  quantity?: number;
  message?: string;
  status?: string;
  total_price?: number;
  notes?: string;
  updated_by?: string;
  status_history?: any[];
}

export const updateOrder = async (
  id: number,
  updates: UpdateOrderInput
): Promise<OrderRecord | null> => {
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'status_history') {
        values.push(JSON.stringify(value));
        setClauses.push(`${key} = $${paramIndex++}::jsonb`);
      } else {
        values.push(value);
        setClauses.push(`${key} = $${paramIndex++}`);
      }
    }
  });

  if (setClauses.length === 0) {
    return getOrderById(id);
  }

  values.push(id);
  const setClause = `${setClauses.join(', ')}, updated_at = now()`;

  const { rows } = await pool.query<OrderRecord>(
    `UPDATE orders SET ${setClause} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return rows[0] ?? null;
};

export const deleteOrder = async (id: number): Promise<boolean> => {
  const result = await pool.query(`DELETE FROM orders WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
};

export const countOrders = async (): Promise<number> => {
  const { rows } = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM orders`
  );
  return rows[0]?.total ?? 0;
};

export const countOrdersByStatus = async (status: string): Promise<number> => {
  const { rows } = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM orders WHERE status = $1`,
    [status]
  );
  return rows[0]?.total ?? 0;
};

export const countOrdersSince = async (since: Date): Promise<number> => {
  const { rows } = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM orders WHERE order_date >= $1`,
    [since]
  );
  return rows[0]?.total ?? 0;
};

export const countOrdersSinceWithStatuses = async (
  since: Date,
  statuses: string[]
): Promise<number> => {
  const { rows } = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total
     FROM orders
     WHERE order_date >= $1 AND status = ANY($2)`,
    [since, statuses]
  );
  return rows[0]?.total ?? 0;
};

export const getSalesByProductSince = async (
  since: Date,
  statuses: string[]
): Promise<{
  product: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}[]> => {
  const { rows } = await pool.query(
    `SELECT product,
            SUM(quantity)::int AS total_quantity,
            SUM(total_price)::numeric(12,2) AS total_revenue,
            COUNT(*)::int AS order_count
     FROM orders
     WHERE order_date >= $1 AND status = ANY($2)
     GROUP BY product
     ORDER BY total_quantity DESC`,
    [since, statuses]
  );
  return rows.map(row => ({
    product: row.product,
    total_quantity: Number(row.total_quantity),
    total_revenue: Number(row.total_revenue ?? 0),
    order_count: Number(row.order_count),
  }));
};

export const getDailyBreakdown = async (
  since: Date,
  statuses: string[]
): Promise<{
  period: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}[]> => {
  const { rows } = await pool.query(
    `SELECT to_char(order_date, 'YYYY-MM-DD') AS period,
            SUM(quantity)::int AS total_quantity,
            SUM(total_price)::numeric(12,2) AS total_revenue,
            COUNT(*)::int AS order_count
     FROM orders
     WHERE order_date >= $1 AND status = ANY($2)
     GROUP BY period
     ORDER BY period ASC`,
    [since, statuses]
  );
  return rows.map(row => ({
    period: row.period,
    total_quantity: Number(row.total_quantity),
    total_revenue: Number(row.total_revenue ?? 0),
    order_count: Number(row.order_count),
  }));
};

export const getRevenueSince = async (statuses: string[]): Promise<number> => {
  const { rows } = await pool.query<{ total: number }>(
    `SELECT SUM(total_price)::numeric(12,2) AS total
     FROM orders
     WHERE status = ANY($1) AND total_price IS NOT NULL`,
    [statuses]
  );
  return Number(rows[0]?.total ?? 0);
};

export const getRecentOrders = async (): Promise<Pick<OrderRecord, 'id' | 'customer_name' | 'business_type' | 'quantity' | 'status' | 'order_date'>[]> => {
  const { rows } = await pool.query<Pick<OrderRecord, 'id' | 'customer_name' | 'business_type' | 'quantity' | 'status' | 'order_date'>>(
    `SELECT id, customer_name, business_type, quantity, status, order_date
     FROM orders
     ORDER BY order_date DESC
     LIMIT 5`
  );
  return rows;
};

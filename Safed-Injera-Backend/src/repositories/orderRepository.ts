import { PoolClient } from 'pg';
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
  branch_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderQueryOptions {
  status?: string;
  businessType?: string;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
  _start?: number;
  _end?: number;
  /** Filter orders for this branch (sub_admin) */
  branchId?: string;
  /** Inclusive lower bound on order_date */
  orderDateFrom?: Date;
  /** Inclusive upper bound on order_date (end of day) */
  orderDateTo?: Date;
}

const sortColumnMap: Record<string, string> = {
  id: 'id',
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
  const { status, businessType, search, sort, order, _start, _end, branchId, orderDateFrom, orderDateTo } = options;
  const filters: string[] = [];
  const values: (string | number | Date)[] = [];

  if (status) {
    values.push(status);
    filters.push(`status = $${values.length}`);
  }

  if (businessType) {
    values.push(businessType);
    filters.push(`business_type = $${values.length}`);
  }

  if (search && search.trim()) {
    values.push(`%${search.trim()}%`);
    filters.push(`customer_name ILIKE $${values.length}`);
  }

  if (branchId) {
    values.push(branchId);
    filters.push(`branch_id = $${values.length}`);
  }

  if (orderDateFrom) {
    values.push(orderDateFrom);
    filters.push(`order_date >= $${values.length}`);
  }

  if (orderDateTo) {
    values.push(orderDateTo);
    filters.push(`order_date <= $${values.length}`);
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

export const getOrderById = async (
  id: number,
  client?: PoolClient
): Promise<OrderRecord | null> => {
  const db = client ?? pool;
  const { rows } = await db.query<OrderRecord>(
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
  branch_id?: string | null;
}

export const createOrder = async (
  order: CreateOrderInput,
  client?: PoolClient
): Promise<OrderRecord> => {
  const db = client ?? pool;
  const { rows } = await db.query<OrderRecord>(
    `INSERT INTO orders
     (customer_name, email, phone, business_type, product, quantity, message, status, total_price, notes, branch_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
      order.branch_id ?? null,
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
  branch_id?: string | null;
}

const UPDATE_ORDER_ALLOWED = new Set([
  'customer_name',
  'email',
  'phone',
  'business_type',
  'product',
  'quantity',
  'message',
  'status',
  'total_price',
  'notes',
  'branch_id',
]);

export const updateOrder = async (
  id: number,
  updates: UpdateOrderInput,
  client?: PoolClient
): Promise<OrderRecord | null> => {
  const db = client ?? pool;
  const setClauses: string[] = [];
  const values: (string | number)[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && UPDATE_ORDER_ALLOWED.has(key)) {
      values.push(value as string | number);
      setClauses.push(`${key} = $${values.length}`);
    }
  });

  if (setClauses.length === 0) {
    return getOrderById(id, client);
  }

  const finalValues = [...values, id];
  const setClause = `${setClauses.join(', ')}, updated_at = now()`;

  const { rows } = await db.query<OrderRecord>(
    `UPDATE orders SET ${setClause} WHERE id = $${finalValues.length} RETURNING *`,
    finalValues
  );

  return rows[0] ?? null;
};

export const deleteOrder = async (
  id: number,
  client?: PoolClient
): Promise<boolean> => {
  const db = client ?? pool;
  const result = await db.query(`DELETE FROM orders WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
};

export const countOrders = async (branchId?: string | null): Promise<number> => {
  const where = branchId ? 'WHERE branch_id = $1' : '';
  const params = branchId ? [branchId] : [];
  const { rows } = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM orders ${where}`,
    params
  );
  return rows[0]?.total ?? 0;
};

export const countOrdersByStatus = async (status: string, branchId?: string | null): Promise<number> => {
  if (branchId) {
    const { rows } = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM orders WHERE status = $1 AND branch_id = $2`,
      [status, branchId]
    );
    return rows[0]?.total ?? 0;
  }
  const { rows } = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM orders WHERE status = $1`,
    [status]
  );
  return rows[0]?.total ?? 0;
};

export const countOrdersSince = async (since: Date, branchId?: string | null): Promise<number> => {
  if (branchId) {
    const { rows } = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM orders WHERE order_date >= $1 AND branch_id = $2`,
      [since, branchId]
    );
    return rows[0]?.total ?? 0;
  }
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
  statuses: string[],
  branchId?: string | null
): Promise<{
  product: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}[]> => {
  const params: unknown[] = [since, statuses];
  let branchClause = '';
  if (branchId) {
    branchClause = ' AND branch_id = $3';
    params.push(branchId);
  }
  const { rows } = await pool.query(
    `SELECT product,
            SUM(quantity)::int AS total_quantity,
            SUM(total_price)::numeric(12,2) AS total_revenue,
            COUNT(*)::int AS order_count
     FROM orders
     WHERE order_date >= $1 AND status = ANY($2)${branchClause}
     GROUP BY product
     ORDER BY total_quantity DESC`,
    params
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
  statuses: string[],
  branchId?: string | null
): Promise<{
  period: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}[]> => {
  const params: unknown[] = [since, statuses];
  let branchClause = '';
  if (branchId) {
    branchClause = ' AND branch_id = $3';
    params.push(branchId);
  }
  const { rows } = await pool.query(
    `SELECT to_char(order_date, 'YYYY-MM-DD') AS period,
            SUM(quantity)::int AS total_quantity,
            SUM(total_price)::numeric(12,2) AS total_revenue,
            COUNT(*)::int AS order_count
     FROM orders
     WHERE order_date >= $1 AND status = ANY($2)${branchClause}
     GROUP BY period
     ORDER BY period ASC`,
    params
  );
  return rows.map(row => ({
    period: row.period,
    total_quantity: Number(row.total_quantity),
    total_revenue: Number(row.total_revenue ?? 0),
    order_count: Number(row.order_count),
  }));
};

export const getRevenueSince = async (statuses: string[], branchId?: string | null): Promise<number> => {
  const params: unknown[] = [statuses];
  let branchClause = '';
  if (branchId) {
    branchClause = ' AND branch_id = $2';
    params.push(branchId);
  }
  const { rows } = await pool.query<{ total: number }>(
    `SELECT SUM(total_price)::numeric(12,2) AS total
     FROM orders
     WHERE status = ANY($1) AND total_price IS NOT NULL${branchClause}`,
    params
  );
  return Number(rows[0]?.total ?? 0);
};

/** Optional date filter for analytics (inclusive YYYY-MM-DD). Omit or allTime for no date filter. */
export type AnalyticsDateRange = {
  allTime?: boolean;
  from?: string;
  to?: string;
};

function buildAnalyticsWhere(
  branchId: string | null | undefined,
  dateRange?: AnalyticsDateRange
): { where: string; params: unknown[] } {
  const parts: string[] = [];
  const params: unknown[] = [];
  if (branchId) {
    parts.push(`branch_id = $${params.length + 1}`);
    params.push(branchId);
  }
  if (dateRange && !dateRange.allTime && dateRange.from && dateRange.to) {
    parts.push(`order_date::date >= $${params.length + 1}::date`);
    params.push(dateRange.from);
    parts.push(`order_date::date <= $${params.length + 1}::date`);
    params.push(dateRange.to);
  }
  const where = parts.length ? `WHERE ${parts.join(' AND ')}` : '';
  return { where, params };
}

/** Count of orders per status (optionally scoped by branch and date). */
export const getOrderStatusBreakdown = async (
  branchId?: string | null,
  dateRange?: AnalyticsDateRange
): Promise<{ status: string; count: number }[]> => {
  const { where, params } = buildAnalyticsWhere(branchId ?? null, dateRange);
  const { rows } = await pool.query<{ status: string; count: string }>(
    `SELECT status, COUNT(*)::int AS count
     FROM orders
     ${where}
     GROUP BY status
     ORDER BY count DESC`,
    params
  );
  return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
};

/** Top customers by number of orders (ties broken by revenue). */
export const getTopCustomersByOrderCount = async (
  limit: number,
  branchId?: string | null,
  dateRange?: AnalyticsDateRange
): Promise<
  { customer_name: string; email: string; order_count: number; total_revenue: number }[]
> => {
  const lim = Math.min(Math.max(limit, 1), 50);
  const { where, params } = buildAnalyticsWhere(branchId ?? null, dateRange);
  const limitIdx = params.length + 1;
  const { rows } = await pool.query(
    `SELECT customer_name,
            COALESCE(email, '') AS email,
            COUNT(*)::int AS order_count,
            COALESCE(SUM(total_price), 0)::numeric(12,2) AS total_revenue
     FROM orders
     ${where}
     GROUP BY customer_name, email
     ORDER BY order_count DESC, total_revenue DESC
     LIMIT $${limitIdx}`,
    [...params, lim]
  );
  return rows.map((r: any) => ({
    customer_name: r.customer_name,
    email: r.email,
    order_count: Number(r.order_count),
    total_revenue: Number(r.total_revenue ?? 0),
  }));
};

/** Orders grouped by business type. */
export const getBusinessTypeBreakdown = async (
  branchId?: string | null,
  dateRange?: AnalyticsDateRange
): Promise<{ business_type: string; order_count: number }[]> => {
  const { where, params } = buildAnalyticsWhere(branchId ?? null, dateRange);
  const { rows } = await pool.query(
    `SELECT business_type, COUNT(*)::int AS order_count
     FROM orders
     ${where}
     GROUP BY business_type
     ORDER BY order_count DESC`,
    params
  );
  return rows.map((r: any) => ({
    business_type: r.business_type,
    order_count: Number(r.order_count),
  }));
};

/** Sales by product for revenue-eligible statuses with no date filter. */
export const getSalesByProductAllTime = async (
  statuses: string[],
  branchId?: string | null
): Promise<{
  product: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}[]> => {
  const params: unknown[] = [statuses];
  let branchClause = '';
  if (branchId) {
    branchClause = ' AND branch_id = $2';
    params.push(branchId);
  }
  const { rows } = await pool.query(
    `SELECT product,
            SUM(quantity)::int AS total_quantity,
            SUM(total_price)::numeric(12,2) AS total_revenue,
            COUNT(*)::int AS order_count
     FROM orders
     WHERE status = ANY($1)${branchClause}
     GROUP BY product
     ORDER BY total_quantity DESC`,
    params
  );
  return rows.map((row) => ({
    product: row.product,
    total_quantity: Number(row.total_quantity),
    total_revenue: Number(row.total_revenue ?? 0),
    order_count: Number(row.order_count),
  }));
};

/** Sales by product within an inclusive date range (by order_date::date). */
export const getSalesByProductInDateRange = async (
  fromYmd: string,
  toYmd: string,
  statuses: string[],
  branchId?: string | null
): Promise<{
  product: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}[]> => {
  const params: unknown[] = [fromYmd, toYmd, statuses];
  let branchClause = '';
  if (branchId) {
    branchClause = ' AND branch_id = $4';
    params.push(branchId);
  }
  const { rows } = await pool.query(
    `SELECT product,
            SUM(quantity)::int AS total_quantity,
            SUM(total_price)::numeric(12,2) AS total_revenue,
            COUNT(*)::int AS order_count
     FROM orders
     WHERE order_date::date >= $1::date
       AND order_date::date <= $2::date
       AND status = ANY($3)${branchClause}
     GROUP BY product
     ORDER BY total_quantity DESC`,
    params
  );
  return rows.map((row) => ({
    product: row.product,
    total_quantity: Number(row.total_quantity),
    total_revenue: Number(row.total_revenue ?? 0),
    order_count: Number(row.order_count),
  }));
};

/** Daily breakdown within inclusive date range. */
export const getDailyBreakdownInDateRange = async (
  fromYmd: string,
  toYmd: string,
  statuses: string[],
  branchId?: string | null
): Promise<{
  period: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}[]> => {
  const params: unknown[] = [fromYmd, toYmd, statuses];
  let branchClause = '';
  if (branchId) {
    branchClause = ' AND branch_id = $4';
    params.push(branchId);
  }
  const { rows } = await pool.query(
    `SELECT to_char(order_date, 'YYYY-MM-DD') AS period,
            SUM(quantity)::int AS total_quantity,
            SUM(total_price)::numeric(12,2) AS total_revenue,
            COUNT(*)::int AS order_count
     FROM orders
     WHERE order_date::date >= $1::date
       AND order_date::date <= $2::date
       AND status = ANY($3)${branchClause}
     GROUP BY period
     ORDER BY period ASC`,
    params
  );
  return rows.map((row) => ({
    period: row.period,
    total_quantity: Number(row.total_quantity),
    total_revenue: Number(row.total_revenue ?? 0),
    order_count: Number(row.order_count),
  }));
};

export const getRecentOrders = async (
  branchId?: string | null
): Promise<Pick<OrderRecord, 'id' | 'customer_name' | 'business_type' | 'quantity' | 'status' | 'order_date'>[]> => {
  const params: unknown[] = [];
  let branchClause = '';
  if (branchId) {
    branchClause = ' AND branch_id = $1';
    params.push(branchId);
  }
  const { rows } = await pool.query<Pick<OrderRecord, 'id' | 'customer_name' | 'business_type' | 'quantity' | 'status' | 'order_date'>>(
    `SELECT id, customer_name, business_type, quantity, status, order_date
     FROM orders
     WHERE order_date >= NOW() - INTERVAL '3 days'
       AND NOT (status = 'delivered' AND updated_at < NOW() - INTERVAL '1 day')
       ${branchClause}
     ORDER BY order_date DESC
     LIMIT 15`,
    params
  );
  return rows;
};

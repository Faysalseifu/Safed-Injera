import { PoolClient } from 'pg';
import { pool } from '../config/db';

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string | null;
  delivery_frequency: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly' | 'biweekly';
  quantity_per_delivery: number;
  product: string;
  branch_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  delivery_frequency: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly' | 'biweekly';
  quantity_per_delivery: number;
  product?: string;
  branch_id: string;
  is_active?: boolean;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  delivery_frequency?: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly' | 'biweekly';
  quantity_per_delivery?: number;
  product?: string;
  is_active?: boolean;
}

export const getCustomersByBranch = async (branchId: string): Promise<CustomerRecord[]> => {
  const { rows } = await pool.query<CustomerRecord>(
    `SELECT * FROM customers 
     WHERE branch_id = $1 
     ORDER BY name ASC`,
    [branchId]
  );
  return rows;
};

export const getActiveCustomersByBranch = async (branchId: string): Promise<CustomerRecord[]> => {
  const { rows } = await pool.query<CustomerRecord>(
    `SELECT * FROM customers 
     WHERE branch_id = $1 AND is_active = true 
     ORDER BY name ASC`,
    [branchId]
  );
  return rows;
};

export const getCustomerById = async (id: string): Promise<CustomerRecord | null> => {
  const { rows } = await pool.query<CustomerRecord>(
    `SELECT * FROM customers WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
};

export const createCustomer = async (
  input: CreateCustomerInput,
  client?: PoolClient
): Promise<CustomerRecord> => {
  const db = client ?? pool;
  const { rows } = await db.query<CustomerRecord>(
    `INSERT INTO customers 
     (name, phone, delivery_frequency, quantity_per_delivery, product, branch_id, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.name,
      input.phone ?? null,
      input.delivery_frequency,
      input.quantity_per_delivery,
      input.product ?? 'Injera',
      input.branch_id,
      input.is_active ?? true,
    ]
  );
  return rows[0];
};

export const updateCustomer = async (
  id: string,
  updates: UpdateCustomerInput
): Promise<CustomerRecord | null> => {
  const setClauses: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      values.push(value);
      setClauses.push(`${key} = $${values.length}`);
    }
  });

  if (setClauses.length === 0) {
    return await getCustomerById(id);
  }

  setClauses.push(`updated_at = now()`);
  values.push(id);
  const setClause = setClauses.join(', ');

  const { rows } = await pool.query<CustomerRecord>(
    `UPDATE customers SET ${setClause} WHERE id = $${values.length} RETURNING *`,
    values
  );

  return rows[0] ?? null;
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  const result = await pool.query(`DELETE FROM customers WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
};

/**
 * Get customers that are due for delivery on a specific date
 * Based on delivery_frequency and checking last delivery from checklists
 */
export const getDueCustomersForDate = async (
  branchId: string,
  targetDate: Date
): Promise<CustomerRecord[]> => {
  const dateStr = targetDate.toISOString().split('T')[0];
  
  // Get all active customers for the branch
  const customers = await getActiveCustomersByBranch(branchId);
  
  // Get last delivery dates for each customer from checklists
  const { rows: lastDeliveries } = await pool.query<{
    customer_id: string;
    last_delivery_date: Date | null;
  }>(
    `SELECT DISTINCT ON (customer_id) 
      customer_id, 
      dr.report_date as last_delivery_date
    FROM customer_checklists cc
    JOIN daily_reports dr ON cc.report_id = dr.id
    WHERE cc.delivered = true 
      AND dr.branch_id = $1
      AND cc.customer_id = ANY($2::uuid[])
    ORDER BY customer_id, dr.report_date DESC`,
    [branchId, customers.map(c => c.id)]
  );

  const lastDeliveryMap = new Map<string, Date>();
  lastDeliveries.forEach((ld) => {
    if (ld.last_delivery_date) {
      lastDeliveryMap.set(ld.customer_id, ld.last_delivery_date);
    }
  });
  
  // Filter customers based on delivery frequency
  const dueCustomers: CustomerRecord[] = [];
  
  for (const customer of customers) {
    const lastDelivery = lastDeliveryMap.get(customer.id);
    const customerStartDate = lastDelivery || customer.created_at;
    const daysSinceLastDelivery = Math.floor(
      (targetDate.getTime() - customerStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    let isDue = false;
    
    switch (customer.delivery_frequency) {
      case 'daily':
        isDue = true;
        break;
      case 'every_2_days':
        isDue = daysSinceLastDelivery >= 2;
        break;
      case 'every_3_days':
        isDue = daysSinceLastDelivery >= 3;
        break;
      case 'weekly':
        isDue = daysSinceLastDelivery >= 7;
        break;
      case 'biweekly':
        isDue = daysSinceLastDelivery >= 14;
        break;
    }
    
    if (isDue) {
      dueCustomers.push(customer);
    }
  }
  
  return dueCustomers;
};

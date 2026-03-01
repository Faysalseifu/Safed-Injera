import { PoolClient } from 'pg';
import { pool } from '../config/db';

export interface DailyReportRecord {
  id: string;
  branch_id: string;
  report_date: Date;
  received_injera: number;
  sold_injera: number;
  remaining_injera: number;
  wasted_injera: number;
  total_revenue: number;
  submitted_by: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerChecklistRecord {
  id: string;
  report_id: string;
  customer_id: string;
  delivered: boolean;
  quantity_delivered: number;
  comment: string | null;
  created_at: Date;
}

export interface CreateDailyReportInput {
  branch_id: string;
  report_date: Date;
  received_injera: number;
  sold_injera: number;
  remaining_injera: number;
  wasted_injera: number;
  total_revenue: number;
  submitted_by: string;
  notes?: string;
  checklists: Array<{
    customer_id: string;
    delivered: boolean;
    quantity_delivered: number;
    comment?: string;
  }>;
}

export interface DailyReportWithChecklists extends DailyReportRecord {
  checklists: CustomerChecklistRecord[];
}

export const getDailyReportById = async (id: string): Promise<DailyReportRecord | null> => {
  const { rows } = await pool.query<DailyReportRecord>(
    `SELECT * FROM daily_reports WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
};

export const getDailyReportByBranchAndDate = async (
  branchId: string,
  reportDate: Date
): Promise<DailyReportRecord | null> => {
  const dateStr = reportDate.toISOString().split('T')[0];
  const { rows } = await pool.query<DailyReportRecord>(
    `SELECT * FROM daily_reports 
     WHERE branch_id = $1 AND report_date = $2 
     LIMIT 1`,
    [branchId, dateStr]
  );
  return rows[0] ?? null;
};

export const getDailyReportsByBranch = async (
  branchId: string,
  limit: number = 30,
  offset: number = 0
): Promise<DailyReportRecord[]> => {
  const { rows } = await pool.query<DailyReportRecord>(
    `SELECT * FROM daily_reports 
     WHERE branch_id = $1 
     ORDER BY report_date DESC 
     LIMIT $2 OFFSET $3`,
    [branchId, limit, offset]
  );
  return rows;
};

export const getAllDailyReports = async (
  branchId?: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100,
  offset: number = 0
): Promise<DailyReportRecord[]> => {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (branchId) {
    conditions.push(`branch_id = $${paramIndex++}`);
    values.push(branchId);
  }

  if (startDate) {
    conditions.push(`report_date >= $${paramIndex++}`);
    values.push(startDate.toISOString().split('T')[0]);
  }

  if (endDate) {
    conditions.push(`report_date <= $${paramIndex++}`);
    values.push(endDate.toISOString().split('T')[0]);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(limit, offset);

  const { rows } = await pool.query<DailyReportRecord>(
    `SELECT * FROM daily_reports 
     ${whereClause}
     ORDER BY report_date DESC, branch_id ASC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    values
  );

  return rows;
};

export const createDailyReportWithChecklists = async (
  input: CreateDailyReportInput,
  client: PoolClient
): Promise<DailyReportWithChecklists> => {
  const dateStr = input.report_date.toISOString().split('T')[0];

  // Create the daily report
  const { rows: reportRows } = await client.query<DailyReportRecord>(
    `INSERT INTO daily_reports 
     (branch_id, report_date, received_injera, sold_injera, remaining_injera, wasted_injera, total_revenue, submitted_by, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      input.branch_id,
      dateStr,
      input.received_injera,
      input.sold_injera,
      input.remaining_injera,
      input.wasted_injera,
      input.total_revenue,
      input.submitted_by,
      input.notes ?? null,
    ]
  );

  const report = reportRows[0];

  // Create checklists
  const checklists: CustomerChecklistRecord[] = [];
  for (const checklist of input.checklists) {
    const { rows: checklistRows } = await client.query<CustomerChecklistRecord>(
      `INSERT INTO customer_checklists 
       (report_id, customer_id, delivered, quantity_delivered, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        report.id,
        checklist.customer_id,
        checklist.delivered,
        checklist.quantity_delivered,
        checklist.comment ?? null,
      ]
    );
    checklists.push(checklistRows[0]);
  }

  return {
    ...report,
    checklists,
  };
};

export const getDailyReportWithChecklists = async (
  id: string
): Promise<DailyReportWithChecklists | null> => {
  const report = await getDailyReportById(id);
  if (!report) {
    return null;
  }

  const { rows: checklistsWithNames } = await pool.query<
    CustomerChecklistRecord & { customer_name: string }
  >(
    `SELECT cc.*, c.name as customer_name
     FROM customer_checklists cc
     JOIN customers c ON cc.customer_id = c.id
     WHERE cc.report_id = $1
     ORDER BY c.name ASC`,
    [id]
  );

  // Remove customer_name from the result (it's only for ordering)
  const checklists: CustomerChecklistRecord[] = checklistsWithNames.map(({ customer_name, ...checklist }) => checklist);

  return {
    ...report,
    checklists,
  };
};

/**
 * Get aggregated statistics for reports
 */
export interface ReportStatistics {
  totalReports: number;
  totalRevenue: number;
  totalSold: number;
  totalWasted: number;
  averageWasteRate: number;
  averageDailyRevenue: number;
}

export const getReportStatistics = async (
  branchId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<ReportStatistics> => {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (branchId) {
    conditions.push(`branch_id = $${paramIndex++}`);
    values.push(branchId);
  }

  if (startDate) {
    conditions.push(`report_date >= $${paramIndex++}`);
    values.push(startDate.toISOString().split('T')[0]);
  }

  if (endDate) {
    conditions.push(`report_date <= $${paramIndex++}`);
    values.push(endDate.toISOString().split('T')[0]);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query<{
    total_reports: number;
    total_revenue: number;
    total_sold: number;
    total_wasted: number;
    avg_waste_rate: number;
    avg_daily_revenue: number;
  }>(
    `SELECT 
      COUNT(*)::int as total_reports,
      COALESCE(SUM(total_revenue), 0)::numeric(12,2) as total_revenue,
      COALESCE(SUM(sold_injera), 0)::int as total_sold,
      COALESCE(SUM(wasted_injera), 0)::int as total_wasted,
      CASE 
        WHEN SUM(sold_injera + wasted_injera) > 0 
        THEN ROUND((SUM(wasted_injera)::numeric / SUM(sold_injera + wasted_injera)::numeric * 100), 2)
        ELSE 0
      END as avg_waste_rate,
      CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(total_revenue)::numeric / COUNT(*)::numeric), 2)
        ELSE 0
      END as avg_daily_revenue
    FROM daily_reports
    ${whereClause}`,
    values
  );

  const stats = rows[0];
  return {
    totalReports: stats.total_reports,
    totalRevenue: Number(stats.total_revenue),
    totalSold: stats.total_sold,
    totalWasted: stats.total_wasted,
    averageWasteRate: Number(stats.avg_waste_rate),
    averageDailyRevenue: Number(stats.avg_daily_revenue),
  };
};

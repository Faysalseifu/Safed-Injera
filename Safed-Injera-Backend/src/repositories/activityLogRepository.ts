import { pool } from '../config/db';

export interface ActivityLogRecord {
  id: number;
  user_id: string | null;
  action_type: string;
  entity_type: string;
  entity_id: number;
  details: Record<string, any>;
  created_at: Date;
}

export interface CreateActivityLogInput {
  user_id?: string;
  action_type: string;
  entity_type: string;
  entity_id: number;
  details?: Record<string, any>;
}

export const createActivityLog = async (
  log: CreateActivityLogInput
): Promise<ActivityLogRecord> => {
  const { rows } = await pool.query<ActivityLogRecord>(
    `INSERT INTO activity_logs
     (user_id, action_type, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      log.user_id ?? null,
      log.action_type,
      log.entity_type,
      log.entity_id,
      JSON.stringify(log.details ?? {}),
    ]
  );
  return rows[0];
};

export interface ActivityLogFilters {
  user_id?: string;
  entity_type?: string;
  entity_id?: number;
  action_type?: string;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}

export const getActivityLogs = async (
  filters: ActivityLogFilters = {}
): Promise<{ rows: ActivityLogRecord[]; total: number }> => {
  const {
    user_id,
    entity_type,
    entity_id,
    action_type,
    start_date,
    end_date,
    limit = 50,
    offset = 0,
  } = filters;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (user_id) {
    values.push(user_id);
    conditions.push(`al.user_id = $${paramIndex++}`);
  }

  if (entity_type) {
    values.push(entity_type);
    conditions.push(`al.entity_type = $${paramIndex++}`);
  }

  if (entity_id) {
    values.push(entity_id);
    conditions.push(`al.entity_id = $${paramIndex++}`);
  }

  if (action_type) {
    values.push(action_type);
    conditions.push(`al.action_type = $${paramIndex++}`);
  }

  if (start_date) {
    values.push(start_date);
    conditions.push(`al.created_at >= $${paramIndex++}`);
  }

  if (end_date) {
    values.push(end_date);
    conditions.push(`al.created_at <= $${paramIndex++}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const { rows: countRows } = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM activity_logs al ${whereClause}`,
    values
  );
  const total = countRows[0]?.total ?? 0;

  // Get paginated results
  values.push(limit, offset);
  const { rows } = await pool.query<ActivityLogRecord>(
    `SELECT al.*, u.username as user_username
     FROM activity_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    values
  );

  return { rows, total };
};

export const getActivityLogsByEntity = async (
  entityType: string,
  entityId: number,
  limit: number = 50
): Promise<ActivityLogRecord[]> => {
  const { rows } = await pool.query<ActivityLogRecord>(
    `SELECT al.*, u.username as user_username
     FROM activity_logs al
     LEFT JOIN users u ON al.user_id = u.id
     WHERE al.entity_type = $1 AND al.entity_id = $2
     ORDER BY al.created_at DESC
     LIMIT $3`,
    [entityType, entityId, limit]
  );
  return rows;
};

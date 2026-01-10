import { Request, Response } from 'express';
import logger from '../utils/logger';
import {
  getActivityLogs,
  getActivityLogsByEntity,
} from '../repositories/activityLogRepository';

export const getActivityLogsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      entityType,
      entityId,
      actionType,
      startDate,
      endDate,
      limit,
      offset,
    } = req.query;

    const filters = {
      user_id: typeof userId === 'string' ? userId : undefined,
      entity_type: typeof entityType === 'string' ? entityType : undefined,
      entity_id: typeof entityId === 'string' ? Number(entityId) : undefined,
      action_type: typeof actionType === 'string' ? actionType : undefined,
      start_date: typeof startDate === 'string' ? new Date(startDate) : undefined,
      end_date: typeof endDate === 'string' ? new Date(endDate) : undefined,
      limit: typeof limit === 'string' ? Number(limit) : undefined,
      offset: typeof offset === 'string' ? Number(offset) : undefined,
    };

    const { rows, total } = await getActivityLogs(filters);

    res.set('Content-Range', `activity-logs ${filters.offset ?? 0}-${(filters.offset ?? 0) + rows.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(rows);
  } catch (error) {
    logger.error('Get activity logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActivityLogsByStockHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid stock id' });
      return;
    }

    const logs = await getActivityLogsByEntity('stock', id, limit);
    res.json(logs);
  } catch (error) {
    logger.error('Get activity logs by stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActivityLogsByOrderHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid order id' });
      return;
    }

    const logs = await getActivityLogsByEntity('order', id, limit);
    res.json(logs);
  } catch (error) {
    logger.error('Get activity logs by order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

import { Request, Response } from 'express';
import logger from '../utils/logger';
import {
  getStockSettings,
  getStockSettingByCategory,
  updateStockSetting,
  getDefaultThresholds,
} from '../repositories/stockSettingsRepository';
import { createActivityLog } from '../repositories/activityLogRepository';
import { AuthRequest } from '../middleware/authMiddleware';

export const getStockSettingsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await getStockSettings();
    res.json(settings);
  } catch (error) {
    logger.error('Get stock settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStockSettingHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    if (!category) {
      res.status(400).json({ message: 'Category is required' });
      return;
    }

    const setting = await getStockSettingByCategory(category);
    if (!setting) {
      res.status(404).json({ message: 'Stock setting not found' });
      return;
    }

    res.json(setting);
  } catch (error) {
    logger.error('Get stock setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStockSettingHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { minimumThreshold } = req.body;
    const userId = req.user?.id;

    if (!category) {
      res.status(400).json({ message: 'Category is required' });
      return;
    }

    if (typeof minimumThreshold !== 'number' || minimumThreshold < 0) {
      res.status(400).json({ message: 'Valid minimum threshold is required' });
      return;
    }

    const setting = await updateStockSetting(category, minimumThreshold, userId);

    // Log activity
    if (userId) {
      try {
        await createActivityLog({
          user_id: userId,
          action_type: 'stock_setting_updated',
          entity_type: 'stock_setting',
          entity_id: setting.id,
          details: {
            category,
            minimum_threshold: minimumThreshold,
          },
        });
      } catch (logError) {
        logger.warn('Failed to create activity log:', logError);
      }
    }

    logger.info(`Stock setting updated: ${category} = ${minimumThreshold} by ${userId ?? 'unknown'}`);
    res.json(setting);
  } catch (error) {
    logger.error('Update stock setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDefaultThresholdsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const defaults = getDefaultThresholds();
    res.json(defaults);
  } catch (error) {
    logger.error('Get default thresholds error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

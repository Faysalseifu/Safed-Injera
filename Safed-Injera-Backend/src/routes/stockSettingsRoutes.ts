import express from 'express';
import {
  getStockSettingsHandler,
  getStockSettingHandler,
  updateStockSettingHandler,
  getDefaultThresholdsHandler,
} from '../controllers/stockSettingsController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// All stock settings routes are protected
router.use(protect);

router.get('/defaults', getDefaultThresholdsHandler);
router.get('/', getStockSettingsHandler);
router.get('/:category', getStockSettingHandler);
router.put('/:category', adminOnly, updateStockSettingHandler);

export default router;

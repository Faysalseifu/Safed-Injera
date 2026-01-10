import express from 'express';
import {
  getActivityLogsHandler,
  getActivityLogsByStockHandler,
  getActivityLogsByOrderHandler,
} from '../controllers/activityLogsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All activity log routes are protected
router.use(protect);

router.get('/', getActivityLogsHandler);
router.get('/stock/:id', getActivityLogsByStockHandler);
router.get('/order/:id', getActivityLogsByOrderHandler);

export default router;

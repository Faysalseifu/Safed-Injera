import express from 'express';
import {
  getSalesAnalysis,
  getDashboard,
  exportData,
} from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All analytics routes are protected
router.use(protect);

router.get('/sales', getSalesAnalysis);
router.get('/dashboard', getDashboard);
router.get('/export', exportData);

export default router;



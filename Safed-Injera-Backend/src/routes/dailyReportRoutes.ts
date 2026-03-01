import express from 'express';
import {
  getReportPreparationData,
  submitDailyReport,
  getDailyReports,
  getDailyReport,
  getReportAnalysis,
} from '../controllers/dailyReportController';
import { protect, subAdminOrHigher, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(subAdminOrHigher);

router.get('/preparation', getReportPreparationData);
router.post('/submit', submitDailyReport);
router.get('/analysis', adminOnly, getReportAnalysis);
router.get('/:id', getDailyReport);
router.get('/', getDailyReports);

export default router;

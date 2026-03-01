import express from 'express';
import {
  dispatchTransfer,
  receiveTransfer,
  getPendingTransfers,
  getTransferById,
  getBranchDashboardStats,
  returnStockToHub,
} from '../controllers/stockTransferController';
import { protect, subAdminOrHigher } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/branch-dashboard', getBranchDashboardStats);
router.post('/dispatch', dispatchTransfer);
router.post('/return', subAdminOrHigher, returnStockToHub);
router.get('/pending', getPendingTransfers);
router.get('/:id', getTransferById);
router.post('/:id/receive', receiveTransfer);

export default router;

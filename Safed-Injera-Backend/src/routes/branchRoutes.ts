import express from 'express';
import {
  getBranches,
  getBranch,
  getMainHub,
  getBranchOptions,
  createBranchHandler,
} from '../controllers/branchController';
import {
  getBranchDashboard,
  getAllBranchesDashboard,
} from '../controllers/branchDashboardController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', getBranches);
router.get('/main-hub', getMainHub);
router.get('/options', getBranchOptions);
router.get('/dashboard/all', getAllBranchesDashboard); // Admin: all branches overview
router.get('/dashboard', getBranchDashboard); // Branch-specific dashboard
router.get('/:id', getBranch);
router.post('/', adminOnly, createBranchHandler);

export default router;

import express from 'express';
import {
  addDebtPaymentHandler,
  createDebtHandler,
  getDebtHandler,
  getDebtsHandler,
  updateDebtHandler,
} from '../controllers/debtController';
import { hubAdminOnly, protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(hubAdminOnly);

router.get('/', getDebtsHandler);
router.post('/', createDebtHandler);
router.get('/:id', getDebtHandler);
router.patch('/:id', updateDebtHandler);
router.post('/:id/payments', addDebtPaymentHandler);

export default router;

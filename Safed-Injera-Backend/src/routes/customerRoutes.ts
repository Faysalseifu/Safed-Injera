import express from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomerHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  getDueCustomers,
} from '../controllers/customerController';
import { protect, subAdminOrHigher } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(subAdminOrHigher);

router.get('/', getCustomers);
router.get('/due', getDueCustomers);
router.get('/:id', getCustomer);
router.post('/', createCustomerHandler);
router.put('/:id', updateCustomerHandler);
router.delete('/:id', deleteCustomerHandler);

export default router;

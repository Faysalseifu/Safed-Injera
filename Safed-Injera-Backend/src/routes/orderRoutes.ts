import express from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
} from '../controllers/orderController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Public route - create order from frontend
router.post('/', createOrder);

// Protected routes
router.use(protect);

router.get('/', getOrders);
router.get('/stats', getOrderStats);
router.route('/:id')
  .get(getOrder)
  .put(updateOrder)
  .patch(updateOrder) // PATCH also uses updateOrder for status updates
  .delete(adminOnly, deleteOrder);

export default router;



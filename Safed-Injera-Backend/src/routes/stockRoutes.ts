import express from 'express';
import {
  getStocks,
  getStock,
  createStock,
  updateStock,
  deleteStock,
  updateStockQuantity,
} from '../controllers/stockController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// All stock routes are protected
router.use(protect);

router.route('/')
  .get(getStocks)
  .post(createStock);

router.route('/:id')
  .get(getStock)
  .put(updateStock)
  .delete(adminOnly, deleteStock);

router.patch('/:id/quantity', updateStockQuantity);

export default router;



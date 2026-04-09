import express from 'express';
import {
  getStocks,
  getHubStocks,
  getStock,
  createStock,
  updateStock,
  deleteStock,
  updateStockQuantity,
  quickAdjustStock,
  getStockTransactionsHandler,
  getLowStockItemsHandler,
} from '../controllers/stockController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All stock routes are protected
router.use(protect);

router.route('/')
  .get(getStocks)
  .post(createStock);

router.get('/hub', getHubStocks);

router.get('/low-stock', getLowStockItemsHandler);

router.route('/:id')
  .get(getStock)
  .put(updateStock)
  .delete(deleteStock); // Sub-admin can delete, but controller enforces branch scoping

router.patch('/:id/quantity', updateStockQuantity);
router.post('/:id/quick-adjust', quickAdjustStock);
router.get('/:id/transactions', getStockTransactionsHandler);

export default router;



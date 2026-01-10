import { Request, Response } from 'express';
import logger from '../utils/logger';
import {
  getStocks as getStocksRepo,
  findStockById,
  createStock as createStockRepo,
  updateStock as updateStockRepo,
  deleteStock as deleteStockRepo,
  adjustStockQuantity as adjustStockQuantityRepo,
  getLowStockItems,
  StockFilters,
} from '../repositories/stockRepository';
import { createStockTransaction, getStockTransactions } from '../repositories/stockTransactionRepository';
import { createActivityLog } from '../repositories/activityLogRepository';
import { getStockSettingByCategory } from '../repositories/stockSettingsRepository';
import { transformStock, transformStockInput } from '../utils/transform';
import { AuthRequest } from '../middleware/authMiddleware';

// Exported controller functions
export const getStocks = async (req: Request, res: Response) => {
  try {
    const { category, isActive, isLowStock, sort } = req.query;
    const filters: StockFilters = {
      category: typeof category === 'string' ? category : undefined,
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
      isLowStock: typeof isLowStock === 'string' ? isLowStock === 'true' : undefined,
      sortBy: sort === 'price' ? 'price' : 'created_at',
      sortOrder: sort === 'price' ? 'ASC' : 'DESC',
    };
    const stocks = await getStocksRepo(filters);
    const transformedStocks = stocks.map(transformStock);
    res.set('Content-Range', `stocks 0-${transformedStocks.length}/${transformedStocks.length}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(transformedStocks);
  } catch (error) {
    logger.error('Get stocks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStock = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid stock id' });
      return;
    }
    const stock = await findStockById(id);
    if (!stock) {
      res.status(404).json({ message: 'Stock item not found' });
      return;
    }
    res.json(transformStock(stock));
  } catch (error) {
    logger.error('Get stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createStock = async (req: AuthRequest, res: Response) => {
  try {
    const { productName, description, quantity, unit, price, category, isActive, minimumThreshold } = req.body;
    
    // Get default threshold for category if not provided
    let threshold = minimumThreshold;
    if (!threshold) {
      const setting = await getStockSettingByCategory(category || 'Injera');
      threshold = setting?.minimum_threshold ?? 0;
    }

    const stock = await createStockRepo({
      product_name: productName,
      description,
      quantity: Number(quantity),
      unit,
      price: Number(price),
      category,
      is_active: isActive !== undefined ? Boolean(isActive) : true,
      minimum_threshold: threshold,
    });

    // Create initial transaction
    const userId = req.user?.id;
    if (userId && Number(quantity) > 0) {
      try {
        await createStockTransaction({
          stock_id: stock.id,
          transaction_type: 'initial',
          quantity_change: Number(quantity),
          quantity_before: 0,
          quantity_after: Number(quantity),
          performed_by: userId,
          reason: 'Initial stock entry',
        });

        await createActivityLog({
          user_id: userId,
          action_type: 'stock_created',
          entity_type: 'stock',
          entity_id: stock.id,
          details: {
            product_name: productName,
            quantity: Number(quantity),
            category,
          },
        });
      } catch (logError) {
        logger.warn('Failed to create transaction/log:', logError);
      }
    }

    logger.info(`Stock created: ${productName}`);
    res.status(201).json(transformStock(stock));
  } catch (error) {
    logger.error('Create stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStock = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid stock id' });
      return;
    }

    const currentStock = await findStockById(id);
    if (!currentStock) {
      res.status(404).json({ message: 'Stock item not found' });
      return;
    }

    // Transform input from camelCase to snake_case for database
    const dbInput = transformStockInput(req.body);
    
    // Track quantity changes
    const quantityChanged = req.body.quantity !== undefined && req.body.quantity !== currentStock.quantity;
    const quantityChange = quantityChanged ? Number(req.body.quantity) - currentStock.quantity : 0;

    const updatedStock = await updateStockRepo(id, dbInput);
    if (!updatedStock) {
      res.status(404).json({ message: 'Stock item not found' });
      return;
    }

    // Log transaction and activity if quantity changed
    const userId = req.user?.id;
    if (userId && quantityChanged && quantityChange !== 0) {
      try {
        await createStockTransaction({
          stock_id: id,
          transaction_type: quantityChange > 0 ? 'in' : 'out',
          quantity_change: quantityChange,
          quantity_before: currentStock.quantity,
          quantity_after: Number(req.body.quantity),
          performed_by: userId,
          reason: req.body.reason || 'Manual update',
        });

        await createActivityLog({
          user_id: userId,
          action_type: 'stock_updated',
          entity_type: 'stock',
          entity_id: id,
          details: {
            product_name: updatedStock.product_name,
            quantity_change: quantityChange,
            quantity_before: currentStock.quantity,
            quantity_after: Number(req.body.quantity),
          },
        });
      } catch (logError) {
        logger.warn('Failed to create transaction/log:', logError);
      }
    }

    logger.info(`Stock updated: ${updatedStock.product_name} by ${userId ?? 'unknown'}`);
    res.json(transformStock(updatedStock));
  } catch (error) {
    logger.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStock = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid stock id' });
      return;
    }
    const deleted = await deleteStockRepo(id);
    if (!deleted) {
      res.status(404).json({ message: 'Stock item not found' });
      return;
    }
    logger.info(`Stock deleted: ${id}`);
    res.json({ message: 'Stock item deleted', id });
  } catch (error) {
    logger.error('Delete stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStockQuantity = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { adjustment, reason } = req.body;
    if (isNaN(id) || typeof adjustment !== 'number') {
      res.status(400).json({ message: 'Invalid stock id or adjustment' });
      return;
    }

    const currentStock = await findStockById(id);
    if (!currentStock) {
      res.status(404).json({ message: 'Stock item not found' });
      return;
    }

    const userId = req.user?.id;
    const stock = await adjustStockQuantityRepo(id, adjustment, userId, reason);
    if (!stock) {
      res.status(400).json({ message: 'Stock item not found or insufficient stock' });
      return;
    }

    // Create transaction record
    try {
      await createStockTransaction({
        stock_id: id,
        transaction_type: adjustment > 0 ? 'in' : adjustment < 0 ? 'out' : 'adjustment',
        quantity_change: adjustment,
        quantity_before: currentStock.quantity,
        quantity_after: stock.quantity,
        performed_by: userId,
        reason: reason || 'Quantity adjustment',
      });

      await createActivityLog({
        user_id: userId,
        action_type: 'stock_quantity_adjusted',
        entity_type: 'stock',
        entity_id: id,
        details: {
          product_name: stock.product_name,
          adjustment,
          quantity_before: currentStock.quantity,
          quantity_after: stock.quantity,
          reason,
        },
      });
    } catch (logError) {
      logger.warn('Failed to create transaction/log:', logError);
    }

    logger.info(`Stock quantity updated: ${stock.product_name} (${adjustment > 0 ? '+' : ''}${adjustment}) by ${userId ?? 'unknown'}`);
    res.json(transformStock(stock));
  } catch (error) {
    logger.error('Update stock quantity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const quickAdjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { amount, operation, reason } = req.body; // operation: 'add' | 'subtract', amount: number
    
    if (isNaN(id) || !amount || !operation) {
      res.status(400).json({ message: 'Invalid stock id, amount, or operation' });
      return;
    }

    const adjustment = operation === 'add' ? Number(amount) : -Number(amount);
    
    // Create a modified request object with adjustment
    const modifiedReq = {
      ...req,
      body: { ...req.body, adjustment, reason },
      params: { ...req.params, id: String(id) },
    } as AuthRequest;
    
    return updateStockQuantity(modifiedReq, res);
  } catch (error) {
    logger.error('Quick adjust stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStockTransactionsHandler = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid stock id' });
      return;
    }

    const transactions = await getStockTransactions(id, limit);
    res.json(transactions);
  } catch (error) {
    logger.error('Get stock transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLowStockItemsHandler = async (req: Request, res: Response) => {
  try {
    const items = await getLowStockItems();
    res.json(items.map(transformStock));
  } catch (error) {
    logger.error('Get low stock items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




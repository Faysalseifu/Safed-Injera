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
import { getMainHubBranch } from '../repositories/branchRepository';
import { transformStock, transformStockInput } from '../utils/transform';
import { withTransaction } from '../utils/transaction';
import { AuthRequest } from '../middleware/authMiddleware';

// Exported controller functions
export const getStocks = async (req: AuthRequest, res: Response) => {
  try {
    const { category, isActive, isLowStock, sort } = req.query;
    const filters: StockFilters = {
      category: typeof category === 'string' ? category : undefined,
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
      isLowStock: typeof isLowStock === 'string' ? isLowStock === 'true' : undefined,
      sortBy: sort === 'price' ? 'price' : 'created_at',
      sortOrder: sort === 'price' ? 'ASC' : 'DESC',
    };
    if (req.user?.role === 'sub_admin' && req.user.branch_id) {
      filters.branchId = req.user.branch_id;
    }
    const _start = req.query._start ? Number(req.query._start) : undefined;
    const _end = req.query._end ? Number(req.query._end) : undefined;
    if (_start !== undefined && _end !== undefined && !Number.isNaN(_start) && !Number.isNaN(_end)) {
      filters.offset = _start;
      filters.limit = Math.max(_end - _start, 1);
    }
    const { rows: stocks, total } = await getStocksRepo(filters);
    const transformedStocks = stocks.map(transformStock);
    const startIx = filters.offset ?? 0;
    const endIx = transformedStocks.length ? startIx + transformedStocks.length - 1 : startIx;
    res.set('Content-Range', `stocks ${startIx}-${endIx}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(transformedStocks);
  } catch (error) {
    logger.error('Get stocks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getHubStocks = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role === 'sub_admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { category, isActive, isLowStock, sort, _sort, _order, _start, _end } = req.query;
    const baseFilters: StockFilters = {
      category: typeof category === 'string' ? category : undefined,
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
      isLowStock: typeof isLowStock === 'string' ? isLowStock === 'true' : undefined,
      sortBy:
        (typeof sort === 'string' && sort === 'price') || (typeof _sort === 'string' && _sort === 'price')
          ? 'price'
          : 'created_at',
      sortOrder:
        (typeof _order === 'string' && (_order === 'ASC' || _order === 'DESC'))
          ? _order
          : sort === 'price'
            ? 'ASC'
            : 'DESC',
    };

    const start = typeof _start === 'string' ? Number(_start) : undefined;
    const end = typeof _end === 'string' ? Number(_end) : undefined;

    const mainHub = await getMainHubBranch();
    const [hubStocks, globalStocks] = await Promise.all([
      mainHub ? getStocksRepo({ ...baseFilters, branchId: mainHub.id }) : Promise.resolve({ rows: [], total: 0 }),
      getStocksRepo({ ...baseFilters, branchId: null }),
    ]);

    const merged = [...hubStocks.rows, ...globalStocks.rows];
    const byId = new Map<number, any>();
    for (const row of merged) byId.set(row.id, row);

    let unique = Array.from(byId.values());
    if (baseFilters.sortBy === 'price') {
      unique.sort((a, b) => {
        const av = Number(a.price) || 0;
        const bv = Number(b.price) || 0;
        return baseFilters.sortOrder === 'ASC' ? av - bv : bv - av;
      });
    } else {
      unique.sort((a, b) => {
        const ad = new Date(a.created_at ?? a.createdAt ?? 0).getTime();
        const bd = new Date(b.created_at ?? b.createdAt ?? 0).getTime();
        return baseFilters.sortOrder === 'ASC' ? ad - bd : bd - ad;
      });
    }

    const total = unique.length;
    const offset = start !== undefined && Number.isFinite(start) && start >= 0 ? start : 0;
    const limit =
      end !== undefined && Number.isFinite(end) && end > offset ? Math.max(end - offset, 1) : total;
    const paged = unique.slice(offset, offset + limit);

    const transformed = paged.map(transformStock);
    const endIx = transformed.length ? offset + transformed.length - 1 : offset;
    res.set('Content-Range', `stocks ${offset}-${endIx}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(transformed);
  } catch (error) {
    logger.error('Get hub stocks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStock = async (req: AuthRequest, res: Response) => {
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
    if (req.user?.role === 'sub_admin' && req.user.branch_id && stock.branch_id !== req.user.branch_id) {
      res.status(403).json({ message: 'Access denied to this stock' });
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
      branch_id: req.user?.role === 'sub_admin' ? req.user.branch_id ?? undefined : undefined,
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

    // Enforce branch scoping for sub-admin
    if (req.user?.role === 'sub_admin' && req.user.branch_id && currentStock.branch_id !== req.user.branch_id) {
      res.status(403).json({ message: 'Access denied to this stock' });
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

export const deleteStock = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid stock id' });
      return;
    }

    // Check stock exists and enforce branch scoping for sub-admin
    const stock = await findStockById(id);
    if (!stock) {
      res.status(404).json({ message: 'Stock item not found' });
      return;
    }

    if (req.user?.role === 'sub_admin' && req.user.branch_id && stock.branch_id !== req.user.branch_id) {
      res.status(403).json({ message: 'Access denied to this stock' });
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

    const userId = req.user?.id;
    const stock = await withTransaction(async (client) => {
      const currentStock = await findStockById(id, client);
      if (!currentStock) {
        throw new Error('STOCK_NOT_FOUND');
      }

      // Enforce branch scoping for sub-admin
      if (req.user?.role === 'sub_admin' && req.user.branch_id && currentStock.branch_id !== req.user.branch_id) {
        throw new Error('ACCESS_DENIED');
      }

      const updatedStock = await adjustStockQuantityRepo(id, adjustment, client);
      if (!updatedStock) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      await createStockTransaction(
        {
          stock_id: id,
          transaction_type: adjustment > 0 ? 'in' : adjustment < 0 ? 'out' : 'adjustment',
          quantity_change: adjustment,
          quantity_before: currentStock.quantity,
          quantity_after: updatedStock.quantity,
          performed_by: userId,
          reason: reason || 'Quantity adjustment',
        },
        client
      );

      await createActivityLog(
        {
          user_id: userId,
          action_type: 'stock_quantity_adjusted',
          entity_type: 'stock',
          entity_id: id,
          details: {
            product_name: updatedStock.product_name,
            adjustment,
            quantity_before: currentStock.quantity,
            quantity_after: updatedStock.quantity,
            reason,
          },
        },
        client
      );

      return updatedStock;
    });

    logger.info(`Stock quantity updated: ${stock.product_name} (${adjustment > 0 ? '+' : ''}${adjustment}) by ${userId ?? 'unknown'}`);
    res.json(transformStock(stock));
  } catch (error: any) {
    if (error?.message === 'STOCK_NOT_FOUND') {
      res.status(404).json({ message: 'Stock item not found' });
      return;
    }
    if (error?.message === 'ACCESS_DENIED') {
      res.status(403).json({ message: 'Access denied to this stock' });
      return;
    }
    if (error?.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ message: 'Stock item not found or insufficient stock' });
      return;
    }
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
    // Use 'unknown' first to satisfy TypeScript's type checking
    const modifiedReq = {
      ...req,
      body: { ...req.body, adjustment, reason },
      params: { ...req.params, id: String(id) },
    } as unknown as AuthRequest;

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

export const getLowStockItemsHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role === 'sub_admin') {
      const branchId = req.user.branch_id ?? undefined;
      const items = await getLowStockItems(branchId);
      res.json(items.map(transformStock));
      return;
    }

    const mainHub = await getMainHubBranch();
    if (!mainHub) {
      const items = await getLowStockItems(null);
      res.json(items.map(transformStock));
      return;
    }

    const [hubItems, globalItems] = await Promise.all([
      getLowStockItems(mainHub.id),
      getLowStockItems(null),
    ]);
    const unique = Array.from(new Map([...hubItems, ...globalItems].map((item) => [item.id, item])).values());
    res.json(unique.map(transformStock));
  } catch (error) {
    logger.error('Get low stock items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




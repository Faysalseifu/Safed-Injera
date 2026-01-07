import { Request, Response } from 'express';
import logger from '../utils/logger';
import {
  getStocks as getStocksRepo,
  findStockById,
  createStock as createStockRepo,
  updateStock as updateStockRepo,
  deleteStock as deleteStockRepo,
  adjustStockQuantity as adjustStockQuantityRepo,
  StockFilters,
} from '../repositories/stockRepository';
import { transformStock, transformStockInput } from '../utils/transform';

// Exported controller functions
export const getStocks = async (req: Request, res: Response) => {
  try {
    const { category, isActive, sort } = req.query;
    const filters: StockFilters = {
      category: typeof category === 'string' ? category : undefined,
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
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

export const createStock = async (req: Request, res: Response) => {
  try {
    const { productName, description, quantity, unit, price, category, isActive } = req.body;
    const stock = await createStockRepo({
      product_name: productName,
      description,
      quantity: Number(quantity),
      unit,
      price: Number(price),
      category,
      is_active: isActive !== undefined ? Boolean(isActive) : true,
    });
    logger.info(`Stock created: ${productName}`);
    res.status(201).json(transformStock(stock));
  } catch (error) {
    logger.error('Create stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid stock id' });
      return;
    }
    // Transform input from camelCase to snake_case for database
    const dbInput = transformStockInput(req.body);
    const updatedStock = await updateStockRepo(id, dbInput);
    if (!updatedStock) {
      res.status(404).json({ message: 'Stock item not found' });
      return;
    }
    logger.info(`Stock updated: ${updatedStock.product_name}`);
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

export const updateStockQuantity = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { adjustment } = req.body;
    if (isNaN(id) || typeof adjustment !== 'number') {
      res.status(400).json({ message: 'Invalid stock id or adjustment' });
      return;
    }
    const stock = await adjustStockQuantityRepo(id, adjustment);
    if (!stock) {
      res.status(404).json({ message: 'Stock item not found or insufficient stock' });
      return;
    }
    logger.info(`Stock quantity updated: ${stock.product_name} (${adjustment > 0 ? '+' : ''}${adjustment})`);
    res.json(transformStock(stock));
  } catch (error) {
    logger.error('Update stock quantity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getMainHubBranch } from '../repositories/branchRepository';
import {
  findStockByProductAndBranch,
  adjustStockQuantity,
  createStock,
} from '../repositories/stockRepository';
import {
  createStockTransaction,
  getBranchDailyOutQuantity,
} from '../repositories/stockTransactionRepository';
import { getStocks } from '../repositories/stockRepository';
import {
  createStockTransfer,
  getStockTransferById,
  getPendingTransfersForBranch,
  updateStockTransferStatus,
} from '../repositories/stockTransferRepository';
import { getStockSettingByCategory } from '../repositories/stockSettingsRepository';
import { createActivityLog } from '../repositories/activityLogRepository';
import { withTransaction } from '../utils/transaction';
import logger from '../utils/logger';

export const dispatchTransfer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mainHub = await getMainHubBranch();
    if (!mainHub) {
      res.status(500).json({ message: 'Main Hub not configured' });
      return;
    }

    const { toBranchId, productName, quantity, stockId, fromBranchId } = req.body;
    if (!toBranchId || !productName || !quantity || quantity <= 0) {
      res.status(400).json({ message: 'toBranchId, productName, and quantity (positive) are required' });
      return;
    }

    let sourceBranchId: string;
    if (req.user?.role === 'sub_admin') {
      if (!req.user.branch_id) {
        res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
        return;
      }
      sourceBranchId = req.user.branch_id;
    } else {
      sourceBranchId = typeof fromBranchId === 'string' && fromBranchId.trim()
        ? fromBranchId.trim()
        : mainHub.id;
    }

    if (sourceBranchId === toBranchId) {
      res.status(400).json({ message: 'Source and destination branches cannot be the same' });
      return;
    }

    const transfer = await withTransaction(async (client) => {
      const stock = stockId
        ? await findStockByProductAndBranch(productName, sourceBranchId, client) ||
          (sourceBranchId === mainHub.id ? await findStockByProductAndBranch(productName, null, client) : null)
        : await findStockByProductAndBranch(productName, sourceBranchId, client) ||
          (sourceBranchId === mainHub.id ? await findStockByProductAndBranch(productName, null, client) : null);

      if (!stock) {
        throw new Error('STOCK_NOT_FOUND');
      }
      if (stock.quantity < quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      const updatedStock = await adjustStockQuantity(stock.id, -quantity, client);
      if (!updatedStock) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      const created = await createStockTransfer(
        {
          from_branch_id: sourceBranchId,
          to_branch_id: toBranchId,
          product_name: productName,
          category: stock.category,
          quantity,
          unit: stock.unit,
          dispatched_by: req.user?.id,
        },
        client
      );

      await createStockTransaction(
        {
          stock_id: stock.id,
          transaction_type: 'out',
          quantity_change: -quantity,
          quantity_before: stock.quantity,
          quantity_after: updatedStock.quantity,
          performed_by: req.user?.id,
          reason:
            sourceBranchId === mainHub.id
              ? `Internal dispatch sold to branch ${toBranchId}`
              : `Branch transfer to branch ${toBranchId}`,
        },
        client
      );

      return created;
    });

    logger.info(`Transfer dispatched: ${productName} x${quantity} from branch ${sourceBranchId} to branch ${toBranchId}`);
    res.status(201).json(transfer);
  } catch (error: any) {
    if (error?.message === 'STOCK_NOT_FOUND') {
      res.status(404).json({ message: 'Stock not found at source branch' });
      return;
    }
    if (error?.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ message: 'Insufficient stock at source branch' });
      return;
    }
    logger.error('Dispatch transfer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const receiveTransfer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (req.user?.role === 'sub_admin' && req.user.branch_id) {
      const transfer = await getStockTransferById(id);
      if (!transfer) {
        res.status(404).json({ message: 'Transfer not found' });
        return;
      }
      if (transfer.to_branch_id !== req.user.branch_id) {
        res.status(403).json({ message: 'Access denied to this transfer' });
        return;
      }
      if (transfer.status !== 'in_transit' && transfer.status !== 'pending') {
        res.status(400).json({ message: 'Transfer already received or cancelled' });
        return;
      }
    }

    await withTransaction(async (client) => {
      const transfer = await getStockTransferById(id, client);
      if (!transfer) {
        throw new Error('NOT_FOUND');
      }
      if (transfer.to_branch_id !== req.user?.branch_id && req.user?.role === 'sub_admin') {
        throw new Error('FORBIDDEN');
      }
      if (transfer.status !== 'in_transit' && transfer.status !== 'pending') {
        throw new Error('ALREADY_RECEIVED');
      }

      let branchStock = await findStockByProductAndBranch(
        transfer.product_name,
        transfer.to_branch_id,
        client
      );

      if (!branchStock) {
        const setting = await getStockSettingByCategory(transfer.category);
        const threshold = setting?.minimum_threshold ?? 0;
        branchStock = await createStock(
          {
            product_name: transfer.product_name,
            category: transfer.category,
            quantity: 0,
            unit: transfer.unit,
            price: 0,
            is_active: true,
            minimum_threshold: threshold,
            branch_id: transfer.to_branch_id,
          },
          client
        );
      }

      const qtyBefore = branchStock.quantity;
      const updatedStock = await adjustStockQuantity(
        branchStock.id,
        transfer.quantity,
        client
      );
      if (!updatedStock) {
        throw new Error('ADJUST_FAILED');
      }

      await createStockTransaction(
        {
          stock_id: branchStock.id,
          transaction_type: 'in',
          quantity_change: transfer.quantity,
          quantity_before: qtyBefore,
          quantity_after: updatedStock.quantity,
          performed_by: userId,
          reason: `Transfer received from branch ${transfer.from_branch_id}`,
        },
        client
      );

      await updateStockTransferStatus(id, 'received', userId, client);
    });

    const updated = await getStockTransferById(id);
    logger.info(`Transfer received: ${id}`);
    res.json(updated);
  } catch (error: any) {
    if (error?.message === 'NOT_FOUND') {
      res.status(404).json({ message: 'Transfer not found' });
      return;
    }
    if (error?.message === 'FORBIDDEN') {
      res.status(403).json({ message: 'Access denied to this transfer' });
      return;
    }
    if (error?.message === 'ALREADY_RECEIVED') {
      res.status(400).json({ message: 'Transfer already received or cancelled' });
      return;
    }
    if (error?.message === 'ADJUST_FAILED') {
      res.status(500).json({ message: 'Failed to update branch stock' });
      return;
    }
    logger.error('Receive transfer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPendingTransfers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branchId = (req.query.branchId as string) || req.user?.branch_id;
    if (!branchId) {
      res.status(400).json({ message: 'Branch ID required (query param or user branch)' });
      return;
    }
    if (req.user?.role === 'sub_admin' && branchId !== req.user.branch_id) {
      res.status(403).json({ message: 'Access denied to other branch transfers' });
      return;
    }
    const transfers = await getPendingTransfersForBranch(branchId);
    res.json(transfers);
  } catch (error) {
    logger.error('Get pending transfers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBranchDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branchId = (req.query.branchId as string) || req.user?.branch_id;
    if (!branchId) {
      res.status(400).json({ message: 'Branch ID required' });
      return;
    }
    if (req.user?.role === 'sub_admin' && branchId !== req.user.branch_id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const [{ rows: stocks }, pendingTransfers, dailyOut] = await Promise.all([
      getStocks({ branchId }),
      getPendingTransfersForBranch(branchId),
      getBranchDailyOutQuantity(branchId, new Date()),
    ]);

    const stockOnHand = stocks
      .filter((s) => s.is_active)
      .reduce((sum, s) => sum + (s.quantity || 0), 0);

    res.json({
      stockOnHand,
      dailySalesDistribution: dailyOut,
      pendingTransfersCount: pendingTransfers.length,
      pendingTransfers,
    });
  } catch (error) {
    logger.error('Get branch dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTransferById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const transfer = await getStockTransferById(id);
    if (!transfer) {
      res.status(404).json({ message: 'Transfer not found' });
      return;
    }
    if (
      req.user?.role === 'sub_admin' &&
      transfer.to_branch_id !== req.user.branch_id &&
      transfer.from_branch_id !== req.user.branch_id
    ) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    res.json(transfer);
  } catch (error) {
    logger.error('Get transfer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Return stock from branch to main hub
 */
export const returnStockToHub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productName, quantity, category, unit, fromBranchId } = req.body;
    const userBranchId = req.user?.branch_id;
    const userRole = req.user?.role;

    let sourceBranchId: string;
    if (userRole === 'sub_admin') {
      if (!userBranchId) {
        res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
        return;
      }
      sourceBranchId = userBranchId;
    } else if (typeof fromBranchId === 'string' && fromBranchId.trim()) {
      sourceBranchId = fromBranchId.trim();
    } else {
      res.status(400).json({ message: 'fromBranchId is required for admin/staff returns' });
      return;
    }

    const mainHub = await getMainHubBranch();
    if (!mainHub) {
      res.status(500).json({ message: 'Main Hub not configured' });
      return;
    }

    if (!productName || !quantity || quantity <= 0) {
      res.status(400).json({ message: 'productName and quantity (positive) are required' });
      return;
    }

    await withTransaction(async (client) => {
      // Check branch has enough stock
      const branchStock = await findStockByProductAndBranch(productName, sourceBranchId, client);
      if (!branchStock || branchStock.quantity < quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      // Reduce branch stock
      const branchQtyBefore = branchStock.quantity;
      const updatedBranchStock = await adjustStockQuantity(branchStock.id, -quantity, client);
      if (!updatedBranchStock) {
        throw new Error('ADJUST_FAILED');
      }

      // Find or create main hub stock
      let hubStock = await findStockByProductAndBranch(productName, mainHub.id, client) ||
                     await findStockByProductAndBranch(productName, null, client);

      if (!hubStock) {
        const setting = await getStockSettingByCategory(category || 'Injera');
        hubStock = await createStock(
          {
            product_name: productName,
            category: category || 'Injera',
            quantity: 0,
            unit: unit || branchStock.unit,
            price: branchStock.price || 0,
            is_active: true,
            minimum_threshold: setting?.minimum_threshold ?? 0,
            branch_id: mainHub.id,
          },
          client
        );
      }

      // Add to main hub stock
      const hubQtyBefore = hubStock.quantity;
      const updatedHubStock = await adjustStockQuantity(hubStock.id, quantity, client);
      if (!updatedHubStock) {
        throw new Error('HUB_ADJUST_FAILED');
      }

      // Create transfer record (reverse direction)
      const returnTransfer = await createStockTransfer(
        {
          from_branch_id: sourceBranchId,
          to_branch_id: mainHub.id,
          product_name: productName,
          category: category || branchStock.category,
          quantity,
          unit: unit || branchStock.unit,
          dispatched_by: req.user?.id,
        },
        client
      );

      // Update transfer status to received immediately (since it's a return)
      await updateStockTransferStatus(returnTransfer.id, 'received', req.user?.id, client);

      // Log transactions
      await createStockTransaction(
        {
          stock_id: branchStock.id,
          transaction_type: 'out',
          quantity_change: -quantity,
          quantity_before: branchQtyBefore,
          quantity_after: updatedBranchStock.quantity,
          performed_by: req.user?.id,
          reason: `Returned to Main Hub (Transfer: ${returnTransfer.id})`,
        },
        client
      );

      await createStockTransaction(
        {
          stock_id: hubStock.id,
          transaction_type: 'in',
          quantity_change: quantity,
          quantity_before: hubQtyBefore,
          quantity_after: updatedHubStock.quantity,
          performed_by: req.user?.id,
          reason: `Returned from branch ${sourceBranchId} (Transfer: ${returnTransfer.id})`,
        },
        client
      );

      // Log activity
      await createActivityLog(
        {
          user_id: req.user?.id,
          action_type: 'stock_returned',
          entity_type: 'stock_transfer',
          entity_id: parseInt(returnTransfer.id.slice(0, 8), 16),
          details: {
            product_name: productName,
            quantity,
            from_branch: sourceBranchId,
            to_branch: mainHub.id,
          },
        },
        client
      );

      return returnTransfer;
    });

    logger.info(`Stock returned: ${productName} x${quantity} from branch ${sourceBranchId} to Main Hub`);
    res.status(201).json({ message: 'Stock returned successfully', quantity });
  } catch (error: any) {
    if (error?.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ message: 'Insufficient stock at branch' });
      return;
    }
    if (error?.message === 'ADJUST_FAILED' || error?.message === 'HUB_ADJUST_FAILED') {
      res.status(400).json({ message: 'Failed to adjust stock' });
      return;
    }
    logger.error('Return stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

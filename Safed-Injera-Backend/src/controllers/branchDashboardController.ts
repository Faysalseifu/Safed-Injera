import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getBranchById, getAllBranchesWithStatistics } from '../repositories/branchRepository';
import { getBranchStockSummary, getLowStockItems } from '../repositories/stockRepository';
import { getPendingTransfersForBranch } from '../repositories/stockTransferRepository';
import { getBranchDailyOutQuantity } from '../repositories/stockTransactionRepository';
import { getActivityLogsByBranch } from '../repositories/activityLogRepository';
import logger from '../utils/logger';

/**
 * Get branch dashboard data
 * For sub-admin: automatically uses their branch_id
 * For admin: requires branchId query param or uses their branch_id if they have one
 */
export const getBranchDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requestedBranchId = req.query.branchId as string | undefined;
    const userBranchId = req.user?.branch_id;
    const userRole = req.user?.role;

    // Determine which branch to show
    let branchId: string | undefined;

    if (userRole === 'sub_admin') {
      // Sub-admin can ONLY see their own branch
      if (!userBranchId) {
        res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
        return;
      }
      branchId = userBranchId;
    } else if (userRole === 'admin' || userRole === 'staff') {
      // Admin can view any branch via query param, or their own if they have one
      branchId = requestedBranchId || userBranchId || undefined;
      // If no branchId provided, return list of branches for admin to select
      if (!branchId) {
        const branches = await getAllBranchesWithStatistics();
        res.json({
          branches: branches.map((b) => ({
            id: b.branch_id,
            name: b.branch_name,
            location: b.location,
            statistics: {
              totalStock: Number(b.total_stock),
              totalValue: Number(b.total_value),
              lowStockCount: Number(b.low_stock_count),
              pendingTransfersCount: Number(b.pending_transfers_count),
              lastRestockedAt: b.last_restocked_at,
            },
          })),
          requiresSelection: true,
        });
        return;
      }
    } else {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Verify branch exists
    const branch = await getBranchById(branchId);
    if (!branch) {
      res.status(404).json({ message: 'Branch not found' });
      return;
    }

    // Verify sub-admin can only access their branch
    if (userRole === 'sub_admin' && branchId !== userBranchId) {
      res.status(403).json({ message: 'Access denied to this branch' });
      return;
    }

    // Fetch all dashboard data in parallel
    const [stockSummary, lowStockItems, pendingTransfers, dailyOut, recentActivity] = await Promise.all([
      getBranchStockSummary(branchId),
      getLowStockItems(branchId),
      getPendingTransfersForBranch(branchId),
      getBranchDailyOutQuantity(branchId, new Date()),
      getActivityLogsByBranch(branchId, 10),
    ]);

    res.json({
      branch: {
        id: branch.id,
        name: branch.name,
        location: branch.location,
        isMainHub: branch.is_main_hub,
      },
      stock: {
        totalStock: stockSummary.total_stock,
        totalValue: stockSummary.total_value,
        lowStockCount: stockSummary.low_stock_count,
        categoryBreakdown: stockSummary.category_breakdown,
        lowStockItems: lowStockItems.map((item) => ({
          id: item.id,
          productName: item.product_name,
          quantity: item.quantity,
          minimumThreshold: item.minimum_threshold || 0,
          unit: item.unit,
        })),
      },
      transfers: {
        pendingCount: pendingTransfers.length,
        pendingTransfers: pendingTransfers.map((t) => ({
          id: t.id,
          productName: t.product_name,
          quantity: t.quantity,
          unit: t.unit,
          status: t.status,
          createdAt: t.created_at,
        })),
      },
      dailySales: {
        quantity: dailyOut,
        date: new Date().toISOString().split('T')[0],
      },
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        actionType: log.action_type,
        entityType: log.entity_type,
        performedBy: log.user_username ?? 'System',
        createdAt: log.created_at,
        details: log.details,
      })),
      isAdminView: userRole === 'admin' || userRole === 'staff',
    });
  } catch (error) {
    logger.error('Get branch dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all branches with statistics (admin only)
 */
export const getAllBranchesDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin' && userRole !== 'staff') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const branches = await getAllBranchesWithStatistics();

    res.json({
      branches: branches.map((b) => ({
        id: b.branch_id,
        name: b.branch_name,
        location: b.location,
        statistics: {
          totalStock: Number(b.total_stock),
          totalValue: Number(b.total_value),
          lowStockCount: Number(b.low_stock_count),
          pendingTransfersCount: Number(b.pending_transfers_count),
          lastRestockedAt: b.last_restocked_at,
        },
      })),
    });
  } catch (error) {
    logger.error('Get all branches dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

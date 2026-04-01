import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  getDailyReportByBranchAndDate,
  getAllDailyReports,
  createDailyReportWithChecklists,
  getDailyReportWithChecklists,
  getReportStatistics,
} from '../repositories/dailyReportRepository';
import {
  getBranchStockSummary,
  adjustStockQuantity,
  findStockByProductAndBranch,
} from '../repositories/stockRepository';
import { getReceivedTransfersForBranchOnDate } from '../repositories/stockTransferRepository';
import { createStockTransaction } from '../repositories/stockTransactionRepository';
import { createActivityLog } from '../repositories/activityLogRepository';
import { getDueCustomersForDate } from '../repositories/customerRepository';
import { withTransaction } from '../utils/transaction';
import logger from '../utils/logger';

/**
 * Assert that user has access to the branch
 */
const assertBranchAccess = (req: AuthRequest, branchId: string): void => {
  if (req.user?.role === 'sub_admin' && req.user.branch_id !== branchId) {
    throw new Error('ACCESS_DENIED');
  }
};

/**
 * Get report preparation data (due customers, received stock, current stock)
 */
export const getReportPreparationData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branchId = req.query.branchId as string | undefined;
    const dateStr = req.query.date as string | undefined;
    const userBranchId = req.user?.branch_id;
    const userRole = req.user?.role;

    let targetBranchId: string | undefined;

    if (userRole === 'sub_admin') {
      if (!userBranchId) {
        res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
        return;
      }
      targetBranchId = userBranchId;
    } else if (userRole === 'admin' || userRole === 'staff') {
      targetBranchId = branchId || userBranchId || undefined;
      if (!targetBranchId) {
        res.status(400).json({ message: 'branchId query parameter required' });
        return;
      }
    } else {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const targetDate = dateStr ? new Date(dateStr) : new Date();

    // Get due customers
    const dueCustomers = await getDueCustomersForDate(targetBranchId, targetDate);

    // Get current stock for Injera
    const stockSummary = await getBranchStockSummary(targetBranchId);
    const injeraStock = stockSummary.category_breakdown.find((cat) => cat.category === 'Injera');
    const currentStock = injeraStock?.total_quantity || 0;

    // Get received injera from transfers on the target date
    const receivedTransfers = await getReceivedTransfersForBranchOnDate(targetBranchId, targetDate);
    const receivedToday = receivedTransfers
      .filter((t) => t.category === 'Injera')
      .reduce((sum, t) => sum + t.quantity, 0);

    // Determine starting stock: yesterday's remaining or live stock as fallback
    const yesterday = new Date(targetDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayReport = await getDailyReportByBranchAndDate(targetBranchId, yesterday);
    const startingStock = yesterdayReport ? yesterdayReport.remaining_injera : currentStock;

    // Check if report already exists for the target date
    const existingReport = await getDailyReportByBranchAndDate(targetBranchId, targetDate);

    res.json({
      dueCustomers,
      currentStock,
      startingStock,
      receivedToday,
      existingReport: existingReport ? { id: existingReport.id, submittedAt: existingReport.created_at } : null,
    });
  } catch (error) {
    logger.error('Get report preparation data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Submit daily report
 */
export const submitDailyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      branchId,
      reportDate,
      receivedInjera,
      soldInjera,
      remainingInjera,
      wastedInjera,
      totalRevenue,
      notes,
      checklists,
    } = req.body;

    const userBranchId = req.user?.branch_id;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    let targetBranchId: string | undefined;

    if (userRole === 'sub_admin') {
      if (!userBranchId) {
        res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
        return;
      }
      targetBranchId = userBranchId;
    } else if (userRole === 'admin' || userRole === 'staff') {
      targetBranchId = branchId || userBranchId;
      if (!targetBranchId) {
        res.status(400).json({ message: 'branchId is required' });
        return;
      }
    } else {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Validate: sold + wasted + remaining should equal received + starting stock
    const reportDateObj = reportDate ? new Date(reportDate) : new Date();
    const yesterday = new Date(reportDateObj);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayReport = await getDailyReportByBranchAndDate(targetBranchId, yesterday);

    let startingStock: number;
    if (yesterdayReport) {
      startingStock = yesterdayReport.remaining_injera;
    } else {
      const liveStockSummary = await getBranchStockSummary(targetBranchId);
      const liveInjeraStock = liveStockSummary.category_breakdown.find(cat => cat.category === 'Injera');
      startingStock = liveInjeraStock?.total_quantity || 0;
    }

    const expectedTotal = receivedInjera + startingStock;
    const actualTotal = soldInjera + wastedInjera + remainingInjera;

    if (Math.abs(expectedTotal - actualTotal) > 1) {
      // Allow 1 unit difference for rounding
      res.status(400).json({
        message: `Stock validation failed: Expected total ${expectedTotal} (received: ${receivedInjera} + starting: ${startingStock}), but got ${actualTotal} (sold: ${soldInjera} + wasted: ${wastedInjera} + remaining: ${remainingInjera})`,
      });
      return;
    }

    // Check if report already exists
    const existingReport = await getDailyReportByBranchAndDate(targetBranchId, reportDateObj);
    if (existingReport) {
      res.status(400).json({ message: 'Report already exists for this date' });
      return;
    }

    // Create report with stock deductions in transaction
    const report = await withTransaction(async (client) => {
      // Create report and checklists
      const newReport = await createDailyReportWithChecklists(
        {
          branch_id: targetBranchId,
          report_date: reportDateObj,
          received_injera: receivedInjera,
          sold_injera: soldInjera,
          remaining_injera: remainingInjera,
          wasted_injera: wastedInjera,
          total_revenue: totalRevenue,
          submitted_by: userId,
          notes: notes || null,
          checklists: (checklists || []).map((c: any) => ({
            customer_id: c.customer_id || c.customerId,
            delivered: c.delivered,
            quantity_delivered: c.quantity_delivered ?? c.quantityDelivered ?? 0,
            comment: c.comment,
          })),
        },
        client
      );

      // Deduct sold and wasted stock from Injera stock
      const injeraStock = await findStockByProductAndBranch('Injera', targetBranchId, client);
      if (injeraStock) {
        const totalToDeduct = soldInjera + wastedInjera;
        if (totalToDeduct > 0) {
          const beforeQuantity = injeraStock.quantity;
          const updatedStock = await adjustStockQuantity(injeraStock.id, -totalToDeduct, client);
          if (!updatedStock) {
            throw new Error('INSUFFICIENT_STOCK');
          }

          // Log stock transactions
          await createStockTransaction(
            {
              stock_id: injeraStock.id,
              transaction_type: 'out',
              quantity_change: -soldInjera,
              quantity_before: beforeQuantity,
              quantity_after: updatedStock.quantity,
              performed_by: userId,
              reason: `Daily report: Sold ${soldInjera} units`,
            },
            client
          );

          if (wastedInjera > 0) {
            await createStockTransaction(
              {
                stock_id: injeraStock.id,
                transaction_type: 'out',
                quantity_change: -wastedInjera,
                quantity_before: updatedStock.quantity,
                quantity_after: updatedStock.quantity - wastedInjera,
                performed_by: userId,
                reason: `Daily report: Wasted ${wastedInjera} units`,
              },
              client
            );
          }
        }
      }

      // Log activity
      await createActivityLog(
        {
          user_id: userId,
          action_type: 'daily_report_submitted',
          entity_type: 'daily_report',
          entity_id: parseInt(newReport.id.slice(0, 8), 16),
          details: {
            branch_id: targetBranchId,
            report_date: reportDateObj.toISOString().split('T')[0],
            sold_injera: soldInjera,
            total_revenue: totalRevenue,
          },
        },
        client
      );

      return newReport;
    });

    logger.info(`Daily report submitted for branch ${targetBranchId} on ${reportDateObj.toISOString().split('T')[0]}`);
    res.status(201).json(report);
  } catch (error: any) {
    if (error.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ message: 'Insufficient stock for this report' });
      return;
    }
    logger.error('Submit daily report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDailyReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branchId = req.query.branchId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const userBranchId = req.user?.branch_id;
    const userRole = req.user?.role;

    let targetBranchId: string | undefined;

    if (userRole === 'sub_admin') {
      if (!userBranchId) {
        res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
        return;
      }
      targetBranchId = userBranchId;
    } else if (userRole === 'admin' || userRole === 'staff') {
      targetBranchId = branchId;
    } else {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const reports = await getAllDailyReports(
      targetBranchId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit,
      offset
    );

    res.json(reports);
  } catch (error) {
    logger.error('Get daily reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDailyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const report = await getDailyReportWithChecklists(id);

    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    // Check access
    assertBranchAccess(req, report.branch_id);

    res.json(report);
  } catch (error: any) {
    if (error.message === 'ACCESS_DENIED') {
      res.status(403).json({ message: 'Access denied to this report' });
      return;
    }
    logger.error('Get daily report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getReportAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin' && userRole !== 'staff') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const branchId = req.query.branchId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const statistics = await getReportStatistics(
      branchId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    res.json(statistics);
  } catch (error) {
    logger.error('Get report analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

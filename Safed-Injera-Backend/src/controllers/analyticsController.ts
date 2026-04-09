import { Response } from 'express';
import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';
import logger from '../utils/logger';
import {
  getSalesByProductSince,
  getSalesByProductAllTime,
  getSalesByProductInDateRange,
  getDailyBreakdown,
  getDailyBreakdownInDateRange,
  getRevenueSince,
  getRecentOrders,
  countOrders,
  countOrdersByStatus,
  countOrdersSince,
  getOrders as getOrdersRepo,
  getOrderStatusBreakdown,
  getTopCustomersByOrderCount,
  getBusinessTypeBreakdown,
  sumDeliveredQuantitySince,
  type AnalyticsDateRange,
} from '../repositories/orderRepository';
import { getStocks, getLowStockItems } from '../repositories/stockRepository';
import { getMainHubBranch } from '../repositories/branchRepository';
import { getDispatchedQuantityFromBranchSince } from '../repositories/stockTransferRepository';
import { transformOrder, transformStock } from '../utils/transform';
import { AuthRequest } from '../middleware/authMiddleware';
import { REVENUE_ORDER_STATUSES } from '../constants/orderConstants';

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Default: last 30 days inclusive. Pass all=true for no date filter, or from & to (YYYY-MM-DD).
 */
function resolveAnalyticsDateRange(req: AuthRequest): { range: AnalyticsDateRange } | { error: string } {
  const all = req.query.all === 'true' || req.query.all === '1';
  if (all) {
    return { range: { allTime: true } };
  }

  const fromQ = typeof req.query.from === 'string' ? req.query.from : '';
  const toQ = typeof req.query.to === 'string' ? req.query.to : '';

  if (fromQ && toQ) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fromQ) || !/^\d{4}-\d{2}-\d{2}$/.test(toQ)) {
      return { error: 'Invalid date format. Use YYYY-MM-DD.' };
    }
    if (fromQ > toQ) {
      return { error: 'from must be before or equal to to' };
    }
    return { range: { allTime: false, from: fromQ, to: toQ } };
  }

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  return { range: { allTime: false, from: formatYmd(start), to: formatYmd(end) } };
}

// @desc    Get sales analysis
// @route   GET /api/analytics/sales
// @access  Private
export const getSalesAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branchId = req.user?.role === 'sub_admin' ? req.user.branch_id ?? undefined : undefined;
    if (req.user?.role === 'sub_admin' && !branchId) {
      res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
      return;
    }

    const statuses = [...REVENUE_ORDER_STATUSES];
    const explicitRange =
      req.query.all === 'true' ||
      req.query.all === '1' ||
      (typeof req.query.from === 'string' && typeof req.query.to === 'string' && req.query.from && req.query.to);

    if (explicitRange) {
      const resolved = resolveAnalyticsDateRange(req);
      if ('error' in resolved) {
        res.status(400).json({ message: resolved.error });
        return;
      }
      const { range } = resolved;
      let productSales;
      let dailyBreakdown;
      if (range.allTime) {
        productSales = await getSalesByProductAllTime(statuses, branchId);
        dailyBreakdown = await getDailyBreakdown(
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          statuses,
          branchId
        );
      } else {
        productSales = await getSalesByProductInDateRange(range.from!, range.to!, statuses, branchId);
        dailyBreakdown = await getDailyBreakdownInDateRange(range.from!, range.to!, statuses, branchId);
      }
      res.json({
        period: 'range',
        range,
        startDate: range.allTime ? null : range.from,
        endDate: range.allTime ? null : range.to,
        productSales,
        dailyBreakdown,
      });
      return;
    }

    const { period } = req.query; // 'daily', 'weekly', 'monthly'
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'daily':
      default:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
    }
    const sales = await getSalesByProductSince(startDate, statuses, branchId);
    const dailyBreakdown = await getDailyBreakdown(
      new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      statuses,
      branchId
    );
    res.json({
      period,
      startDate,
      productSales: sales,
      dailyBreakdown,
    });
  } catch (error) {
    logger.error('Sales analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Order insights for analytics UI (status mix, top customers, business types)
// @route   GET /api/analytics/insights
// @access  Private
export const getAnalyticsInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branchId = req.user?.role === 'sub_admin' ? req.user.branch_id ?? undefined : undefined;
    if (req.user?.role === 'sub_admin' && !branchId) {
      res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
      return;
    }

    const resolved = resolveAnalyticsDateRange(req);
    if ('error' in resolved) {
      res.status(400).json({ message: resolved.error });
      return;
    }
    const { range } = resolved;

    const [statusBreakdown, topCustomers, businessTypeBreakdown] = await Promise.all([
      getOrderStatusBreakdown(branchId, range),
      getTopCustomersByOrderCount(10, branchId, range),
      getBusinessTypeBreakdown(branchId, range),
    ]);

    res.json({
      range,
      statusBreakdown,
      topCustomers,
      businessTypeBreakdown,
    });
  } catch (error) {
    logger.error('Analytics insights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard overview
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branchId = req.user?.role === 'sub_admin' ? req.user.branch_id ?? undefined : undefined;
    if (req.user?.role === 'sub_admin' && !branchId) {
      res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
      return;
    }
    const totalOrders = await countOrders(branchId);
    const pendingOrders = await countOrdersByStatus('pending', branchId);
    const completedOrders = await countOrdersByStatus('delivered', branchId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await countOrdersSince(today, branchId);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekOrders = await countOrdersSince(weekAgo, branchId);

    let lowStockItems;
    if (branchId) {
      lowStockItems = await getLowStockItems(branchId);
    } else {
      const mainHub = await getMainHubBranch();
      if (mainHub) {
        const [hubItems, globalItems] = await Promise.all([
          getLowStockItems(mainHub.id),
          getLowStockItems(null),
        ]);
        lowStockItems = Array.from(
          new Map([...hubItems, ...globalItems].map((item) => [item.id, item])).values()
        );
      } else {
        lowStockItems = await getLowStockItems(null);
      }
    }

    const revenue = await getRevenueSince([...REVENUE_ORDER_STATUSES], branchId);
    const recentOrders = (await getRecentOrders(branchId)).map(transformOrder);
    const transformedLowStockItems = lowStockItems.map(transformStock);

    let dispatchSoldThisWeek = 0;
    let directRetailSoldThisWeek = 0;
    if (branchId) {
      dispatchSoldThisWeek = await getDispatchedQuantityFromBranchSince(branchId, weekAgo);
      directRetailSoldThisWeek = await sumDeliveredQuantitySince(weekAgo, { branchId });
    } else {
      const mainHub = await getMainHubBranch();
      dispatchSoldThisWeek = mainHub
        ? await getDispatchedQuantityFromBranchSince(mainHub.id, weekAgo)
        : 0;
      directRetailSoldThisWeek = await sumDeliveredQuantitySince(weekAgo, { hubDirectOnly: true });
    }

    res.json({
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        today: todayOrders,
        thisWeek: weekOrders,
      },
      soldKpis: {
        internalDispatchThisWeek: dispatchSoldThisWeek,
        directRetailThisWeek: directRetailSoldThisWeek,
      },
      revenue,
      lowStockAlerts: transformedLowStockItems.length,
      lowStockItems: transformedLowStockItems,
      recentOrders,
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export data to CSV
// @route   GET /api/analytics/export?format=csv
// @access  Private
export const exportData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { format, type } = req.query; // format: csv, pdf, excel; type: orders, stock
    const branchId = req.user?.role === 'sub_admin' ? req.user.branch_id ?? undefined : undefined;
    if (req.user?.role === 'sub_admin' && !branchId) {
      res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
      return;
    }
    let data: any[];
    if (type === 'stock') {
      const { rows: stocks } = await getStocks({});
      data = stocks.map(transformStock);
    } else {
      const { rows } = await getOrdersRepo(branchId ? { branchId } : {});
      data = rows.map(transformOrder);
    }
    const filename = `safed-injera-${type || 'orders'}-${new Date().toISOString().split('T')[0]}`;
    switch (format) {
      case 'csv':
        exportCSV(res, data, filename);
        break;
      case 'pdf':
        exportPDF(res, data, filename, type as string);
        break;
      case 'excel':
        exportExcel(res, data, filename);
        break;
      default:
        res.status(400).json({ message: 'Invalid format. Use csv, pdf, or excel.' });
    }
  } catch (error) {
    logger.error('Export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// CSV Export
const exportCSV = (res: Response, data: any[], filename: string): void => {
  if (data.length === 0) {
    res.status(404).json({ message: 'No data to export' });
    return;
  }

  const headers = Object.keys(data[0]).filter(key => key !== '_id' && key !== '__v');
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        let value = row[header];
        if (value instanceof Date) {
          value = value.toISOString();
        }
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value ?? '';
      }).join(',')
    ),
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
  res.send(csvRows.join('\n'));
};

// PDF Export
const exportPDF = (res: Response, data: any[], filename: string, type: string): void => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);

  doc.pipe(res);

  // Header
  doc.fontSize(24).fillColor('#4E1815').text('Safed Injera', { align: 'center' });
  doc.fontSize(14).fillColor('#A89688').text(`${type === 'stock' ? 'Stock' : 'Sales'} Report`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).fillColor('#666').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);

  // Content
  doc.fontSize(12).fillColor('#4E1815');

  if (type === 'stock') {
    doc.text('Product Name | Quantity | Price | Category', { underline: true });
    doc.moveDown();
    data.forEach(item => {
      doc.fontSize(10).fillColor('#333')
        .text(`${item.productName} | ${item.quantity} | ${item.price} ETB | ${item.category}`);
    });
  } else {
    doc.text('Customer | Product | Qty | Status | Date', { underline: true });
    doc.moveDown();
    data.slice(0, 50).forEach(order => {
      doc.fontSize(10).fillColor('#333')
        .text(`${order.customerName} | ${order.product} | ${order.quantity} | ${order.status} | ${new Date(order.orderDate).toLocaleDateString()}`);
    });
  }

  // Summary
  doc.moveDown(2);
  doc.fontSize(12).fillColor('#4E1815').text(`Total Records: ${data.length}`);

  doc.end();
};

// Excel Export
const exportExcel = (res: Response, data: any[], filename: string): void => {
  const cleanedData = data.map(item => {
    const { _id, __v, ...rest } = item;
    return rest;
  });

  const ws = XLSX.utils.json_to_sheet(cleanedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
  res.send(buffer);
};



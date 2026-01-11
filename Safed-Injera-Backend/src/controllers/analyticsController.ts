import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';
import logger from '../utils/logger';
import {
  getSalesByProductSince,
  getDailyBreakdown,
  getRevenueSince,
  getRecentOrders,
  countOrders,
  countOrdersByStatus,
  countOrdersSince,
} from '../repositories/orderRepository';
import { getStocks, findStockById, getLowStockItems } from '../repositories/stockRepository';
import { transformStock, toCamelCase } from '../utils/transform';

// @desc    Get sales analysis
// @route   GET /api/analytics/sales
// @access  Private
export const getSalesAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
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
    const statuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    const sales = await getSalesByProductSince(startDate, statuses);
    const dailyBreakdown = await getDailyBreakdown(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), statuses);
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

// @desc    Get dashboard overview
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalOrders = await countOrders();
    const pendingOrders = await countOrdersByStatus('pending');
    const completedOrders = await countOrdersByStatus('delivered');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await countOrdersSince(today);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekOrders = await countOrdersSince(weekAgo);
    const lowStockItems = await getLowStockItems();
    const revenue = await getRevenueSince(['confirmed', 'processing', 'shipped', 'delivered']);
    const recentOrders = await getRecentOrders();
    res.json({
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        today: todayOrders,
        thisWeek: weekOrders,
      },
      revenue,
      lowStockAlerts: lowStockItems.length,
      lowStockItems: lowStockItems.map(item => ({
        productName: item.product_name,
        quantity: item.quantity,
        minimumThreshold: item.minimum_threshold,
      })),
      recentOrders: toCamelCase(recentOrders),
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export data to CSV
// @route   GET /api/analytics/export?format=csv
// @access  Private
export const exportData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { format, type } = req.query; // format: csv, pdf, excel; type: orders, stock
    let data: any[];
    if (type === 'stock') {
      data = await getStocks({});
    } else {
      // Use getOrdersRepo to fetch all orders for export
      const { rows } = await require('../repositories/orderRepository').getOrders({});
      data = rows;
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



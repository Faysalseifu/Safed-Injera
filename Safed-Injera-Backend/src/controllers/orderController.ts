import { Response } from 'express';
import type { PoolClient } from 'pg';
import {
  countOrders,
  countOrdersByStatus,
  countOrdersSince,
  createOrder as insertOrder,
  deleteOrder as removeOrder,
  getOrderById,
  getOrders as getOrdersRepo,
  updateOrder as updateOrderRecord,
  type OrderRecord,
} from '../repositories/orderRepository';
import {
  adjustStockQuantity,
  findStockByName,
  findStockByProductAndBranch,
  type StockRecord,
} from '../repositories/stockRepository';
import { getMainHubBranch } from '../repositories/branchRepository';
import { createStockTransaction } from '../repositories/stockTransactionRepository';
import { sendOrderNotification } from '../utils/email';
import { withTransaction } from '../utils/transaction';
import logger from '../utils/logger';
import { transformOrder, transformOrderInput } from '../utils/transform';
import { AuthRequest } from '../middleware/authMiddleware';
import { DEFAULT_ORDER_LIST_DAYS } from '../constants/orderConstants';

const parseOrderId = (idParam: string): number | null => {
  const parsed = Number(idParam);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Stock row used when marking an order delivered / reverting / deleting.
 *
 * Hub-scoped orders (`branch_id` null, or branch is the main hub): try that branch row, then legacy
 * `branch_id IS NULL` stock, then main hub id, then a fuzzy name match (single-site / legacy data).
 *
 * Sub-branch orders: **only** that branch’s stock row. We intentionally do not fall back to main hub
 * or unscoped rows — that previously deducted hub inventory for branch deliveries and made hub vs
 * branch counts disagree.
 */
async function resolveStockForOrderFulfillment(
  product: string,
  orderBranchId: string | null,
  client?: PoolClient
): Promise<StockRecord | null> {
  const mainHub = await getMainHubBranch();
  const mainHubId = mainHub?.id ?? null;
  const treatsAsHub =
    orderBranchId == null || (mainHubId != null && orderBranchId === mainHubId);

  if (orderBranchId) {
    const atBranch = await findStockByProductAndBranch(product, orderBranchId, client);
    if (atBranch) return atBranch;
    if (!treatsAsHub) {
      return null;
    }
  }

  const legacy = await findStockByProductAndBranch(product, null, client);
  if (legacy) return legacy;

  if (mainHubId) {
    const atMainHub = await findStockByProductAndBranch(product, mainHubId, client);
    if (atMainHub) return atMainHub;
  }

  return findStockByName(product, client);
}

/** Price lookup when creating an order — branch row first; sub-branches may fall back to hub/legacy for price only (not for fulfillment). */
async function resolveStockForOrderPricing(
  product: string,
  orderBranchId: string | null,
  client?: PoolClient
): Promise<StockRecord | null> {
  const mainHub = await getMainHubBranch();
  const mainHubId = mainHub?.id ?? null;
  const treatsAsHub =
    orderBranchId == null || (mainHubId != null && orderBranchId === mainHubId);

  if (orderBranchId) {
    const atBranch = await findStockByProductAndBranch(product, orderBranchId, client);
    if (atBranch) return atBranch;
    if (!treatsAsHub) {
      if (mainHubId) {
        const atHub = await findStockByProductAndBranch(product, mainHubId, client);
        if (atHub) return atHub;
      }
      const legacy = await findStockByProductAndBranch(product, null, client);
      if (legacy) return legacy;
      return findStockByName(product, client);
    }
  }

  const legacy = await findStockByProductAndBranch(product, null, client);
  if (legacy) return legacy;

  if (mainHubId) {
    const atMainHub = await findStockByProductAndBranch(product, mainHubId, client);
    if (atMainHub) return atMainHub;
  }

  return findStockByName(product, client);
}

function parseOrderListDateFilters(req: AuthRequest): {
  orderDateFrom?: Date;
  orderDateTo?: Date;
} {
  const includeAll = req.query.includeAll === 'true' || req.query.includeAll === '1';
  const fromDateStr = typeof req.query.fromDate === 'string' ? req.query.fromDate : undefined;
  const toDateStr = typeof req.query.toDate === 'string' ? req.query.toDate : undefined;
  const maxAgeDaysRaw = req.query.maxAgeDays;
  const maxAgeDays =
    typeof maxAgeDaysRaw === 'string' && maxAgeDaysRaw !== '' ? Number(maxAgeDaysRaw) : undefined;

  if (includeAll) {
    return {};
  }

  let orderDateFrom: Date | undefined;
  let orderDateTo: Date | undefined;

  if (fromDateStr) {
    orderDateFrom = new Date(fromDateStr);
    orderDateFrom.setHours(0, 0, 0, 0);
  } else if (maxAgeDays !== undefined && !Number.isNaN(maxAgeDays) && maxAgeDays >= 0) {
    const d = new Date();
    d.setDate(d.getDate() - maxAgeDays);
    d.setHours(0, 0, 0, 0);
    orderDateFrom = d;
  } else {
    const d = new Date();
    d.setDate(d.getDate() - DEFAULT_ORDER_LIST_DAYS);
    d.setHours(0, 0, 0, 0);
    orderDateFrom = d;
  }

  if (toDateStr) {
    orderDateTo = new Date(toDateStr);
    orderDateTo.setHours(23, 59, 59, 999);
  }

  return { orderDateFrom, orderDateTo };
}

function canAccessOrder(req: AuthRequest, order: OrderRecord): boolean {
  if (req.user?.role !== 'sub_admin') {
    return true;
  }
  const bid = req.user.branch_id;
  if (!bid) {
    return false;
  }
  return order.branch_id === bid;
}

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      status,
      businessType,
      search,
      customerName,
      sort,
      _sort,
      _order,
      _start,
      _end,
      branchId: branchIdQuery,
    } = req.query;

    const parsedStart = _start ? Number(_start) : undefined;
    const parsedEnd = _end ? Number(_end) : undefined;

    const searchTerm =
      typeof search === 'string' ? search : typeof customerName === 'string' ? customerName : undefined;

    const { orderDateFrom, orderDateTo } = parseOrderListDateFilters(req);

    let branchFilter: string | undefined;
    if (req.user?.role === 'sub_admin') {
      branchFilter = req.user.branch_id ?? undefined;
      if (!branchFilter) {
        res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
        return;
      }
    } else if (typeof branchIdQuery === 'string' && branchIdQuery.trim()) {
      branchFilter = branchIdQuery.trim();
    }

    const options = {
      status: typeof status === 'string' ? status : undefined,
      businessType: typeof businessType === 'string' ? businessType : undefined,
      search: searchTerm,
      sort: _sort ? String(_sort) : undefined,
      order: (typeof _order === 'string' && (_order === 'ASC' || _order === 'DESC') ? _order : undefined) as
        | 'ASC'
        | 'DESC'
        | undefined,
      _start: typeof parsedStart === 'number' ? parsedStart : undefined,
      _end: typeof parsedEnd === 'number' ? parsedEnd : undefined,
      branchId: branchFilter,
      orderDateFrom,
      orderDateTo,
    };

    if (!options.sort && sort === 'date') {
      options.sort = 'orderDate';
    }

    const { rows, total } = await getOrdersRepo(options);

    const startIndex = options._start ?? 0;
    const endIndex = rows.length ? startIndex + rows.length - 1 : startIndex;

    const transformedOrders = rows.map(transformOrder);

    res.set('Content-Range', `orders ${startIndex}-${endIndex}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(transformedOrders);
  } catch (error) {
    logger.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = parseOrderId(req.params.id);
    if (!orderId) {
      res.status(400).json({ message: 'Invalid order id' });
      return;
    }

    const order = await getOrderById(orderId);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    if (!canAccessOrder(req, order)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json(transformOrder(order));
  } catch (error) {
    logger.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      email,
      phone,
      businessType,
      product,
      quantity,
      message,
      branchId: branchIdBody,
    } = req.body;

    const quantityNumber = Math.max(Number(quantity) || 1, 1);
    const productName = typeof product === 'string' && product.trim().length > 0 ? product : 'Pure Teff Injera';

    let branchId: string | null = null;
    if (req.user?.role === 'sub_admin' && req.user.branch_id) {
      branchId = req.user.branch_id;
    } else if (
      (req.user?.role === 'admin' || req.user?.role === 'staff') &&
      typeof branchIdBody === 'string' &&
      branchIdBody.trim()
    ) {
      branchId = branchIdBody.trim();
    }

    const order = await withTransaction(async (client) => {
      const stockItem = await resolveStockForOrderPricing(productName, branchId, client);
      const totalPrice = stockItem ? Number(Number(stockItem.price) * quantityNumber) : undefined;

      const payload = {
        customer_name: customerName,
        email,
        phone,
        business_type: businessType,
        product: productName,
        quantity: quantityNumber,
        message,
        total_price: totalPrice,
        branch_id: branchId,
      };

      const createdOrder = await insertOrder(payload, client);

      return createdOrder;
    });

    try {
      await sendOrderNotification({
        customerName,
        email,
        businessType,
        product: productName,
        quantity: quantityNumber,
        message,
      });
    } catch (emailError) {
      logger.error('Failed to send order notification email:', emailError);
    }

    logger.info(`New order created: ${order.id} from ${customerName}`);
    res.status(201).json({ message: 'Order created successfully', order: transformOrder(order) });
  } catch (error: any) {
    if (error?.message?.startsWith('INSUFFICIENT_STOCK:')) {
      const [, name, available, requested] = error.message.split(':');
      res.status(400).json({
        message: `Insufficient stock for ${name}. Available: ${available}, requested: ${requested}`,
      });
      return;
    }
    logger.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = parseOrderId(req.params.id);
    if (!orderId) {
      res.status(400).json({ message: 'Invalid order id' });
      return;
    }

    const newStatus = req.body?.status;
    const existingOrder = await getOrderById(orderId);
    if (!existingOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    if (!canAccessOrder(req, existingOrder)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const dbInput = transformOrderInput(req.body);

    let updated: OrderRecord | null;

    try {
      updated = await withTransaction(async (client) => {
        const stockItem = await resolveStockForOrderFulfillment(
          existingOrder.product,
          existingOrder.branch_id,
          client
        );

        if (newStatus === 'delivered' && existingOrder.status !== 'delivered') {
          if (!stockItem) {
            throw new Error('NO_STOCK_ROW');
          }
          if (stockItem.quantity < existingOrder.quantity) {
            throw new Error('INSUFFICIENT_STOCK');
          }
          const updatedStock = await adjustStockQuantity(stockItem.id, -existingOrder.quantity, client);
          if (!updatedStock) {
            throw new Error('INSUFFICIENT_STOCK');
          }
          await createStockTransaction(
            {
              stock_id: stockItem.id,
              transaction_type: 'out',
              quantity_change: -existingOrder.quantity,
              quantity_before: stockItem.quantity,
              quantity_after: updatedStock.quantity,
              reason: `Order #${orderId} delivered - stock deducted`,
            },
            client
          );
        }

        if (existingOrder.status === 'delivered' && newStatus !== 'delivered' && newStatus !== undefined) {
          if (!stockItem) {
            throw new Error('NO_STOCK_ROW');
          }
          const updatedStock = await adjustStockQuantity(stockItem.id, existingOrder.quantity, client);
          if (!updatedStock) {
            throw new Error('STOCK_ADJUST_FAILED');
          }
          await createStockTransaction(
            {
              stock_id: stockItem.id,
              transaction_type: 'in',
              quantity_change: existingOrder.quantity,
              quantity_before: stockItem.quantity,
              quantity_after: updatedStock.quantity,
              reason: `Order #${orderId} reverted from delivered - stock restored`,
            },
            client
          );
        }

        return updateOrderRecord(orderId, dbInput, client);
      });
    } catch (e: any) {
      if (e?.message === 'INSUFFICIENT_STOCK') {
        res.status(400).json({
          message: 'Insufficient stock to mark this order as delivered',
        });
        return;
      }
      if (e?.message === 'NO_STOCK_ROW') {
        res.status(400).json({
          message: 'No stock record found for this product at the fulfilling location',
        });
        return;
      }
      if (e?.message === 'STOCK_ADJUST_FAILED') {
        res.status(500).json({ message: 'Could not adjust stock' });
        return;
      }
      throw e;
    }

    if (!updated) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    logger.info(`Order ${orderId} updated: ${req.body.status ?? 'status unchanged'}`);
    res.json(transformOrder(updated));
  } catch (error) {
    logger.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = parseOrderId(req.params.id);
    if (!orderId) {
      res.status(400).json({ message: 'Invalid order id' });
      return;
    }

    const existing = await getOrderById(orderId);
    if (existing && !canAccessOrder(req, existing)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    await withTransaction(async (client) => {
      const order = await getOrderById(orderId, client);
      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      const stockItem = await resolveStockForOrderFulfillment(order.product, order.branch_id, client);

      if (stockItem && order.quantity > 0 && order.status === 'delivered') {
        const updatedStock = await adjustStockQuantity(stockItem.id, order.quantity, client);
        if (updatedStock) {
          await createStockTransaction(
            {
              stock_id: stockItem.id,
              transaction_type: 'in',
              quantity_change: order.quantity,
              quantity_before: stockItem.quantity,
              quantity_after: updatedStock.quantity,
              reason: `Order #${orderId} deleted - stock reversal`,
            },
            client
          );
        }
      }

      const deleted = await removeOrder(orderId, client);
      if (!deleted) {
        throw new Error('ORDER_NOT_FOUND');
      }
    });

    logger.info(`Order deleted: ${orderId}`);
    res.json({ message: 'Order deleted', id: orderId });
  } catch (error: any) {
    if (error?.message === 'ORDER_NOT_FOUND') {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    logger.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrderStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branchId = req.user?.role === 'sub_admin' ? req.user.branch_id ?? undefined : undefined;
    if (req.user?.role === 'sub_admin' && !branchId) {
      res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
      return;
    }

    const totalOrders = await countOrders(branchId);
    const pendingOrders = await countOrdersByStatus('pending', branchId);
    const confirmedOrders = await countOrdersByStatus('confirmed', branchId);
    const shippedOrders = await countOrdersByStatus('shipped', branchId);
    const deliveredOrders = await countOrdersByStatus('delivered', branchId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await countOrdersSince(today, branchId);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekOrders = await countOrdersSince(weekAgo, branchId);

    res.json({
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      todayOrders,
      weekOrders,
    });
  } catch (error) {
    logger.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

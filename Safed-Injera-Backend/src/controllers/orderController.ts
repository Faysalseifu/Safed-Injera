import { Request, Response } from 'express';
import {
  countOrders,
  countOrdersByStatus,
  countOrdersSince,
  createOrder as insertOrder,
  deleteOrder as removeOrder,
  getOrderById,
  getOrders as getOrdersRepo,
  updateOrder as updateOrderRecord,
} from '../repositories/orderRepository';
import {
  adjustStockQuantity,
  findStockByName,
} from '../repositories/stockRepository';
import { createActivityLog } from '../repositories/activityLogRepository';
import { sendOrderNotification } from '../utils/email';
import logger from '../utils/logger';
import { transformOrder, transformOrderInput } from '../utils/transform';
import { AuthRequest } from '../middleware/authMiddleware';

const parseOrderId = (idParam: string): number | null => {
  const parsed = Number(idParam);
  return Number.isNaN(parsed) ? null : parsed;
};

const handleStockStatusChange = async (
  currentOrder: any,
  newStatus: string,
  userId?: string
): Promise<void> => {
  if (!newStatus || newStatus === currentOrder.status) return;

  const isDeductionStatus = (s: string) => s === 'shipped' || s === 'delivered';
  const wasDeducted = isDeductionStatus(currentOrder.status);
  const shouldBeDeducted = isDeductionStatus(newStatus);

  if (!wasDeducted && shouldBeDeducted) {
    const stockItem = await findStockByName(currentOrder.product);
    if (stockItem) {
      const adjusted = await adjustStockQuantity(
        stockItem.id,
        -currentOrder.quantity,
        userId,
        `Order #${currentOrder.id} status changed to ${newStatus}`
      );
      if (adjusted) {
        logger.info(`Stock reduced for order #${currentOrder.id} status ${newStatus}`);
      } else {
        logger.warn(`Could not reduce stock for order #${currentOrder.id} - insufficient quantity or item not found`);
      }
    }
  } else if (wasDeducted && !shouldBeDeducted) {
    const stockItem = await findStockByName(currentOrder.product);
    if (stockItem) {
      await adjustStockQuantity(
        stockItem.id,
        currentOrder.quantity,
        userId,
        `Order #${currentOrder.id} status changed from ${currentOrder.status} to ${newStatus}`
      );
      logger.info(`Stock returned for order #${currentOrder.id} status ${newStatus}`);
    }
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      businessType,
      sort,
      _sort,
      _order,
      _start,
      _end,
    } = req.query;

    const parsedStart = _start ? Number(_start) : undefined;
    const parsedEnd = _end ? Number(_end) : undefined;

    const options = {
      status: typeof status === 'string' ? status : undefined,
      businessType: typeof businessType === 'string' ? businessType : undefined,
      sort: _sort ? String(_sort) : undefined,
      order: (typeof _order === 'string' && (_order === 'ASC' || _order === 'DESC') ? _order : undefined) as 'ASC' | 'DESC' | undefined,
      _start: typeof parsedStart === 'number' ? parsedStart : undefined,
      _end: typeof parsedEnd === 'number' ? parsedEnd : undefined,
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

export const getOrder = async (req: Request, res: Response): Promise<void> => {
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

    res.json(transformOrder(order));
  } catch (error) {
    logger.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      email,
      phone,
      businessType,
      product,
      quantity,
      message,
      status,
    } = req.body;

    const quantityNumber = Math.max(Number(quantity) || 1, 1);
    const productName = typeof product === 'string' && product.trim().length > 0 ? product : 'Pure Teff Injera';

    const stockItem = await findStockByName(productName);
    const totalPrice = stockItem ? Number(Number(stockItem.price) * quantityNumber) : undefined;

    const payload: any = {
      customer_name: customerName,
      email,
      phone,
      business_type: businessType,
      product: productName,
      quantity: quantityNumber,
      message,
      total_price: totalPrice,
      status: status || 'pending',
    };

    const order = await insertOrder(payload);

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
  } catch (error) {
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

    // Get current order to track status changes
    const currentOrder = await getOrderById(orderId);
    if (!currentOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Transform input from camelCase to snake_case for database
    const dbInput = transformOrderInput(req.body);

    // Track status changes
    const userId = req.user?.id;
    if (userId) {
      dbInput.updated_by = userId;
    }

    // Handle status change tracking
    if (req.body.status && req.body.status !== currentOrder.status) {
      const statusHistory = Array.isArray(currentOrder.status_history)
        ? [...currentOrder.status_history]
        : [];

      statusHistory.push({
        from: currentOrder.status,
        to: req.body.status,
        changed_by: userId,
        changed_at: new Date().toISOString(),
      });

      dbInput.status_history = statusHistory;

      // Log activity
      try {
        await createActivityLog({
          user_id: userId,
          action_type: 'order_status_changed',
          entity_type: 'order',
          entity_id: orderId,
          details: {
            from: currentOrder.status,
            to: req.body.status,
            order_id: orderId,
          },
        });
      } catch (logError) {
        logger.warn('Failed to create activity log:', logError);
      }

      // Handle stock adjustment
      await handleStockStatusChange(currentOrder, req.body.status, userId);
    }

    const updated = await updateOrderRecord(orderId, dbInput);
    if (!updated) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    logger.info(`Order ${orderId} updated: ${req.body.status ?? 'status unchanged'} by ${userId ?? 'unknown'}`);
    res.json(transformOrder(updated));
  } catch (error) {
    logger.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = parseOrderId(req.params.id);
    const { status } = req.body;

    if (!orderId) {
      res.status(400).json({ message: 'Invalid order id' });
      return;
    }

    if (!status) {
      res.status(400).json({ message: 'Status is required' });
      return;
    }

    const currentOrder = await getOrderById(orderId);
    if (!currentOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const userId = req.user?.id;
    const statusHistory = Array.isArray(currentOrder.status_history)
      ? [...currentOrder.status_history]
      : [];

    statusHistory.push({
      from: currentOrder.status,
      to: status,
      changed_by: userId,
      changed_at: new Date().toISOString(),
    });

    // Handle stock adjustment
    await handleStockStatusChange(currentOrder, status, userId);

    const updated = await updateOrderRecord(orderId, {
      status,
      status_history: statusHistory,
      updated_by: userId,
    });

    if (!updated) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Log activity
    try {
      await createActivityLog({
        user_id: userId,
        action_type: 'order_status_changed',
        entity_type: 'order',
        entity_id: orderId,
        details: {
          from: currentOrder.status,
          to: status,
          order_id: orderId,
        },
      });
    } catch (logError) {
      logger.warn('Failed to create activity log:', logError);
    }

    logger.info(`Order ${orderId} status updated to ${status} by ${userId ?? 'unknown'}`);
    res.json(transformOrder(updated));
  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseOrderId(req.params.id);
    if (!orderId) {
      res.status(400).json({ message: 'Invalid order id' });
      return;
    }

    const deleted = await removeOrder(orderId);
    if (!deleted) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    logger.info(`Order deleted: ${orderId}`);
    res.json({ message: 'Order deleted', id: orderId });
  } catch (error) {
    logger.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrderStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalOrders = await countOrders();
    const pendingOrders = await countOrdersByStatus('pending');
    const confirmedOrders = await countOrdersByStatus('confirmed');
    const shippedOrders = await countOrdersByStatus('shipped');
    const deliveredOrders = await countOrdersByStatus('delivered');
    const sentOrders = await countOrdersByStatus('sent');
    const checkedOrders = await countOrdersByStatus('checked');
    const declinedOrders = await countOrdersByStatus('declined');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await countOrdersSince(today);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekOrders = await countOrdersSince(weekAgo);

    res.json({
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      sentOrders,
      checkedOrders,
      declinedOrders,
      todayOrders,
      weekOrders,
    });
  } catch (error) {
    logger.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  getCustomersByBranch,
  getActiveCustomersByBranch,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getDueCustomersForDate,
} from '../repositories/customerRepository';
import { createActivityLog } from '../repositories/activityLogRepository';
import logger from '../utils/logger';

/**
 * Assert that user has access to the branch
 */
const assertBranchAccess = (req: AuthRequest, branchId: string): void => {
  if (req.user?.role === 'sub_admin' && req.user.branch_id !== branchId) {
    throw new Error('ACCESS_DENIED');
  }
};

export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branchId = req.query.branchId as string | undefined;
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

    const onlyActive = req.query.active === 'true';
    const customers = onlyActive
      ? await getActiveCustomersByBranch(targetBranchId)
      : await getCustomersByBranch(targetBranchId);

    res.json(customers);
  } catch (error) {
    logger.error('Get customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const customer = await getCustomerById(id);

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    // Check access
    assertBranchAccess(req, customer.branch_id);

    res.json(customer);
  } catch (error: any) {
    if (error.message === 'ACCESS_DENIED') {
      res.status(403).json({ message: 'Access denied to this customer' });
      return;
    }
    logger.error('Get customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCustomerHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, deliveryFrequency, quantityPerDelivery, product } = req.body;
    const userBranchId = req.user?.branch_id;
    const userRole = req.user?.role;

    let branchId: string | undefined;

    if (userRole === 'sub_admin') {
      if (!userBranchId) {
        res.status(403).json({ message: 'Sub-admin must be assigned to a branch' });
        return;
      }
      branchId = userBranchId;
    } else if (userRole === 'admin' || userRole === 'staff') {
      branchId = req.body.branchId || userBranchId;
      if (!branchId) {
        res.status(400).json({ message: 'branchId is required' });
        return;
      }
    } else {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const customer = await createCustomer({
      name,
      phone,
      delivery_frequency: deliveryFrequency,
      quantity_per_delivery: quantityPerDelivery,
      product: product || 'Injera',
      branch_id: branchId,
    });

    // Log activity
    if (req.user?.id) {
      await createActivityLog({
        user_id: req.user.id,
        action_type: 'customer_created',
        entity_type: 'customer',
        entity_id: parseInt(customer.id.slice(0, 8), 16), // Convert UUID to number for entity_id
        details: {
          customer_name: name,
          branch_id: branchId,
        },
      });
    }

    logger.info(`Customer created: ${name} for branch ${branchId}`);
    res.status(201).json(customer);
  } catch (error) {
    logger.error('Create customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCustomerHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const customer = await getCustomerById(id);

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    // Check access
    assertBranchAccess(req, customer.branch_id);

    const { name, phone, deliveryFrequency, quantityPerDelivery, product, isActive } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (deliveryFrequency !== undefined) updates.delivery_frequency = deliveryFrequency;
    if (quantityPerDelivery !== undefined) updates.quantity_per_delivery = quantityPerDelivery;
    if (product !== undefined) updates.product = product;
    if (isActive !== undefined) updates.is_active = isActive;

    const updated = await updateCustomer(id, updates);

    if (!updated) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    // Log activity
    if (req.user?.id) {
      await createActivityLog({
        user_id: req.user.id,
        action_type: 'customer_updated',
        entity_type: 'customer',
        entity_id: parseInt(id.slice(0, 8), 16),
        details: {
          customer_name: updated.name,
        },
      });
    }

    logger.info(`Customer updated: ${id}`);
    res.json(updated);
  } catch (error: any) {
    if (error.message === 'ACCESS_DENIED') {
      res.status(403).json({ message: 'Access denied to this customer' });
      return;
    }
    logger.error('Update customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCustomerHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const customer = await getCustomerById(id);

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    // Check access
    assertBranchAccess(req, customer.branch_id);

    const deleted = await deleteCustomer(id);

    if (!deleted) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    // Log activity
    if (req.user?.id) {
      await createActivityLog({
        user_id: req.user.id,
        action_type: 'customer_deleted',
        entity_type: 'customer',
        entity_id: parseInt(id.slice(0, 8), 16),
        details: {
          customer_name: customer.name,
        },
      });
    }

    logger.info(`Customer deleted: ${id}`);
    res.json({ message: 'Customer deleted', id });
  } catch (error: any) {
    if (error.message === 'ACCESS_DENIED') {
      res.status(403).json({ message: 'Access denied to this customer' });
      return;
    }
    logger.error('Delete customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDueCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const dueCustomers = await getDueCustomersForDate(targetBranchId, targetDate);

    res.json(dueCustomers);
  } catch (error) {
    logger.error('Get due customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

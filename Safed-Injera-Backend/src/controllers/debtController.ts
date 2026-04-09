import { Response } from 'express';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/authMiddleware';
import { toCamelCase } from '../utils/transform';
import { withTransaction } from '../utils/transaction';
import {
  createDebt,
  getDebtById,
  listDebts,
  updateDebt as updateDebtRepo,
  updateDebtStatus,
  DebtStatus,
} from '../repositories/debtRepository';
import { createDebtPayment, listPaymentsByDebt } from '../repositories/debtPaymentRepository';
import { createActivityLog } from '../repositories/activityLogRepository';

const parseDebtId = (val: any): number | null => {
  const parsed = Number(val);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const normalizeMoneyFields = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj.originalAmount !== undefined) obj.originalAmount = Number(obj.originalAmount) || 0;
  if (obj.paidAmount !== undefined) obj.paidAmount = Number(obj.paidAmount) || 0;
  if (obj.remainingAmount !== undefined) obj.remainingAmount = Number(obj.remainingAmount) || 0;
  if (obj.amount !== undefined) obj.amount = Number(obj.amount) || 0;
  return obj;
};

export const getDebtsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
    const statuses = (statusParam ? statusParam.split(',') : ['open', 'partial'])
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s): s is DebtStatus => s === 'open' || s === 'partial' || s === 'paid');

    const limitParam = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
    const offsetParam = typeof req.query.offset === 'string' ? Number(req.query.offset) : undefined;

    const start = typeof req.query._start === 'string' ? Number(req.query._start) : undefined;
    const end = typeof req.query._end === 'string' ? Number(req.query._end) : undefined;

    const offset =
      offsetParam !== undefined && Number.isFinite(offsetParam) && offsetParam >= 0
        ? offsetParam
        : start !== undefined && Number.isFinite(start) && start >= 0
          ? start
          : 0;

    const limit =
      limitParam !== undefined && Number.isFinite(limitParam) && limitParam > 0
        ? limitParam
        : end !== undefined && Number.isFinite(end) && end > offset
          ? Math.max(end - offset, 1)
          : 50;

    const { rows, total } = await listDebts({ statuses, limit, offset });
    const transformed = rows.map((r) => normalizeMoneyFields(toCamelCase(r)));

    const endIx = transformed.length ? offset + transformed.length - 1 : offset;
    res.set('Content-Range', `debts ${offset}-${endIx}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(transformed);
  } catch (error) {
    logger.error('Get debts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDebtHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseDebtId(req.params.id);
    if (!id) {
      res.status(400).json({ message: 'Invalid debt id' });
      return;
    }

    const [debt, payments] = await Promise.all([getDebtById(id), listPaymentsByDebt(id)]);
    if (!debt) {
      res.status(404).json({ message: 'Debt not found' });
      return;
    }

    res.json({
      debt: normalizeMoneyFields(toCamelCase(debt)),
      payments: payments.map((p) => normalizeMoneyFields(toCamelCase(p))),
    });
  } catch (error) {
    logger.error('Get debt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createDebtHandler = async (req: AuthRequest, res: Response) => {
  try {
    const customerName = (req.body.customerName ?? req.body.customer_name ?? '').toString().trim();
    const phone = req.body.phone ? String(req.body.phone).trim() : undefined;
    const reason = req.body.reason ? String(req.body.reason).trim() : undefined;
    const expectedRepaymentDate =
      req.body.expectedRepaymentDate ?? req.body.expected_repayment_date
        ? String(req.body.expectedRepaymentDate ?? req.body.expected_repayment_date).trim()
        : undefined;

    const originalAmountRaw = req.body.originalAmount ?? req.body.original_amount ?? req.body.amount;
    const originalAmount = Number(originalAmountRaw);

    if (!customerName) {
      res.status(400).json({ message: 'Customer name is required' });
      return;
    }
    if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
      res.status(400).json({ message: 'Original amount must be a positive number' });
      return;
    }

    const created = await withTransaction(async (client) => {
      const debt = await createDebt(
        {
          customer_name: customerName,
          phone,
          reason,
          original_amount: originalAmount,
          expected_repayment_date: expectedRepaymentDate,
          created_by: req.user?.id,
        },
        client
      );

      await createActivityLog(
        {
          user_id: req.user?.id,
          action_type: 'create_debt',
          entity_type: 'debt',
          entity_id: debt.id,
          details: {
            customerName,
            phone: phone ?? null,
            originalAmount,
            expectedRepaymentDate: expectedRepaymentDate ?? null,
          },
        },
        client
      );

      return debt;
    });

    const debtWithTotals = await getDebtById(created.id);
    res.status(201).json(normalizeMoneyFields(toCamelCase(debtWithTotals ?? created)));
  } catch (error) {
    logger.error('Create debt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateDebtHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseDebtId(req.params.id);
    if (!id) {
      res.status(400).json({ message: 'Invalid debt id' });
      return;
    }

    const updates: any = {};

    if (req.body.customerName !== undefined || req.body.customer_name !== undefined) {
      const v = String(req.body.customerName ?? req.body.customer_name).trim();
      if (!v) {
        res.status(400).json({ message: 'Customer name cannot be empty' });
        return;
      }
      updates.customer_name = v;
    }

    if (req.body.phone !== undefined) {
      updates.phone = req.body.phone ? String(req.body.phone).trim() : null;
    }

    if (req.body.reason !== undefined) {
      updates.reason = req.body.reason ? String(req.body.reason).trim() : null;
    }

    if (req.body.expectedRepaymentDate !== undefined || req.body.expected_repayment_date !== undefined) {
      updates.expected_repayment_date =
        req.body.expectedRepaymentDate ?? req.body.expected_repayment_date
          ? String(req.body.expectedRepaymentDate ?? req.body.expected_repayment_date).trim()
          : null;
    }

    const updated = await withTransaction(async (client) => {
      const debt = await updateDebtRepo(id, updates, client);
      if (!debt) return null;

      await createActivityLog(
        {
          user_id: req.user?.id,
          action_type: 'update_debt',
          entity_type: 'debt',
          entity_id: id,
          details: { updates: toCamelCase(updates) },
        },
        client
      );

      return debt;
    });

    if (!updated) {
      res.status(404).json({ message: 'Debt not found' });
      return;
    }

    const debtWithTotals = await getDebtById(id);
    res.json(normalizeMoneyFields(toCamelCase(debtWithTotals ?? updated)));
  } catch (error) {
    logger.error('Update debt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addDebtPaymentHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseDebtId(req.params.id);
    if (!id) {
      res.status(400).json({ message: 'Invalid debt id' });
      return;
    }

    const amountRaw = req.body.amount ?? req.body.paymentAmount;
    const amount = Number(amountRaw);
    const paymentDate = req.body.paymentDate ?? req.body.payment_date;
    const note = req.body.note !== undefined ? String(req.body.note).trim() : undefined;

    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ message: 'Payment amount must be a positive number' });
      return;
    }

    const result = await withTransaction(async (client) => {
      const debtLock = await client.query(
        `SELECT id, original_amount, status
         FROM debts
         WHERE id = $1
         FOR UPDATE`,
        [id]
      );

      if (!debtLock.rows[0]) {
        return { notFound: true } as const;
      }

      const originalAmount = Number(debtLock.rows[0].original_amount) || 0;

      const paidRes = await client.query<{ paid_amount: any }>(
        `SELECT COALESCE(SUM(amount), 0) AS paid_amount
         FROM debt_payments
         WHERE debt_id = $1`,
        [id]
      );
      const alreadyPaid = Number(paidRes.rows[0]?.paid_amount) || 0;
      const remaining = Math.max(originalAmount - alreadyPaid, 0);

      if (amount > remaining) {
        return { overpay: true, remaining } as const;
      }

      const payment = await createDebtPayment(
        {
          debt_id: id,
          amount,
          payment_date: paymentDate ? String(paymentDate).trim() : undefined,
          note,
          recorded_by: req.user?.id,
        },
        client
      );

      const newPaid = alreadyPaid + amount;
      const newRemaining = Math.max(originalAmount - newPaid, 0);

      let newStatus: DebtStatus = 'open';
      let closedAt: Date | null = null;
      if (newRemaining === 0) {
        newStatus = 'paid';
        closedAt = new Date();
      } else if (newPaid > 0) {
        newStatus = 'partial';
      }

      await updateDebtStatus(id, newStatus, closedAt, client);

      await createActivityLog(
        {
          user_id: req.user?.id,
          action_type: 'add_debt_payment',
          entity_type: 'debt',
          entity_id: id,
          details: {
            paymentId: payment.id,
            amount,
            paymentDate: payment.payment_date,
            note: note ?? null,
            newStatus,
          },
        },
        client
      );

      return { payment, newStatus } as const;
    });

    if ((result as any).notFound) {
      res.status(404).json({ message: 'Debt not found' });
      return;
    }

    if ((result as any).overpay) {
      res.status(400).json({ message: `Payment exceeds remaining balance (${(result as any).remaining})` });
      return;
    }

    const debtWithTotals = await getDebtById(id);
    if (!debtWithTotals) {
      res.status(404).json({ message: 'Debt not found' });
      return;
    }
    res.status(201).json({
      debt: normalizeMoneyFields(toCamelCase(debtWithTotals)),
      payment: normalizeMoneyFields(toCamelCase((result as any).payment)),
    });
  } catch (error) {
    logger.error('Add debt payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

type DebtStatus = 'open' | 'partial' | 'paid';

type DebtRow = {
  id: number;
  customerName: string;
  phone?: string | null;
  reason?: string | null;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  expectedRepaymentDate?: string | null;
  status: DebtStatus;
  createdAt?: string;
};

const getUserRole = (): string | null => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.role === 'string' ? parsed.role : null;
  } catch {
    return null;
  }
};

export default function DebtsPage() {
  const theme = useTheme();
  const role = useMemo(() => getUserRole(), []);

  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'outstanding' | 'open' | 'partial' | 'paid' | 'all'>('outstanding');
  const [createdDateFilter, setCreatedDateFilter] = useState('');
  const [expectedDateFilter, setExpectedDateFilter] = useState('');
  const [expectedQuickFilter, setExpectedQuickFilter] = useState<'all' | 'today' | 'due_soon' | 'overdue'>('all');

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState<DebtRow | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const getStatusQuery = () => {
    if (statusFilter === 'all') return 'open,partial,paid';
    if (statusFilter === 'paid') return 'paid';
    if (statusFilter === 'open') return 'open';
    if (statusFilter === 'partial') return 'partial';
    return 'open,partial';
  };

  const fetchDebts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    try {
      const status = getStatusQuery();
      const res = await fetch(`${API_URL}/debts?status=${encodeURIComponent(status)}&limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to fetch debts' }));
        throw new Error(err.message || 'Failed to fetch debts');
      }
      const data = await res.json();
      const normalized: DebtRow[] = (Array.isArray(data) ? data : []).map((d: any) => ({
        id: Number(d.id),
        customerName: String(d.customerName ?? ''),
        phone: d.phone ?? null,
        reason: d.reason ?? null,
        originalAmount: Number(d.originalAmount) || 0,
        paidAmount: Number(d.paidAmount) || 0,
        remainingAmount: Number(d.remainingAmount) || 0,
        expectedRepaymentDate: d.expectedRepaymentDate ?? null,
        status: (d.status as DebtStatus) || 'open',
        createdAt: d.createdAt,
      }));
      setDebts(normalized);
    } catch (e: any) {
      setSnackbar({ open: true, severity: 'error', message: e.message || 'Failed to fetch debts' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filteredDebts = useMemo(() => {
    const toYmd = (value?: string | null) => {
      if (!value) return '';
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const today = new Date();
    const todayYmd = toYmd(today.toISOString());
    const startOfToday = new Date(todayYmd);

    return debts.filter((d) => {
      if (createdDateFilter) {
        if (toYmd(d.createdAt ?? null) !== createdDateFilter) return false;
      }

      if (expectedDateFilter) {
        if (toYmd(d.expectedRepaymentDate ?? null) !== expectedDateFilter) return false;
      }

      if (expectedQuickFilter !== 'all') {
        const dueYmd = toYmd(d.expectedRepaymentDate ?? null);
        if (!dueYmd) return false;
        const due = new Date(dueYmd);
        const diffDays = Math.floor((due.getTime() - startOfToday.getTime()) / 86400000);

        if (expectedQuickFilter === 'today') {
          if (diffDays !== 0) return false;
        } else if (expectedQuickFilter === 'overdue') {
          if (diffDays >= 0) return false;
        } else if (expectedQuickFilter === 'due_soon') {
          if (diffDays < 0 || diffDays > 2) return false;
        }
      }

      return true;
    });
  }, [createdDateFilter, debts, expectedDateFilter, expectedQuickFilter]);

  const handleCreate = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const name = customerName.trim();
    const originalAmount = Number(amount);
    if (!name) {
      setSnackbar({ open: true, severity: 'error', message: 'Client name is required' });
      return;
    }
    if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
      setSnackbar({ open: true, severity: 'error', message: 'Amount must be a positive number' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/debts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: name,
          phone: phone.trim() || undefined,
          originalAmount,
          reason: reason.trim() || undefined,
          expectedRepaymentDate: expectedDate || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to create debt' }));
        throw new Error(err.message || 'Failed to create debt');
      }
      setSnackbar({ open: true, severity: 'success', message: 'Debt created' });
      setCustomerName('');
      setPhone('');
      setAmount(0);
      setReason('');
      setExpectedDate('');
      await fetchDebts();
    } catch (e: any) {
      setSnackbar({ open: true, severity: 'error', message: e.message || 'Failed to create debt' });
    } finally {
      setSubmitting(false);
    }
  };

  const openPayment = (debt: DebtRow) => {
    setPaymentDebt(debt);
    setPaymentAmount(Math.max(Number(debt.remainingAmount) || 0, 0));
    setPaymentDate('');
    setPaymentNote('');
    setPaymentOpen(true);
  };

  const handleAddPayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!paymentDebt) return;

    const amt = Number(paymentAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setSnackbar({ open: true, severity: 'error', message: 'Payment amount must be a positive number' });
      return;
    }

    setPaymentSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/debts/${paymentDebt.id}/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amt,
          paymentDate: paymentDate || undefined,
          note: paymentNote.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to add payment' }));
        throw new Error(err.message || 'Failed to add payment');
      }

      setSnackbar({ open: true, severity: 'success', message: 'Payment recorded' });
      setPaymentOpen(false);
      setPaymentDebt(null);
      await fetchDebts();
    } catch (e: any) {
      setSnackbar({ open: true, severity: 'error', message: e.message || 'Failed to add payment' });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const statusChip = (s: DebtStatus) => (
    <Chip
      label={s}
      size="small"
      sx={{
        textTransform: 'capitalize',
        fontWeight: 700,
      }}
      color={s === 'paid' ? 'success' : s === 'partial' ? 'info' : 'warning'}
      variant="outlined"
    />
  );

  const getRowSx = (d: DebtRow) => {
    const remaining = Number(d.remainingAmount) || 0;
    const dueRaw = d.expectedRepaymentDate;
    if (!dueRaw || remaining <= 0) return undefined;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const startOfToday = new Date(`${yyyy}-${mm}-${dd}`);

    const due = new Date(dueRaw);
    if (Number.isNaN(due.getTime())) return undefined;
    const dueDateOnly = new Date(`${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`);

    const diffDays = Math.floor((dueDateOnly.getTime() - startOfToday.getTime()) / 86400000);
    const isOverdue = diffDays < 0;
    const isDueSoon = diffDays >= 0 && diffDays <= 2;
    if (!isOverdue && !isDueSoon) return undefined;

    return {
      backgroundColor: isOverdue
        ? alpha(theme.palette.error.main, 0.14)
        : alpha(theme.palette.error.main, 0.08),
      '&:hover': {
        backgroundColor: isOverdue
          ? alpha(theme.palette.error.main, 0.18)
          : alpha(theme.palette.error.main, 0.12),
      },
    };
  };

  if (role === 'sub_admin') {
    return (
      <Card sx={{ borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Debts
          </Typography>
          <Alert severity="info">Debts are available only for Main Hub (admin/staff).</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Debts
      </Typography>

      <Card sx={{ borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Create Debt
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Client Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                fullWidth
                sx={{ flex: 2, minWidth: 240 }}
              />
              <TextField
                label="Phone (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                sx={{ flex: 1, minWidth: 200 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                fullWidth
                sx={{ flex: 1, minWidth: 180 }}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <TextField
                label="Expected Repayment Date (Optional)"
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                fullWidth
                sx={{ flex: 1, minWidth: 220 }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              label="Reason (Optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setCustomerName('');
                  setPhone('');
                  setAmount(0);
                  setReason('');
                  setExpectedDate('');
                }}
              >
                Clear
              </Button>
              <Button variant="contained" onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating…' : 'Create'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: '16px' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Outstanding Debts
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <TextField
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                size="small"
                sx={{ minWidth: 160 }}
                SelectProps={{ native: true }}
              >
                <option value="outstanding">Unpaid (Open/Partial)</option>
                <option value="open">Open</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="all">All</option>
              </TextField>

              <TextField
                select
                label="Expected"
                value={expectedQuickFilter}
                onChange={(e) => setExpectedQuickFilter(e.target.value as any)}
                size="small"
                sx={{ minWidth: 150 }}
                SelectProps={{ native: true }}
              >
                <option value="all">All</option>
                <option value="today">Due Today</option>
                <option value="due_soon">Due Soon (2 days)</option>
                <option value="overdue">Overdue</option>
              </TextField>

              <TextField
                label="Created (Daily)"
                type="date"
                value={createdDateFilter}
                onChange={(e) => setCreatedDateFilter(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Expected Date"
                type="date"
                value={expectedDateFilter}
                onChange={(e) => setExpectedDateFilter(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />

              <Button variant="outlined" onClick={fetchDebts} disabled={loading}>
                Refresh
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : filteredDebts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No outstanding debts.
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Original
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Paid
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Remaining
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Expected</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDebts.map((d) => (
                    <TableRow key={d.id} hover sx={getRowSx(d)}>
                      <TableCell sx={{ fontWeight: 600 }}>{d.customerName}</TableCell>
                      <TableCell>{d.phone || '—'}</TableCell>
                      <TableCell align="right">{d.originalAmount.toLocaleString()}</TableCell>
                      <TableCell align="right">{d.paidAmount.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        {d.remainingAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{d.expectedRepaymentDate || '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 260 }}>{d.reason || '—'}</TableCell>
                      <TableCell>{statusChip(d.status)}</TableCell>
                      <TableCell align="right">
                        {d.status === 'paid' || d.remainingAmount <= 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        ) : (
                          <Button size="small" variant="outlined" onClick={() => openPayment(d)}>
                            Add Payment
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {paymentDebt
                ? `Client: ${paymentDebt.customerName} — Remaining: ${paymentDebt.remainingAmount.toLocaleString()}`
                : ''}
            </Typography>
            <TextField
              label="Amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              fullWidth
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              label="Payment Date (Optional)"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Note (Optional)"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setPaymentOpen(false);
              setPaymentDebt(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddPayment} disabled={paymentSubmitting}>
            {paymentSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  Divider,
  Chip,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const colors = {
  cream: '#F9F9F7',
  paper: '#FFFFFF',
  gold: '#B56A3A',
  textPrimary: '#4E1815',
  textSecondary: '#6B7B7D',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

interface DueCustomer {
  id: string;
  name: string;
  phone: string | null;
  delivery_frequency: string;
  quantity_per_delivery: number;
  product: string;
}

interface PreparationData {
  dueCustomers: DueCustomer[];
  currentStock: number;
  startingStock: number;
  receivedToday: number;
  existingReport: { id: string; submittedAt: string } | null;
}

interface ChecklistItem {
  customerId: string;
  customerName: string;
  delivered: boolean;
  quantityDelivered: number;
  comment: string;
}

interface DailyReportFormProps {
  branchId?: string;
  onSuccess?: () => void;
}

export const DailyReportForm = ({ branchId, onSuccess }: DailyReportFormProps) => {
  const [preparationData, setPreparationData] = useState<PreparationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState({
    reportDate: new Date().toISOString().split('T')[0],
    receivedInjera: 0,
    soldInjera: 0,
    remainingInjera: 0,
    wastedInjera: 0,
    totalRevenue: 0,
    notes: '',
  });

  const [soldManuallyEdited, setSoldManuallyEdited] = useState(false);

  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);

  const fetchPreparationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = branchId
        ? `${API_URL}/daily-reports/preparation?branchId=${branchId}&date=${formData.reportDate}`
        : `${API_URL}/daily-reports/preparation?date=${formData.reportDate}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setPreparationData(data);

      // Initialize checklists from due customers
      const initialChecklists: ChecklistItem[] = data.dueCustomers.map((customer: DueCustomer) => ({
        customerId: customer.id,
        customerName: customer.name,
        delivered: false,
        quantityDelivered: customer.quantity_per_delivery,
        comment: '',
      }));
      setChecklists(initialChecklists);
      setSoldManuallyEdited(false);

      // Pre-populate received injera
      setFormData((prev) => ({
        ...prev,
        receivedInjera: data.receivedToday,
        remainingInjera: data.currentStock,
      }));
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to load data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreparationData();
  }, [formData.reportDate, branchId]);

  const handleChecklistChange = (index: number, field: keyof ChecklistItem, value: any) => {
    const updated = [...checklists];
    updated[index] = { ...updated[index], [field]: value };
    setChecklists(updated);
  };

  const calculateTotalDelivered = () => {
    return checklists
      .filter((c) => c.delivered)
      .reduce((sum, c) => sum + c.quantityDelivered, 0);
  };

  useEffect(() => {
    if (soldManuallyEdited) {
      return;
    }
    const deliveredTotal = calculateTotalDelivered();
    setFormData((prev) => ({
      ...prev,
      soldInjera: deliveredTotal,
    }));
  }, [checklists, soldManuallyEdited]);

  const validateStock = () => {
    const starting = preparationData?.startingStock ?? preparationData?.currentStock ?? 0;
    const received = formData.receivedInjera;
    const sold = formData.soldInjera;
    const wasted = formData.wastedInjera;
    const remaining = formData.remainingInjera;

    const expectedTotal = received + starting;
    const actualTotal = sold + wasted + remaining;

    return Math.abs(expectedTotal - actualTotal) <= 1;
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.reportDate) {
      setSnackbar({ open: true, message: 'Report date is required', severity: 'error' });
      return;
    }

    // Validate stock calculations
    if (!validateStock()) {
      const starting = preparationData?.startingStock ?? preparationData?.currentStock ?? 0;
      const expectedTotal = formData.receivedInjera + starting;
      const actualTotal = formData.soldInjera + formData.wastedInjera + formData.remainingInjera;
      setSnackbar({
        open: true,
        message: `Stock validation failed: Expected ${expectedTotal} (received: ${formData.receivedInjera} + starting: ${starting}), but got ${actualTotal} (sold: ${formData.soldInjera} + wasted: ${formData.wastedInjera} + remaining: ${formData.remainingInjera})`,
        severity: 'error',
      });
      return;
    }

    // Validate checklists - require comment if not delivered
    const invalidChecklists = checklists.filter((c) => !c.delivered && !c.comment.trim());
    if (invalidChecklists.length > 0) {
      setSnackbar({
        open: true,
        message: `Please provide a reason for customers that did not receive delivery`,
        severity: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/daily-reports/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branchId: branchId || undefined,
          reportDate: formData.reportDate,
          receivedInjera: formData.receivedInjera,
          soldInjera: formData.soldInjera,
          wastedInjera: formData.wastedInjera,
          remainingInjera: formData.remainingInjera,
          totalRevenue: formData.totalRevenue,
          notes: formData.notes || undefined,
          checklists: checklists.map((c) => ({
            customerId: c.customerId,
            delivered: c.delivered,
            quantityDelivered: c.delivered ? c.quantityDelivered : 0,
            comment: c.comment || undefined,
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to submit report');
      }

      setSnackbar({ open: true, message: 'Daily report submitted successfully!', severity: 'success' });
      if (onSuccess) {
        onSuccess();
      }
      // Reset form
      fetchPreparationData();
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to submit report', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: colors.gold }} />
      </Box>
    );
  }

  if (!preparationData) {
    return (
      <Alert severity="error">Failed to load preparation data. Please try again.</Alert>
    );
  }

  if (preparationData.existingReport) {
    return (
      <Alert severity="info">
        A report has already been submitted for this date. Report ID: {preparationData.existingReport.id}
      </Alert>
    );
  }

  const startingStock = preparationData.startingStock ?? preparationData.currentStock;
  const expectedTotal = formData.receivedInjera + startingStock;
  const actualTotal = formData.soldInjera + formData.wastedInjera + formData.remainingInjera;
  const stockValid = validateStock();

  return (
    <>
      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <AssignmentIcon sx={{ color: colors.gold }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
              Submit Daily Report
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Report Date */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Report Date"
                type="date"
                value={formData.reportDate}
                onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Stock Summary */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ bgcolor: colors.cream }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Stock Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Starting Stock
                      </Typography>
                      <Typography variant="h6">{startingStock}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Received Today
                      </Typography>
                      <Typography variant="h6">{formData.receivedInjera}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Expected Total
                      </Typography>
                      <Typography variant="h6">{expectedTotal}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Actual Total
                      </Typography>
                      <Typography variant="h6" sx={{ color: stockValid ? colors.success : colors.error }}>
                        {actualTotal}
                      </Typography>
                    </Grid>
                  </Grid>
                  {!stockValid && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      Stock mismatch: Expected {expectedTotal}, but got {actualTotal}. Please check your numbers.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Sales & Waste */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Sold Injera"
                type="number"
                value={formData.soldInjera}
                onChange={(e) =>
                  setFormData({ ...formData, soldInjera: parseInt(e.target.value) || 0 })
                }
                onFocus={() => setSoldManuallyEdited(true)}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Wasted Injera"
                type="number"
                value={formData.wastedInjera}
                onChange={(e) =>
                  setFormData({ ...formData, wastedInjera: parseInt(e.target.value) || 0 })
                }
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Remaining Injera"
                type="number"
                value={formData.remainingInjera}
                onChange={(e) =>
                  setFormData({ ...formData, remainingInjera: parseInt(e.target.value) || 0 })
                }
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Total Revenue (ETB)"
                type="number"
                value={formData.totalRevenue}
                onChange={(e) =>
                  setFormData({ ...formData, totalRevenue: parseFloat(e.target.value) || 0 })
                }
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Customer Checklist */}
            {checklists.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Customer Delivery Checklist ({checklists.length} due today)
                </Typography>
                {checklists.map((checklist, index) => (
                  <Card key={checklist.customerId} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {checklist.customerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Expected: {checklist.quantityDelivered} units
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={checklist.delivered}
                                onChange={(e) =>
                                  handleChecklistChange(index, 'delivered', e.target.checked)
                                }
                              />
                            }
                            label="Delivered"
                          />
                        </Grid>
                        {checklist.delivered && (
                          <Grid item xs={12} sm={3}>
                            <TextField
                              label="Quantity"
                              type="number"
                              value={checklist.quantityDelivered}
                              onChange={(e) =>
                                handleChecklistChange(
                                  index,
                                  'quantityDelivered',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              fullWidth
                              size="small"
                              inputProps={{ min: 0 }}
                            />
                          </Grid>
                        )}
                        {!checklist.delivered && (
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Reason (Required)"
                              value={checklist.comment}
                              onChange={(e) =>
                                handleChecklistChange(index, 'comment', e.target.value)
                              }
                              fullWidth
                              size="small"
                              required
                              placeholder="Why was delivery not made?"
                            />
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
                <Box sx={{ mt: 2, p: 2, bgcolor: colors.cream, borderRadius: 1 }}>
                  <Typography variant="body2">
                    Total Delivered to Customers: <strong>{calculateTotalDelivered()}</strong> units
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                label="Notes (Optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => fetchPreparationData()}
                  disabled={submitting}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSubmit}
                  disabled={submitting || !stockValid}
                  sx={{
                    background: `linear-gradient(135deg, ${colors.gold} 0%, #A85A2A 100%)`,
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

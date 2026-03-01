import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';

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

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  delivery_frequency: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly' | 'biweekly';
  quantity_per_delivery: number;
  product: string;
  branch_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CustomerListProps {
  branchId?: string;
}

const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  every_2_days: 'Every 2 Days',
  every_3_days: 'Every 3 Days',
  weekly: 'Weekly',
  biweekly: 'Biweekly',
};

export const CustomerList = ({ branchId }: CustomerListProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    deliveryFrequency: 'daily' as const,
    quantityPerDelivery: 1,
    product: 'Injera',
    isActive: true,
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = branchId
        ? `${API_URL}/customers?branchId=${branchId}&active=true`
        : `${API_URL}/customers?active=true`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCustomers(data);
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to load customers', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [branchId]);

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone || '',
        deliveryFrequency: customer.delivery_frequency,
        quantityPerDelivery: customer.quantity_per_delivery,
        product: customer.product,
        isActive: customer.is_active,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        deliveryFrequency: 'daily',
        quantityPerDelivery: 1,
        product: 'Injera',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingCustomer
        ? `${API_URL}/customers/${editingCustomer.id}`
        : `${API_URL}/customers`;
      const method = editingCustomer ? 'PUT' : 'POST';
      const body: any = {
        name: formData.name,
        phone: formData.phone || undefined,
        deliveryFrequency: formData.deliveryFrequency,
        quantityPerDelivery: formData.quantityPerDelivery,
        product: formData.product,
      };
      if (editingCustomer) {
        body.isActive = formData.isActive;
      }
      if (!editingCustomer && branchId) {
        body.branchId = branchId;
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to save customer');
      }

      setSnackbar({
        open: true,
        message: editingCustomer ? 'Customer updated successfully' : 'Customer created successfully',
        severity: 'success',
      });
      handleCloseDialog();
      fetchCustomers();
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to save customer', severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to delete customer');
      }

      setSnackbar({ open: true, message: 'Customer deleted successfully', severity: 'success' });
      fetchCustomers();
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to delete customer', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: colors.gold }} />
      </Box>
    );
  }

  return (
    <>
      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ color: colors.gold }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                Recurring Customers
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: `linear-gradient(135deg, ${colors.gold} 0%, #A85A2A 100%)`,
                '&:hover': { opacity: 0.9 },
              }}
            >
              Add Customer
            </Button>
          </Box>

          {customers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PersonIcon sx={{ fontSize: 64, color: colors.textSecondary, mb: 2 }} />
              <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 2 }}>
                No customers yet
              </Typography>
              <Button variant="outlined" onClick={() => handleOpenDialog()}>
                Add Your First Customer
              </Button>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.phone || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={frequencyLabels[customer.delivery_frequency]}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>{customer.quantity_per_delivery}</TableCell>
                    <TableCell>{customer.product}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(customer)}
                        sx={{ color: colors.gold }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(customer.id)}
                        sx={{ color: colors.error }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Customer Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Delivery Frequency</InputLabel>
              <Select
                value={formData.deliveryFrequency}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryFrequency: e.target.value as any })
                }
                label="Delivery Frequency"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="every_2_days">Every 2 Days</MenuItem>
                <MenuItem value="every_3_days">Every 3 Days</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Biweekly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Quantity per Delivery"
              type="number"
              value={formData.quantityPerDelivery}
              onChange={(e) =>
                setFormData({ ...formData, quantityPerDelivery: parseInt(e.target.value) || 1 })
              }
              required
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Product"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              fullWidth
            />
            {editingCustomer && (
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  label="Status"
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || formData.quantityPerDelivery < 1}
            sx={{
              background: `linear-gradient(135deg, ${colors.gold} 0%, #A85A2A 100%)`,
            }}
          >
            {editingCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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

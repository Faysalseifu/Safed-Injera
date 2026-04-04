import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HistoryIcon from '@mui/icons-material/History';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { CustomerList } from './CustomerList';
import { DailyReportForm } from './DailyReportForm';

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

interface BranchDashboardData {
  branch: {
    id: string;
    name: string;
    location: string;
    isMainHub: boolean;
  };
  stock: {
    totalStock: number;
    totalValue: number;
    lowStockCount: number;
    categoryBreakdown: Array<{
      category: string;
      total_quantity: number;
      total_value: number;
    }>;
    lowStockItems: Array<{
      id: number;
      productName: string;
      quantity: number;
      minimumThreshold: number;
      unit: string;
    }>;
  };
  transfers: {
    pendingCount: number;
    pendingTransfers: Array<{
      id: string;
      productName: string;
      quantity: number;
      unit: string;
      status: string;
      createdAt: string;
    }>;
  };
  dailySales: {
    quantity: number;
    date: string;
  };
  recentActivity: Array<{
    id: number;
    actionType: string;
    performedBy: string;
    createdAt: string;
    details: any;
  }>;
  isAdminView: boolean;
}

interface DashboardBranchProps {
  branchId?: string; // Optional: for admin viewing specific branch
}

export const DashboardBranch = ({ branchId }: DashboardBranchProps) => {
  const [data, setData] = useState<BranchDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receivingId, setReceivingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [returnStockOpen, setReturnStockOpen] = useState(false);
  const [returnStockData, setReturnStockData] = useState({
    productName: '',
    quantity: '',
    category: '',
    unit: '',
  });
  const [returning, setReturning] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const url = branchId
        ? `${API_URL}/branches/dashboard?branchId=${branchId}`
        : `${API_URL}/branches/dashboard`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to fetch');
      }
      const json = await response.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchId]);

  const handleReturnStock = async () => {
    if (!returnStockData.productName || !returnStockData.quantity || Number(returnStockData.quantity) <= 0) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    try {
      setReturning(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/stock-transfers/return`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: returnStockData.productName,
          quantity: Number(returnStockData.quantity),
          category: returnStockData.category || 'Injera',
          unit: returnStockData.unit || 'pieces',
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to return stock');
      }

      setSnackbar({ open: true, message: `Successfully returned ${returnStockData.quantity} ${returnStockData.unit} to Main Hub`, severity: 'success' });
      setReturnStockOpen(false);
      setReturnStockData({ productName: '', quantity: '', category: '', unit: '' });
      fetchData();
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to return stock', severity: 'error' });
    } finally {
      setReturning(false);
    }
  };

  const handleReceive = async (transferId: string) => {
    try {
      setReceivingId(transferId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/stock-transfers/${transferId}/receive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to receive');
      }
      await fetchData();
    } catch (e: any) {
      alert(e.message || 'Failed to receive transfer');
    } finally {
      setReceivingId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress sx={{ color: colors.gold }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) return null;

  return (
    <Box
      sx={{
        bgcolor: colors.cream,
        minHeight: '100vh',
        p: { xs: 1.5, md: 2, lg: 3 },
        width: '100%',
      }}
    >
      <Box sx={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <StorefrontIcon sx={{ fontSize: 32, color: colors.gold }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                  {data.branch.name}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {data.branch.location}
                </Typography>
              </Box>
            </Box>
            {data.isAdminView && (
              <Chip
                label="Admin View"
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>

          {/* Tabs for Sub-Admin - Only show if NOT admin view */}
          {!data.isAdminView && (
            <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    color: colors.textSecondary,
                    fontWeight: 600,
                    textTransform: 'none',
                    minHeight: 64,
                    '&.Mui-selected': {
                      color: colors.gold,
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: colors.gold,
                    height: 3,
                  },
                }}
              >
                <Tab label="Dashboard" icon={<StorefrontIcon />} iconPosition="start" />
                <Tab label="Customers" icon={<PersonIcon />} iconPosition="start" />
                <Tab label="Daily Report" icon={<AssignmentIcon />} iconPosition="start" />
              </Tabs>
            </Box>
          )}

          {/* Return Stock Button - Sub-Admin Only */}
          {!data.isAdminView && activeTab === 0 && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowUpwardIcon />}
                onClick={() => setReturnStockOpen(true)}
                sx={{
                  borderColor: colors.gold,
                  color: colors.gold,
                  '&:hover': {
                    borderColor: colors.gold,
                    backgroundColor: `${colors.gold}10`,
                  },
                }}
              >
                Return Stock to Main Hub
              </Button>
            </Box>
          )}
        </Box>

        {/* Tab Content for Sub-Admin */}
        {!data.isAdminView && activeTab === 0 && (
          <>
            {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
                background: 'linear-gradient(135deg, #B56A3A 0%, #A85A2A 100%)',
                color: '#FFF',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <InventoryIcon />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    My Branch Stock
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {data.stock.totalStock.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Total Value: {data.stock.totalValue.toLocaleString()} ETB
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
                border: '1px solid rgba(78, 24, 21, 0.06)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <WarningAmberIcon sx={{ color: colors.warning }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                    Low Stock Items
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                  {data.stock.lowStockCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Needs attention
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
                border: '1px solid rgba(78, 24, 21, 0.06)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <TrendingDownIcon sx={{ color: colors.gold }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                    Daily Sales
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                  {data.dailySales.quantity.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(data.dailySales.date).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
                border: '1px solid rgba(78, 24, 21, 0.06)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <LocalShippingIcon sx={{ color: colors.gold }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                    Pending Transfers
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                  {data.transfers.pendingCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  To Receive
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Low Stock Items */}
          {data.stock.lowStockItems.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                    Low Stock in My Branch
                  </Typography>
                  <List>
                    {data.stock.lowStockItems.slice(0, 5).map((item, idx) => (
                      <Box key={item.id}>
                        <ListItem>
                          <ListItemText
                            primary={item.productName}
                            secondary={`${item.quantity} ${item.unit} / Min: ${item.minimumThreshold} ${item.unit}`}
                          />
                          <Chip
                            label="Low"
                            color="warning"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </ListItem>
                        {idx < data.stock.lowStockItems.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Category Breakdown */}
          {data.stock.categoryBreakdown.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                    Stock by Category
                  </Typography>
                  <List>
                    {data.stock.categoryBreakdown.map((cat, idx) => (
                      <Box key={cat.category}>
                        <ListItem>
                          <ListItemText
                            primary={cat.category}
                            secondary={`${cat.total_quantity.toLocaleString()} units • ${cat.total_value.toLocaleString()} ETB`}
                          />
                        </ListItem>
                        {idx < data.stock.categoryBreakdown.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Pending Transfers */}
          {data.transfers.pendingTransfers.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                    Pending Transfers to Receive
                  </Typography>
                <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', mx: -2, width: 'calc(100% + 32px)', px: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.transfers.pendingTransfers.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{t.productName}</TableCell>
                          <TableCell>
                            {t.quantity} {t.unit}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={t.status}
                              size="small"
                              color={t.status === 'in_transit' ? 'info' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(t.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleReceive(t.id)}
                              disabled={receivingId === t.id}
                              sx={{
                                background: `linear-gradient(135deg, ${colors.success} 0%, #388E3C 100%)`,
                                '&:hover': { opacity: 0.9 },
                              }}
                            >
                              {receivingId === t.id ? 'Receiving...' : 'Receive'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Recent Activity */}
          {data.recentActivity.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <HistoryIcon sx={{ color: colors.gold }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                      Recent Activity in My Branch
                    </Typography>
                  </Box>
                  <List>
                    {data.recentActivity.map((activity, idx) => (
                      <Box key={activity.id}>
                        <ListItem>
                          <ListItemText
                            primary={activity.actionType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            secondary={`By ${activity.performedBy} • ${new Date(activity.createdAt).toLocaleString()}`}
                          />
                        </ListItem>
                        {idx < data.recentActivity.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
          </>
        )}
        
        {/* Customers Tab - Sub-Admin Only */}
        {!data.isAdminView && activeTab === 1 && (
          <Box sx={{ mb: 3 }}>
            <CustomerList branchId={data.branch.id} />
          </Box>
        )}

        {/* Daily Report Tab - Sub-Admin Only */}
        {!data.isAdminView && activeTab === 2 && (
          <Box sx={{ mb: 3 }}>
            <DailyReportForm
              branchId={data.branch.id}
              onSuccess={() => {
                fetchData();
              }}
            />
          </Box>
        )}

        {/* Admin View - Show dashboard without tabs */}
        {data.isAdminView && (
          <>
            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
                    background: 'linear-gradient(135deg, #B56A3A 0%, #A85A2A 100%)',
                    color: '#FFF',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <InventoryIcon />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Branch Stock
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {data.stock.totalStock.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Total Value: {data.stock.totalValue.toLocaleString()} ETB
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
                    border: '1px solid rgba(78, 24, 21, 0.06)',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <WarningAmberIcon sx={{ color: colors.warning }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                        Low Stock Items
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                      {data.stock.lowStockCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Needs attention
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
                    border: '1px solid rgba(78, 24, 21, 0.06)',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <TrendingDownIcon sx={{ color: colors.gold }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                        Daily Sales
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                      {data.dailySales.quantity.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(data.dailySales.date).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
                    border: '1px solid rgba(78, 24, 21, 0.06)',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <LocalShippingIcon sx={{ color: colors.gold }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                        Pending Transfers
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                      {data.transfers.pendingCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      To Receive
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>

      {/* Return Stock Dialog */}
      <Dialog open={returnStockOpen} onClose={() => setReturnStockOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Return Stock to Main Hub</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Product Name"
              value={returnStockData.productName}
              onChange={(e) => setReturnStockData({ ...returnStockData, productName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Quantity"
              type="number"
              value={returnStockData.quantity}
              onChange={(e) => setReturnStockData({ ...returnStockData, quantity: e.target.value })}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={returnStockData.category}
                onChange={(e) => setReturnStockData({ ...returnStockData, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="Injera">Injera</MenuItem>
                <MenuItem value="Pure Teff">Pure Teff</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Unit"
              value={returnStockData.unit}
              onChange={(e) => setReturnStockData({ ...returnStockData, unit: e.target.value })}
              placeholder="pieces"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnStockOpen(false)}>Cancel</Button>
          <Button
            onClick={handleReturnStock}
            variant="contained"
            disabled={returning}
            sx={{
              background: `linear-gradient(135deg, ${colors.gold} 0%, #A85A2A 100%)`,
              '&:hover': { opacity: 0.9 },
            }}
          >
            {returning ? 'Returning...' : 'Return Stock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

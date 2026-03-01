import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Table,
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
  Snackbar,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HistoryIcon from '@mui/icons-material/History';
import StorefrontIcon from '@mui/icons-material/Storefront';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

interface BranchSelectionData {
  branches: Array<{
    id: string;
    name: string;
    location: string;
    statistics: {
      totalStock: number;
      totalValue: number;
      lowStockCount: number;
      pendingTransfersCount: number;
      lastRestockedAt: string | null;
    };
  }>;
  requiresSelection: true;
}

export const BranchDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<BranchDashboardData | null>(null);
  const [branchSelection, setBranchSelection] = useState<BranchSelectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receivingId, setReceivingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Check if branchId is in URL query params (for admin viewing specific branch)
      const urlParams = new URLSearchParams(location.search);
      const branchIdParam = urlParams.get('branchId');
      
      // Build URL with branchId if provided (for admin)
      const url = branchIdParam 
        ? `${API_URL}/branches/dashboard?branchId=${branchIdParam}`
        : `${API_URL}/branches/dashboard`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch dashboard data' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      
      // Check if this is a branch selection response
      if (json.requiresSelection) {
        setBranchSelection(json);
        setData(null);
      } else {
        setData(json);
        setBranchSelection(null);
      }
    } catch (e: any) {
      console.error('Fetch error:', e);
      setError(e.message || 'Failed to load dashboard. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get user role
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
    fetchData();
  }, [location.search]); // Re-fetch when URL query params change

  const handleBranchSelect = (branchId: string) => {
    navigate(`/branch-dashboard?branchId=${branchId}`);
  };

  const handleReceive = async (transferId: string) => {
    try {
      setReceivingId(transferId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/stock-transfers/${transferId}/receive`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to receive transfer' }));
        throw new Error(err.message || 'Failed to receive transfer');
      }
      setSnackbar({ open: true, message: 'Transfer received successfully!', severity: 'success' });
      await fetchData();
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to receive transfer', severity: 'error' });
    } finally {
      setReceivingId(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 400, gap: 2 }}>
        <CircularProgress sx={{ color: colors.gold }} />
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Loading branch dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          sx={{
            background: `linear-gradient(135deg, ${colors.gold} 0%, #A85A2A 100%)`,
            '&:hover': { opacity: 0.9 },
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Show branch selection if admin needs to select a branch
  if (branchSelection && branchSelection.requiresSelection) {
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
              Select Branch to View
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Choose a branch to view its dashboard and manage stock
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {branchSelection.branches.map((branch) => (
              <Grid item xs={12} sm={6} md={4} key={branch.id}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
                    border: '1px solid rgba(78, 24, 21, 0.06)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 24px rgba(78, 24, 21, 0.12)',
                    },
                  }}
                  onClick={() => handleBranchSelect(branch.id)}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>
                          {branch.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          {branch.location}
                        </Typography>
                      </Box>
                      <StorefrontIcon sx={{ color: colors.gold, fontSize: 28 }} />
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                            Total Stock
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                            {branch.statistics.totalStock.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                            Total Value
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                            {branch.statistics.totalValue.toLocaleString()} ETB
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WarningAmberIcon
                            sx={{
                              fontSize: 16,
                              color: branch.statistics.lowStockCount > 0 ? colors.warning : colors.textSecondary,
                            }}
                          />
                          <Box>
                            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                              Low Stock
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: branch.statistics.lowStockCount > 0 ? colors.warning : colors.textPrimary,
                              }}
                            >
                              {branch.statistics.lowStockCount}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocalShippingIcon
                            sx={{
                              fontSize: 16,
                              color: branch.statistics.pendingTransfersCount > 0 ? colors.gold : colors.textSecondary,
                            }}
                          />
                          <Box>
                            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                              Pending
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                              {branch.statistics.pendingTransfersCount}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBranchSelect(branch.id);
                      }}
                      sx={{
                        background: `linear-gradient(135deg, ${colors.gold} 0%, #A85A2A 100%)`,
                        '&:hover': { opacity: 0.9 },
                        fontWeight: 600,
                      }}
                    >
                      View Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 2 }}>
          No data available
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
        >
          Refresh
        </Button>
      </Box>
    );
  }

  return (
    <>
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
                {data.isAdminView && userRole === 'admin' && (
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/branch-dashboard')}
                    sx={{ borderColor: colors.gold, color: colors.gold, mr: 1 }}
                  >
                    Back to Branches
                  </Button>
                )}
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
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {data.isAdminView && (
                  <Chip
                    label="Admin View"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                )}
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchData}
                  disabled={loading}
                  sx={{ borderColor: colors.gold, color: colors.gold }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
            
            {/* Quick Actions */}
            {data.isAdminView && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<InventoryIcon />}
                  onClick={() => navigate(`/stocks?branchId=${data.branch.id}`)}
                  sx={{ borderColor: colors.gold, color: colors.gold }}
                >
                  View Stock List
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate(`/activity-logs?branchId=${data.branch.id}`)}
                  sx={{ borderColor: colors.gold, color: colors.gold }}
                >
                  View Activity Logs
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LocalShippingIcon />}
                  onClick={() => navigate(`/stock-transfers?branchId=${data.branch.id}`)}
                  sx={{ borderColor: colors.gold, color: colors.gold }}
                >
                  View Transfers
                </Button>
              </Box>
            )}
          </Box>

          {/* No tabs for admin viewing branch - tabs are only in DashboardBranch (sub-admin's main dashboard) */}

          {/* Dashboard Content - Admin view only (sub-admin uses DashboardBranch with tabs) */}
          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
                  background: 'linear-gradient(135deg, #B56A3A 0%, #A85A2A 100%)',
                  color: '#FFF',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' },
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
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <WarningAmberIcon sx={{ color: data.stock.lowStockCount > 0 ? colors.warning : colors.textSecondary }} />
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
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' },
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
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' },
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                        Low Stock in My Branch
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => navigate(`/stocks?branchId=${data.branch.id}&isLowStock=true`)}
                        sx={{ color: colors.gold }}
                      >
                        View All
                      </Button>
                    </Box>
                    <List>
                      {data.stock.lowStockItems.slice(0, 5).map((item, idx) => (
                        <Box key={item.id}>
                          <ListItem
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                            onClick={() => navigate(`/stocks/${item.id}`)}
                          >
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
                    {data.stock.lowStockItems.length > 5 && (
                      <Button
                        fullWidth
                        variant="text"
                        onClick={() => navigate(`/stocks?branchId=${data.branch.id}&isLowStock=true`)}
                        sx={{ mt: 1, color: colors.gold }}
                      >
                        +{data.stock.lowStockItems.length - 5} more items
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Category Breakdown */}
            {data.stock.categoryBreakdown.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                        Stock by Category
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => navigate(`/stocks?branchId=${data.branch.id}`)}
                        sx={{ color: colors.gold }}
                      >
                        View All Stock
                      </Button>
                    </Box>
                    <List>
                      {data.stock.categoryBreakdown.map((cat, idx) => (
                        <Box key={cat.category}>
                          <ListItem
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                            onClick={() => navigate(`/stocks?branchId=${data.branch.id}&category=${cat.category}`)}
                          >
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
                          <TableRow key={t.id} hover>
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
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Recent Activity */}
            {data.recentActivity.length > 0 && (
              <Grid item xs={12}>
                <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HistoryIcon sx={{ color: colors.gold }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                          Recent Activity in My Branch
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => navigate(`/activity-logs?branchId=${data.branch.id}`)}
                        sx={{ color: colors.gold }}
                      >
                        View All Activity
                      </Button>
                    </Box>
                    <List>
                      {data.recentActivity.map((activity, idx) => (
                        <Box key={activity.id}>
                          <ListItem
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                            onClick={() => navigate(`/activity-logs/${activity.id}`)}
                          >
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

            {/* Empty States */}
            {data.stock.lowStockItems.length === 0 && data.stock.categoryBreakdown.length === 0 && (
              <Grid item xs={12}>
                <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)', p: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <InventoryIcon sx={{ fontSize: 64, color: colors.textSecondary, mb: 2 }} />
                    <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 1 }}>
                      No stock data available
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Stock information will appear here once items are added to this branch.
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

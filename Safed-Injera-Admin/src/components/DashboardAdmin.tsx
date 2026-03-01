import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  IconButton,
  Tooltip,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { DashboardBranch } from './DashboardBranch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const colors = {
  cream: '#F9F9F7',
  paper: '#FFFFFF',
  gold: '#B56A3A',
  textPrimary: '#4E1815',
  textSecondary: '#6B7B7D',
  success: '#4CAF50',
  warning: '#FF9800',
};

interface BranchStatistics {
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
}

interface DashboardAdminProps {
  onViewBranch?: (branchId: string) => void;
}

export const DashboardAdmin = ({ onViewBranch }: DashboardAdminProps) => {
  const [branches, setBranches] = useState<BranchStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/branches/dashboard/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to fetch');
      }
      const json = await response.json();
      setBranches(json.branches || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    // Check if branchId is in URL params
    const branchIdParam = searchParams.get('branchId');
    if (branchIdParam) {
      setSelectedBranchId(branchIdParam);
    }
  }, [searchParams]);

  const handleViewBranch = (branchId: string) => {
    if (onViewBranch) {
      onViewBranch(branchId);
    } else {
      navigate(`/dashboard/branch/${branchId}`);
    }
    setSelectedBranchId(branchId);
  };

  if (selectedBranchId) {
    return (
      <Box>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setSelectedBranchId(null)}
            sx={{ mb: 2 }}
          >
            ← Back to All Branches
          </Button>
        </Box>
        <DashboardBranch branchId={selectedBranchId} />
      </Box>
    );
  }

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
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

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
          <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
            Branch Overview & Quick Edit
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Manage stock across all branches. Click "View / Manage Branch" to see branch-specific details.
          </Typography>
        </Box>

        {/* Branch Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {branches.map((branch) => (
            <Grid item xs={12} md={6} lg={4} key={branch.id}>
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
                  border: '1px solid rgba(78, 24, 21, 0.06)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 24px rgba(78, 24, 21, 0.12)',
                  },
                }}
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
                        <WarningAmberIcon sx={{ fontSize: 16, color: branch.statistics.lowStockCount > 0 ? colors.warning : colors.textSecondary }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                            Low Stock
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: branch.statistics.lowStockCount > 0 ? colors.warning : colors.textPrimary }}>
                            {branch.statistics.lowStockCount}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocalShippingIcon sx={{ fontSize: 16, color: branch.statistics.pendingTransfersCount > 0 ? colors.gold : colors.textSecondary }} />
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

                  {branch.statistics.lastRestockedAt && (
                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 2 }}>
                      Last restocked: {new Date(branch.statistics.lastRestockedAt).toLocaleDateString()}
                    </Typography>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewBranch(branch.id)}
                    sx={{
                      background: `linear-gradient(135deg, ${colors.gold} 0%, #A85A2A 100%)`,
                      '&:hover': { opacity: 0.9 },
                      fontWeight: 600,
                    }}
                  >
                    View / Manage Branch
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Branch Table View */}
        {branches.length > 0 && (
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                All Branches Summary
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Branch</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Total Stock</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Total Value</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Low Stock</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Pending Transfers</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {branch.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            {branch.location}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{branch.statistics.totalStock.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{branch.statistics.totalValue.toLocaleString()} ETB</Typography>
                      </TableCell>
                      <TableCell align="right">
                        {branch.statistics.lowStockCount > 0 ? (
                          <Chip
                            label={branch.statistics.lowStockCount}
                            color="warning"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {branch.statistics.pendingTransfersCount > 0 ? (
                          <Chip
                            label={branch.statistics.pendingTransfersCount}
                            color="info"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View branch dashboard">
                          <IconButton
                            size="small"
                            onClick={() => handleViewBranch(branch.id)}
                            sx={{ color: colors.gold }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {branches.length === 0 && (
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)', p: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <StorefrontIcon sx={{ fontSize: 64, color: colors.textSecondary, mb: 2 }} />
              <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 1 }}>
                No branches found
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Create branches to start managing distributed inventory
              </Typography>
            </Box>
          </Card>
        )}
      </Box>
    </Box>
  );
};

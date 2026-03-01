import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

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

interface DailyReport {
  id: string;
  branch_id: string;
  report_date: string;
  received_injera: number;
  sold_injera: number;
  remaining_injera: number;
  wasted_injera: number;
  total_revenue: number;
  submitted_by: string;
  notes: string | null;
  created_at: string;
}

interface ReportWithDetails extends DailyReport {
  checklists: Array<{
    id: string;
    customer_id: string;
    delivered: boolean;
    quantity_delivered: number;
    comment: string | null;
  }>;
  branch_name?: string;
}

interface ReportStatistics {
  totalReports: number;
  totalRevenue: number;
  totalSold: number;
  totalWasted: number;
  averageWasteRate: number;
  averageDailyRevenue: number;
}

export const BranchReports = () => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportWithDetails | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    branchId: '',
    startDate: '',
    endDate: '',
  });

  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchBranches();
    fetchReports();
    fetchStatistics();
  }, [filters]);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      }
    } catch (e) {
      console.error('Failed to fetch branches', e);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.branchId) params.append('branchId', filters.branchId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('limit', '50');

      const response = await fetch(`${API_URL}/daily-reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setReports(data);
    } catch (e: any) {
      console.error('Failed to fetch reports', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.branchId) params.append('branchId', filters.branchId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`${API_URL}/daily-reports/analysis?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (e) {
      console.error('Failed to fetch statistics', e);
    }
  };

  const handleViewDetails = async (reportId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/daily-reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedReport(data);
        setDetailDialogOpen(true);
      }
    } catch (e) {
      console.error('Failed to fetch report details', e);
    }
  };

  if (loading && reports.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: colors.gold }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AssignmentIcon sx={{ color: colors.gold, fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary }}>
            Branch Daily Reports
          </Typography>
        </Box>

        {/* Statistics Cards */}
        {statistics && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Total Reports
                  </Typography>
                  <Typography variant="h5">{statistics.totalReports}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h5">{statistics.totalRevenue.toLocaleString()} ETB</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Average Waste Rate
                  </Typography>
                  <Typography variant="h5">{statistics.averageWasteRate.toFixed(1)}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Avg Daily Revenue
                  </Typography>
                  <Typography variant="h5">{statistics.averageDailyRevenue.toLocaleString()} ETB</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FilterListIcon sx={{ color: colors.gold }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filters
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Branch</InputLabel>
                  <Select
                    value={filters.branchId}
                    onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
                    label="Branch"
                  >
                    <MenuItem value="">All Branches</MenuItem>
                    {branches.map((branch) => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="End Date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Reports Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Daily Reports ({reports.length})
          </Typography>
          {reports.length === 0 ? (
            <Alert severity="info">No reports found for the selected filters.</Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Branch</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Received
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Sold
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Wasted
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Remaining
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Revenue
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>{new Date(report.report_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {branches.find((b) => b.id === report.branch_id)?.name || report.branch_id.slice(0, 8)}
                    </TableCell>
                    <TableCell align="right">{report.received_injera}</TableCell>
                    <TableCell align="right">{report.sold_injera}</TableCell>
                    <TableCell align="right">
                      {report.wasted_injera > 0 ? (
                        <Chip label={report.wasted_injera} color="warning" size="small" />
                      ) : (
                        report.wasted_injera
                      )}
                    </TableCell>
                    <TableCell align="right">{report.remaining_injera}</TableCell>
                    <TableCell align="right">{report.total_revenue.toLocaleString()} ETB</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(report.id)}
                        sx={{ color: colors.gold }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedReport.report_date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Revenue
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedReport.total_revenue.toLocaleString()} ETB
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Received
                  </Typography>
                  <Typography variant="body1">{selectedReport.received_injera}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Sold
                  </Typography>
                  <Typography variant="body1">{selectedReport.sold_injera}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Wasted
                  </Typography>
                  <Typography variant="body1" sx={{ color: selectedReport.wasted_injera > 0 ? colors.warning : 'inherit' }}>
                    {selectedReport.wasted_injera}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Remaining
                  </Typography>
                  <Typography variant="body1">{selectedReport.remaining_injera}</Typography>
                </Grid>
              </Grid>

              {selectedReport.notes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body2">{selectedReport.notes}</Typography>
                </Box>
              )}

              {selectedReport.checklists && selectedReport.checklists.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Customer Deliveries
                  </Typography>
                  <List>
                    {selectedReport.checklists.map((checklist, idx) => (
                      <Box key={checklist.id}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2">
                                  Customer ID: {checklist.customer_id.slice(0, 8)}
                                </Typography>
                                {checklist.delivered ? (
                                  <Chip label="Delivered" color="success" size="small" />
                                ) : (
                                  <Chip label="Not Delivered" color="error" size="small" />
                                )}
                              </Box>
                            }
                            secondary={
                              checklist.delivered
                                ? `Quantity: ${checklist.quantity_delivered}`
                                : `Reason: ${checklist.comment || 'No reason provided'}`
                            }
                          />
                        </ListItem>
                        {idx < selectedReport.checklists.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

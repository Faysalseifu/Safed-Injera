import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  TextField,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const colors = {
  sidebar: '#4E1815',
  cream: '#F9F9F7',
  paper: '#FFFFFF',
  gold: '#B56A3A',
  goldDark: '#A85A2A',
  teal: '#A89688',
  textPrimary: '#4E1815',
  textSecondary: '#6B7B7D',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

/** Stable color per status for charts */
const STATUS_COLOR_PALETTE = [
  '#4E1815',
  '#B56A3A',
  '#A89688',
  '#4CAF50',
  '#2196F3',
  '#FF9800',
  '#E91E63',
  '#9C27B0',
  '#00BCD4',
  '#795548',
  '#607D8B',
];

function statusColor(status: string, index: number): string {
  const key = status.toLowerCase();
  const fixed: Record<string, string> = {
    delivered: '#4CAF50',
    cancelled: '#9E9E9E',
    declined: '#F44336',
    pending: '#FF9800',
    confirmed: '#8BC34A',
    processing: '#03A9F4',
    shipped: '#3F51B5',
    sent: '#00ACC1',
    checked: '#26A69A',
  };
  return fixed[key] ?? STATUS_COLOR_PALETTE[index % STATUS_COLOR_PALETTE.length];
}

function humanizeStatus(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface InsightsResponse {
  range?: { allTime?: boolean; from?: string; to?: string };
  statusBreakdown: { status: string; count: number }[];
  topCustomers: {
    customer_name: string;
    email: string;
    order_count: number;
    total_revenue: number;
  }[];
  businessTypeBreakdown: { business_type: string; order_count: number }[];
}

type DatePreset = '30d' | '14d' | 'week' | '1d' | 'all' | 'custom';

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Preset → inclusive local date range (30d = last 30 calendar days including today). */
function computePresetRange(
  preset: Exclude<DatePreset, 'custom'>
): { from: string; to: string } | { all: true } {
  const today = startOfToday();
  if (preset === 'all') return { all: true };
  const end = new Date(today);
  const start = new Date(today);
  switch (preset) {
    case '1d':
      break;
    case '30d':
      start.setDate(start.getDate() - 29);
      break;
    case '14d':
      start.setDate(start.getDate() - 13);
      break;
    case 'week': {
      const day = today.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      start.setDate(today.getDate() + diffToMonday);
      break;
    }
    default:
      start.setDate(start.getDate() - 29);
  }
  return { from: toYmd(start), to: toYmd(end) };
}


interface ProductSalesRow {
  product: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}

interface SalesPayload {
  productSales: ProductSalesRow[];
}

const Analytics = () => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportType, setExportType] = useState('orders');
  const [loading, setLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [salesData, setSalesData] = useState<SalesPayload | null>(null);

  /** Default reporting window: last 30 days (matches API default). */
  const [preset, setPreset] = useState<DatePreset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  /** When preset is "custom", fetch uses this applied range (draft fields until Apply). */
  const [appliedCustom, setAppliedCustom] = useState<{ from: string; to: string } | null>(null);

  const selectPreset = (p: DatePreset) => {
    setPreset(p);
    if (p === 'custom') {
      const r = computePresetRange('30d');
      if ('from' in r) {
        setCustomFrom(r.from);
        setCustomTo(r.to);
        setAppliedCustom({ from: r.from, to: r.to });
      }
    } else {
      setAppliedCustom(null);
    }
  };

  const applyCustomRange = () => {
    if (!customFrom || !customTo || customFrom > customTo) return;
    setAppliedCustom({ from: customFrom, to: customTo });
  };

  useEffect(() => {
    const fetchInsights = async () => {
      let query = '';
      if (preset === 'custom') {
        if (!appliedCustom) return;
        query = `from=${encodeURIComponent(appliedCustom.from)}&to=${encodeURIComponent(appliedCustom.to)}`;
      } else {
        const r = computePresetRange(preset);
        if ('all' in r && r.all) query = 'all=true';
        else if ('from' in r) query = `from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`;
      }

      setInsightsLoading(true);
      setInsightsError(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const qs = query ? `?${query}` : '';
      try {
        const [insRes, salesRes] = await Promise.all([
          fetch(`${API_URL}/analytics/insights${qs}`, { headers }),
          fetch(`${API_URL}/analytics/sales${qs}`, { headers }),
        ]);
        if (!insRes.ok) throw new Error('Failed to load analytics insights');
        setInsights(await insRes.json());
        if (salesRes.ok) setSalesData(await salesRes.json());
      } catch (e) {
        console.error(e);
        setInsightsError('Could not load insights. Check that the API is running.');
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchInsights();
  }, [preset, appliedCustom]);

  const totals = useMemo(() => {
    const breakdown = insights?.statusBreakdown ?? [];
    const sum = breakdown.reduce((a, b) => a + b.count, 0);
    const countOf = (s: string) =>
      breakdown.find((x) => x.status.toLowerCase() === s.toLowerCase())?.count ?? 0;
    return {
      total: sum,
      delivered: countOf('delivered'),
      cancelled: countOf('cancelled'),
      declined: countOf('declined'),
      pending: countOf('pending'),
    };
  }, [insights]);

  const periodLabel = useMemo(() => {
    const r = insights?.range;
    if (r?.allTime) return 'All time';
    if (r?.from && r?.to) return `${r.from} → ${r.to}`;
    return 'Last 30 days';
  }, [insights?.range]);

  const comparisonSummary = useMemo(() => {
    const { delivered, cancelled, declined, pending, total } = totals;
    const prefix = insights?.range?.allTime
      ? 'All-time: '
      : insights?.range?.from && insights?.range?.to
        ? `Selected period (${insights.range.from} → ${insights.range.to}): `
        : '';
    if (total === 0) {
      return `${prefix}No orders in this range yet. Try widening the date filter or choose “All time”.`;
    }
    const lost = cancelled + declined;
    const ratioText =
      lost > 0
        ? `For every cancelled or declined order, you have about ${(delivered / lost).toFixed(1)} delivered orders.`
        : delivered > 0
          ? 'No cancelled or declined orders in this range — focus on moving pending orders forward.'
          : '';
    return `${prefix}${delivered} delivered, ${cancelled} cancelled, ${declined} declined, ${pending} pending. ${ratioText}`;
  }, [totals, insights?.range]);

  const statusBarData = useMemo(() => {
    const rows = insights?.statusBreakdown ?? [];
    return {
      labels: rows.map((r) => humanizeStatus(r.status)),
      datasets: [
        {
          label: 'Orders',
          data: rows.map((r) => r.count),
          backgroundColor: rows.map((r, i) => statusColor(r.status, i)),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [insights]);

  const statusDoughnutData = useMemo(() => {
    const rows = insights?.statusBreakdown ?? [];
    return {
      labels: rows.map((r) => humanizeStatus(r.status)),
      datasets: [
        {
          data: rows.map((r) => r.count),
          backgroundColor: rows.map((r, i) => statusColor(r.status, i)),
          borderWidth: 0,
        },
      ],
    };
  }, [insights]);

  const keyComparisonBarData = useMemo(() => {
    const { delivered, cancelled, declined, pending } = totals;
    return {
      labels: ['Delivered', 'Cancelled', 'Declined', 'Pending'],
      datasets: [
        {
          label: 'Order count',
          data: [delivered, cancelled, declined, pending],
          backgroundColor: ['#4CAF50', '#9E9E9E', '#F44336', '#FF9800'],
          borderRadius: 10,
        },
      ],
    };
  }, [totals]);

  const topCustomersBarData = useMemo(() => {
    const rows = insights?.topCustomers ?? [];
    return {
      labels: rows.map((r) => {
        const name = r.customer_name?.trim() || 'Unknown';
        return name.length > 22 ? `${name.slice(0, 20)}…` : name;
      }),
      datasets: [
        {
          label: 'Orders placed',
          data: rows.map((r) => r.order_count),
          backgroundColor: 'rgba(181, 106, 58, 0.85)',
          borderRadius: 6,
        },
      ],
    };
  }, [insights]);

  const businessTypeData = useMemo(() => {
    const rows = insights?.businessTypeBreakdown ?? [];
    return {
      labels: rows.map((r) => humanizeStatus(r.business_type.replace(/-/g, ' '))),
      datasets: [
        {
          label: 'Orders',
          data: rows.map((r) => r.order_count),
          backgroundColor: rows.map((_, i) => STATUS_COLOR_PALETTE[i % STATUS_COLOR_PALETTE.length]),
          borderRadius: 8,
        },
      ],
    };
  }, [insights]);

  const productMixData = useMemo(() => {
    const rows = (salesData?.productSales ?? []).filter((p) => safeNum(p.total_quantity) > 0);
    const palette = [
      '#4E1815',
      '#B56A3A',
      '#A89688',
      '#4CAF50',
      '#2196F3',
      '#E91E63',
      '#9C27B0',
    ];
    return {
      labels: rows.map((p) => p.product || 'Product'),
      datasets: [
        {
          data: rows.map((p) => safeNum(p.total_quantity)),
          backgroundColor: rows.map((_, i) => palette[i % palette.length]),
          borderWidth: 0,
        },
      ],
    };
  }, [salesData]);

  const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: colors.textPrimary, font: { family: 'Inter, system-ui, sans-serif' } },
      },
      tooltip: {
        backgroundColor: colors.sidebar,
        titleFont: { weight: '600' as const },
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  const barOptionsVertical = {
    ...chartOptionsBase,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: colors.textSecondary, maxRotation: 45, minRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(63, 79, 81, 0.06)' },
        ticks: { color: colors.textSecondary, stepSize: 1 },
      },
    },
  };

  const barOptionsHorizontal = {
    ...chartOptionsBase,
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(63, 79, 81, 0.06)' },
        ticks: { color: colors.textSecondary, stepSize: 1 },
      },
      y: {
        grid: { display: false },
        ticks: { color: colors.textSecondary, font: { size: 11 } },
      },
    },
  };

  const doughnutOptions = {
    ...chartOptionsBase,
    plugins: {
      ...chartOptionsBase.plugins,
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 16,
          color: colors.textPrimary,
          font: { size: 11 },
        },
      },
    },
  };

  const handleExport = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `${API_URL}/analytics/export?format=${exportFormat}&type=${exportType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const extensions: Record<string, string> = {
        csv: 'csv',
        pdf: 'pdf',
        excel: 'xlsx',
      };

      a.download = `safed-injera-${exportType}-${new Date().toISOString().split('T')[0]}.${extensions[exportFormat]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ExportCard = ({
    format,
    icon,
    title,
    description,
  }: {
    format: string;
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <Box
      onClick={() => setExportFormat(format)}
      sx={{
        cursor: 'pointer',
        bgcolor: colors.paper,
        borderRadius: '16px',
        p: 3,
        border: exportFormat === format ? `2px solid ${colors.gold}` : `1px solid rgba(78, 24, 21, 0.08)`,
        boxShadow: exportFormat === format ? '0 4px 20px rgba(181, 106, 58, 0.2)' : '0 2px 8px rgba(78, 24, 21, 0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(78, 24, 21, 0.1)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            color: exportFormat === format ? colors.gold : colors.sidebar,
            p: 1.5,
            borderRadius: '12px',
            bgcolor: exportFormat === format ? 'rgba(181, 106, 58, 0.1)' : 'rgba(78, 24, 21, 0.06)',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {description}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: '1400px',
        margin: '0 auto',
        bgcolor: colors.cream,
        minHeight: '100vh',
      }}
      className="fade-in"
    >
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
        <Avatar
          sx={{
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            background: 'linear-gradient(135deg, #B56A3A 0%, #A85A2A 100%)',
            boxShadow: '0 4px 12px rgba(181, 106, 58, 0.3)',
          }}
        >
          <TableChartIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
        </Avatar>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.textPrimary,
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            }}
          >
            Analytics & Reports
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Visual comparisons: orders by outcome, top customers, and business mix. Export raw data below.
          </Typography>
        </Box>
      </Box>

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: '1px solid rgba(78, 24, 21, 0.08)',
          bgcolor: colors.paper,
          boxShadow: '0 2px 12px rgba(78, 24, 21, 0.06)',
        }}
      >
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <DateRangeIcon sx={{ color: colors.gold }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                Reporting period
              </Typography>
              <Chip label={periodLabel} size="small" sx={{ bgcolor: 'rgba(181, 106, 58, 0.12)', fontWeight: 600 }} />
            </Stack>
            <Typography variant="caption" sx={{ color: colors.textSecondary, maxWidth: 420 }}>
              Default: last 30 days. All charts use the same range. Product mix uses revenue-eligible order statuses.
            </Typography>
          </Stack>

          <ToggleButtonGroup
            value={preset}
            exclusive
            onChange={(_, v: DatePreset | null) => {
              if (v !== null) selectPreset(v);
            }}
            size="small"
            sx={{
              flexWrap: 'wrap',
              gap: 0.5,
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 600,
                px: 1.5,
                borderRadius: '10px !important',
                border: `1px solid rgba(78, 24, 21, 0.12) !important`,
              },
              '& .Mui-selected': {
                bgcolor: 'rgba(181, 106, 58, 0.15) !important',
                color: `${colors.textPrimary} !important`,
              },
            }}
          >
            <ToggleButton value="30d">30 days</ToggleButton>
            <ToggleButton value="14d">2 weeks</ToggleButton>
            <ToggleButton value="week">This week</ToggleButton>
            <ToggleButton value="1d">Today</ToggleButton>
            <ToggleButton value="all">All data</ToggleButton>
            <ToggleButton value="custom">Custom</ToggleButton>
          </ToggleButtonGroup>

          {preset === 'custom' && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mt: 2 }}>
              <TextField
                label="From"
                type="date"
                size="small"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="To"
                type="date"
                size="small"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                variant="contained"
                onClick={applyCustomRange}
                disabled={!customFrom || !customTo || customFrom > customTo}
                sx={{ bgcolor: colors.gold, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                Apply range
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      {insightsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: colors.gold }} />
        </Box>
      )}

      {insightsError && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {insightsError}
        </Alert>
      )}

      {!insightsLoading && insights && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(78,24,21,0.08)', bgcolor: colors.paper }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Delivered
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.success }}>
                    {totals.delivered}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(78,24,21,0.08)', bgcolor: colors.paper }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Cancelled
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#9E9E9E' }}>
                    {totals.cancelled}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(78,24,21,0.08)', bgcolor: colors.paper }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Declined
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.error }}>
                    {totals.declined}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(78,24,21,0.08)', bgcolor: colors.paper }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.warning }}>
                    {totals.pending}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              border: '1px solid rgba(78,24,21,0.08)',
              bgcolor: 'rgba(255,255,255,0.95)',
              borderLeft: `4px solid ${colors.gold}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CompareArrowsIcon sx={{ color: colors.gold }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                  Compare & contrast
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.7 }}>
                {comparisonSummary}
              </Typography>
            </CardContent>
          </Card>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <ChartCard title="Outcome focus: delivered vs cancelled vs declined vs pending" icon={<CompareArrowsIcon />}>
                {totals.total === 0 ? (
                  <EmptyChart />
                ) : (
                  <Box sx={{ height: 280 }}>
                    <Bar data={keyComparisonBarData} options={barOptionsVertical} />
                  </Box>
                )}
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard title="Share of orders by status" icon={<PieChartOutlineIcon />}>
                {totals.total === 0 ? (
                  <EmptyChart />
                ) : (
                  <Box sx={{ height: 280 }}>
                    <Doughnut data={statusDoughnutData} options={doughnutOptions} />
                  </Box>
                )}
              </ChartCard>
            </Grid>
            <Grid item xs={12}>
              <ChartCard title="All statuses — order volume" icon={<TableChartIcon />}>
                {totals.total === 0 ? (
                  <EmptyChart />
                ) : (
                  <Box sx={{ height: 320 }}>
                    <Bar data={statusBarData} options={barOptionsVertical} />
                  </Box>
                )}
              </ChartCard>
            </Grid>
            <Grid item xs={12} lg={7}>
              <ChartCard title="Who orders most (top 10 by order count)" icon={<TableChartIcon />}>
                {(!insights.topCustomers || insights.topCustomers.length === 0) ? (
                  <EmptyChart message="No customer data yet" />
                ) : (
                  <Box sx={{ height: Math.min(360, 40 + insights.topCustomers.length * 36) }}>
                    <Bar data={topCustomersBarData} options={barOptionsHorizontal} />
                  </Box>
                )}
              </ChartCard>
              {insights.topCustomers?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {insights.topCustomers.slice(0, 5).map((c, i) => (
                    <Box
                      key={`${c.email}-${c.customer_name}-${i}`}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: '1px solid rgba(78,24,21,0.06)',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {i + 1}. {c.customer_name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip size="small" label={`${c.order_count} orders`} sx={{ bgcolor: 'rgba(181,106,58,0.12)' }} />
                        <Typography variant="caption" color="text.secondary">
                          {c.total_revenue.toLocaleString()} ETB
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} lg={5}>
              <ChartCard title="Orders by business type" icon={<PieChartOutlineIcon />}>
                {(!insights.businessTypeBreakdown || insights.businessTypeBreakdown.length === 0) ? (
                  <EmptyChart message="No business type data" />
                ) : (
                  <Box sx={{ height: 280 }}>
                    <Bar data={businessTypeData} options={barOptionsVertical} />
                  </Box>
                )}
              </ChartCard>
            </Grid>
            <Grid item xs={12}>
              <ChartCard title={`Product mix (units, revenue-eligible) — ${periodLabel}`} icon={<PieChartOutlineIcon />}>
                {!salesData?.productSales?.length || productMixData.datasets[0].data.length === 0 ? (
                  <EmptyChart message="No product sales in this period (or sales API unavailable)" />
                ) : (
                  <Box sx={{ height: 280 }}>
                    <Doughnut data={productMixData} options={doughnutOptions} />
                  </Box>
                )}
              </ChartCard>
            </Grid>
          </Grid>
        </>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              bgcolor: colors.paper,
              borderRadius: '20px',
              p: { xs: 2, md: 4 },
              boxShadow: '0 2px 12px rgba(78, 24, 21, 0.06)',
              border: '1px solid rgba(78, 24, 21, 0.04)',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 3 }}>
              Export Data
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: colors.gold,
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}
                >
                  1
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                  Select Data Type
                </Typography>
              </Box>

              <FormControl
                sx={{
                  minWidth: 240,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&.Mui-focused fieldset': {
                      borderColor: colors.gold,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: colors.gold,
                  },
                }}
              >
                <InputLabel>Data Type</InputLabel>
                <Select
                  value={exportType}
                  label="Data Type"
                  onChange={(e) => setExportType(e.target.value)}
                >
                  <MenuItem value="orders">Orders</MenuItem>
                  <MenuItem value="stock">Stock Inventory</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: colors.gold,
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}
                >
                  2
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                  Select Export Format
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <ExportCard
                    format="csv"
                    icon={<DescriptionIcon sx={{ fontSize: 36 }} />}
                    title="CSV"
                    description="Comma-separated values, works with Excel and Google Sheets"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ExportCard
                    format="excel"
                    icon={<TableChartIcon sx={{ fontSize: 36 }} />}
                    title="Excel"
                    description="Microsoft Excel format (.xlsx)"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ExportCard
                    format="pdf"
                    icon={<PictureAsPdfIcon sx={{ fontSize: 36 }} />}
                    title="PDF"
                    description="Portable Document Format, ready to print"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={loading}
              sx={{
                bgcolor: colors.gold,
                color: '#FFF',
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(181, 106, 58, 0.25)',
                '&:hover': {
                  bgcolor: colors.goldDark,
                  boxShadow: '0 6px 24px rgba(181, 106, 58, 0.35)',
                },
              }}
            >
              {loading ? 'Exporting...' : `Export ${exportType} as ${exportFormat.toUpperCase()}`}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              bgcolor: colors.paper,
              borderRadius: '20px',
              p: { xs: 2, md: 4 },
              boxShadow: '0 2px 12px rgba(78, 24, 21, 0.06)',
              border: '1px solid rgba(78, 24, 21, 0.04)',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 3 }}>
              Quick Reports
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => {
                    setExportType('orders');
                    setExportFormat('pdf');
                    setTimeout(handleExport, 100);
                  }}
                  sx={{
                    py: 2,
                    borderRadius: '12px',
                    borderColor: colors.sidebar,
                    color: colors.sidebar,
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: colors.gold,
                      color: colors.gold,
                      bgcolor: 'rgba(181, 106, 58, 0.05)',
                    },
                  }}
                >
                  Orders Report (PDF)
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TableChartIcon />}
                  onClick={() => {
                    setExportType('stock');
                    setExportFormat('excel');
                    setTimeout(handleExport, 100);
                  }}
                  sx={{
                    py: 2,
                    borderRadius: '12px',
                    borderColor: colors.sidebar,
                    color: colors.sidebar,
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: colors.gold,
                      color: colors.gold,
                      bgcolor: 'rgba(181, 106, 58, 0.05)',
                    },
                  }}
                >
                  Inventory (Excel)
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  onClick={() => {
                    setExportType('orders');
                    setExportFormat('csv');
                    setTimeout(handleExport, 100);
                  }}
                  sx={{
                    py: 2,
                    borderRadius: '12px',
                    borderColor: colors.sidebar,
                    color: colors.sidebar,
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: colors.gold,
                      color: colors.gold,
                      bgcolor: 'rgba(181, 106, 58, 0.05)',
                    },
                  }}
                >
                  Sales Data (CSV)
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

function safeNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function ChartCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        bgcolor: colors.paper,
        borderRadius: '20px',
        p: { xs: 2, md: 3 },
        boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
        border: '1px solid rgba(78, 24, 21, 0.06)',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ color: colors.gold }}>{icon}</Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

function EmptyChart({ message = 'No data for this chart yet' }: { message?: string }) {
  return (
    <Box
      sx={{
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textSecondary,
        typography: 'body2',
      }}
    >
      {message}
    </Box>
  );
}

export default Analytics;

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from '@mui/material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

// Design tokens - Safed Injera Branding
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
  purple: '#9C27B0',
  blue: '#2196F3',
  pink: '#E91E63',
  darkBg: '#3A120F',
  darkCard: '#4A2A1F',
};

// Gradient definitions - Safed Injera Branding
const gradients = {
  purple: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
  blue: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  pink: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
  teal: 'linear-gradient(135deg, #A89688 0%, #8B7A6D 100%)',
  gold: 'linear-gradient(135deg, #B56A3A 0%, #A85A2A 100%)',
  dark: 'linear-gradient(135deg, #4E1815 0%, #5A0F12 100%)',
  darkCard: 'linear-gradient(135deg, #4A2A1F 0%, #3A120F 100%)',
};

interface DashboardData {
  orders: {
    total: number;
    pending: number;
    completed: number;
    today: number;
    thisWeek: number;
  };
  soldKpis?: {
    internalDispatchThisWeek: number;
    directRetailThisWeek: number;
  };
  revenue: number;
  lowStockAlerts: number;
  lowStockItems: Array<{ productName: string; quantity: number }>;
  recentOrders: Array<{
    id: number;
    customerName: string;
    email?: string;
    phone?: string;
    businessType: string;
    product?: string;
    quantity: number;
    status: string;
    orderDate: string;
    message?: string;
    totalPrice?: number;
  }>;
}

interface SalesData {
  productSales: Array<{ _id: string; totalQuantity: number; orderCount: number }>;
  dailyBreakdown: Array<{ _id: string; totalQuantity: number; orderCount: number }>;
}

interface BranchOption {
  id: string;
  name: string;
  location?: string;
  is_main_hub?: boolean;
}

const toNumber = (value: unknown, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const getDailyLabel = (row: any): string => row?._id || row?.period || '';
const getDailyTotalQty = (row: any): number => toNumber(row?.totalQuantity ?? row?.total_quantity, 0);
const getDailyOrderCount = (row: any): number => toNumber(row?.orderCount ?? row?.order_count, 0);

const getProductLabel = (row: any): string => row?._id || row?.product || 'Unknown';
const getProductQty = (row: any): number => toNumber(row?.totalQuantity ?? row?.total_quantity, 0);

// Modern Metric Card Component
const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'gold' | 'dark' | 'teal' | 'purple' | 'blue' | 'pink';
  trend?: { value: number; positive: boolean };
}) => {
  const getBackground = () => {
    switch (variant) {
      case 'gold':
        return gradients.gold;
      case 'dark':
        return gradients.dark;
      case 'teal':
        return gradients.teal;
      case 'purple':
        return gradients.purple;
      case 'blue':
        return gradients.blue;
      case 'pink':
        return gradients.pink;
      default:
        return colors.paper;
    }
  };

  const isLight = variant === 'default';

  return (
    <Box
      sx={{
        background: getBackground(),
        borderRadius: '20px',
        padding: { xs: '20px', md: '24px' },
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isLight
          ? '0 2px 12px rgba(63, 79, 81, 0.06)'
          : '0 4px 20px rgba(0, 0, 0, 0.15)',
        border: isLight ? '1px solid rgba(63, 79, 81, 0.04)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '140px',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isLight
            ? '0 8px 24px rgba(63, 79, 81, 0.12)'
            : '0 12px 32px rgba(0, 0, 0, 0.25)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: '150px',
          height: '150px',
          background: isLight
            ? 'radial-gradient(circle, rgba(230, 181, 77, 0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: '12px',
            bgcolor: isLight ? 'rgba(63, 79, 81, 0.06)' : 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isLight ? colors.sidebar : '#FFFFFF',
          }}
        >
          {icon}
        </Box>
        {trend && (
          <Chip
            size="small"
            label={`${trend.positive ? '+' : ''}${trend.value}%`}
            sx={{
              bgcolor: trend.positive ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)',
              color: trend.positive ? colors.success : colors.error,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        )}
      </Box>
      <Box sx={{ mt: 'auto' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: isLight ? colors.textPrimary : '#FFFFFF',
            fontSize: { xs: '1.75rem', md: '2rem' },
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isLight ? colors.textSecondary : 'rgba(255, 255, 255, 0.8)',
            fontWeight: 500,
            mt: 0.5,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: isLight ? colors.textSecondary : 'rgba(255, 255, 255, 0.6)',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Recent Orders Card Component
const RecentOrdersCard = ({
  orders,
  onUpdateStatus,
  onOrderClick,
}: {
  orders: DashboardData['recentOrders'];
  onUpdateStatus: (orderId: number, newStatus: string) => Promise<void>;
  onOrderClick: (orderId: number) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>, orderId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedOrderId(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (selectedOrderId !== null) {
      await onUpdateStatus(selectedOrderId, newStatus);
    }
    handleClose();
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'rgba(255, 152, 0, 0.15)', text: colors.warning },
    confirmed: { bg: 'rgba(33, 150, 243, 0.15)', text: colors.blue },
    processing: { bg: 'rgba(156, 39, 176, 0.15)', text: colors.purple },
    shipped: { bg: 'rgba(0, 188, 212, 0.15)', text: '#00ACC1' },
    delivered: { bg: 'rgba(76, 175, 80, 0.15)', text: colors.success },
    cancelled: { bg: 'rgba(244, 67, 54, 0.15)', text: colors.error },
    declined: { bg: 'rgba(244, 67, 54, 0.15)', text: colors.error },
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 243, 238, 0.9) 100%)',
        borderRadius: '20px',
        p: { xs: 2, md: 3 },
        boxShadow: '0 4px 20px rgba(63, 79, 81, 0.08)',
        border: '1px solid rgba(63, 79, 81, 0.06)',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
            Last Orders
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Last 3 days (delivered orders removed after 1 day)
          </Typography>
        </Box>
      </Box>

      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          '& th, & td': {
            padding: '12px 8px',
            textAlign: 'left',
            borderBottom: '1px solid rgba(63, 79, 81, 0.08)',
          },
          '& th': {
            fontWeight: 600,
            color: colors.textSecondary,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
          '& tbody tr:hover': {
            bgcolor: 'rgba(63, 79, 81, 0.02)',
          },
        }}
      >
        <thead>
          <tr>
            <th>Customer</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders?.slice(0, 5).map((order) => (
            <tr key={order.id}>
              <td>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      background: gradients.gold,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(230, 181, 77, 0.3)',
                    }}
                  >
                    {order.customerName?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: colors.textPrimary,
                        cursor: 'pointer',
                        '&:hover': {
                          color: colors.gold,
                          textDecoration: 'underline',
                        },
                        transition: 'color 0.2s ease',
                      }}
                      onClick={() => onOrderClick(order.id)}
                    >
                      {order.customerName || 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
              </td>
              <td>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {order.businessType}
                </Typography>
              </td>
              <td>
                <Chip
                  size="small"
                  label={order.quantity}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(230, 181, 77, 0.2) 0%, rgba(201, 155, 57, 0.15) 100%)',
                    color: colors.goldDark,
                    fontWeight: 600,
                    minWidth: '40px',
                    border: '1px solid rgba(230, 181, 77, 0.3)',
                  }}
                />
              </td>
              <td>
                <Chip
                  size="small"
                  label={order.status}
                  onClick={(e) => handleStatusClick(e, order.id)}
                  sx={{
                    bgcolor: (statusColors[order.status] || statusColors.pending).bg,
                    color: (statusColors[order.status] || statusColors.pending).text,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    px: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                />
              </td>
              <td>
                <IconButton
                  size="small"
                  onClick={(e) => handleStatusClick(e, order.id)}
                  sx={{ color: colors.textSecondary }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            minWidth: '150px',
            mt: 0.5,
          }
        }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, color: colors.textSecondary, display: 'block' }}>
          Change Status
        </Typography>
        {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <MenuItem
            key={status}
            onClick={() => handleStatusChange(status)}
            sx={{
              fontSize: '0.875rem',
              textTransform: 'capitalize',
              '&:hover': {
                bgcolor: statusColors[status]?.bg,
                color: statusColors[status]?.text,
              }
            }}
          >
            {status}
          </MenuItem>
        ))}
      </Menu>

      {(!orders || orders.length === 0) && (
        <Typography sx={{ color: colors.textSecondary, textAlign: 'center', py: 4 }}>
          No recent orders
        </Typography>
      )}
    </Box>
  );
};

// Statistics Chart Component
const StatisticsChart = ({ data }: { data: SalesData['dailyBreakdown'] }) => {
  const chartData = {
    labels: data?.slice(-7).map((d) => {
      const rawDate = getDailyLabel(d);
      const date = rawDate ? new Date(rawDate) : null;
      return date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : '-';
    }) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Orders',
        data: data?.slice(-7).map((d) => getDailyOrderCount(d)) || [4, 6, 5, 8, 7, 9, 6],
        backgroundColor: [
          'rgba(156, 39, 176, 0.8)',
          'rgba(33, 150, 243, 0.8)',
          'rgba(233, 30, 99, 0.8)',
          'rgba(0, 188, 212, 0.8)',
          'rgba(230, 181, 77, 0.8)',
          'rgba(156, 39, 176, 0.8)',
          'rgba(33, 150, 243, 0.8)',
        ],
        borderRadius: 8,
        barThickness: 28,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: colors.sidebar,
        titleFont: { family: 'Inter', weight: 600 },
        bodyFont: { family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Inter', size: 12 },
          color: colors.textSecondary,
        },
      },
      y: {
        grid: {
          color: 'rgba(63, 79, 81, 0.06)',
          drawBorder: false,
        },
        ticks: {
          font: { family: 'Inter', size: 12 },
          color: colors.textSecondary,
          stepSize: 2,
        },
      },
    },
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 243, 238, 0.9) 100%)',
        borderRadius: '20px',
        p: { xs: 2, md: 3 },
        boxShadow: '0 4px 20px rgba(63, 79, 81, 0.08)',
        border: '1px solid rgba(63, 79, 81, 0.06)',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(156, 39, 176, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(-30%, -30%)',
        },
      }}
    >
      <Box sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
          Statistics
        </Typography>
      </Box>
      <Box sx={{ height: 280 }}>
        <Bar data={chartData} options={options} />
      </Box>
    </Box>
  );
};

// Sales Share Donut Chart
const SalesShareChart = ({ data }: { data: SalesData['productSales'] }) => {
  const chartData = {
    labels: data?.map((p) => getProductLabel(p)) || ['Product A', 'Product B', 'Product C'],
    datasets: [
      {
        data: data?.map((p) => getProductQty(p)) || [30, 45, 25],
        backgroundColor: [
          'rgba(156, 39, 176, 0.8)',
          'rgba(33, 150, 243, 0.8)',
          'rgba(233, 30, 99, 0.8)',
          'rgba(0, 188, 212, 0.8)',
          'rgba(230, 181, 77, 0.8)',
        ],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { family: 'Inter', size: 12 },
          color: colors.textPrimary,
        },
      },
      tooltip: {
        backgroundColor: colors.sidebar,
        titleFont: { family: 'Inter', weight: 600 },
        bodyFont: { family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 243, 238, 0.9) 100%)',
        borderRadius: '20px',
        p: { xs: 2, md: 3 },
        boxShadow: '0 4px 20px rgba(63, 79, 81, 0.08)',
        border: '1px solid rgba(63, 79, 81, 0.06)',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(233, 30, 99, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, 30%)',
        },
      }}
    >
      <Box sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
          Sales Share
        </Typography>
      </Box>
      <Box sx={{ height: 280, position: 'relative' }}>
        <Doughnut data={chartData} options={options} />
      </Box>
    </Box>
  );
};

// Trend Line Chart
const TrendChart = ({ data }: { data: SalesData['dailyBreakdown'] }) => {
  const chartData = {
    labels: data?.slice(-30).map((d, i) => {
      if (i % 5 === 0) {
        const rawDate = getDailyLabel(d);
        const date = rawDate ? new Date(rawDate) : null;
        return date && !Number.isNaN(date.getTime())
          ? date.toLocaleDateString('en-US', { month: 'short' })
          : '';
      }
      return '';
    }) || ['Jan', '', '', '', '', 'Feb', '', '', '', '', 'Mar', '', '', '', '', 'Apr', '', '', '', '', 'May'],
    datasets: [
      {
        label: 'Sales Trend',
        data: data?.slice(-30).map((d) => getDailyTotalQty(d)) || Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 50),
        borderColor: '#E91E63',
        backgroundColor: 'rgba(233, 30, 99, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#E91E63',
        pointHoverBorderColor: colors.paper,
        pointHoverBorderWidth: 2,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: colors.sidebar,
        titleFont: { family: 'Inter', weight: 600 },
        bodyFont: { family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Inter', size: 12 },
          color: colors.textSecondary,
        },
      },
      y: {
        grid: {
          color: 'rgba(63, 79, 81, 0.06)',
          drawBorder: false,
        },
        ticks: {
          font: { family: 'Inter', size: 12 },
          color: colors.textSecondary,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 243, 238, 0.9) 100%)',
        borderRadius: '20px',
        p: { xs: 2, md: 3 },
        boxShadow: '0 4px 20px rgba(63, 79, 81, 0.08)',
        border: '1px solid rgba(63, 79, 81, 0.06)',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(233, 30, 99, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(-20%, -20%)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, position: 'relative', zIndex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
          Sales Schedule
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.15) 0%, rgba(156, 39, 176, 0.1) 100%)',
            px: 2,
            py: 0.75,
            borderRadius: '12px',
            border: '1px solid rgba(233, 30, 99, 0.2)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {toNumber(data?.reduce((sum, d) => sum + getDailyTotalQty(d), 0), 0).toLocaleString()}
          </Typography>
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            Total
          </Typography>
        </Box>
      </Box>
      <Box sx={{ height: 240 }}>
        <Line data={chartData} options={options} />
      </Box>
    </Box>
  );
};

// Low Stock Alert Card
const LowStockCard = ({ items }: { items: DashboardData['lowStockItems'] }) => {
  return (
    <Box
      sx={{
        background: items && items.length > 0
          ? 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(0, 188, 212, 0.05) 100%)',
        borderRadius: '20px',
        p: { xs: 2, md: 3 },
        boxShadow: items && items.length > 0
          ? '0 4px 20px rgba(233, 30, 99, 0.15)'
          : '0 2px 12px rgba(63, 79, 81, 0.06)',
        border: items && items.length > 0
          ? '1px solid rgba(233, 30, 99, 0.2)'
          : '1px solid rgba(63, 79, 81, 0.04)',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: items && items.length > 0
            ? 'radial-gradient(circle, rgba(233, 30, 99, 0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(33, 150, 243, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: '12px',
            background: items && items.length > 0
              ? 'linear-gradient(135deg, rgba(233, 30, 99, 0.2) 0%, rgba(244, 67, 54, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(0, 188, 212, 0.15) 100%)',
            color: items && items.length > 0 ? colors.error : colors.success,
            display: 'flex',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <WarningAmberIcon fontSize="small" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
          Low Stock Alerts
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {items?.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 1.5,
              px: 1,
              borderRadius: '8px',
              mb: 1,
              borderBottom: index < items.length - 1 ? '1px solid rgba(63, 79, 81, 0.08)' : 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, color: colors.textPrimary }}>
              {item.productName}
            </Typography>
            <Chip
              size="small"
              label={`${item.quantity} left`}
              sx={{
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(233, 30, 99, 0.1) 100%)',
                color: colors.error,
                fontWeight: 600,
                border: '1px solid rgba(244, 67, 54, 0.3)',
              }}
            />
          </Box>
        ))}
      </Box>

      {(!items || items.length === 0) && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" sx={{ color: colors.success, fontWeight: 500 }}>
            ✓ All stock levels healthy
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Branch Office Activities Section Component
const BranchOfficeActivitiesSection = () => {
  const navigate = useNavigate();
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [branchStats, setBranchStats] = useState<any>(null);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        const [reportsRes, statsRes, branchesRes] = await Promise.all([
          fetch(`${API_URL}/daily-reports?limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/daily-reports/analysis`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/branches`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (reportsRes.ok) {
          const reports = await reportsRes.json();
          setRecentReports(reports);
        }
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setBranchStats(stats);
        }
        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          setBranches(branchesData);
        }
      } catch (e) {
        console.error('Failed to fetch branch activities', e);
      } finally {
        setLoading(false);
      }
    };

    fetchBranchActivities();
  }, []);

  return (
    <Box sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <StorefrontIcon sx={{ fontSize: 28, color: colors.gold }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary }}>
            Branch Office Activities
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate('/branch-reports')}
          sx={{ borderColor: colors.gold, color: colors.gold }}
        >
          View All Reports
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        {branchStats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Total Reports Submitted
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                    {branchStats.totalReports}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Total Branch Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.success }}>
                    {branchStats.totalRevenue.toLocaleString()} ETB
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Average Waste Rate
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: branchStats.averageWasteRate > 5 ? colors.warning : colors.textPrimary }}>
                    {branchStats.averageWasteRate.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Avg Daily Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                    {branchStats.averageDailyRevenue.toLocaleString()} ETB
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Recent Reports */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                  Recent Daily Reports
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/branch-reports')}
                  sx={{ color: colors.gold }}
                >
                  View All
                </Button>
              </Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={24} sx={{ color: colors.gold }} />
                </Box>
              ) : recentReports.length === 0 ? (
                <Alert severity="info">No reports submitted yet.</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Branch</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Sold</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Revenue</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Waste</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentReports.slice(0, 5).map((report: any) => {
                      const branch = branches.find((b) => b.id === report.branch_id);
                      return (
                        <TableRow key={report.id} hover>
                          <TableCell>{new Date(report.report_date).toLocaleDateString()}</TableCell>
                          <TableCell>{branch?.name || report.branch_id.slice(0, 8)}</TableCell>
                          <TableCell align="right">{report.sold_injera}</TableCell>
                          <TableCell align="right">{report.total_revenue.toLocaleString()} ETB</TableCell>
                          <TableCell align="right">
                            {report.wasted_injera > 0 ? (
                              <Chip label={report.wasted_injera} color="warning" size="small" />
                            ) : (
                              report.wasted_injera
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                Branch Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<StorefrontIcon />}
                  onClick={() => navigate('/branch-dashboard')}
                  sx={{
                    background: `linear-gradient(135deg, ${colors.gold} 0%, #A85A2A 100%)`,
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  View All Branches
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  onClick={() => navigate('/branch-reports')}
                  sx={{ borderColor: colors.gold, color: colors.gold }}
                >
                  Branch Reports & Analysis
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [allStocks, setAllStocks] = useState<any[]>([]);
  const [mainHubId, setMainHubId] = useState<string | null>(null);
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);
  const [totalInjera, setTotalInjera] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [branchTransferDialogOpen, setBranchTransferDialogOpen] = useState(false);
  const [selectedTransferBranchId, setSelectedTransferBranchId] = useState<string>('');
  const [selectedTransferStockId, setSelectedTransferStockId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(100);
  const [transferLoading, setTransferLoading] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const [dashboardRes, salesRes, lowStockRes] = await Promise.all([
        fetch(`${API_URL}/analytics/dashboard`, { headers }),
        fetch(`${API_URL}/analytics/sales?period=monthly`, { headers }),
        fetch(`${API_URL}/stocks/low-stock`, { headers }),
      ]);

      if (!dashboardRes.ok || !salesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const dashboard = await dashboardRes.json();
      const sales = await salesRes.json();
      const lowStockItems = lowStockRes.ok ? await lowStockRes.json() : [];

      // Enhance dashboard data with low stock items
      if (lowStockItems && lowStockItems.length > 0) {
        dashboard.lowStockItems = lowStockItems.map((item: any) => ({
          productName: item.productName,
          quantity: item.quantity,
          minimumThreshold: item.minimumThreshold,
        }));
        dashboard.lowStockAlerts = lowStockItems.length;
      }

      setDashboardData(dashboard);
      setSalesData(sales);
    } catch (err) {
      setError('Failed to load dashboard data. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStocks();
    fetchBranchOptions();
  }, []);

  // Refresh stocks when stock dialog closes (after adding stock)
  useEffect(() => {
    if (!stockDialogOpen) {
      fetchStocks();
    }
  }, [stockDialogOpen]);

  const fetchStocks = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/stocks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const stocks = Array.isArray(data) ? data : (data.rows || []);
        setAllStocks(stocks);

        // Calculate total injera quantity (sum of all active stock quantities)
        const total = stocks
          .filter((stock: any) => stock.isActive !== false)
          .reduce((sum: number, stock: any) => sum + (Number(stock.quantity) || 0), 0);
        setTotalInjera(total);
      }
    } catch (err) {
      console.error('Failed to fetch stocks', err);
    }
  };

  const fetchBranchOptions = async () => {
    const token = localStorage.getItem('token');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [optionsRes, mainHubRes] = await Promise.all([
        fetch(`${API_URL}/branches/options`, { headers }),
        fetch(`${API_URL}/branches/main-hub`, { headers }),
      ]);

      if (optionsRes.ok) {
        const options = await optionsRes.json();
        setBranchOptions(Array.isArray(options) ? options : []);
      }
      if (mainHubRes.ok) {
        const mainHub = await mainHubRes.json();
        setMainHubId(mainHub?.id || null);
      }
    } catch (err) {
      console.error('Failed to fetch branch options', err);
    }
  };

  const hubStocks = allStocks.filter((stock: any) => {
    if (!stock || stock.isActive === false) return false;
    if (!mainHubId) return stock.branchId == null;
    return stock.branchId === mainHubId || stock.branchId == null;
  });

  const transferToBranch = async (forcedBranchId?: string) => {
    const branchId = forcedBranchId || selectedTransferBranchId;
    const stockId = selectedTransferStockId;
    const quantity = Number(transferAmount);
    const selectedStock = hubStocks.find((s: any) => String(s.id) === String(stockId));

    if (!branchId) {
      setError('Please select a branch destination');
      return;
    }
    if (!selectedStock) {
      setError('Please select a hub stock item');
      return;
    }
    if (!quantity || quantity <= 0) {
      setError('Transfer quantity must be greater than zero');
      return;
    }
    if (quantity > Number(selectedStock.quantity || 0)) {
      setError('Transfer quantity exceeds main hub stock');
      return;
    }

    const token = localStorage.getItem('token');
    setTransferLoading(true);
    try {
      const response = await fetch(`${API_URL}/stock-transfers/dispatch`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toBranchId: branchId,
          productName: selectedStock.productName,
          quantity,
          stockId: selectedStock.id,
          fromBranchId: mainHubId || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to send stock to branch' }));
        throw new Error(err.message || 'Failed to send stock to branch');
      }

      const targetName = branchOptions.find((b) => b.id === branchId)?.name || 'branch';
      showSuccess(`Sent ${quantity} ${selectedStock.unit || ''} ${selectedStock.productName} to ${targetName}`);
      setBranchTransferDialogOpen(false);
      setSelectedTransferBranchId('');
      setTransferAmount(100);
      await fetchStocks();
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to send stock to branch');
    } finally {
      setTransferLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state to reflect change immediately
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          recentOrders: dashboardData.recentOrders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
        });
      }

      // Refresh stocks to get updated values from backend
      // Backend handles all stock adjustments based on status changes
      fetchStocks();
    } catch (err) {
      console.error(err);
      setError('Failed to update order status');
    }
  };

  const handleOrderClick = async (orderId: number) => {
    setLoadingOrderDetail(true);
    setOrderDetailDialogOpen(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const orderDetail = await response.json();
      setSelectedOrderDetail(orderDetail);
    } catch (err) {
      console.error(err);
      setError('Failed to load order details');
      setSelectedOrderDetail(null);
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: colors.gold }} size={48} />
        <Typography sx={{ color: colors.textSecondary }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: 'rgba(244, 67, 54, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(244, 67, 54, 0.2)',
        }}
      >
        <Typography sx={{ color: colors.error }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: '1600px',
        margin: '0 auto',
        bgcolor: 'transparent',
        minHeight: '100vh',
        position: 'relative',
      }}
      className="fade-in"
    >
      {/* Header */}
      <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2D3739 0%, #3F4F51 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
          }}
        >
          Dashboard Overview
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Welcome back! Here's what's happening with your business.
        </Typography>
      </Box>

      {/* Quick Actions Row */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => {
            fetchStocks();
            setStockDialogOpen(true);
          }}
          sx={{
            bgcolor: colors.gold,
            borderRadius: '12px',
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: colors.goldDark, transform: 'translateY(-2px)' },
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(230, 181, 77, 0.3)',
          }}
        >
          Add Injera Stock
        </Button>
        <Button
          variant="contained"
          startIcon={<LocalShippingOutlinedIcon />}
          onClick={() => {
            if (branchOptions.length === 0) {
              setError('No branch options available');
              return;
            }
            if (hubStocks.length === 0) {
              setError('No active main hub stock available for transfer');
              return;
            }
            if (!selectedTransferStockId && hubStocks[0]?.id) {
              setSelectedTransferStockId(String(hubStocks[0].id));
            }
            setBranchTransferDialogOpen(true);
          }}
          sx={{
            bgcolor: colors.teal,
            borderRadius: '12px',
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: '#8B7A6D', transform: 'translateY(-2px)' },
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(168, 150, 136, 0.35)',
          }}
        >
          Send Stock to Branch
        </Button>
        <Button
          variant="contained"
          startIcon={<PhoneInTalkIcon />}
          onClick={() => setOrderDialogOpen(true)}
          sx={{
            bgcolor: colors.sidebar,
            borderRadius: '12px',
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: colors.darkBg, transform: 'translateY(-2px)' },
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(63, 79, 81, 0.3)',
          }}
        >
          Register Phone Order
        </Button>
      </Box>

      {/* Metric Cards Row */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
        <Grid item xs={12} sm={6} md={4} lg={2.4} sx={{ '@media (min-width: 1200px)': { maxWidth: 'calc(20% - 24px)', flexBasis: 'calc(20% - 24px)' } }}>
          <MetricCard
            title="Total Injera"
            value={totalInjera.toLocaleString()}
            icon={<InventoryIcon />}
            variant="gold"
            subtitle="Available in stock"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4} sx={{ '@media (min-width: 1200px)': { maxWidth: 'calc(20% - 24px)', flexBasis: 'calc(20% - 24px)' } }}>
          <MetricCard
            title="Total Orders"
            value={dashboardData?.orders.total || 0}
            icon={<ShoppingCartIcon />}
            variant="dark"
            trend={{ value: 12, positive: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4} sx={{ '@media (min-width: 1200px)': { maxWidth: 'calc(20% - 24px)', flexBasis: 'calc(20% - 24px)' } }}>
          <MetricCard
            title="Active Orders"
            value={dashboardData?.orders.pending || 0}
            icon={<LocalShippingOutlinedIcon />}
            variant="teal"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4} sx={{ '@media (min-width: 1200px)': { maxWidth: 'calc(20% - 24px)', flexBasis: 'calc(20% - 24px)' } }}>
          <MetricCard
            title="Today's Orders"
            value={dashboardData?.orders.today || 0}
            icon={<TrendingUpIcon />}
            variant="blue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4} sx={{ '@media (min-width: 1200px)': { maxWidth: 'calc(20% - 24px)', flexBasis: 'calc(20% - 24px)' } }}>
          <MetricCard
            title="Low Stock Alerts"
            value={dashboardData?.lowStockAlerts || 0}
            icon={<WarningAmberIcon />}
            variant={dashboardData?.lowStockAlerts && dashboardData.lowStockAlerts > 0 ? 'pink' : 'blue'}
            subtitle={dashboardData?.lowStockAlerts && dashboardData.lowStockAlerts > 0 ? 'Items need attention' : 'All items stocked'}
          />
        </Grid>
      </Grid>

      <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)', position: 'relative', zIndex: 1 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
            Branch Stock Refill
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
            Dispatch stock from Main Hub to branches. This reduces Main Hub stock immediately.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {branchOptions.map((branch) => (
              <Button
                key={branch.id}
                variant="outlined"
                size="small"
                onClick={() => {
                  setSelectedTransferBranchId(branch.id);
                  if (!selectedTransferStockId && hubStocks[0]?.id) {
                    setSelectedTransferStockId(String(hubStocks[0].id));
                  }
                  setBranchTransferDialogOpen(true);
                }}
                sx={{ borderColor: colors.gold, color: colors.gold }}
              >
                Send to {branch.name}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)', position: 'relative', zIndex: 1 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 2 }}>
            Weekly Sold Split
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(181, 106, 58, 0.08)',
                  border: '1px solid rgba(181, 106, 58, 0.2)',
                }}
              >
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Internal Dispatch Sold (Hub to Branch)
                </Typography>
                <Typography variant="h4" sx={{ color: colors.textPrimary, fontWeight: 700 }}>
                  {dashboardData?.soldKpis?.internalDispatchThisWeek ?? 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(33, 150, 243, 0.08)',
                  border: '1px solid rgba(33, 150, 243, 0.2)',
                }}
              >
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Direct Retail Sold (Hub Customer Orders)
                </Typography>
                <Typography variant="h4" sx={{ color: colors.textPrimary, fontWeight: 700 }}>
                  {dashboardData?.soldKpis?.directRetailThisWeek ?? 0}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Charts and Activity Row */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
        <Grid item xs={12} lg={7}>
          <RecentOrdersCard
            orders={dashboardData?.recentOrders || []}
            onUpdateStatus={handleUpdateOrderStatus}
            onOrderClick={handleOrderClick}
          />
        </Grid>
        <Grid item xs={12} lg={5}>
          <StatisticsChart data={salesData?.dailyBreakdown || []} />
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ position: 'relative', zIndex: 1 }}>
        <Grid item xs={12} md={4}>
          <SalesShareChart data={salesData?.productSales || []} />
        </Grid>
        <Grid item xs={12} md={5}>
          <TrendChart data={salesData?.dailyBreakdown || []} />
        </Grid>
        <Grid item xs={12} md={3}>
          <LowStockCard items={dashboardData?.lowStockItems || []} />
        </Grid>
      </Grid>

      {/* Branch Office Activities Section */}
      <BranchOfficeActivitiesSection />

      {/* Injera Adder Dialog */}
      <Dialog open={stockDialogOpen} onClose={() => setStockDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Injera Stock</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select Product</InputLabel>
              <Select
                native
                label="Select Product"
                defaultValue=""
                id="stock-product-select"
              >
                <option value="" disabled></option>
                {allStocks.map((stock) => (
                  <option key={stock.id} value={stock.id}>
                    {stock.productName} ({stock.quantity} in stock)
                  </option>
                ))}
              </Select>
            </FormControl>
            <TextField
              id="stock-amount"
              label="Amount to Add"
              type="number"
              fullWidth
              defaultValue={50}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setStockDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              const stockId = (document.getElementById('stock-product-select') as HTMLSelectElement).value;
              const amount = (document.getElementById('stock-amount') as HTMLInputElement).value;
              if (!stockId || !amount) return;

              const token = localStorage.getItem('token');
              const res = await fetch(`${API_URL}/stocks/${stockId}/quick-adjust`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ amount: Number(amount), operation: 'add', reason: 'Manual restoration via dashboard' })
              });
              if (res.ok) {
                setStockDialogOpen(false);
                showSuccess(`Added ${amount} to stock`);
                // Refresh stocks and update total injera
                await fetchStocks();
                // Refresh dashboard data
                fetchData();
              }
            }}
            sx={{ bgcolor: colors.gold, '&:hover': { bgcolor: colors.goldDark } }}
          >
            Update Stock
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={branchTransferDialogOpen}
        onClose={() => !transferLoading && setBranchTransferDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Send Stock to Branch</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Destination Branch</InputLabel>
              <Select
                native
                value={selectedTransferBranchId}
                onChange={(e) => setSelectedTransferBranchId(String((e.target as HTMLSelectElement).value || ''))}
                label="Destination Branch"
              >
                <option value=""></option>
                {branchOptions.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Hub Product</InputLabel>
              <Select
                native
                value={selectedTransferStockId}
                onChange={(e) => setSelectedTransferStockId(String((e.target as HTMLSelectElement).value || ''))}
                label="Hub Product"
              >
                <option value=""></option>
                {hubStocks.map((stock: any) => (
                  <option key={stock.id} value={stock.id}>
                    {stock.productName} ({stock.quantity} {stock.unit || 'pcs'} available)
                  </option>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Quantity to Send"
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(Math.max(Number(e.target.value) || 0, 0))}
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
            />

            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              Tip: choose a specific branch like Ayer Tena or Betel, then dispatch from hub stock.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button disabled={transferLoading} onClick={() => setBranchTransferDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={transferLoading}
            onClick={() => transferToBranch()}
            sx={{ bgcolor: colors.gold, '&:hover': { bgcolor: colors.goldDark } }}
          >
            {transferLoading ? 'Sending...' : 'Send Stock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog
        open={orderDetailDialogOpen}
        onClose={() => {
          setOrderDetailDialogOpen(false);
          setSelectedOrderDetail(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, borderBottom: '1px solid rgba(63, 79, 81, 0.1)' }}>
          Order Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {loadingOrderDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress sx={{ color: colors.gold }} />
            </Box>
          ) : selectedOrderDetail ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Customer Information */}
              <Box sx={{ p: 2, bgcolor: 'rgba(181, 106, 58, 0.05)', borderRadius: '12px', border: '1px solid rgba(181, 106, 58, 0.1)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                      {selectedOrderDetail.customerName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>Email</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                      {selectedOrderDetail.email || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>Phone</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                      {selectedOrderDetail.phone || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>Business Type</Typography>
                    <Chip
                      label={selectedOrderDetail.businessType || 'N/A'}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(181, 106, 58, 0.15)',
                        color: colors.goldDark,
                        fontWeight: 600,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Order Information */}
              <Box sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.05)', borderRadius: '12px', border: '1px solid rgba(33, 150, 243, 0.1)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Order Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>Product</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                      {selectedOrderDetail.product || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>Quantity</Typography>
                    <Chip
                      label={selectedOrderDetail.quantity || 0}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(181, 106, 58, 0.2)',
                        color: colors.goldDark,
                        fontWeight: 600,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>Total Price</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                      {selectedOrderDetail.totalPrice
                        ? `ETB ${Number(selectedOrderDetail.totalPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>Status</Typography>
                    <Chip
                      label={selectedOrderDetail.status || 'N/A'}
                      size="small"
                      sx={{
                        bgcolor: selectedOrderDetail.status === 'pending'
                          ? 'rgba(255, 152, 0, 0.15)'
                          : selectedOrderDetail.status === 'delivered'
                            ? 'rgba(76, 175, 80, 0.15)'
                            : 'rgba(33, 150, 243, 0.15)',
                        color: selectedOrderDetail.status === 'pending'
                          ? colors.warning
                          : selectedOrderDetail.status === 'delivered'
                            ? colors.success
                            : colors.blue,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>Order Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                      {selectedOrderDetail.orderDate
                        ? new Date(selectedOrderDetail.orderDate).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Message */}
              {selectedOrderDetail.message && (
                <Box sx={{ p: 2, bgcolor: 'rgba(63, 79, 81, 0.03)', borderRadius: '12px', border: '1px solid rgba(63, 79, 81, 0.08)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.textSecondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Message
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textPrimary, whiteSpace: 'pre-wrap' }}>
                    {selectedOrderDetail.message}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                No order details available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(63, 79, 81, 0.1)' }}>
          <Button
            onClick={() => {
              setOrderDetailDialogOpen(false);
              setSelectedOrderDetail(null);
            }}
            sx={{
              color: colors.textSecondary,
              '&:hover': {
                bgcolor: 'rgba(63, 79, 81, 0.05)',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Phone Order Dialog */}
      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Register Phone Order</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField id="cust-name" label="Customer Name" fullWidth required />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField id="cust-phone" label="Phone Number" fullWidth required />
              <TextField id="cust-email" label="Email (Optional)" fullWidth />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Business Type</InputLabel>
              <Select native label="Business Type" id="cust-biz-type">
                <option value="retailer">Retailer</option>
                <option value="hotel">Hotel/Restaurant</option>
                <option value="supermarket">Supermarket</option>
                <option value="international">International</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 2 }}>
                <InputLabel>Product</InputLabel>
                <Select native label="Product" id="order-product">
                  {allStocks.map((stock) => (
                    <option key={stock.id} value={stock.productName}>
                      {stock.productName} ({stock.quantity} available)
                    </option>
                  ))}
                  {allStocks.length === 0 && (
                    <option value="Pure Teff Injera">Pure Teff Injera</option>
                  )}
                </Select>
              </FormControl>
              <TextField id="order-qty" label="Quantity" type="number" sx={{ flex: 1 }} defaultValue={1} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              const payload = {
                customerName: (document.getElementById('cust-name') as HTMLInputElement).value,
                phone: (document.getElementById('cust-phone') as HTMLInputElement).value,
                email: (document.getElementById('cust-email') as HTMLInputElement).value || 'phone-order@safedinjera.com',
                businessType: (document.getElementById('cust-biz-type') as HTMLSelectElement).value,
                product: (document.getElementById('order-product') as HTMLSelectElement).value,
                quantity: Number((document.getElementById('order-qty') as HTMLInputElement).value),
                status: 'confirmed', // Admin orders are usually confirmed immediately
              };

              const token = localStorage.getItem('token');
              const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
              });
              if (res.ok) {
                setOrderDialogOpen(false);
                showSuccess('Phone order registered successfully');
                fetchData();
                fetchStocks();
              }
            }}
            sx={{ bgcolor: colors.sidebar, '&:hover': { bgcolor: colors.darkBg } }}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage(null)}>
        <Alert severity="success" sx={{ width: '100%', borderRadius: '12px' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;

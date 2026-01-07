import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, Grid, Typography, Box, CircularProgress } from '@mui/material';
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
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_URL = 'http://localhost:5000/api';

interface DashboardData {
  orders: {
    total: number;
    pending: number;
    completed: number;
    today: number;
    thisWeek: number;
  };
  revenue: number;
  lowStockAlerts: number;
  lowStockItems: Array<{ productName: string; quantity: number }>;
  recentOrders: Array<{
    customerName: string;
    businessType: string;
    quantity: number;
    status: string;
    orderDate: string;
  }>;
}

interface SalesData {
  productSales: Array<{ _id: string; totalQuantity: number; orderCount: number }>;
  dailyBreakdown: Array<{ _id: string; totalQuantity: number; orderCount: number }>;
}

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <Card sx={{ height: '100%', bgcolor: color, color: 'white' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="bold">{value}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>{title}</Typography>
        </Box>
        <Box sx={{ opacity: 0.7 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      try {
        const [dashboardRes, salesRes] = await Promise.all([
          fetch(`${API_URL}/analytics/dashboard`, { headers }),
          fetch(`${API_URL}/analytics/sales?period=monthly`, { headers }),
        ]);

        if (!dashboardRes.ok || !salesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const dashboard = await dashboardRes.json();
        const sales = await salesRes.json();

        setDashboardData(dashboard);
        setSalesData(sales);
      } catch (err) {
        setError('Failed to load dashboard data. Make sure the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const salesChartData = {
    labels: salesData?.dailyBreakdown.map(d => d._id) || [],
    datasets: [
      {
        label: 'Orders',
        data: salesData?.dailyBreakdown.map(d => d.orderCount) || [],
        backgroundColor: '#4E1815',
        borderRadius: 4,
      },
    ],
  };

  const productChartData = {
    labels: salesData?.productSales.map(p => p._id) || [],
    datasets: [
      {
        data: salesData?.productSales.map(p => p.totalQuantity) || [],
        backgroundColor: ['#4E1815', '#A89688', '#6B2A25', '#D4C4B5', '#3A120F'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="#4E1815">
        Dashboard Overview
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={dashboardData?.orders.total || 0}
            icon={<ShoppingCartIcon sx={{ fontSize: 48 }} />}
            color="#4E1815"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Orders"
            value={dashboardData?.orders.pending || 0}
            icon={<InventoryIcon sx={{ fontSize: 48 }} />}
            color="#A89688"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Orders"
            value={dashboardData?.orders.today || 0}
            icon={<TrendingUpIcon sx={{ fontSize: 48 }} />}
            color="#6B2A25"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Alerts"
            value={dashboardData?.lowStockAlerts || 0}
            icon={<WarningIcon sx={{ fontSize: 48 }} />}
            color={dashboardData?.lowStockAlerts ? '#d32f2f' : '#388e3c'}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Daily Orders (Last 30 Days)" />
            <CardContent>
              <Box height={300}>
                <Bar data={salesChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Sales by Product" />
            <CardContent>
              <Box height={300}>
                <Doughnut data={productChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Orders" />
            <CardContent>
              {dashboardData?.recentOrders.map((order, index) => (
                <Box key={index} display="flex" justifyContent="space-between" py={1} borderBottom="1px solid #eee">
                  <Typography variant="body2">{order.customerName}</Typography>
                  <Typography variant="body2" color="textSecondary">{order.businessType}</Typography>
                  <Typography variant="body2" fontWeight="bold">{order.quantity} pcs</Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: order.status === 'pending' ? '#ff9800' : '#4caf50',
                      fontWeight: 'bold',
                    }}
                  >
                    {order.status}
                  </Typography>
                </Box>
              ))}
              {(!dashboardData?.recentOrders || dashboardData.recentOrders.length === 0) && (
                <Typography color="textSecondary">No recent orders</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Low Stock Items" />
            <CardContent>
              {dashboardData?.lowStockItems.map((item, index) => (
                <Box key={index} display="flex" justifyContent="space-between" py={1} borderBottom="1px solid #eee">
                  <Typography variant="body2">{item.productName}</Typography>
                  <Typography variant="body2" color="error" fontWeight="bold">
                    {item.quantity} remaining
                  </Typography>
                </Box>
              ))}
              {(!dashboardData?.lowStockItems || dashboardData.lowStockItems.length === 0) && (
                <Typography color="textSecondary">All stock levels are healthy</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;



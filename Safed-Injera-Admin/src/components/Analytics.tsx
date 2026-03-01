import { useState } from 'react';
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
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';

const API_URL = 'http://localhost:5000/api';

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
  darkBg: '#3A120F',
  darkCard: '#4A2A1F',
};

const Analytics = () => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportType, setExportType] = useState('orders');
  const [loading, setLoading] = useState(false);

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
      {/* Header */}
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
            Export your data in various formats for reporting and analysis.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Export Data Section */}
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

            {/* Step 1 */}
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

            {/* Step 2 */}
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

            {/* Export Button */}
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

        {/* Quick Reports Section */}
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

export default Analytics;

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';

const API_URL = 'http://localhost:5000/api';

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

  const ExportCard = ({ format, icon, title, description }: { format: string; icon: React.ReactNode; title: string; description: string }) => (
    <Card 
      sx={{ 
        cursor: 'pointer',
        border: exportFormat === format ? '2px solid #4E1815' : '1px solid #eee',
        transition: 'all 0.3s',
        '&:hover': { boxShadow: 3 },
      }}
      onClick={() => setExportFormat(format)}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ color: '#4E1815' }}>{icon}</Box>
          <Box>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2" color="textSecondary">{description}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="#4E1815">
        Analytics & Reports
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Export Data" />
            <CardContent>
              <Typography variant="body1" gutterBottom>
                Export your data in various formats for reporting and analysis.
              </Typography>
              
              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                1. Select Data Type
              </Typography>
              
              <FormControl sx={{ minWidth: 200, mb: 3 }}>
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

              <Typography variant="h6" gutterBottom>
                2. Select Export Format
              </Typography>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={4}>
                  <ExportCard
                    format="csv"
                    icon={<DescriptionIcon sx={{ fontSize: 40 }} />}
                    title="CSV"
                    description="Comma-separated values, works with Excel and Google Sheets"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ExportCard
                    format="excel"
                    icon={<TableChartIcon sx={{ fontSize: 40 }} />}
                    title="Excel"
                    description="Microsoft Excel format (.xlsx)"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ExportCard
                    format="pdf"
                    icon={<PictureAsPdfIcon sx={{ fontSize: 40 }} />}
                    title="PDF"
                    description="Portable Document Format, ready to print"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={loading}
                sx={{
                  bgcolor: '#4E1815',
                  '&:hover': { bgcolor: '#6B2A25' },
                  px: 4,
                  py: 1.5,
                }}
              >
                {loading ? 'Exporting...' : `Export ${exportType} as ${exportFormat.toUpperCase()}`}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Quick Reports" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setExportType('orders');
                      setExportFormat('pdf');
                      handleExport();
                    }}
                    sx={{ py: 2, borderColor: '#4E1815', color: '#4E1815' }}
                  >
                    Download Orders Report (PDF)
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setExportType('stock');
                      setExportFormat('excel');
                      handleExport();
                    }}
                    sx={{ py: 2, borderColor: '#4E1815', color: '#4E1815' }}
                  >
                    Download Inventory (Excel)
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setExportType('orders');
                      setExportFormat('csv');
                      handleExport();
                    }}
                    sx={{ py: 2, borderColor: '#4E1815', color: '#4E1815' }}
                  >
                    Download Sales Data (CSV)
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;



import { useState, useEffect } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { Box, Typography, Button, Card, CardContent, Grid, TextField } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const colors = {
  sidebar: '#3F4F51',
  cream: '#F5F3EE',
  paper: '#FFFFFF',
  gold: '#E6B54D',
  goldDark: '#C99B39',
  teal: '#5DB5A4',
  textPrimary: '#2D3739',
  textSecondary: '#6B7B7D',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

export const StockSettings = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [thresholdValue, setThresholdValue] = useState<number>(0);
  const notify = useNotify();
  const refresh = useRefresh();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/stock-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (category: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/stock-settings/${category}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ minimumThreshold: thresholdValue }),
      });

      if (response.ok) {
        notify(`Threshold updated for ${category}`, { type: 'success' });
        setEditingCategory(null);
        fetchSettings();
        refresh();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      notify('Failed to update threshold', { type: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading settings...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: colors.cream,
        minHeight: '100vh',
        p: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon sx={{ fontSize: 32, color: colors.gold }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary }}>
              Stock Settings
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Configure minimum thresholds for each stock category
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {settings.map((setting) => (
            <Grid item xs={12} md={6} key={setting.id}>
              <Card
                sx={{
                  borderRadius: '20px',
                  boxShadow: '0 2px 12px rgba(63, 79, 81, 0.06)',
                  border: '1px solid rgba(63, 79, 81, 0.04)',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                    {setting.category}
                  </Typography>
                  {editingCategory === setting.category ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        type="number"
                        label="Minimum Threshold"
                        value={thresholdValue}
                        onChange={(e: any) => setThresholdValue(Number(e.target.value))}
                        fullWidth
                        inputProps={{ min: 0 }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => handleUpdate(setting.category)}
                          sx={{
                            bgcolor: colors.gold,
                            '&:hover': { bgcolor: colors.goldDark },
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditingCategory(null);
                            setThresholdValue(setting.minimum_threshold);
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        Current Threshold: {setting.minimum_threshold}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 2 }}>
                        Updated: {new Date(setting.updated_at).toLocaleDateString()}
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditingCategory(setting.category);
                          setThresholdValue(setting.minimum_threshold);
                        }}
                        sx={{
                          borderColor: colors.gold,
                          color: colors.gold,
                          '&:hover': { borderColor: colors.goldDark, bgcolor: 'rgba(230, 181, 77, 0.1)' },
                        }}
                      >
                        Edit
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

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
        p: { xs: 1, sm: 1.5, md: 2, lg: 3 },
        width: '100%',
      }}
    >
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 }, display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
          <SettingsIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: colors.gold }} />
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: colors.textPrimary,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              }}
            >
              Stock Settings
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: colors.textSecondary,
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
              }}
            >
              Configure minimum thresholds for each stock category
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {settings.map((setting) => (
            <Grid item xs={12} sm={6} md={6} key={setting.id}>
              <Card
                sx={{
                  borderRadius: { xs: '16px', sm: '20px' },
                  boxShadow: '0 4px 20px rgba(63, 79, 81, 0.08)',
                  border: '1px solid rgba(63, 79, 81, 0.06)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 243, 238, 0.9) 100%)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 24px rgba(63, 79, 81, 0.12)',
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: { xs: 1.5, sm: 2 }, 
                      color: colors.textPrimary,
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                    }}
                  >
                    {setting.category}
                  </Typography>
                  {editingCategory === setting.category ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                      <TextField
                        type="number"
                        label="Minimum Threshold"
                        value={thresholdValue}
                        onChange={(e: any) => setThresholdValue(Number(e.target.value))}
                        fullWidth
                        inputProps={{ min: 0 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          onClick={() => handleUpdate(setting.category)}
                          sx={{
                            background: 'linear-gradient(135deg, #E6B54D 0%, #C99B39 100%)',
                            color: '#FFFFFF',
                            flex: { xs: '1 1 100%', sm: '1 1 auto' },
                            '&:hover': { 
                              background: 'linear-gradient(135deg, #C99B39 0%, #B88A2E 100%)',
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease',
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
                          sx={{
                            flex: { xs: '1 1 100%', sm: '1 1 auto' },
                            borderRadius: '12px',
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 600, 
                          mb: 1,
                          fontSize: { xs: '0.938rem', sm: '1rem' },
                        }}
                      >
                        Current Threshold: <strong style={{ color: colors.gold }}>{setting.minimum_threshold}</strong>
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: colors.textSecondary, 
                          display: 'block', 
                          mb: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '0.75rem', sm: '0.813rem' },
                        }}
                      >
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
                          borderRadius: '12px',
                          width: { xs: '100%', sm: 'auto' },
                          '&:hover': { 
                            borderColor: colors.goldDark, 
                            background: 'linear-gradient(135deg, rgba(230, 181, 77, 0.1) 0%, rgba(201, 155, 57, 0.05) 100%)',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.2s ease',
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

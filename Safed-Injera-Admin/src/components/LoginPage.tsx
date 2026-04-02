import React, { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LockOutlined, PersonOutline } from '@mui/icons-material';

const LoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') || '').trim();
    const password = String(formData.get('password') || '');

    if (!username || !password) {
      notify('Please enter your username and password.', { type: 'warning' });
      return;
    }

    setLoading(true);
    login({ username, password })
      .catch((error) => {
        notify(error?.message || 'Login failed. Please try again.', { type: 'error' });
      })
      .finally(() => setLoading(false));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 4 },
        py: { xs: 5, md: 8 },
        backgroundColor: 'rgba(249, 249, 247, 1)',
        backgroundImage:
          'radial-gradient(circle at 15% 20%, rgba(181, 106, 58, 0.08), rgba(181, 106, 58, 0) 40%),\
           radial-gradient(circle at 85% 10%, rgba(78, 24, 21, 0.12), rgba(78, 24, 21, 0) 45%),\
           linear-gradient(135deg, rgba(249, 249, 247, 1) 0%, rgba(237, 234, 230, 1) 55%, rgba(249, 249, 247, 1) 100%)',
        position: 'relative',
        overflow: 'hidden',
        '@keyframes floatIn': {
          '0%': { opacity: 0, transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(181, 106, 58, 0.25), rgba(181, 106, 58, 0) 65%)',
          top: -160,
          right: -120,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78, 24, 21, 0.2), rgba(78, 24, 21, 0) 70%)',
          bottom: -220,
          left: -180,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 960,
          borderRadius: 4,
          border: '1px solid rgba(63, 79, 81, 0.08)',
          boxShadow: '0 24px 64px rgba(63, 79, 81, 0.14)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
          backgroundColor: theme.palette.background.paper,
          animation: 'floatIn 700ms ease-out',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage:
              'linear-gradient(90deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 40%)',
            opacity: 0.6,
          }}
        />
        <Box sx={{ p: { xs: 4, sm: 5, md: 6 }, position: 'relative' }}>
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                color: theme.palette.common.white,
                fontWeight: 700,
                letterSpacing: '0.06em',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: '0 12px 32px rgba(181, 106, 58, 0.35)',
              }}
            >
              SI
            </Box>
            <Box>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                {['Admin console', 'Secure access'].map((label) => (
                  <Box
                    key={label}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      backgroundColor: 'rgba(78, 24, 21, 0.08)',
                    }}
                  >
                    {label}
                  </Box>
                ))}
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Safed Injera Admin
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Welcome back. Sign in to manage branches, orders, and inventory.
              </Typography>
            </Box>
          </Stack>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <TextField
                name="username"
                label="Username or Email"
                autoComplete="username"
                autoFocus
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={1}
              >
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label={
                    <Typography variant="body2" color="text.secondary">
                      Remember this device
                    </Typography>
                  }
                />
                <Typography variant="body2" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                  Need help? Contact support
                </Typography>
              </Stack>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                disabled={loading}
                sx={{
                  height: 48,
                  fontWeight: 600,
                  backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                  boxShadow: '0 12px 24px rgba(181, 106, 58, 0.3)',
                  '&:hover': {
                    boxShadow: '0 16px 30px rgba(181, 106, 58, 0.4)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 4, borderColor: 'rgba(63, 79, 81, 0.08)' }} />
          <Typography variant="body2" color="text.secondary">
            Need access? Contact your Safed admin to enable your account.
          </Typography>
        </Box>

        <Box
          sx={{
            p: { xs: 4, sm: 5, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background:
              'linear-gradient(150deg, rgba(78, 24, 21, 0.97) 0%, rgba(90, 15, 18, 0.98) 60%, rgba(65, 18, 16, 0.98) 100%)',
            color: theme.palette.common.white,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.22,
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0) 40%),\
                 radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0) 45%)',
            }}
          />
          <Stack spacing={2} sx={{ position: 'relative' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Safed Operations Hub
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
              A focused workspace for daily reporting, stock control, and branch visibility.
            </Typography>
          </Stack>

          <Stack spacing={2} sx={{ mt: { xs: 4, md: 6 }, position: 'relative' }}>
            {[
              'Track branch performance at a glance',
              'Review orders and inventory in minutes',
              'Keep reports consistent across teams',
            ].map((item) => (
              <Stack key={item} direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.secondary.main,
                    boxShadow: '0 0 0 6px rgba(181, 106, 58, 0.2)',
                  }}
                />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {isMdUp && (
            <Box
              sx={{
                mt: 6,
                p: 2.5,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                position: 'relative',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Tip of the day
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                Review activity logs after each shift to keep branch data clean.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;

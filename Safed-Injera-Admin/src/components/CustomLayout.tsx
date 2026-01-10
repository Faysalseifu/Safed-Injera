import React, { useContext } from 'react';
import { Layout, LayoutProps, AppBar, useLogout } from 'react-admin';
import { IconButton, Tooltip, Box, Typography, useTheme, Menu, MenuItem, Avatar, Divider } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CustomMenu from './CustomMenu';
import MobileBottomNav from './MobileBottomNav';
import { DarkModeContext } from '../App';

const CustomAppBar = (props: any) => {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const theme = useTheme();
  const logout = useLogout();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      {...props}
      sx={{
        background: darkMode 
          ? 'linear-gradient(135deg, #1a1f21 0%, #0f1314 100%)' 
          : 'linear-gradient(135deg, #3F4F51 0%, #2D3739 100%)',
        backgroundImage: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Box sx={{ flex: 1 }} />

      {/* Search Button */}
      <Tooltip title="Search">
        <IconButton
          color="inherit"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: '#E6B54D',
            },
          }}
        >
          <SearchIcon />
        </IconButton>
      </Tooltip>

      {/* Notifications */}
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            position: 'relative',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: '#E6B54D',
            },
          }}
        >
          <NotificationsNoneIcon />
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#F44336',
              border: '2px solid #3F4F51',
            }}
          />
        </IconButton>
      </Tooltip>

      {/* Dark Mode Toggle */}
      <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <IconButton
          color="inherit"
          onClick={toggleDarkMode}
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: '#E6B54D',
            },
          }}
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>

      {/* User Menu */}
      <Box sx={{ ml: 1, mr: 2 }}>
        <Tooltip title="Account">
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0,
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#E6B54D',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2D3739' }}>
              {user.username || 'Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7B7D' }}>
              {user.email || 'admin@safedinjera.com'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
            <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20, color: '#6B7B7D' }} />
            <Typography variant="body2">Profile</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#F44336' }}>
            <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
            <Typography variant="body2">Logout</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </AppBar>
  );
};

const CustomLayout = (props: LayoutProps) => {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        bgcolor: darkMode ? '#1a1f21' : '#F5F3EE',
      }}
    >
      <Layout
        {...props}
        menu={CustomMenu}
        appBar={CustomAppBar}
        sx={{
          '& .RaLayout-content': {
            paddingBottom: { xs: '80px', md: '0' },
            backgroundColor: darkMode ? '#1a1f21' : '#F5F3EE',
            transition: 'background-color 0.3s ease',
          },
          '& .RaSidebar-fixed': {
            background: 'linear-gradient(180deg, #3F4F51 0%, #2D3739 100%)',
          },
          '& .RaLayout-appFrame': {
            marginTop: '0',
          },
          // Modern sidebar styling
          '& .MuiDrawer-paper': {
            background: 'linear-gradient(180deg, #3F4F51 0%, #2D3739 100%)',
            borderRight: 'none',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
          },
        }}
      />
      <MobileBottomNav />
    </Box>
  );
};

export default CustomLayout;

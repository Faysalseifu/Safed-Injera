import React, { useContext } from 'react';
import { Layout, LayoutProps, AppBar } from 'react-admin';
import { IconButton, Tooltip, Box, Typography, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import CustomMenu from './CustomMenu';
import MobileBottomNav from './MobileBottomNav';
import { DarkModeContext } from '../App';

const CustomAppBar = (props: any) => {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const theme = useTheme();

  return (
    <AppBar
      {...props}
      sx={{
        backgroundColor: darkMode ? '#1a1f21' : '#3F4F51',
        backgroundImage: 'none',
        boxShadow: 'none',
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
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: '#E6B54D',
            },
          }}
        >
          <NotificationsNoneIcon />
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

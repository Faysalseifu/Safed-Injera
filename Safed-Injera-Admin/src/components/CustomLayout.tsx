import React, { useContext } from 'react';
import { Layout, LayoutProps, AppBar } from 'react-admin';
import { IconButton, Tooltip, Box } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CustomMenu from './CustomMenu';
import MobileBottomNav from './MobileBottomNav';
import { DarkModeContext } from '../App';

const CustomAppBar = (props: any) => {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  return (
    <AppBar {...props}>
      <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <IconButton
          color="inherit"
          onClick={toggleDarkMode}
          sx={{ ml: 'auto' }}
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>
    </AppBar>
  );
};

const CustomLayout = (props: LayoutProps) => (
  <Box sx={{ position: 'relative', minHeight: '100vh' }}>
    <Layout
      {...props}
      menu={CustomMenu}
      appBar={CustomAppBar}
      sx={{
        '& .RaLayout-content': {
          paddingBottom: { xs: '80px', md: '0' }, // Space for mobile bottom nav
        },
      }}
    />
    <MobileBottomNav />
  </Box>
);

export default CustomLayout;
```

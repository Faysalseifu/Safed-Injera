import React, { useContext } from 'react';
import { Layout, LayoutProps } from 'react-admin';
import { Box } from '@mui/material';
import CustomMenu from './CustomMenu';
import MobileBottomNav from './MobileBottomNav';
import { DarkModeContext } from '../App';

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
        sx={{
          '& .RaLayout-content': {
            paddingBottom: { xs: '80px', md: '0' },
            backgroundColor: darkMode ? '#1a1f21' : '#F5F3EE',
            transition: 'background-color 0.3s ease',
            paddingTop: { xs: '16px', md: '24px' },
            paddingLeft: { xs: '16px', md: '24px' },
            paddingRight: { xs: '16px', md: '24px' },
          },
          '& .RaSidebar-fixed': {
            background: 'linear-gradient(180deg, #3F4F51 0%, #2D3739 100%)',
          },
          '& .RaLayout-appFrame': {
            marginTop: '0',
          },
          '& .MuiDrawer-paper': {
            background: 'linear-gradient(180deg, #3F4F51 0%, #2D3739 100%)',
            borderRight: 'none',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
            width: { xs: '280px', sm: '280px' },
          },
        }}
      />
      <MobileBottomNav />
    </Box>
  );
};

export default CustomLayout;

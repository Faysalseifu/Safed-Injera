import React, { useContext } from 'react';
import { Layout, LayoutProps } from 'react-admin';
import { Box } from '@mui/material';
import CustomMenu from './CustomMenu';
import MobileBottomNav from './MobileBottomNav';
import { DarkModeContext } from '../App';

// Custom AppBar component that returns null to hide the top navbar
const HiddenAppBar = () => null;

const CustomLayout = (props: LayoutProps) => {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        bgcolor: darkMode ? '#3A120F' : '#F9F9F7',
        backgroundImage: darkMode 
          ? 'linear-gradient(135deg, #3A120F 0%, #4A2A1F 25%, #5A0F12 50%, #4A2A1F 75%, #3A120F 100%)'
          : 'none',
        overflow: 'hidden',
      }}
    >
      <Layout
        {...props}
        menu={CustomMenu}
        appBar={HiddenAppBar}
        sx={{
          '& .RaLayout-content': {
            paddingBottom: { xs: '80px', md: '0' },
            backgroundColor: 'transparent',
            marginLeft: { xs: 0, md: '280px' },
            marginTop: '0',
            paddingTop: { xs: '16px', md: '24px' },
            paddingLeft: { xs: '16px', md: '24px' },
            paddingRight: { xs: '16px', md: '24px' },
            minHeight: 'calc(100vh - 0px)',
            width: { xs: '100%', md: 'calc(100% - 280px)' },
            transition: 'margin-left 0.2s ease, width 0.2s ease',
            position: 'relative',
            zIndex: 1,
            overflowX: 'hidden',
          },
          '& .RaSidebar-fixed': {
            background: darkMode 
              ? 'linear-gradient(180deg, #4A2A1F 0%, #5A0F12 100%)'
              : 'linear-gradient(180deg, #4E1815 0%, #5A0F12 100%)',
            borderRight: darkMode ? '1px solid rgba(181, 106, 58, 0.2)' : 'none',
            top: 0,
            height: '100vh',
            zIndex: 1200,
          },
          '& .RaLayout-appFrame': {
            marginTop: '0',
            display: 'flex',
            flexDirection: 'row',
          },
          '& .MuiDrawer-root': {
            zIndex: 1200,
          },
          '& .MuiDrawer-paper': {
            background: darkMode 
              ? 'linear-gradient(180deg, #4A2A1F 0%, #5A0F12 100%)'
              : 'linear-gradient(180deg, #4E1815 0%, #5A0F12 100%)',
            borderRight: darkMode ? '1px solid rgba(181, 106, 58, 0.2)' : 'none',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)',
            width: '280px !important',
            top: '0 !important',
            height: '100vh !important',
            position: 'fixed !important',
            left: '0 !important',
            overflowY: 'auto',
            overflowX: 'hidden',
            transform: 'none !important',
            willChange: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '3px',
              transition: 'background 0.2s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.25)',
              },
            },
          },
        }}
      />
      <MobileBottomNav />
    </Box>
  );
};

export default CustomLayout;

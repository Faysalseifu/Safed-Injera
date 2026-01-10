import { useContext } from 'react';
import { Menu, MenuItemLink, useSidebarState } from 'react-admin';
import { Box, Typography, Avatar, Divider } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { DarkModeContext } from '../App';

const menuItemStyles = {
  '& .RaMenuItemLink-active': {
    backgroundColor: 'rgba(230, 181, 77, 0.15) !important',
    borderRadius: '12px',
    '& .MuiListItemIcon-root': {
      color: '#E6B54D',
    },
    '& .MuiTypography-root': {
      color: '#E6B54D',
      fontWeight: 600,
    },
  },
  '& .MuiMenuItem-root, & .RaMenuItemLink-root': {
    borderRadius: '12px',
    margin: '4px 12px',
    padding: '12px 16px',
    transition: 'all 0.2s ease',
    color: 'rgba(255, 255, 255, 0.7)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      transform: 'translateX(4px)',
      color: '#FFFFFF',
      '& .MuiListItemIcon-root': {
        color: '#E6B54D',
        transform: 'scale(1.1)',
      },
    },
  },
  '& .MuiListItemIcon-root': {
    transition: 'all 0.2s ease',
    minWidth: '40px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
};

// Active users mock data
const activeUsers = [
  { name: 'Sead', avatar: 'S' },
  { name: 'Yenus', avatar: 'Y' },
  { name: 'Suhayb', avatar: 'S' },
];

const CustomMenu = () => {
  const [open] = useSidebarState();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(180deg, #3F4F51 0%, #2D3739 100%)',
      }}
    >
      {/* Profile Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: '#E6B54D',
            fontSize: '1.5rem',
            fontWeight: 700,
            border: '3px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          SA
        </Avatar>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            Safed Admin
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.813rem',
            }}
          >
            admin@safedinjera.com
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Menu sx={menuItemStyles}>
        <MenuItemLink
          to="/"
          primaryText="Dashboard"
          leftIcon={<DashboardIcon />}
          sidebarIsOpen={open}
        />
        <MenuItemLink
          to="/stocks"
          primaryText="Stock"
          leftIcon={<InventoryIcon />}
          sidebarIsOpen={open}
        />
        <MenuItemLink
          to="/orders"
          primaryText="Orders"
          leftIcon={<ShoppingCartIcon />}
          sidebarIsOpen={open}
        />
        <MenuItemLink
          to="/analytics"
          primaryText="Analytics"
          leftIcon={<BarChartIcon />}
          sidebarIsOpen={open}
        />
      </Menu>

      {/* Bottom Section - Active Users */}
      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: 1.5,
            px: 1,
          }}
        >
          Active Users
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1 }}>
          {activeUsers.map((user, index) => (
            <Avatar
              key={index}
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: index === 0 ? '#E6B54D' : index === 1 ? '#5DB5A4' : '#7B68EE',
                border: '2px solid #3F4F51',
                marginLeft: index > 0 ? '-8px' : 0,
                zIndex: activeUsers.length - index,
              }}
            >
              {user.avatar}
            </Avatar>
          ))}
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '-8px',
              border: '2px solid #3F4F51',
            }}
          >
            <Typography sx={{ fontSize: '0.625rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              +5
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomMenu;

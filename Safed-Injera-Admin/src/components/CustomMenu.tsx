import { useContext, useState } from 'react';
import { Menu, MenuItemLink, useSidebarState, useLogout } from 'react-admin';
import { 
  Box, 
  Typography, 
  Avatar, 
  Divider, 
  IconButton, 
  Tooltip, 
  Menu as MuiMenu, 
  MenuItem,
  InputBase,
  Badge,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { DarkModeContext } from '../App';

const menuItemStyles = {
  '& .RaMenuItemLink-active': {
    backgroundColor: 'rgba(181, 106, 58, 0.2) !important',
    borderRadius: '12px',
    '& .MuiListItemIcon-root': {
      color: '#B56A3A',
    },
    '& .MuiTypography-root': {
      color: '#B56A3A',
      fontWeight: 600,
    },
  },
  '& .MuiMenuItem-root, & .RaMenuItemLink-root': {
    borderRadius: '12px',
    margin: '4px 12px',
    padding: '12px 16px',
    transition: 'background-color 0.15s ease, color 0.15s ease',
    color: 'rgba(255, 255, 255, 0.7)',
    willChange: 'background-color',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      transform: 'translateX(2px)',
      color: '#FFFFFF',
      '& .MuiListItemIcon-root': {
        color: '#B56A3A',
      },
    },
  },
  '& .MuiListItemIcon-root': {
    transition: 'color 0.15s ease',
    minWidth: '40px',
    color: 'rgba(255, 255, 255, 0.6)',
    willChange: 'color',
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
  const logout = useLogout();
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: darkMode 
          ? 'linear-gradient(180deg, #4A2A1F 0%, #5A0F12 100%)'
          : 'linear-gradient(180deg, #4E1815 0%, #5A0F12 100%)',
      }}
    >
      {/* Brand Logo Section */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Box
          sx={{
            height: { xs: 40, sm: 50 },
            width: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 0.5,
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '0.1em',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          SAFED
        </Box>
        <Typography
          sx={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Safed Injera
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: { xs: '0.625rem', sm: '0.75rem' },
            fontWeight: 500,
          }}
        >
          Admin Dashboard
        </Typography>
      </Box>

      {/* Profile Section */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Avatar
          sx={{
            width: { xs: 56, sm: 72 },
            height: { xs: 56, sm: 72 },
            background: 'linear-gradient(135deg, #B56A3A 0%, #A85A2A 100%)',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 700,
            border: '3px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s ease',
            },
          }}
          onClick={handleUserMenuOpen}
        >
          {user.username ? user.username.charAt(0).toUpperCase() : 'SA'}
        </Avatar>
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Typography
            sx={{
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            {user.username || 'Safed Admin'}
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: { xs: '0.75rem', sm: '0.813rem' },
            }}
          >
            {user.email || 'admin@safedinjera.com'}
          </Typography>
        </Box>

        {/* User Menu */}
        <MuiMenu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
            },
          }}
          transformOrigin={{ horizontal: 'center', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
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
          <MenuItem onClick={handleUserMenuClose} sx={{ py: 1.5 }}>
            <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20, color: '#6B7B7D' }} />
            <Typography variant="body2">Profile</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#F44336' }}>
            <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
            <Typography variant="body2">Logout</Typography>
          </MenuItem>
        </MuiMenu>
      </Box>

      {/* Search Bar */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1, sm: 1.25 },
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
            willChange: 'background-color',
            '&:focus-within': {
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(181, 106, 58, 0.3)',
            },
          }}
        >
          <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: { xs: 18, sm: 20 }, mr: 1 }} />
          <InputBase
            placeholder="Search..."
            sx={{
              flex: 1,
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: { xs: '0.875rem', sm: '0.938rem' },
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.4)',
              },
            }}
          />
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: 1,
          justifyContent: 'space-between',
        }}
      >
        <Tooltip title="Notifications">
          <IconButton
            sx={{
              flex: 1,
              color: 'rgba(255, 255, 255, 0.7)',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              py: { xs: 1, sm: 1.25 },
              transition: 'background-color 0.15s ease, color 0.15s ease',
              willChange: 'background-color',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: '#B56A3A',
              },
            }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsNoneIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
          <IconButton
            onClick={toggleDarkMode}
            sx={{
              flex: 1,
              color: 'rgba(255, 255, 255, 0.7)',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              py: { xs: 1, sm: 1.25 },
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: '#B56A3A',
              },
            }}
          >
            {darkMode ? (
              <Brightness7Icon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            ) : (
              <Brightness4Icon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            )}
          </IconButton>
        </Tooltip>
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
        <MenuItemLink
          to="/stock-settings"
          primaryText="Stock Settings"
          leftIcon={<SettingsIcon />}
          sidebarIsOpen={open}
        />
        <MenuItemLink
          to="/activity-logs"
          primaryText="Activity Logs"
          leftIcon={<HistoryIcon />}
          sidebarIsOpen={open}
        />
      </Menu>

      {/* Logout Section */}
      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Box
          onClick={() => logout()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1.5,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease, transform 0.15s ease',
            color: 'rgba(255, 255, 255, 0.7)',
            willChange: 'background-color',
            '&:hover': {
              bgcolor: 'rgba(244, 67, 54, 0.15)',
              color: '#F44336',
              transform: 'translateX(2px)',
            },
          }}
        >
          <LogoutIcon sx={{ fontSize: 20, transition: 'transform 0.2s ease' }} />
          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
            Logout
          </Typography>
        </Box>
      </Box>

      {/* Bottom Section - Active Users */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
                background: index === 0 
                  ? 'linear-gradient(135deg, #B56A3A 0%, #A85A2A 100%)'
                  : index === 1 
                    ? 'linear-gradient(135deg, #A89688 0%, #8B7A6D 100%)'
                    : 'linear-gradient(135deg, #5A0F12 0%, #4A2A1F 100%)',
                border: darkMode ? '2px solid #4A2A1F' : '2px solid #5A0F12',
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
              border: darkMode ? '2px solid #4A2A1F' : '2px solid #5A0F12',
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

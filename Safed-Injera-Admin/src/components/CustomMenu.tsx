import { Menu, MenuItemLink, useSidebarState } from 'react-admin';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DashboardIcon from '@mui/icons-material/Dashboard';

const menuItemStyles = {
  '& .RaMenuItemLink-active': {
    borderLeft: '4px solid',
    borderColor: 'warning.main',
    backgroundColor: 'action.selected',
  },
  '& .MuiMenuItem-root': {
    borderRadius: '8px',
    margin: '4px 8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      backgroundColor: 'action.hover',
      transform: 'translateX(4px)',
      '& .MuiListItemIcon-root': {
        color: 'warning.main',
        transform: 'scale(1.1)',
      },
    },
  },
  '& .MuiListItemIcon-root': {
    transition: 'all 0.3s ease',
  },
};

const CustomMenu = () => {
  const [open] = useSidebarState();

  return (
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
  );
};

export default CustomMenu;




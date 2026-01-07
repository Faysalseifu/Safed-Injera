import { Menu, MenuItemLink, useSidebarState } from 'react-admin';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DashboardIcon from '@mui/icons-material/Dashboard';

const CustomMenu = () => {
  const [open] = useSidebarState();

  return (
    <Menu>
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



import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import authProvider from './providers/authProvider';
import dataProvider from './providers/dataProvider';
import Dashboard from './components/Dashboard';
import CustomLayout from './components/CustomLayout';
import { StockList, StockCreate, StockEdit } from './components/StockList';
import { OrderList, OrderEdit } from './components/OrderList';
import Analytics from './components/Analytics';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4E1815',
    },
    secondary: {
      main: '#A89688',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
});

function App() {
  return (
    <Admin
      dashboard={Dashboard}
      authProvider={authProvider}
      dataProvider={dataProvider}
      theme={theme}
      layout={CustomLayout}
      title="Safed Injera Admin"
    >
      <Resource
        name="stocks"
        list={StockList}
        create={StockCreate}
        edit={StockEdit}
        icon={InventoryIcon}
        options={{ label: 'Stock' }}
      />
      <Resource
        name="orders"
        list={OrderList}
        edit={OrderEdit}
        icon={ShoppingCartIcon}
        options={{ label: 'Orders' }}
      />
      <CustomRoutes>
        <Route path="/analytics" element={<Analytics />} />
      </CustomRoutes>
    </Admin>
  );
}

export default App;


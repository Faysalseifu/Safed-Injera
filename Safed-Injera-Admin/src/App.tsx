import React, { useState, useEffect } from 'react';
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import authProvider from './providers/authProvider';
import dataProvider from './providers/dataProvider';
import Dashboard from './components/Dashboard';
import CustomLayout from './components/CustomLayout';
import { StockList, StockCreate, StockEdit } from './components/StockList';
import { OrderList, OrderEdit } from './components/OrderList';
import Analytics from './components/Analytics';
import { StockSettings } from './components/StockSettings';
import { ActivityLogs } from './components/ActivityLogs';
import { lightTheme, darkTheme } from './theme';
import './styles/globals.css';

// Dark mode context
export const DarkModeContext = React.createContext({
  darkMode: false,
  toggleDarkMode: () => { },
});

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('safed-admin-dark-mode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('safed-admin-dark-mode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Admin
          dashboard={Dashboard}
          authProvider={authProvider}
          dataProvider={dataProvider}
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
            <Route path="/stock-settings" element={<StockSettings />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
          </CustomRoutes>
        </Admin>
      </ThemeProvider>
    </DarkModeContext.Provider>
  );
}

export default App;



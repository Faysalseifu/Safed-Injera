import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, useTheme, useMediaQuery, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import { DarkModeContext } from '../App';

const MobileBottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { darkMode } = useContext(DarkModeContext);

    if (!isMobile) return null;

    const getCurrentValue = () => {
        const path = location.pathname;
        if (path === '/' || path === '') return 0;
        if (path.startsWith('/stocks')) return 1;
        if (path.startsWith('/orders')) return 2;
        if (path.startsWith('/analytics')) return 3;
        return 0;
    };

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {  
        const routes = ['/', '/stocks', '/orders', '/analytics'];
        navigate(routes[newValue]);
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 16,
                left: 16,
                right: 16,
                zIndex: 1200,
                display: { xs: 'block', md: 'none' },
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: darkMode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                    : '0 8px 32px rgba(0, 0, 0, 0.12)',
            }}
            elevation={0}
        >
            <BottomNavigation
                value={getCurrentValue()}
                onChange={handleChange}
                sx={{
                    height: 72,
                    bgcolor: darkMode 
                        ? 'rgba(26, 8, 7, 0.85)' 
                        : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${darkMode ? 'rgba(181, 106, 58, 0.2)' : 'rgba(230, 181, 77, 0.3)'}`,
                    borderRadius: '24px',
                    '& .MuiBottomNavigationAction-root': {
                        minWidth: 'auto',
                        padding: '8px',
                        color: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(78, 24, 21, 0.5)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&.Mui-selected': {
                            color: darkMode ? '#E6B54D' : '#4E1815',
                            '& .MuiSvgIcon-root': {
                                transform: 'translateY(-4px) scale(1.15)',
                            },
                        },
                        '&:hover': {
                            color: darkMode ? '#E6B54D' : '#4E1815',
                        },
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        opacity: 0,
                        transform: 'translateY(10px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&.Mui-selected': {
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            opacity: 1,
                            transform: 'translateY(0)',
                        },
                    },
                    '& .MuiSvgIcon-root': {
                        fontSize: '1.6rem',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                }}
            >
                <BottomNavigationAction
                    label="Dashboard"
                    icon={<DashboardIcon />}
                />
                <BottomNavigationAction
                    label="Stock"
                    icon={<InventoryIcon />}
                />
                <BottomNavigationAction
                    label="Orders"
                    icon={<ShoppingCartIcon />}
                />
                <BottomNavigationAction
                    label="Analytics"
                    icon={<BarChartIcon />}
                />
            </BottomNavigation>
        </Paper>
    );
};

export default MobileBottomNav;

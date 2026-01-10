import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, useTheme, useMediaQuery } from '@mui/material';
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
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
                display: { xs: 'block', md: 'none' },
                borderRadius: '20px 20px 0 0',
                overflow: 'hidden',
                boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.1)',
            }}
            elevation={0}
        >
            <BottomNavigation
                value={getCurrentValue()}
                onChange={handleChange}
                sx={{
                    height: 70,
                    bgcolor: darkMode ? '#242a2c' : '#FFFFFF',
                    borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(63, 79, 81, 0.08)'}`,
                    '& .MuiBottomNavigationAction-root': {
                        minWidth: 'auto',
                        padding: '8px 16px',
                        color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(63, 79, 81, 0.5)',
                        transition: 'all 0.2s ease',
                        '&.Mui-selected': {
                            color: '#E6B54D',
                            '& .MuiSvgIcon-root': {
                                transform: 'scale(1.1)',
                            },
                        },
                        '&:hover': {
                            color: '#E6B54D',
                        },
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontSize: '0.688rem',
                        fontWeight: 500,
                        marginTop: '4px',
                        '&.Mui-selected': {
                            fontSize: '0.688rem',
                            fontWeight: 600,
                        },
                    },
                    '& .MuiSvgIcon-root': {
                        fontSize: '1.5rem',
                        transition: 'transform 0.2s ease',
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

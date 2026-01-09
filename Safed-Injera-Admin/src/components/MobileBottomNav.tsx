import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';

const MobileBottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Map paths to navigation values
    const getValueFromPath = (pathname: string): number => {
        if (pathname === '/' || pathname.startsWith('/dashboard')) return 0;
        if (pathname.startsWith('/stocks')) return 1;
        if (pathname.startsWith('/orders')) return 2;
        if (pathname.startsWith('/analytics')) return 3;
        return 0;
    };

    const [value, setValue] = React.useState(getValueFromPath(location.pathname));

    React.useEffect(() => {
        setValue(getValueFromPath(location.pathname));
    }, [location.pathname]);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);

        switch (newValue) {
            case 0:
                navigate('/');
                break;
            case 1:
                navigate('/stocks');
                break;
            case 2:
                navigate('/orders');
                break;
            case 3:
                navigate('/analytics');
                break;
        }
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
                paddingBottom: 'env(safe-area-inset-bottom)',
                display: { xs: 'block', md: 'none' },
                boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
                borderTop: '1px solid',
                borderColor: 'divider',
            }}
            elevation={3}
        >
            <BottomNavigation
                value={value}
                onChange={handleChange}
                showLabels
                sx={{
                    height: 64,
                    '& .MuiBottomNavigationAction-root': {
                        minWidth: 0,
                        padding: '6px 12px',
                        transition: 'all 0.3s ease',
                    },
                    '& .Mui-selected': {
                        color: 'primary.main',
                        '& .MuiBottomNavigationAction-label': {
                            fontSize: '0.75rem',
                            fontWeight: 600,
                        },
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontSize: '0.7rem',
                        marginTop: '4px',
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

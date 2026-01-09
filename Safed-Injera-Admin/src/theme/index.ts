import { createTheme, ThemeOptions } from '@mui/material/styles';

// Brand colors from Safed Injera
const brandColors = {
    ethiopianEarth: '#4E1815',
    injeraMaroon: '#5A0F12',
    coffeeBrown: '#4A2A1F',
    sefedSand: '#A89688',
    amberGlow: '#B56A3A',
    injeraWhite: '#F9F9F7',
    cloudWhite: '#FFFFFF',
};

// Dark mode colors
const darkColors = {
    bgPrimary: '#3A120F',
    bgSecondary: '#4A2A1F',
    bgTertiary: '#5A0F12',
};

// Common theme options
const commonTheme: ThemeOptions = {
    typography: {
        fontFamily: 'Poppins, system-ui, sans-serif',
        h1: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0 2px 8px rgba(78, 24, 21, 0.05)',
        '0 4px 16px rgba(78, 24, 21, 0.08)',
        '0 6px 24px rgba(78, 24, 21, 0.10)',
        '0 8px 32px rgba(78, 24, 21, 0.12)',
        '0 12px 40px rgba(78, 24, 21, 0.15)',
        '0 16px 48px rgba(78, 24, 21, 0.18)',
        '0 20px 56px rgba(78, 24, 21, 0.20)',
        '0 24px 64px rgba(78, 24, 21, 0.22)',
        ...Array(16).fill('0 24px 64px rgba(78, 24, 21, 0.22)'),
    ] as any,
};

// Light theme
export const lightTheme = createTheme({
    ...commonTheme,
    palette: {
        mode: 'light',
        primary: {
            main: brandColors.ethiopianEarth,
            light: '#6B2A25',
            dark: '#3A120F',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: brandColors.sefedSand,
            light: '#D4C4B5',
            dark: '#8A7568',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#d32f2f',
        },
        warning: {
            main: brandColors.amberGlow,
        },
        success: {
            main: '#388e3c',
        },
        background: {
            default: '#F5F5F5',
            paper: '#FFFFFF',
        },
        text: {
            primary: brandColors.ethiopianEarth,
            secondary: brandColors.coffeeBrown,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(78, 24, 21, 0.12)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 4px 16px rgba(78, 24, 21, 0.15)',
                        transform: 'translateY(-1px)',
                    },
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0 8px 24px rgba(78, 24, 21, 0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 2px 8px rgba(78, 24, 21, 0.05)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: `linear-gradient(135deg, ${brandColors.ethiopianEarth} 0%, ${brandColors.injeraMaroon} 100%)`,
                    boxShadow: '0 2px 8px rgba(78, 24, 21, 0.1)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRight: '1px solid rgba(78, 24, 21, 0.08)',
                },
            },
        },
    },
});

// Dark theme
export const darkTheme = createTheme({
    ...commonTheme,
    palette: {
        mode: 'dark',
        primary: {
            main: brandColors.amberGlow,
            light: '#C88A5A',
            dark: '#9A5A2A',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: brandColors.sefedSand,
            light: '#D4C4B5',
            dark: '#8A7568',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#f44336',
        },
        warning: {
            main: brandColors.amberGlow,
        },
        success: {
            main: '#66bb6a',
        },
        background: {
            default: darkColors.bgPrimary,
            paper: darkColors.bgSecondary,
        },
        text: {
            primary: brandColors.injeraWhite,
            secondary: brandColors.sefedSand,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'rgba(58, 18, 15, 0.85)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(181, 106, 58, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(181, 106, 58, 0.25)',
                        border: '1px solid rgba(181, 106, 58, 0.3)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 4px 16px rgba(181, 106, 58, 0.3)',
                        transform: 'translateY(-1px)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: 'rgba(58, 18, 15, 0.90)',
                    backdropFilter: 'blur(15px)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: `linear-gradient(135deg, ${darkColors.bgSecondary} 0%, ${darkColors.bgTertiary} 100%)`,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(20px)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: 'rgba(58, 18, 15, 0.95)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    borderRight: '1px solid rgba(181, 106, 58, 0.15)',
                },
            },
        },
    },
});

export default lightTheme;

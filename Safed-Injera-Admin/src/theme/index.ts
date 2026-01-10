import { createTheme, ThemeOptions } from '@mui/material/styles';

// New modern dashboard color palette inspired by premium flight booking dashboard
const designTokens = {
    // Sidebar and primary colors
    sidebar: {
        dark: '#3F4F51',      // Dark teal
        darker: '#2D3739',    // Darker variant
        light: '#4A5C5E',     // Lighter variant
    },
    // Background colors
    background: {
        cream: '#F5F3EE',     // Main content background
        paper: '#FFFFFF',     // Card backgrounds
        muted: '#EDEBE6',     // Muted sections
    },
    // Accent colors
    accent: {
        gold: '#E6B54D',      // Primary accent (gold/yellow)
        goldDark: '#C99B39',  // Darker gold
        goldLight: '#F1C85D', // Lighter gold
        teal: '#5DB5A4',      // Secondary accent
    },
    // Text colors
    text: {
        primary: '#2D3739',   // Main text
        secondary: '#6B7B7D', // Secondary text
        muted: '#9CA9AB',     // Muted text
        light: '#FFFFFF',     // Light text for dark backgrounds
    },
    // Status colors
    status: {
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',
    },
    // Chart colors with gradients inspired by modern dashboards
    charts: {
        primary: '#3F4F51',
        secondary: '#E6B54D',
        tertiary: '#5DB5A4',
        quaternary: '#F5A623',
        quinary: '#7B68EE',
        purple: '#9C27B0',
        blue: '#2196F3',
        pink: '#E91E63',
        teal: '#00BCD4',
    },
    // Gradient definitions for modern UI
    gradients: {
        purple: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
        blue: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
        pink: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
        teal: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
        gold: 'linear-gradient(135deg, #E6B54D 0%, #C99B39 100%)',
        dark: 'linear-gradient(135deg, #3F4F51 0%, #2D3739 100%)',
    },
    // Injera-inspired colors
    injera: {
        brown: '#4A2A1F',
        maroon: '#5B1214',
        cream: '#EDEAE6',
    },
};

// Common theme options
const commonTheme: ThemeOptions = {
    typography: {
        fontFamily: '"Inter", "Roboto", system-ui, sans-serif',
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
            fontSize: '1.75rem',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
        },
        body1: {
            fontSize: '0.938rem',
        },
        body2: {
            fontSize: '0.875rem',
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 16,
    },
    shadows: [
        'none',
        '0 2px 8px rgba(63, 79, 81, 0.04)',
        '0 4px 16px rgba(63, 79, 81, 0.06)',
        '0 6px 20px rgba(63, 79, 81, 0.08)',
        '0 8px 24px rgba(63, 79, 81, 0.10)',
        '0 12px 32px rgba(63, 79, 81, 0.12)',
        '0 16px 40px rgba(63, 79, 81, 0.14)',
        '0 20px 48px rgba(63, 79, 81, 0.16)',
        '0 24px 56px rgba(63, 79, 81, 0.18)',
        ...Array(16).fill('0 24px 56px rgba(63, 79, 81, 0.18)'),
    ] as any,
};

// Light theme (main theme inspired by the reference design)
export const lightTheme = createTheme({
    ...commonTheme,
    palette: {
        mode: 'light',
        primary: {
            main: designTokens.sidebar.dark,
            light: designTokens.sidebar.light,
            dark: designTokens.sidebar.darker,
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: designTokens.accent.gold,
            light: designTokens.accent.goldLight,
            dark: designTokens.accent.goldDark,
            contrastText: '#FFFFFF',
        },
        error: {
            main: designTokens.status.error,
        },
        warning: {
            main: designTokens.status.warning,
        },
        success: {
            main: designTokens.status.success,
        },
        info: {
            main: designTokens.status.info,
        },
        background: {
            default: designTokens.background.cream,
            paper: designTokens.background.paper,
        },
        text: {
            primary: designTokens.text.primary,
            secondary: designTokens.text.secondary,
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: designTokens.background.cream,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: designTokens.background.paper,
                    boxShadow: '0 2px 12px rgba(63, 79, 81, 0.06)',
                    border: '1px solid rgba(63, 79, 81, 0.04)',
                    borderRadius: 20,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 8px 24px rgba(63, 79, 81, 0.10)',
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
                        boxShadow: '0 4px 12px rgba(230, 181, 77, 0.25)',
                        transform: 'translateY(-1px)',
                    },
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(230, 181, 77, 0.30)',
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
                    boxShadow: '0 2px 12px rgba(63, 79, 81, 0.06)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: designTokens.sidebar.dark,
                    backgroundImage: 'none',
                    boxShadow: 'none',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: `linear-gradient(180deg, ${designTokens.sidebar.dark} 0%, ${designTokens.sidebar.darker} 100%)`,
                    borderRight: 'none',
                    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    margin: '4px 12px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(230, 181, 77, 0.15)',
                        '&:hover': {
                            backgroundColor: 'rgba(230, 181, 77, 0.20)',
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderColor: 'rgba(63, 79, 81, 0.08)',
                },
                head: {
                    fontWeight: 600,
                    backgroundColor: designTokens.background.muted,
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
            main: designTokens.accent.gold,
            light: designTokens.accent.goldLight,
            dark: designTokens.accent.goldDark,
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: designTokens.accent.teal,
            light: '#7DCBB8',
            dark: '#409F8E',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#ff5252',
        },
        warning: {
            main: '#ffb74d',
        },
        success: {
            main: '#69f0ae',
        },
        info: {
            main: '#64b5f6',
        },
        background: {
            default: '#1a1f21',
            paper: '#242a2c',
        },
        text: {
            primary: '#f5f5f5',
            secondary: '#b0bec5',
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'rgba(36, 42, 44, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(230, 181, 77, 0.12)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    borderRadius: 20,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 12px 40px rgba(230, 181, 77, 0.15)',
                        border: '1px solid rgba(230, 181, 77, 0.20)',
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
                        boxShadow: '0 4px 16px rgba(230, 181, 77, 0.25)',
                        transform: 'translateY(-1px)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: 'rgba(36, 42, 44, 0.95)',
                    backdropFilter: 'blur(15px)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1a1f21',
                    backgroundImage: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(20px)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: 'linear-gradient(180deg, #1a1f21 0%, #0f1314 100%)',
                    borderRight: '1px solid rgba(230, 181, 77, 0.08)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                },
                head: {
                    fontWeight: 600,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                },
            },
        },
    },
});

// Export design tokens for use in components
export { designTokens };
export default lightTheme;

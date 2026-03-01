import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4E1815 0%, #5A0F12 100%)',
            p: 3,
          }}
        >
          <Paper
            sx={{
              maxWidth: 500,
              width: '100%',
              p: 4,
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 249, 247, 0.9) 100%)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(233, 30, 99, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 40, color: '#F44336' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4E1815', mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B7B7D', mb: 3 }}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  mt: 2,
                  mb: 3,
                  p: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '8px',
                  textAlign: 'left',
                  maxHeight: 200,
                  overflow: 'auto',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7B7D', display: 'block', mb: 1 }}>
                  Error Details (Development Only)
                </Typography>
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    color: '#F44336',
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                onClick={this.handleReset}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #B56A3A 0%, #A85A2A 100%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #A85A2A 0%, #985020 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(181, 106, 58, 0.4)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outlined"
                startIcon={<RefreshIcon />}
                sx={{
                  borderColor: '#B56A3A',
                  color: '#B56A3A',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  '&:hover': {
                    borderColor: '#A85A2A',
                    bgcolor: 'rgba(181, 106, 58, 0.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Refresh Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return <>{this.props.children}</>;
  }
}

export default ErrorBoundary;

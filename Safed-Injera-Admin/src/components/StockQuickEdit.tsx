import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const colors = {
  sidebar: '#3F4F51',
  cream: '#F5F3EE',
  paper: '#FFFFFF',
  gold: '#E6B54D',
  goldDark: '#C99B39',
  teal: '#5DB5A4',
  textPrimary: '#2D3739',
  textSecondary: '#6B7B7D',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

interface StockQuickEditProps {
  open: boolean;
  onClose: () => void;
  stock: {
    id: number;
    productName: string;
    quantity: number;
    unit: string;
  } | null;
  onSuccess?: () => void;
}

export const StockQuickEdit = ({ open, onClose, stock, onSuccess }: StockQuickEditProps) => {
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleQuickAdjust = async (operation: 'add' | 'subtract', value: number) => {
    if (!stock) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/stocks/${stock.id}/quick-adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: value, operation, reason: reason || `Quick ${operation}` }),
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
        setAmount(0);
        setReason('');
      } else {
        throw new Error('Failed to update stock');
      }
    } catch (error) {
      console.error('Failed to update stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAdjust = async () => {
    if (!stock || amount === 0) return;
    const operation = amount > 0 ? 'add' : 'subtract';
    await handleQuickAdjust(operation, Math.abs(amount));
  };

  if (!stock) return null;

  const newQuantity = stock.quantity + amount;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: colors.textPrimary }}>
        Quick Adjust Stock - {stock.productName}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
            Current Quantity
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary }}>
            {stock.quantity} {stock.unit}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Adjust
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleQuickAdjust('add', 10)}
                disabled={loading}
                sx={{
                  borderColor: colors.success,
                  color: colors.success,
                  py: 1.5,
                  '&:hover': { borderColor: colors.success, bgcolor: 'rgba(76, 175, 80, 0.1)' },
                }}
              >
                +10
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RemoveIcon />}
                onClick={() => handleQuickAdjust('subtract', 10)}
                disabled={loading}
                sx={{
                  borderColor: colors.error,
                  color: colors.error,
                  py: 1.5,
                  '&:hover': { borderColor: colors.error, bgcolor: 'rgba(244, 67, 54, 0.1)' },
                }}
              >
                -10
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleQuickAdjust('add', 50)}
                disabled={loading}
                sx={{
                  borderColor: colors.success,
                  color: colors.success,
                  py: 1.5,
                  '&:hover': { borderColor: colors.success, bgcolor: 'rgba(76, 175, 80, 0.1)' },
                }}
              >
                +50
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RemoveIcon />}
                onClick={() => handleQuickAdjust('subtract', 50)}
                disabled={loading}
                sx={{
                  borderColor: colors.error,
                  color: colors.error,
                  py: 1.5,
                  '&:hover': { borderColor: colors.error, bgcolor: 'rgba(244, 67, 54, 0.1)' },
                }}
              >
                -50
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Custom Amount
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
            <IconButton
              onClick={() => setAmount(Math.max(0, amount - 1))}
              sx={{ border: `1px solid ${colors.textSecondary}`, color: colors.textSecondary }}
            >
              <RemoveIcon />
            </IconButton>
            <TextField
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              sx={{ flex: 1 }}
              inputProps={{ style: { textAlign: 'center', fontSize: '1.2rem', fontWeight: 600 } }}
            />
            <IconButton
              onClick={() => setAmount(amount + 1)}
              sx={{ border: `1px solid ${colors.textSecondary}`, color: colors.textSecondary }}
            >
              <AddIcon />
            </IconButton>
          </Box>
          {amount !== 0 && (
            <Box sx={{ p: 2, bgcolor: 'rgba(63, 79, 81, 0.02)', borderRadius: '8px', mb: 2 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                New Quantity:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: newQuantity < 0 ? colors.error : colors.textPrimary }}>
                {newQuantity} {stock.unit}
              </Typography>
            </Box>
          )}
        </Box>

        <TextField
          fullWidth
          label="Reason (Optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCustomAdjust}
          disabled={loading || amount === 0 || newQuantity < 0}
          sx={{
            bgcolor: colors.gold,
            '&:hover': { bgcolor: colors.goldDark },
          }}
        >
          Apply Change
        </Button>
      </DialogActions>
    </Dialog>
  );
};

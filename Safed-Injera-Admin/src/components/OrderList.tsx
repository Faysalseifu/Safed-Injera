import {
  List,
  Datagrid, SimpleList,
  TextField,
  FunctionField,
  EmailField,
  NumberField,
  DateField,
  EditButton,
  DeleteButton,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  Filter,
  SelectField,
  useDataProvider,
  useNotify,
  useRefresh,
  useRecordContext,
  Button,
} from 'react-admin';
import { Box, useMediaQuery, useTheme, Typography, Chip, IconButton, Tooltip, Avatar, Button as MuiButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState } from 'react';

// Design tokens - Safed Injera Branding
const colors = {
  sidebar: '#4E1815',
  cream: '#F9F9F7',
  paper: '#FFFFFF',
  gold: '#B56A3A',
  goldDark: '#A85A2A',
  teal: '#A89688',
  textPrimary: '#4E1815',
  textSecondary: '#6B7B7D',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

const displayProductName = (name?: string): string => {
  const n = (name ?? '').trim();
  if (!n) return '';
  return n.toLowerCase().includes('injera') ? 'Injera' : n;
};

const statusChoices = [
  { id: 'pending', name: 'Pending' },
  { id: 'sent', name: 'Sent' },
  { id: 'checked', name: 'Checked' },
  { id: 'declined', name: 'Declined' },
  { id: 'confirmed', name: 'Confirmed' },
  { id: 'processing', name: 'Processing' },
  { id: 'shipped', name: 'Shipped' },
  { id: 'delivered', name: 'Delivered' },
  { id: 'cancelled', name: 'Cancelled' },
];

const businessTypeChoices = [
  { id: 'hotel', name: 'Hotel/Restaurant' },
  { id: 'supermarket', name: 'Supermarket' },
  { id: 'retailer', name: 'Retailer' },
  { id: 'international', name: 'International Client' },
  { id: 'other', name: 'Other' },
];

const orderRangeChoices = [
  { id: '5', name: 'Last 5 days (default)' },
  { id: '30', name: 'Last 30 days' },
  { id: '90', name: 'Last 90 days' },
  { id: 'all', name: 'All orders' },
];

const OrderFilter = (props: any) => (
  <Filter {...props}>
    <TextInput
      label="Search Customer"
      source="customerName"
      alwaysOn
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '16px',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(181, 106, 58, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '2px solid rgba(181, 106, 58, 0.2)',
            boxShadow: '0 4px 12px rgba(181, 106, 58, 0.15)',
          },
          '&.Mui-focused': {
            border: `2px solid ${colors.gold}`,
            boxShadow: '0 0 0 4px rgba(181, 106, 58, 0.1)',
          }
        },
        '& .MuiInputLabel-root': {
          fontWeight: 600,
          color: colors.textSecondary,
          '&.Mui-focused': {
            color: colors.gold,
          }
        }
      }}
    />
    <SelectInput
      source="orderRange"
      label="Order date range"
      choices={orderRangeChoices}
      alwaysOn
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '16px',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(181, 106, 58, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '2px solid rgba(181, 106, 58, 0.2)',
            boxShadow: '0 4px 12px rgba(181, 106, 58, 0.15)',
          },
          '&.Mui-focused': {
            border: `2px solid ${colors.gold}`,
            boxShadow: '0 0 0 4px rgba(181, 106, 58, 0.1)',
          }
        },
        '& .MuiInputLabel-root': {
          fontWeight: 600,
          color: colors.textSecondary,
          '&.Mui-focused': {
            color: colors.gold,
          }
        }
      }}
    />
    <SelectInput
      source="status"
      choices={statusChoices}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '16px',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(181, 106, 58, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '2px solid rgba(181, 106, 58, 0.2)',
            boxShadow: '0 4px 12px rgba(181, 106, 58, 0.15)',
          },
          '&.Mui-focused': {
            border: `2px solid ${colors.gold}`,
            boxShadow: '0 0 0 4px rgba(181, 106, 58, 0.1)',
          }
        },
        '& .MuiInputLabel-root': {
          fontWeight: 600,
          color: colors.textSecondary,
          '&.Mui-focused': {
            color: colors.gold,
          }
        }
      }}
    />
    <SelectInput
      source="businessType"
      choices={businessTypeChoices}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '16px',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(181, 106, 58, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '2px solid rgba(181, 106, 58, 0.2)',
            boxShadow: '0 4px 12px rgba(181, 106, 58, 0.15)',
          },
          '&.Mui-focused': {
            border: `2px solid ${colors.gold}`,
            boxShadow: '0 0 0 4px rgba(181, 106, 58, 0.1)',
          }
        },
        '& .MuiInputLabel-root': {
          fontWeight: 600,
          color: colors.textSecondary,
          '&.Mui-focused': {
            color: colors.gold,
          }
        }
      }}
    />
  </Filter>
);

const StatusField = (props: any) => {
  const statusGradients: Record<string, { bg: string; color: string; shadow: string }> = {
    pending: { 
      bg: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 193, 7, 0.15) 100%)', 
      color: colors.warning,
      shadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
    },
    sent: { 
      bg: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(0, 188, 212, 0.15) 100%)', 
      color: colors.info,
      shadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
    },
    checked: { 
      bg: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(0, 188, 212, 0.15) 100%)', 
      color: colors.success,
      shadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
    },
    declined: { 
      bg: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(233, 30, 99, 0.15) 100%)', 
      color: colors.error,
      shadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
    },
    confirmed: { 
      bg: 'linear-gradient(135deg, rgba(181, 106, 58, 0.2) 0%, rgba(168, 90, 42, 0.15) 100%)', 
      color: colors.gold,
      shadow: '0 4px 12px rgba(181, 106, 58, 0.3)'
    },
    processing: { 
      bg: 'linear-gradient(135deg, rgba(168, 150, 136, 0.2) 0%, rgba(181, 106, 58, 0.15) 100%)', 
      color: colors.teal,
      shadow: '0 4px 12px rgba(168, 150, 136, 0.3)'
    },
    shipped: { 
      bg: 'linear-gradient(135deg, rgba(0, 188, 212, 0.2) 0%, rgba(33, 150, 243, 0.15) 100%)', 
      color: '#00bcd4',
      shadow: '0 4px 12px rgba(0, 188, 212, 0.3)'
    },
    delivered: { 
      bg: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(0, 188, 212, 0.15) 100%)', 
      color: colors.success,
      shadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
    },
    cancelled: { 
      bg: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(233, 30, 99, 0.15) 100%)', 
      color: colors.error,
      shadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
    },
  };

  const status = props.record?.status || 'pending';
  const style = statusGradients[status] || statusGradients.pending;

  return (
    <Chip
      label={statusChoices.find((s) => s.id === status)?.name || status}
      size="medium"
      sx={{
        background: style.bg,
        color: style.color,
        fontWeight: 700,
        fontSize: '0.813rem',
        textTransform: 'capitalize',
        borderRadius: '12px',
        border: `2px solid ${style.color}60`,
        boxShadow: style.shadow,
        padding: '8px 12px',
        height: 'auto',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(8px)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 16px ${style.color}40`,
        }
      }}
    />
  );
};

// Quick Status Update Buttons
const QuickStatusButtons = ({ record }: any) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!record) return;
    setLoading(true);
    try {
      await dataProvider.update('orders', {
        id: record.id,
        data: { status: newStatus },
        previousData: record,
      });
      notify(`Order status updated to ${newStatus}`, { type: 'success' });
      refresh();
    } catch (error: unknown) {
      const e = error as { body?: { message?: string }; message?: string };
      const msg = e?.body?.message || e?.message || 'Failed to update order status';
      notify(String(msg), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  const currentStatus = record.status;
  const canSend = currentStatus === 'pending';
  const canCheck = currentStatus === 'sent';
  const canDecline = currentStatus === 'pending' || currentStatus === 'sent';

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {canSend && (
        <Tooltip title="Mark as Sent">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange('sent');
            }}
            disabled={loading}
            sx={{ 
              color: colors.info || '#2196F3',
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(0, 188, 212, 0.05) 100%)',
              '&:hover': { 
                background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(0, 188, 212, 0.1) 100%)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {canCheck && (
        <Tooltip title="Mark as Checked">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange('checked');
            }}
            disabled={loading}
            sx={{ 
              color: colors.success,
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(0, 188, 212, 0.05) 100%)',
              '&:hover': { 
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(0, 188, 212, 0.1) 100%)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <CheckCircleIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {canDecline && (
        <Tooltip title="Decline Order">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange('declined');
            }}
            disabled={loading}
            sx={{ 
              color: colors.error,
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(233, 30, 99, 0.05) 100%)',
              '&:hover': { 
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(233, 30, 99, 0.1) 100%)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

// Status History Viewer
const StatusHistoryViewer = ({ record }: any) => {
  const [open, setOpen] = useState(false);

  if (!record || !record.statusHistory || record.statusHistory.length === 0) {
    return null;
  }

  return (
    <>
      <Tooltip title="View Status History">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          sx={{ color: colors.teal, '&:hover': { bgcolor: 'rgba(93, 181, 164, 0.1)' } }}
        >
          <HistoryIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {open && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
          onClick={() => setOpen(false)}
        >
          <Box
            sx={{
              bgcolor: colors.paper,
              borderRadius: '20px',
              p: 3,
              maxWidth: '500px',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Status History
              </Typography>
              <MuiButton onClick={() => setOpen(false)}>Close</MuiButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {record.statusHistory.map((entry: any, index: number) => (
                <Box key={index} sx={{ p: 2, bgcolor: 'rgba(63, 79, 81, 0.02)', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {entry.from} → {entry.to}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    {new Date(entry.changedAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export const OrderList = (props: any) => (
  <Box sx={{ 
    width: '100%', 
    minHeight: '100vh',
    background: 'linear-gradient(135deg, rgba(249, 249, 247, 0.8) 0%, rgba(237, 234, 230, 0.4) 100%)',
    p: { xs: 1, sm: 1.5, md: 2, lg: 3 } 
  }}>
    <Box sx={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      {/* Enhanced Header Section */}
      <Box sx={{ 
        mb: { xs: 3, sm: 4, md: 5 }, 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 2, sm: 3 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -20,
          left: -20,
          width: { xs: '120px', sm: '160px' },
          height: { xs: '120px', sm: '160px' },
          background: 'radial-gradient(circle, rgba(181, 106, 58, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              background: 'linear-gradient(135deg, #B56A3A 0%, #A85A2A 100%)',
              width: { xs: 56, sm: 64, md: 72 },
              height: { xs: 56, sm: 64, md: 72 },
              boxShadow: '0 8px 24px rgba(181, 106, 58, 0.4), 0 4px 12px rgba(181, 106, 58, 0.2)',
              border: '3px solid rgba(255, 255, 255, 0.9)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 12px 32px rgba(181, 106, 58, 0.5), 0 6px 16px rgba(181, 106, 58, 0.3)',
              }
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: { xs: 28, sm: 32, md: 36 }, color: 'white' }} />
          </Avatar>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              color: colors.textPrimary,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              mb: 0.5,
              background: `linear-gradient(135deg, ${colors.textPrimary} 0%, ${colors.gold} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(78, 24, 21, 0.1)',
            }}
          >
            Orders Management
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: colors.textSecondary,
              fontSize: { xs: '0.938rem', sm: '1rem' },
              fontWeight: 500,
              opacity: 0.9,
            }}
          >
            View and manage all customer orders with real-time updates
          </Typography>
        </Box>
      </Box>

      <List
        {...props}
        filters={<OrderFilter />}
        filterDefaultValues={{ orderRange: '5' }}
        sort={{ field: 'orderDate', order: 'DESC' }}
        sx={{
          width: '100%',
          '& .RaList-content': {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 249, 247, 0.95) 100%)',
            borderRadius: { xs: '20px', sm: '24px' },
            boxShadow: '0 8px 32px rgba(78, 24, 21, 0.12), 0 4px 16px rgba(78, 24, 21, 0.08)',
            border: '1px solid rgba(181, 106, 58, 0.1)',
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            backdropFilter: 'blur(10px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: { xs: '200px', sm: '280px' },
              height: { xs: '200px', sm: '280px' },
              background: 'radial-gradient(circle, rgba(181, 106, 58, 0.06) 0%, rgba(181, 106, 58, 0.02) 40%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate(-40%, -40%)',
              pointerEvents: 'none',
              animation: 'subtle-float 6s ease-in-out infinite',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: { xs: '150px', sm: '200px' },
              height: { xs: '150px', sm: '200px' },
              background: 'radial-gradient(circle, rgba(168, 150, 136, 0.04) 0%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate(40%, 40%)',
              pointerEvents: 'none',
            },
            '@keyframes subtle-float': {
              '0%, 100%': { transform: 'translate(-40%, -40%) scale(1)' },
              '50%': { transform: 'translate(-35%, -35%) scale(1.05)' },
            },
          },
        '& .MuiTableCell-head': {
          fontWeight: 700,
          color: colors.textPrimary,
          bgcolor: 'linear-gradient(135deg, rgba(181, 106, 58, 0.08) 0%, rgba(181, 106, 58, 0.04) 100%)',
          borderBottom: `2px solid rgba(181, 106, 58, 0.15)`,
          textTransform: 'uppercase',
          fontSize: { xs: '0.75rem', sm: '0.813rem' },
          letterSpacing: '0.08em',
          padding: { xs: '16px 8px', sm: '20px 16px' },
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${colors.gold} 0%, transparent 100%)`,
          }
        },
        '& .MuiTableCell-body': {
          borderBottom: `1px solid rgba(78, 24, 21, 0.08)`,
          color: colors.textPrimary,
          padding: { xs: '16px 8px', sm: '20px 16px' },
          fontSize: { xs: '0.875rem', sm: '0.938rem' },
          fontWeight: 500,
          transition: 'all 0.2s ease',
        },
        '& .MuiTableRow-root': {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: 'linear-gradient(90deg, rgba(181, 106, 58, 0.12) 0%, rgba(181, 106, 58, 0.04) 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(181, 106, 58, 0.15)',
          }
        },
        '& .RaDatagrid-clickableRow:hover': {
          background: 'linear-gradient(90deg, rgba(181, 106, 58, 0.12) 0%, rgba(181, 106, 58, 0.04) 100%)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(181, 106, 58, 0.15)',
        },
        '& .MuiToolbar-root': {
          padding: { xs: '16px 20px', sm: '24px 32px' },
          gap: { xs: 2, sm: 3 },
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, rgba(249, 249, 247, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
          borderBottom: '1px solid rgba(181, 106, 58, 0.1)',
        },
        '& .RaFilterFormInput-spacer': {
          display: 'none',
        },
      }}
    >
    <Datagrid
      rowClick="edit"
      sx={{
        '& .RaDatagrid-headerCell': {
          fontWeight: 700,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '2px',
            background: `linear-gradient(90deg, transparent 0%, ${colors.gold} 50%, transparent 100%)`,
            opacity: 0.6,
          }
        },
        '& .MuiTableCell-body': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '60%',
            background: `linear-gradient(180deg, ${colors.gold}20 0%, ${colors.gold}60 50%, ${colors.gold}20 100%)`,
            borderRadius: '0 2px 2px 0',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }
        },
        '& .MuiTableRow-root:hover .MuiTableCell-body::before': {
          opacity: 1,
        }
      }}
    >
      <TextField source="customerName" label="Customer" />
      <EmailField source="email" />
      <TextField source="phone" />
      <SelectField source="businessType" choices={businessTypeChoices} label="Business Type" />
      <FunctionField label="Product" render={(record: any) => displayProductName(record?.product) || '—'} />
      <NumberField source="quantity" />
      <NumberField
        source="totalPrice"
        options={{ style: 'currency', currency: 'ETB' }}
        label="Total (ETB)"
      />
      <StatusField source="status" label="Status" />
      <QuickStatusButtons label="Quick Actions" />
      <StatusHistoryViewer label="History" />
      <DateField source="orderDate" label="Order Date" showTime />
      <EditButton
        sx={{
          color: colors.gold,
          '&:hover': { 
            background: 'linear-gradient(135deg, rgba(181, 106, 58, 0.15) 0%, rgba(168, 90, 42, 0.1) 100%)',
            transform: 'scale(1.1)',
          },
        }}
      />
      <DeleteButton
        sx={{
          color: colors.error,
          '&:hover': { 
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(233, 30, 99, 0.1) 100%)',
            transform: 'scale(1.1)',
          },
        }}
      />
    </Datagrid>
    </List>
    </Box>
  </Box>
);

const OrderStatusHistory = () => {
  const record = useRecordContext();
  if (!record?.statusHistory || record.statusHistory.length === 0) return null;

  return (
    <Box sx={{ p: 2, bgcolor: 'rgba(63, 79, 81, 0.02)', borderRadius: '8px', mb: 2, width: '100%' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Status History
      </Typography>
      {record.statusHistory.map((entry: any, index: number) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Typography variant="body2">
            {entry.from} → {entry.to}
          </Typography>
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            {new Date(entry.changedAt).toLocaleString()}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export const OrderEdit = (props: any) => (
  <Edit
    {...props}
    sx={{
      '& .RaEdit-main': {
        bgcolor: 'transparent',
        borderRadius: '20px',
        mt: 2,
        p: { xs: 1, sm: 2 },
      },
      '& .RaEdit-card': {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 249, 247, 0.9) 100%)',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(78, 24, 21, 0.08)',
        border: '1px solid rgba(78, 24, 21, 0.06)',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(181, 106, 58, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
          pointerEvents: 'none',
        },
      },
    }}
  >
    <SimpleForm
      sx={{
        p: { xs: 2, md: 3 },
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          bgcolor: colors.paper,
          '&.Mui-focused fieldset': {
            borderColor: colors.gold,
            borderWidth: '2px',
          },
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: colors.gold,
          fontWeight: 600,
        },
        '& .MuiSelect-root': {
          borderRadius: '12px',
        },
      }}
    >
      <TextInput source="customerName" disabled fullWidth />
      <TextInput source="email" disabled fullWidth />
      <TextInput source="phone" disabled />
      <SelectInput source="businessType" choices={businessTypeChoices} disabled />
      <TextInput source="product" disabled />
      <NumberInput source="quantity" disabled />
      <NumberInput source="totalPrice" label="Total Price (ETB)" />
      <SelectInput source="status" choices={statusChoices} />
      <OrderStatusHistory />
      <TextInput source="message" multiline rows={3} disabled fullWidth />
      <TextInput source="notes" multiline rows={3} fullWidth label="Admin Notes" />
    </SimpleForm>
  </Edit>
);

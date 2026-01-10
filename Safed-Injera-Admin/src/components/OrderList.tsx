import {
  List,
  Datagrid,
  TextField,
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
  Button,
} from 'react-admin';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import { useState } from 'react';

// Design tokens
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
  info: '#2196F3',
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

const OrderFilter = (props: any) => (
  <Filter {...props}>
    <TextInput
      label="Search Customer"
      source="customerName"
      alwaysOn
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          bgcolor: colors.paper,
        },
      }}
    />
    <SelectInput
      source="status"
      choices={statusChoices}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
        },
      }}
    />
    <SelectInput
      source="businessType"
      choices={businessTypeChoices}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
        },
      }}
    />
  </Filter>
);

const StatusField = (props: any) => {
  const statusGradients: Record<string, { bg: string; color: string }> = {
    pending: { bg: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 193, 7, 0.1) 100%)', color: colors.warning },
    sent: { bg: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(0, 188, 212, 0.1) 100%)', color: colors.info },
    checked: { bg: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(0, 188, 212, 0.1) 100%)', color: colors.success },
    declined: { bg: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(233, 30, 99, 0.1) 100%)', color: colors.error },
    confirmed: { bg: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(0, 188, 212, 0.1) 100%)', color: colors.info },
    processing: { bg: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(123, 104, 238, 0.1) 100%)', color: '#9c27b0' },
    shipped: { bg: 'linear-gradient(135deg, rgba(0, 188, 212, 0.15) 0%, rgba(33, 150, 243, 0.1) 100%)', color: '#00bcd4' },
    delivered: { bg: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(0, 188, 212, 0.1) 100%)', color: colors.success },
    cancelled: { bg: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(233, 30, 99, 0.1) 100%)', color: colors.error },
  };

  const status = props.record?.status || 'pending';
  const style = statusGradients[status] || statusGradients.pending;

  return (
    <Chip
      label={statusChoices.find((s) => s.id === status)?.name || status}
      size="small"
      sx={{
        background: style.bg,
        color: style.color,
        fontWeight: 600,
        fontSize: '0.75rem',
        textTransform: 'capitalize',
        borderRadius: '8px',
        border: `1px solid ${style.color}40`,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
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
      });
      notify(`Order status updated to ${newStatus}`, { type: 'success' });
      refresh();
    } catch (error) {
      notify('Failed to update order status', { type: 'error' });
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
              <Button onClick={() => setOpen(false)}>Close</Button>
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
  <Box sx={{ width: '100%' }}>
    <List
      {...props}
      filters={<OrderFilter />}
      sort={{ field: 'orderDate', order: 'DESC' }}
      sx={{
        width: '100%',
        '& .RaList-content': {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 243, 238, 0.9) 100%)',
          borderRadius: { xs: '16px', sm: '20px' },
          boxShadow: '0 4px 20px rgba(63, 79, 81, 0.08)',
          border: '1px solid rgba(63, 79, 81, 0.06)',
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: { xs: '150px', sm: '200px' },
            height: { xs: '150px', sm: '200px' },
            background: 'radial-gradient(circle, rgba(156, 39, 176, 0.05) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(-30%, -30%)',
            pointerEvents: 'none',
          },
        },
        '& .MuiTableCell-head': {
          fontWeight: 600,
          color: colors.textSecondary,
          bgcolor: 'rgba(63, 79, 81, 0.02)',
          borderBottom: `1px solid rgba(63, 79, 81, 0.08)`,
          textTransform: 'uppercase',
          fontSize: { xs: '0.688rem', sm: '0.75rem' },
          letterSpacing: '0.05em',
          padding: { xs: '8px 4px', sm: '12px 8px' },
        },
        '& .MuiTableCell-body': {
          borderBottom: `1px solid rgba(63, 79, 81, 0.06)`,
          color: colors.textPrimary,
          padding: { xs: '12px 4px', sm: '16px 8px' },
          fontSize: { xs: '0.813rem', sm: '0.875rem' },
        },
        '& .MuiTableRow-root:hover': {
          background: 'linear-gradient(90deg, rgba(156, 39, 176, 0.08) 0%, rgba(156, 39, 176, 0.02) 100%)',
          transition: 'all 0.2s ease',
        },
        '& .RaDatagrid-clickableRow:hover': {
          background: 'linear-gradient(90deg, rgba(156, 39, 176, 0.08) 0%, rgba(156, 39, 176, 0.02) 100%)',
        },
        '& .MuiToolbar-root': {
          padding: { xs: '12px 16px', sm: '16px 24px' },
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap',
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
          fontWeight: 600,
        },
      }}
    >
      <TextField source="customerName" label="Customer" />
      <EmailField source="email" />
      <TextField source="phone" />
      <SelectField source="businessType" choices={businessTypeChoices} label="Business Type" />
      <TextField source="product" />
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
            background: 'linear-gradient(135deg, rgba(230, 181, 77, 0.15) 0%, rgba(201, 155, 57, 0.1) 100%)',
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
);

export const OrderEdit = (props: any) => (
  <Edit
    {...props}
    sx={{
      '& .RaEdit-main': {
        bgcolor: colors.paper,
        borderRadius: '20px',
        boxShadow: '0 2px 12px rgba(63, 79, 81, 0.06)',
        mt: 2,
      },
    }}
  >
    <SimpleForm
      sx={{
        p: { xs: 2, md: 3 },
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          '&.Mui-focused fieldset': {
            borderColor: colors.gold,
          },
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: colors.gold,
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
      {record?.statusHistory && record.statusHistory.length > 0 && (
        <Box sx={{ p: 2, bgcolor: 'rgba(63, 79, 81, 0.02)', borderRadius: '8px', mb: 2 }}>
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
      )}
      <TextInput source="message" multiline rows={3} disabled fullWidth />
      <TextInput source="notes" multiline rows={3} fullWidth label="Admin Notes" />
    </SimpleForm>
  </Edit>
);

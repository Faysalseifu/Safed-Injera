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
} from 'react-admin';
import { Box, Typography, Chip } from '@mui/material';

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
  const statusColors: Record<string, { bg: string; color: string }> = {
    pending: { bg: 'rgba(255, 152, 0, 0.1)', color: colors.warning },
    confirmed: { bg: 'rgba(33, 150, 243, 0.1)', color: colors.info },
    processing: { bg: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' },
    shipped: { bg: 'rgba(0, 188, 212, 0.1)', color: '#00bcd4' },
    delivered: { bg: 'rgba(76, 175, 80, 0.1)', color: colors.success },
    cancelled: { bg: 'rgba(244, 67, 54, 0.1)', color: colors.error },
  };

  const status = props.record?.status || 'pending';
  const style = statusColors[status] || statusColors.pending;

  return (
    <Chip
      label={statusChoices.find((s) => s.id === status)?.name || status}
      size="small"
      sx={{
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 600,
        fontSize: '0.75rem',
        textTransform: 'capitalize',
        borderRadius: '8px',
      }}
    />
  );
};

export const OrderList = (props: any) => (
  <List
    {...props}
    filters={<OrderFilter />}
    sort={{ field: 'orderDate', order: 'DESC' }}
    sx={{
      '& .RaList-content': {
        bgcolor: colors.paper,
        borderRadius: '20px',
        boxShadow: '0 2px 12px rgba(63, 79, 81, 0.06)',
        border: '1px solid rgba(63, 79, 81, 0.04)',
        overflow: 'hidden',
      },
      '& .MuiTableCell-head': {
        fontWeight: 600,
        color: colors.textSecondary,
        bgcolor: 'rgba(63, 79, 81, 0.02)',
        borderBottom: `1px solid rgba(63, 79, 81, 0.08)`,
        textTransform: 'uppercase',
        fontSize: '0.75rem',
        letterSpacing: '0.05em',
      },
      '& .MuiTableCell-body': {
        borderBottom: `1px solid rgba(63, 79, 81, 0.06)`,
        color: colors.textPrimary,
      },
      '& .MuiTableRow-root:hover': {
        bgcolor: 'rgba(230, 181, 77, 0.04)',
      },
      '& .RaDatagrid-clickableRow:hover': {
        bgcolor: 'rgba(230, 181, 77, 0.04)',
      },
      '& .MuiToolbar-root': {
        padding: '16px 24px',
        gap: 2,
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
      <DateField source="orderDate" label="Order Date" showTime />
      <EditButton
        sx={{
          color: colors.gold,
          '&:hover': { bgcolor: 'rgba(230, 181, 77, 0.1)' },
        }}
      />
      <DeleteButton
        sx={{
          color: colors.error,
          '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
        }}
      />
    </Datagrid>
  </List>
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
      <TextInput source="message" multiline rows={3} disabled fullWidth />
      <TextInput source="notes" multiline rows={3} fullWidth label="Admin Notes" />
    </SimpleForm>
  </Edit>
);

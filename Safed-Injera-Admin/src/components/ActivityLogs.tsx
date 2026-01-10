import { useState, useEffect } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  Filter,
  TextInput,
  SelectInput,
  Show,
  SimpleShowLayout,
  ShowButton,
} from 'react-admin';
import { Box, Typography, Chip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

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
  info: '#2196F3',
};

const ActivityLogFilter = (props: any) => (
  <Filter {...props}>
    <TextInput label="Search" source="q" alwaysOn />
    <SelectInput
      source="entityType"
      choices={[
        { id: 'stock', name: 'Stock' },
        { id: 'order', name: 'Order' },
      ]}
    />
    <SelectInput
      source="actionType"
      choices={[
        { id: 'stock_created', name: 'Stock Created' },
        { id: 'stock_updated', name: 'Stock Updated' },
        { id: 'stock_quantity_adjusted', name: 'Stock Quantity Adjusted' },
        { id: 'order_status_changed', name: 'Order Status Changed' },
        { id: 'stock_setting_updated', name: 'Stock Setting Updated' },
      ]}
    />
  </Filter>
);

const ActionTypeField = ({ record }: any) => {
  if (!record) return null;
  
  const actionColors: Record<string, { bg: string; color: string }> = {
    stock_created: { bg: 'rgba(76, 175, 80, 0.1)', color: colors.success },
    stock_updated: { bg: 'rgba(33, 150, 243, 0.1)', color: colors.info || '#2196F3' },
    stock_quantity_adjusted: { bg: 'rgba(255, 152, 0, 0.1)', color: colors.warning },
    order_status_changed: { bg: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' },
    stock_setting_updated: { bg: 'rgba(93, 181, 164, 0.1)', color: colors.teal },
  };

  const style = actionColors[record.action_type] || { bg: 'rgba(63, 79, 81, 0.1)', color: colors.textSecondary };

  return (
    <Chip
      label={record.action_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
      size="small"
      sx={{
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 600,
        fontSize: '0.75rem',
      }}
    />
  );
};

export const ActivityLogs = (props: any) => {
  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 1.5, md: 2, lg: 3 } }}>
      <Box sx={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 }, display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
          <HistoryIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: colors.gold }} />
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: colors.textPrimary,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              }}
            >
              Activity Logs
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: colors.textSecondary,
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
              }}
            >
              Track all system activities and changes
            </Typography>
          </Box>
        </Box>
        <List
          {...props}
          resource="activity-logs"
          filters={<ActivityLogFilter />}
          sort={{ field: 'createdAt', order: 'DESC' }}
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
                right: 0,
                width: { xs: '150px', sm: '200px' },
                height: { xs: '150px', sm: '200px' },
                background: 'radial-gradient(circle, rgba(93, 181, 164, 0.05) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)',
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
            '& .MuiToolbar-root': {
              padding: { xs: '12px 16px', sm: '16px 24px' },
              gap: { xs: 1, sm: 2 },
              flexWrap: 'wrap',
            },
          }}
        >
          <Datagrid>
            <DateField source="createdAt" label="Date" showTime />
            <TextField source="userUsername" label="User" />
            <ActionTypeField label="Action" />
            <TextField source="entityType" label="Entity Type" />
            <TextField source="entityId" label="Entity ID" />
            <ShowButton />
          </Datagrid>
        </List>
      </Box>
    </Box>
  );
};

export const ActivityLogShow = (props: any) => (
  <Show {...props} sx={{ '& .RaShow-main': { bgcolor: colors.cream, minHeight: '100vh', p: { xs: 1, sm: 2, md: 3 } } }}>
    <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
      <SimpleShowLayout
        sx={{
          '& .RaSimpleShowLayout-root': {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 243, 238, 0.9) 100%)',
            borderRadius: { xs: '16px', sm: '20px' },
            boxShadow: '0 4px 20px rgba(63, 79, 81, 0.08)',
            border: '1px solid rgba(63, 79, 81, 0.06)',
            p: { xs: 2, sm: 3, md: 4 },
          },
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: colors.textPrimary }}>
          Activity Log Details
        </Typography>
        <DateField source="createdAt" label="Date & Time" showTime />
        <TextField source="userUsername" label="User" />
        <ActionTypeField label="Action Type" />
        <TextField source="entityType" label="Entity Type" />
        <TextField source="entityId" label="Entity ID" />
        <TextField source="details" label="Details" />
      </SimpleShowLayout>
    </Box>
  </Show>
);

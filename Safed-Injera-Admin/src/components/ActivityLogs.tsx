import { useState, useEffect } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  Filter,
  TextInput,
  SelectInput,
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
    <List
      {...props}
      resource="activity-logs"
      filters={<ActivityLogFilter />}
      sort={{ field: 'createdAt', order: 'DESC' }}
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
      }}
    >
      <Datagrid>
        <DateField source="createdAt" label="Date" showTime />
        <TextField source="userUsername" label="User" />
        <ActionTypeField label="Action" />
        <TextField source="entityType" label="Entity Type" />
        <TextField source="entityId" label="Entity ID" />
      </Datagrid>
    </List>
  );
};

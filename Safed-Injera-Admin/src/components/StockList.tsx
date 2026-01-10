import {
  List,
  Datagrid,
  TextField,
  NumberField,
  BooleanField,
  DateField,
  EditButton,
  DeleteButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  SelectInput,
  required,
  minValue,
  Filter,
  useDataProvider,
  useNotify,
  useRefresh,
} from 'react-admin';
import { Box, Typography, Chip, IconButton, Tooltip, Button } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
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
};

const StockFilter = (props: any) => (
  <Filter {...props}>
    <TextInput
      label="Search"
      source="q"
      alwaysOn
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          bgcolor: colors.paper,
        },
      }}
    />
    <SelectInput
      source="category"
      choices={[
        { id: 'Injera', name: 'Injera' },
        { id: 'Teff Flour', name: 'Teff Flour' },
        { id: 'Packaging', name: 'Packaging' },
        { id: 'Other', name: 'Other' },
      ]}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
        },
      }}
    />
    <BooleanInput source="isActive" label="Active Only" />
    <BooleanInput source="isLowStock" label="Low Stock Only" />
  </Filter>
);

// Custom list wrapper with mobile-first styling
const ListWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      bgcolor: colors.cream,
      minHeight: '100vh',
      p: { xs: 1, sm: 1.5, md: 2, lg: 3 },
      width: '100%',
    }}
  >
    <Box sx={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: colors.textPrimary,
            mb: 0.5,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          }}
        >
          Stock Inventory
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: colors.textSecondary,
            fontSize: { xs: '0.813rem', sm: '0.875rem' },
          }}
        >
          Manage your product inventory and track stock levels.
        </Typography>
      </Box>
      {children}
    </Box>
  </Box>
);

// Deficiency Indicator Field
const DeficiencyIndicatorField = ({ record }: any) => {
  if (!record) return null;
  const isLow = record.isLowStock || (record.minimumThreshold && record.quantity < record.minimumThreshold);
  
  if (isLow) {
    return (
      <Chip
        icon={<WarningIcon />}
        label="Low Stock"
        size="small"
        sx={{
          background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(233, 30, 99, 0.1) 100%)',
          color: colors.error,
          fontWeight: 600,
          border: `1px solid rgba(244, 67, 54, 0.3)`,
          boxShadow: '0 2px 8px rgba(244, 67, 54, 0.2)',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.8 },
          },
        }}
      />
    );
  }
  return (
    <Chip 
      label="OK" 
      size="small" 
      sx={{ 
        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(0, 188, 212, 0.1) 100%)',
        color: colors.success, 
        fontWeight: 600,
        border: `1px solid rgba(76, 175, 80, 0.3)`,
      }} 
    />
  );
};

// Stock Quantity Field with Quick Adjust
const StockQuantityField = ({ record }: any) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [loading, setLoading] = useState(false);

  const handleQuickAdjust = async (amount: number, operation: 'add' | 'subtract') => {
    if (!record) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/stocks/${record.id}/quick-adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, operation, reason: `Quick ${operation === 'add' ? 'add' : 'subtract'}` }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update stock');
      }
      
      notify(`Stock ${operation === 'add' ? 'increased' : 'decreased'} by ${amount}`, { type: 'success' });
      refresh();
    } catch (error) {
      notify('Failed to update stock', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '60px' }}>
        {record.quantity} {record.unit}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Add 10">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickAdjust(10, 'add');
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
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Subtract 10">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickAdjust(10, 'subtract');
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
            <RemoveIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// Minimum Threshold Field
const MinimumThresholdField = ({ record }: any) => {
  if (!record) return null;
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {record.minimumThreshold ?? 'Not set'}
      </Typography>
      {record.minimumThreshold && (
        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
          {record.quantity < record.minimumThreshold
            ? `${record.minimumThreshold - record.quantity} below threshold`
            : 'Above threshold'}
        </Typography>
      )}
    </Box>
  );
};

// Transaction History Button
const TransactionHistoryButton = ({ record }: any) => {
  const [open, setOpen] = useState(false);
  const dataProvider = useDataProvider();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/stocks/${record.id}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        throw new Error('Failed to load transactions');
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="View Transaction History">
        <IconButton
          size="small"
          onClick={handleClick}
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
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Transaction History - {record.productName}
              </Typography>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </Box>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : transactions.length === 0 ? (
              <Typography sx={{ color: colors.textSecondary }}>No transactions found</Typography>
            ) : (
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Change</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Before</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>After</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: any) => (
                    <tr key={tx.id}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{tx.transactionType}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee', color: tx.quantityChange > 0 ? colors.success : colors.error }}>
                        {tx.quantityChange > 0 ? '+' : ''}{tx.quantityChange}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{tx.quantityBefore}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{tx.quantityAfter}</td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export const StockList = (props: any) => (
  <Box sx={{ width: '100%' }}>
    <List
      {...props}
      filters={<StockFilter />}
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
            background: 'radial-gradient(circle, rgba(33, 150, 243, 0.05) 0%, transparent 70%)',
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
        '& .MuiTableRow-root:hover': {
          background: 'linear-gradient(90deg, rgba(230, 181, 77, 0.08) 0%, rgba(230, 181, 77, 0.02) 100%)',
          transition: 'all 0.2s ease',
        },
        '& .RaDatagrid-clickableRow:hover': {
          background: 'linear-gradient(90deg, rgba(230, 181, 77, 0.08) 0%, rgba(230, 181, 77, 0.02) 100%)',
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
          width: '100%',
          '& .RaDatagrid-headerCell': {
            fontWeight: 600,
          },
          '& .RaDatagrid-row': {
            '&:hover': {
              cursor: 'pointer',
            },
          },
        }}
      >
      <TextField source="productName" label="Product Name" />
      <TextField source="category" />
      <DeficiencyIndicatorField label="Status" />
      <StockQuantityField label="Quantity" />
      <MinimumThresholdField label="Min Threshold" />
      <NumberField
        source="price"
        options={{ style: 'currency', currency: 'ETB' }}
        label="Price (ETB)"
      />
      <BooleanField source="isActive" label="Active" />
      <TransactionHistoryButton label="History" />
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

export const StockCreate = (props: any) => (
  <Create
    {...props}
    sx={{
      '& .RaCreate-main': {
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
      <TextInput source="productName" validate={required()} fullWidth />
      <TextInput source="description" multiline rows={3} fullWidth />
      <NumberInput source="quantity" validate={[required(), minValue(0)]} />
      <SelectInput
        source="unit"
        choices={[
          { id: 'pieces', name: 'Pieces' },
          { id: 'packs', name: 'Packs' },
          { id: 'boxes', name: 'Boxes' },
          { id: 'kg', name: 'Kilograms' },
        ]}
        defaultValue="pieces"
      />
      <NumberInput source="price" validate={[required(), minValue(0)]} label="Price (ETB)" />
      <SelectInput
        source="category"
        choices={[
          { id: 'Injera', name: 'Injera' },
          { id: 'Teff Flour', name: 'Teff Flour' },
          { id: 'Packaging', name: 'Packaging' },
          { id: 'Other', name: 'Other' },
        ]}
        defaultValue="Injera"
      />
      <NumberInput source="minimumThreshold" label="Minimum Threshold" />
      <BooleanInput source="isActive" label="Active" defaultValue={true} />
    </SimpleForm>
  </Create>
);

export const StockEdit = (props: any) => (
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
      <TextInput source="productName" validate={required()} fullWidth />
      <TextInput source="description" multiline rows={3} fullWidth />
      <NumberInput source="quantity" validate={[required(), minValue(0)]} />
      <SelectInput
        source="unit"
        choices={[
          { id: 'pieces', name: 'Pieces' },
          { id: 'packs', name: 'Packs' },
          { id: 'boxes', name: 'Boxes' },
          { id: 'kg', name: 'Kilograms' },
        ]}
      />
      <NumberInput source="price" validate={[required(), minValue(0)]} label="Price (ETB)" />
      <SelectInput
        source="category"
        choices={[
          { id: 'Injera', name: 'Injera' },
          { id: 'Teff Flour', name: 'Teff Flour' },
          { id: 'Packaging', name: 'Packaging' },
          { id: 'Other', name: 'Other' },
        ]}
      />
      <NumberInput source="minimumThreshold" label="Minimum Threshold" />
      <BooleanInput source="isActive" label="Active" />
    </SimpleForm>
  </Edit>
);

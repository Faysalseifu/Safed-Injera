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
  </Filter>
);

// Custom list wrapper with new styling
const ListWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      bgcolor: colors.cream,
      minHeight: '100vh',
      p: { xs: 2, md: 3 },
    }}
  >
    <Box sx={{ maxWidth: '1600px', margin: '0 auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: colors.textPrimary,
            mb: 0.5,
          }}
        >
          Stock Inventory
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Manage your product inventory and track stock levels.
        </Typography>
      </Box>
      {children}
    </Box>
  </Box>
);

export const StockList = (props: any) => (
  <List
    {...props}
    filters={<StockFilter />}
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
      <TextField source="productName" label="Product Name" />
      <TextField source="category" />
      <NumberField source="quantity" />
      <TextField source="unit" />
      <NumberField
        source="price"
        options={{ style: 'currency', currency: 'ETB' }}
        label="Price (ETB)"
      />
      <BooleanField source="isActive" label="Active" />
      <DateField source="lastUpdated" label="Last Updated" showTime />
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
      <BooleanInput source="isActive" label="Active" />
    </SimpleForm>
  </Edit>
);

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
    <TextInput label="Search Customer" source="customerName" alwaysOn />
    <SelectInput source="status" choices={statusChoices} />
    <SelectInput source="businessType" choices={businessTypeChoices} />
  </Filter>
);

const StatusField = (props: any) => {
  const colors: Record<string, string> = {
    pending: '#ff9800',
    confirmed: '#2196f3',
    processing: '#9c27b0',
    shipped: '#00bcd4',
    delivered: '#4caf50',
    cancelled: '#f44336',
  };

  return (
    <SelectField
      {...props}
      choices={statusChoices}
      sx={{
        '& .MuiTypography-root': {
          color: colors[props.record?.status] || '#666',
          fontWeight: 'bold',
        },
      }}
    />
  );
};

export const OrderList = (props: any) => (
  <List {...props} filters={<OrderFilter />} sort={{ field: 'orderDate', order: 'DESC' }}>
    <Datagrid rowClick="edit">
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
      <StatusField source="status" />
      <DateField source="orderDate" label="Order Date" showTime />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const OrderEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
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



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

const StockFilter = (props: any) => (
  <Filter {...props}>
    <TextInput label="Search" source="q" alwaysOn />
    <SelectInput
      source="category"
      choices={[
        { id: 'Injera', name: 'Injera' },
        { id: 'Teff Flour', name: 'Teff Flour' },
        { id: 'Packaging', name: 'Packaging' },
        { id: 'Other', name: 'Other' },
      ]}
    />
    <BooleanInput source="isActive" label="Active Only" />
  </Filter>
);

export const StockList = (props: any) => (
  <List {...props} filters={<StockFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="edit">
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
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const StockCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
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
  <Edit {...props}>
    <SimpleForm>
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



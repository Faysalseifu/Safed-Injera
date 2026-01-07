import { Layout, LayoutProps } from 'react-admin';
import CustomMenu from './CustomMenu';

const CustomLayout = (props: LayoutProps) => (
  <Layout {...props} menu={CustomMenu} />
);

export default CustomLayout;



import { lazy } from 'react';

// project-imports
import DashboardLayout from 'layout/Dashboard';
import Loadable from 'components/Loadable';

// Lazy-loaded components
const Addproduct = Loadable(lazy(() => import('views/mycomponents/product/AddProduct')));
const Viewproduct = Loadable(lazy(() => import('views/mycomponents/product/DataProduct')));

const ProductRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'addproduct',
          element: <Addproduct />
        },
        {
          path: 'dataproduct',
          element: <Viewproduct />
        }
      ]
    }
  ]
};

export default ProductRoutes;

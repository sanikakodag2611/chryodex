import { lazy } from 'react';

// project-imports
import DashboardLayout from 'layout/Dashboard';
import Loadable from 'components/Loadable';

// Lazy-loaded components
const DateWise = Loadable(lazy(() => import('views/mycomponents/reports/DateWise')));
const ProductWise = Loadable(lazy(() => import('views/mycomponents/reports/ProductWise')));
const SalesmanWise = Loadable(lazy(() => import('views/mycomponents/reports/SalesmanWise')));
const CityWise = Loadable(lazy(() => import('views/mycomponents/reports/CityWise')));

const ReportRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'datewise',
          element: <DateWise />
        },
        {
          path: 'productwise',
          element: <ProductWise />
        },
        {
          path: 'salesmanwise',
          element: <SalesmanWise />
        },
        {
          path: 'citywise',
          element: <CityWise />
        }
      ]
    }
  ]
};

export default ReportRoutes;

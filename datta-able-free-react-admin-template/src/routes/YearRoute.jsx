import { lazy } from 'react';

// project-imports
import DashboardLayout from 'layout/Dashboard';
import Loadable from 'components/Loadable';

// Lazy-loaded components
const Addyear = Loadable(lazy(() => import('views/mycomponents/year/AddYear')));
const Viewyear = Loadable(lazy(() => import('views/mycomponents/year/YearData')));

const YearRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'addyear',
          element: <Addyear />
        },
        {
          path: 'datayear',
          element: <Viewyear />
        }
      ]
    }
  ]
};

export default YearRoutes;

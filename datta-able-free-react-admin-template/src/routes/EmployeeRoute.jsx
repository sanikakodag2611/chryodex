import { lazy } from 'react';

// project-imports
import DashboardLayout from 'layout/Dashboard';
import Loadable from 'components/Loadable';

// Lazy-loaded components
const Addemployee = Loadable(lazy(() => import('views/mycomponents/employee/AddEmployee')));
const Viewemployee = Loadable(lazy(() => import('views/mycomponents/employee/DataEmployee')));

const EmployeeRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'addemployee',
          element: <Addemployee />
        },
        {
          path: 'dataemployee',
          element: <Viewemployee />
        }
      ]
    }
  ]
};

export default EmployeeRoutes;

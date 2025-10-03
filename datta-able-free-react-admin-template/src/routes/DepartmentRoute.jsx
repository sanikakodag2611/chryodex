import { lazy } from 'react';

// project-imports
import DashboardLayout from 'layout/Dashboard';
import Loadable from 'components/Loadable';

// Lazy-loaded components
const Adddepartment = Loadable(lazy(() => import('views/mycomponents/department/AddDepartment')));
const Viewdepartment = Loadable(lazy(() => import('views/mycomponents/department/DepartmentData')));

const DepartmentRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'adddepartment',
          element: <Adddepartment />
        },
        {
          path: 'datadepartment',
          element: <Viewdepartment />
        }
      ]
    }
  ]
};

export default DepartmentRoutes;

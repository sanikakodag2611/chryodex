import { lazy } from 'react';

// project-imports
import DashboardLayout from 'layout/Dashboard';
import Loadable from 'components/Loadable';

// Lazy-loaded components
const Addcompany = Loadable(lazy(() => import('views/mycomponents/company/AddCompany')));
const Viewcompnay = Loadable(lazy(() => import('views/mycomponents/company/DataCompany')));

const CompanyRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'addcompany',
          element: <Addcompany />
        },
        {
          path: 'datacompany',
          element: <Viewcompnay />
        }
      ]
    }
  ]
};

export default CompanyRoutes;

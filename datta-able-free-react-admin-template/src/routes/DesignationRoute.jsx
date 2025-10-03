import { lazy } from 'react';

// project-imports
import DashboardLayout from 'layout/Dashboard';
import Loadable from 'components/Loadable';

// Lazy-loaded components
const Adddesignation = Loadable(lazy(() => import('views/mycomponents/designation/AddDesignation')));
const Viewdesignation = Loadable(lazy(() => import('views/mycomponents/designation/DesignationData')));

const DesignationRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'adddesignation',
          element: <Adddesignation />
        },
        {
          path: 'datadesignation',
          element: <Viewdesignation />
        }
      ]
    }
  ]
};

export default DesignationRoutes;

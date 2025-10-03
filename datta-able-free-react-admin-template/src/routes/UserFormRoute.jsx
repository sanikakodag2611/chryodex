import { lazy } from 'react';

// project-imports
import DashboardLayout from 'layout/Dashboard';
import Loadable from 'components/Loadable';

// Lazy-load your form
const UserForm = Loadable(lazy(() => import('views/mycomponents/UserForm')));

const UserFormRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'myform',
          element: <UserForm />
        }
      ]
    }
  ]
};

export default UserFormRoutes;

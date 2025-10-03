import { lazy } from 'react';

// project-imports
import DashboardLayout from 'layout/Dashboard';
import Loadable from 'components/Loadable';

// Lazy-loaded components
const AddFile = Loadable(lazy(() => import('views/mycomponents/excelhandle/AddFile')));
const BarChart = Loadable(lazy(() => import('views/mycomponents/excelhandle/BarChart')));
const LineChart = Loadable(lazy(() => import('views/mycomponents/excelhandle/LineChart')));
const PieChart = Loadable(lazy(() => import('views/mycomponents/excelhandle/PieChart')));


const ExcelFileRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'addfile',
          element: <AddFile />
        },
        {
          path: 'databarchart',
          element: <BarChart />
        },
        {
          path: 'datalinechart',
          element: <LineChart />
        },
        {
          path: 'datapiechart',
          element: <PieChart />
        }
      ]
    }
  ]
};

export default ExcelFileRoutes;

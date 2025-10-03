import { lazy } from 'react';

// project-imports
import DashboardLayout from 'layout/Dashboard';
import Loadable from 'components/Loadable';

// Lazy-loaded components
const Addcountry = Loadable(lazy(() => import('views/mycomponents/country_state/AddCountry')));
const Viewcountry = Loadable(lazy(() => import('views/mycomponents/country_state/DataCountry')));
const Addstate = Loadable(lazy(() => import('views/mycomponents/country_state/AddState')));
const Viewstate = Loadable(lazy(() => import('views/mycomponents/country_state/DataState')));
const Adddistrict = Loadable(lazy(() => import('views/mycomponents/country_state/AddDistrict')));
const Viewdistrict = Loadable(lazy(() => import('views/mycomponents/country_state/DataDistrict')));

const CountryStateRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'addcountry',
          element: <Addcountry />
        },
        {
          path: 'datacountry',
          element: <Viewcountry />
        },
        {
          path: 'addstate',
          element: <Addstate />
        },
        {
          path: 'datastate',
          element: <Viewstate />
        }
        ,
        {
          path: 'adddistrict',
          element: <Adddistrict />
        },
        {
          path: 'datadistrict',
          element: <Viewdistrict />
        }
      ]
    }
  ]
};

export default CountryStateRoutes;

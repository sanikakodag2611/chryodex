// src/router.js
import { createBrowserRouter } from "react-router-dom";
import PagesRoutes from "./PagesRoutes";
import NavigationRoutes from "./NavigationRoutes";
import ComponentsRoutes from "./ComponentsRoutes";
import FormsRoutes from "./FormsRoutes";
import TablesRoutes from "./TablesRoutes";
import ChartMapRoutes from "./ChartMapRoutes";
import OtherRoutes from "./OtherRoutes";
import UserFormRoutes from "./UserFormRoute";
import YearRoutes from "./YearRoute";
import DepartmentRoutes from "./DepartmentRoute";
import DesignationRoutes from "./DesignationRoute";
import ReportRoutes from "./ReportRoute";
import CountryStateRoutes from "./CountryStateRoute";
import CompanyRoutes from "./CompanyRoute";
import ProductRoutes from "./ProductRoute";
import EmployeeRoutes from "./EmployeeRoute";
import ExcelFileRoutes from "./ExcelFileRoute"; 
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter(
  [
    // Public routes
    NavigationRoutes,
    PagesRoutes,

    // Protected routes
    {
      element: <ProtectedRoute />,
      children: [
        OtherRoutes,
        ComponentsRoutes, 
        ReportRoutes,
        CompanyRoutes,
        EmployeeRoutes,
        ProductRoutes,
        ExcelFileRoutes,
        YearRoutes,
        DepartmentRoutes,
        DesignationRoutes,
        CountryStateRoutes,
         
      ],
    },
  ],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME,
  }
);

export default router;
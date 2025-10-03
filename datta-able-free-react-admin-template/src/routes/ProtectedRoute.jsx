
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = sessionStorage.getItem('auth_token');
  const employee = sessionStorage.getItem('employee');

  if (!token || !employee) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

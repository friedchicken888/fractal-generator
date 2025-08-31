import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
  const { token, user } = useAuth();

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" />;
  }

  if (requiredRole && (!user || user.role !== requiredRole)) {
    // If a role is required and user doesn't have it, redirect to no access page
    return <Navigate to="/no-access" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

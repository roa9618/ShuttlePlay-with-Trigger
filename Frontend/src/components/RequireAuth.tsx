import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireAuth() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to = "/login"
        state = {{ from: `${location.pathname}${location.search}${location.hash}` }}
        replace
      />
    );
  }

  return <Outlet />;
}
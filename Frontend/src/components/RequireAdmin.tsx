import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireAdmin() {
  const { session, isAuthLoading } = useAuth();
  const location = useLocation();
  if (isAuthLoading) return null;
  return session?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace state={{ from: location.pathname }} />;
}

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { setAuthRedirectPath } from '../utils/authSession';

export default function RequireAuth() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    const returnPath = `${location.pathname}${location.search}${location.hash}`;
    setAuthRedirectPath(returnPath);

    return (
      <Navigate
        to = {`/login?redirect=${encodeURIComponent(returnPath)}`}
        state = {{ from: returnPath }}
        replace
      />
    );
  }

  return <Outlet />;
}

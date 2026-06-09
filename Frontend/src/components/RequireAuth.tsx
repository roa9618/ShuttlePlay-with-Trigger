import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/authSession';

export default function RequireAuth() {
  const location = useLocation();

  if (!isAuthenticated()) {
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

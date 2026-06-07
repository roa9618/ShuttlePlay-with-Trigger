import { Outlet, useLocation } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import Logo from './Logo';

export default function Layout() {
  const location = useLocation();

  // Routes that should show the desktop sidebar
  const desktopRoutes = [
    '/groups',
    '/my-record',
    '/settings',
    '/gallery',
  ];

  // Check if current path should show desktop layout
  const showDesktopLayout = desktopRoutes.some(route => location.pathname.startsWith(route)) ||
    location.pathname.includes('/dashboard') ||
    location.pathname.includes('/participants') ||
    location.pathname.includes('/queue') ||
    location.pathname.includes('/current') ||
    location.pathname.includes('/result/') ||
    location.pathname.includes('/report') ||
    location.pathname.includes('/create-session');

  if (showDesktopLayout) {
    return (
      <div className = "app-desktop-shell flex min-h-screen bg-background">
        <DesktopSidebar />
        <header className = "app-mobile-admin-bar">
          <Logo size = "sm" />
          <span>운영</span>
        </header>
        <div className = "app-desktop-content flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className = "app-mobile-shell min-h-screen bg-background">
      <Outlet />
    </div>
  );
}

import { useEffect } from 'react';
import { Outlet, useLocation, useMatches } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import Logo from './Logo';
import { styles } from './Layout.styles';

const defaultDocumentTitle = '셔틀플레이 | 배드민턴 모임 관리';

type RouteHandle = {
  title?: string;
};

export default function Layout() {
  const location = useLocation();
  const matches = useMatches();

  useEffect(() => {
    const currentTitle = [...matches]
      .reverse()
      .map(match => (match.handle as RouteHandle | undefined)?.title)
      .find(Boolean);

    document.title = currentTitle ? `${currentTitle} | 셔틀플레이` : defaultDocumentTitle;
  }, [matches]);

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
      <div className = {styles.desktopShell}>
        <DesktopSidebar />
        <header className = {styles.mobileAdminBar}>
          <Logo size = "sm" />
          <span>운영</span>
        </header>
        <div className = {styles.desktopContent}>
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className = {styles.mobileShell}>
      <Outlet />
    </div>
  );
}

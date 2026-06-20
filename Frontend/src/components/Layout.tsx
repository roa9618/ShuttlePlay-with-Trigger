import { useEffect } from 'react';
import { Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import Footer from './Footer';
import Logo from './Logo';
import NotificationToastStack from './NotificationToastStack';
import { styles } from './Layout.styles';

const defaultDocumentTitle = '셔틀플레이 | 배드민턴 모임 관리';

type RouteHandle = {
  title?: string;
};

const PARTICIPANT_RESUME_KEY = 'shuttleplay-participant-resume';
const PARTICIPANT_RESUME_MAX_AGE = 6 * 60 * 60 * 1000;
const participantLivePath = /^\/sessions\/((?!demo)[^/]+)\/(status|next-match|match-call|current-match|match-result)$/;

type ParticipantResume = {
  path: string;
  savedAt: number;
};

export default function Layout() {
  const location = useLocation();
  const matches = useMatches();
  const navigate = useNavigate();

  useEffect(() => {
    if (participantLivePath.test(location.pathname)) {
      const resume: ParticipantResume = {
        path: `${location.pathname}${location.search}`,
        savedAt: Date.now(),
      };
      window.localStorage.setItem(PARTICIPANT_RESUME_KEY, JSON.stringify(resume));
      return;
    }

    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    const requestedResume = new URLSearchParams(location.search).get('resume') === 'participant';
    if (location.pathname !== '/' || (!standalone && !requestedResume)) return;

    try {
      const resume = JSON.parse(window.localStorage.getItem(PARTICIPANT_RESUME_KEY) ?? '') as ParticipantResume;
      if (!participantLivePath.test(resume.path.split('?')[0]) || Date.now() - resume.savedAt > PARTICIPANT_RESUME_MAX_AGE) {
        window.localStorage.removeItem(PARTICIPANT_RESUME_KEY);
        return;
      }
      navigate(resume.path, { replace: true });
    } catch {
      window.localStorage.removeItem(PARTICIPANT_RESUME_KEY);
    }
  }, [location.pathname, location.search, navigate]);

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
    '/notifications',
    '/notices',
    '/admin',
    '/gallery',
  ];

  const isSessionEntryFlow = location.pathname.startsWith('/session-entry') ||
    /^\/sessions\/[^/]+\/(join|guest-join|attendance|late|entry-result|status|next-match|match-call|current-match|match-result|guest-report|my-report)(\/|$)/.test(location.pathname);

  const isSessionOperationFlow = /^\/sessions\/[^/]+\/(dashboard|participants|queue|current|result|report)(\/|$)/.test(location.pathname);

  // Session entry pages always use the centered, sidebar-free layout.
  const showDesktopLayout = !isSessionEntryFlow && !isSessionOperationFlow && (desktopRoutes.some(route => location.pathname.startsWith(route)) ||
    location.pathname.includes('/dashboard') ||
    location.pathname.includes('/participants') ||
    location.pathname.includes('/queue') ||
    location.pathname.includes('/current') ||
    location.pathname.includes('/result/') ||
    location.pathname.includes('/report'));

  const showFooter = location.pathname === '/';

  if (showDesktopLayout) {
    return (
      <div className = {styles.desktopShell}>
        <DesktopSidebar />
        <header className = {styles.mobileAdminBar}>
          <Logo size = "sm" />
        </header>
        <div className = {styles.desktopContent}>
          <Outlet />
        </div>
        <NotificationToastStack />
      </div>
    );
  }

  return (
    <div className = {showFooter ? styles.homeShell : styles.mobileShell}>
      <Outlet />
      {showFooter && <Footer />}
      <NotificationToastStack />
    </div>
  );
}

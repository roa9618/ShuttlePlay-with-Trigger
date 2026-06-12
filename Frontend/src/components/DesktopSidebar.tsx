import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import {
  Home,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Grid3x3,
  Bell,
  BellOff,
  CheckCheck,
  ChevronRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import {
  loadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  useNotifications,
  type AppNotification,
} from '../utils/notificationStore';
import { styles } from './DesktopSidebar.styles';
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from '../utils/notificationSocket';

function formatGender(gender?: string | null) {
  if (gender === 'MALE' || gender === '남성' || gender === '남') {
    return '남성';
  }

  if (gender === 'FEMALE' || gender === '여성' || gender === '여') {
    return '여성';
  }

  return '성별 미설정';
}

function formatAgeGroup(ageGroup?: string | null) {
  const labels: Record<string, string> = {
    TEENS: '10대',
    TWENTIES: '20대',
    THIRTIES: '30대',
    FORTIES: '40대',
    FIFTIES: '50대',
    SIXTIES_AND_ABOVE: '60대 이상',
  };

  return ageGroup ? labels[ageGroup] ?? ageGroup : '연령대 미설정';
}

export default function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { session, isAuthenticated, logout } = useAuth();
  const notifications = useNotifications();
  const recentNotifications = notifications.slice(0, 4);
  const unreadCount = notifications.filter(notification => !notification.read).length;

  const navigation = [
    { name: '홈', path: '/', icon: Home },
    { name: '내 모임', path: '/groups', icon: Users },
    { name: '내 기록', path: '/my-record', icon: BarChart3 },
    { name: '설정', path: '/settings', icon: Settings },
    { name: '페이지 갤러리', path: '/gallery', icon: Grid3x3 },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/', {
      replace: true,
    });
  };

  const openNotification = (notification: AppNotification) => {
    void markNotificationAsRead(notification.id);
    setNotificationOpen(false);
    navigate(notification.targetPath);
  };

  const openAllNotifications = () => {
    setNotificationOpen(false);
    navigate('/notifications');
  };

  useEffect(() => {
    if (isAuthenticated) {
      void loadNotifications();
      connectNotificationSocket();
    }

    return () => disconnectNotificationSocket();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current
        && !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = session?.name || '회원';
  return (
    <div className = {styles.header}>
      <div className = {styles.contentBox}>
        <Logo size = "md" />
      </div>

      {isAuthenticated && (
        <div className = {styles.profileSection}>
          <div className = {styles.profileCard}>
            <div className = {styles.profileImageWrapper}>
              {session?.profileImageUrl ? (
                <img
                  src = {session.profileImageUrl}
                  alt = {`${displayName} 프로필`}
                  className = {styles.profileImage}
                />
              ) : (
                <div className = {styles.profileFallback}>
                  {displayName.slice(0, 1)}
                </div>
              )}
            </div>

            <strong className = {styles.profileName}>{displayName}</strong>

            <div className = {styles.profileBadges}>
              <span className = {styles.profileBadge}>
                {formatGender(session?.gender)}
              </span>
              <span className = {styles.profileBadge}>
                {formatAgeGroup(session?.ageGroup)}
              </span>
              <span className = {styles.profileBadge}>
                {session?.grade ? `${session.grade}급` : '급수 미설정'}
              </span>
            </div>
          </div>

          <div ref = {notificationRef} className = {styles.notificationWrapper}>
            <Button
              type = "button"
              variant = "ghost"
              size = "icon"
              aria-label = "알림 확인"
              aria-expanded = {notificationOpen}
              className = {styles.notificationButton}
              onClick = {() => setNotificationOpen(current => !current)}
            >
              <Bell className = {styles.notificationIcon} />
              {unreadCount > 0 && (
                <span className = {styles.notificationCount}>
                  {unreadCount}
                </span>
              )}
            </Button>

            {notificationOpen && (
              <div className = {styles.notificationPanel}>
                <div className = {styles.notificationHeader}>
                  <div>
                    <strong>알림</strong>
                    <span>읽지 않은 알림 {unreadCount}개</span>
                  </div>
                  <button
                    type = "button"
                    disabled = {unreadCount === 0}
                    onClick = {() => void markAllNotificationsAsRead()}
                  >
                    <CheckCheck />
                    전체 읽음
                  </button>
                </div>

                {recentNotifications.length > 0 ? (
                  <div className = {styles.notificationList}>
                    {recentNotifications.map(notification => (
                      <button
                        key = {notification.id}
                        type = "button"
                        className = {styles.notificationItem(notification.read)}
                        onClick = {() => openNotification(notification)}
                      >
                        <div className = {styles.notificationItemIcon}>
                          <Bell />
                        </div>
                        <div className = {styles.notificationItemContent}>
                          <div>
                            <strong>{notification.title}</strong>
                            {!notification.read && <span />}
                          </div>
                          <p>{notification.message}</p>
                          <time>{notification.createdAt}</time>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className = {styles.notificationEmpty}>
                    <div className = {styles.notificationEmptyIcon}>
                      <BellOff />
                    </div>
                    <strong>새로운 알림이 없습니다</strong>
                    <span>새 일정과 경기 알림이 여기에 표시됩니다.</span>
                  </div>
                )}

                <div className = {styles.notificationFooter}>
                  <Button
                    type = "button"
                    variant = "ghost"
                    onClick = {openAllNotifications}
                  >
                    전체 알림 보기
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <nav className = {styles.row}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link key = {item.path} to = {item.path} className = {styles.navLink(active)}
            >
              <Icon className = {styles.iconIcon} />
              <span className = {styles.labelText}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className = {styles.footerActions}>
        <Button variant = "ghost" className = {styles.fullWidthButton} onClick = {handleLogout}
        >
          <LogOut className = {styles.logOutIcon} />
          로그아웃
        </Button>
      </div>
    </div>
  );
}

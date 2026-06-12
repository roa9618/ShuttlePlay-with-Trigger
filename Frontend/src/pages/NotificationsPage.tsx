import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  Trophy,
  Users,
  Info,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  loadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  useNotifications,
  type AppNotification,
  type NotificationType,
} from '../utils/notificationStore';
import { styles } from './NotificationsPage.styles';

const notificationIcons: Record<NotificationType, typeof Bell> = {
  SCHEDULE: CalendarDays,
  MATCH: Trophy,
  GROUP: Users,
  SYSTEM: Info,
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const unreadCount = notifications.filter(notification => !notification.read).length;
  const visibleNotifications = showUnreadOnly
    ? notifications.filter(notification => !notification.read)
    : notifications;

  useEffect(() => {
    void loadNotifications();
  }, []);

  const openNotification = (notification: AppNotification) => {
    void markNotificationAsRead(notification.id);
    navigate(notification.targetPath);
  };

  return (
    <div className = {styles.page}>
      <div className = {styles.content}>
        <header className = {styles.header}>
          <div>
            <h1 className = {styles.title}>전체 알림</h1>
            <p className = {styles.subtitle}>
              일정, 경기, 모임과 관련된 중요한 소식을 확인하세요.
            </p>
          </div>

          <Button
            type = "button"
            variant = "outline"
            className = {styles.markAllButton}
            disabled = {unreadCount === 0}
            onClick = {() => void markAllNotificationsAsRead()}
          >
            <CheckCheck />
            전체 읽음 처리
          </Button>
        </header>

        <section className = {styles.card}>
          <div className = {styles.toolbar}>
            <div className = {styles.tabs}>
              <button
                type = "button"
                className = {styles.tab(!showUnreadOnly)}
                onClick = {() => setShowUnreadOnly(false)}
              >
                전체
                <span>{notifications.length}</span>
              </button>
              <button
                type = "button"
                className = {styles.tab(showUnreadOnly)}
                onClick = {() => setShowUnreadOnly(true)}
              >
                읽지 않음
                <span>{unreadCount}</span>
              </button>
            </div>

            <span className = {styles.summary}>
              읽지 않은 알림 {unreadCount}개
            </span>
          </div>

          {visibleNotifications.length > 0 ? (
            <div className = {styles.list}>
              {visibleNotifications.map(notification => {
                const Icon = notificationIcons[notification.type];

                return (
                  <button
                    key = {notification.id}
                    type = "button"
                    className = {styles.item(notification.read)}
                    onClick = {() => openNotification(notification)}
                  >
                    <div className = {styles.iconBox(notification.type)}>
                      <Icon />
                    </div>

                    <div className = {styles.itemContent}>
                      <div className = {styles.itemTitleRow}>
                        <strong>{notification.title}</strong>
                        {!notification.read && <span className = {styles.unreadDot} />}
                      </div>
                      <p>{notification.message}</p>
                      <span>{notification.createdAt}</span>
                    </div>

                    <ChevronRight className = {styles.chevron} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className = {styles.empty}>
              <div className = {styles.emptyIcon}>
                <CheckCheck />
              </div>
              <strong>모든 알림을 확인했습니다</strong>
              <span>새로운 알림이 도착하면 이곳에서 확인할 수 있습니다.</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

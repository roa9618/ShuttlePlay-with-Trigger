import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  Info,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import type { NotificationType } from '../utils/notificationApi';
import { markNotificationAsRead } from '../utils/notificationStore';
import {
  dismissNotificationToast,
  useNotificationToasts,
  type NotificationToast,
} from '../utils/notificationToastStore';
import { styles } from './NotificationToastStack.styles';

const AUTO_DISMISS_DELAY = 5000;

const notificationIcons: Record<NotificationType, typeof Bell> = {
  SCHEDULE: CalendarDays,
  MATCH: Trophy,
  GROUP: Users,
  SYSTEM: Info,
};

function NotificationToastItem({
  notification,
  onOpen,
}: {
  notification: NotificationToast;
  onOpen: (notification: NotificationToast) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(Date.now());
  const remainingRef = useRef(AUTO_DISMISS_DELAY);
  const Icon = notificationIcons[notification.type];

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(
      () => dismissNotificationToast(notification.toastId),
      remainingRef.current,
    );
  };

  useEffect(() => {
    remainingRef.current = AUTO_DISMISS_DELAY;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(
      () => dismissNotificationToast(notification.toastId),
      remainingRef.current,
    );
    return clearTimer;
  }, [notification.toastId]);

  const pauseTimer = () => {
    remainingRef.current = Math.max(
      0,
      remainingRef.current - (Date.now() - startedAtRef.current),
    );
    clearTimer();
  };

  const resumeTimer = () => {
    if (remainingRef.current > 0) {
      startTimer();
    } else {
      dismissNotificationToast(notification.toastId);
    }
  };

  return (
    <article
      className = {styles.toast}
      role = "button"
      tabIndex = {0}
      onClick = {() => onOpen(notification)}
      onKeyDown = {event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(notification);
        }
      }}
      onMouseEnter = {pauseTimer}
      onMouseLeave = {resumeTimer}
    >
      <div className = {styles.icon(notification.type)}>
        <Icon />
      </div>
      <div className = {styles.content}>
        <strong className = {styles.title}>{notification.title}</strong>
        <p className = {styles.message}>{notification.message}</p>
      </div>
      <button
        type = "button"
        className = {styles.closeButton}
        aria-label = "알림 닫기"
        onClick = {event => {
          event.stopPropagation();
          dismissNotificationToast(notification.toastId);
        }}
      >
        <X />
      </button>
    </article>
  );
}

export default function NotificationToastStack() {
  const navigate = useNavigate();
  const notifications = useNotificationToasts();

  const openNotification = (notification: NotificationToast) => {
    dismissNotificationToast(notification.toastId);
    void markNotificationAsRead(notification.id);
    navigate(notification.targetPath);
  };

  return (
    <aside className = {styles.stack} aria-live = "polite" aria-label = "새 알림">
      {notifications.map(notification => (
        <NotificationToastItem
          key = {notification.toastId}
          notification = {notification}
          onOpen = {openNotification}
        />
      ))}
    </aside>
  );
}

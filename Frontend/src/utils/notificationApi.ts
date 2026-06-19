import { apiClient } from './apiClient';
import { isGalleryPreviewMode, previewNow } from './galleryPreview';
import { encodePublicId } from './publicId';

export type NotificationType = 'SCHEDULE' | 'MATCH' | 'GROUP' | 'SYSTEM';

export type NotificationItemResponse = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  targetPath: string;
  read: boolean;
  createdAt: string;
};

export type NotificationListResponse = {
  items: NotificationItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  unreadCount: number;
};

export function getNotifications(page = 0, size = 100, unreadOnly = false) {
  if (isGalleryPreviewMode()) {
    const items = [
      { id: 1, type: 'SCHEDULE', title: '일정 참여자가 도착했어요', message: '홍길동님이 도착 완료 상태로 변경했습니다.', targetPath: `/groups/${encodePublicId(1)}/schedule`, read: false, createdAt: previewNow(0, 18, 55) },
      { id: 2, type: 'MATCH', title: '다음 경기가 배정됐어요', message: '2번 코트에서 곧 경기가 시작됩니다.', targetPath: '/sessions/demo/next-match', read: false, createdAt: previewNow(0, 19, 10) },
      { id: 3, type: 'GROUP', title: '새 가입 요청이 있어요', message: '최셔틀님이 모임 가입을 요청했습니다.', targetPath: `/groups/${encodePublicId(1)}/requests`, read: true, createdAt: previewNow(-1) },
    ] satisfies NotificationItemResponse[];
    const filteredItems = items.filter(item => !unreadOnly || !item.read);
    return Promise.resolve({ items: filteredItems, page, size, totalElements: filteredItems.length, totalPages: 1, unreadCount: items.filter(item => !item.read).length });
  }

  return apiClient.get<NotificationListResponse>(
    `/notifications?page=${page}&size=${size}&unreadOnly=${unreadOnly}`,
    { auth: true },
  );
}

export function readNotification(notificationId: number) {
  return apiClient.patch<NotificationItemResponse>(
    `/notifications/${notificationId}/read`,
    undefined,
    { auth: true },
  );
}

export function readAllNotifications() {
  return apiClient.patch<void>('/notifications/read-all', undefined, {
    auth: true,
  });
}

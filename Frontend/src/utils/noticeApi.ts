import { apiClient } from './apiClient';
import { isGalleryPreviewMode, previewNow } from './galleryPreview';

export type NoticeItem = {
  id: number;
  title: string;
  content?: string;
  authorName: string;
  pinned: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type NoticePage = {
  items: NoticeItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

const auth = { auth: true };
const previewNotices: NoticeItem[] = [
  { id: 1, title: '일정 입장 기능 안내', content: 'QR과 코드로 일정 입장 및 출석 체크를 사용할 수 있습니다.', authorName: '관리자', pinned: true, viewCount: 128, createdAt: previewNow(-2), updatedAt: previewNow(-2) },
  { id: 2, title: '모바일 화면 개선 안내', content: '현장 참가자가 더 쉽게 사용할 수 있도록 버튼과 안내 문구를 개선했습니다.', authorName: '관리자', pinned: false, viewCount: 86, createdAt: previewNow(-5), updatedAt: previewNow(-5) },
];

export const noticeApi = {
  list: (keyword: string, page: number, size = 10) => isGalleryPreviewMode() ? Promise.resolve({ items: previewNotices, page, size, totalElements: previewNotices.length, totalPages: 1 }) : apiClient.get<NoticePage>(`/notices?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, auth),
  detail: (id: number) => isGalleryPreviewMode() ? Promise.resolve(previewNotices.find(notice => notice.id === id) ?? previewNotices[0]) : apiClient.get<NoticeItem>(`/notices/${id}`, auth),
  create: (body: { title: string; content: string; pinned: boolean }) => apiClient.post<NoticeItem>('/notices', body, auth),
  update: (id: number, body: { title: string; content: string; pinned: boolean }) => apiClient.put<void>(`/notices/${id}`, body, auth),
  delete: (id: number) => apiClient.delete<void>(`/notices/${id}`, auth),
};

import { apiClient } from './apiClient';

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
export const noticeApi = {
  list: (keyword: string, page: number, size = 10) => apiClient.get<NoticePage>(`/notices?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, auth),
  detail: (id: number) => apiClient.get<NoticeItem>(`/notices/${id}`, auth),
  create: (body: { title: string; content: string; pinned: boolean }) => apiClient.post<NoticeItem>('/notices', body, auth),
  update: (id: number, body: { title: string; content: string; pinned: boolean }) => apiClient.put<void>(`/notices/${id}`, body, auth),
  delete: (id: number) => apiClient.delete<void>(`/notices/${id}`, auth),
};

import { apiClient } from './apiClient';

export type AdminSectionResponse = {
  section: string;
  stats?: Record<string, string | number | boolean>;
  items: Array<Record<string, unknown>>;
  secondaryItems?: Array<Record<string, unknown>>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AdminUserDetail = {
  id: number;
  이름: string;
  이메일: string;
  '가입 방식': string;
  권한: 'USER' | 'ADMIN';
  상태: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  급수: string | null;
  '복식 MMR': number;
  '혼복 MMR': number;
  가입일: string;
  성별: string | null;
  나이대: string | null;
  '프로필 완성': boolean;
  '프로필 이미지': string | null;
  '최근 수정일': string;
};

export type AdminFilters = {
  role?: 'USER' | 'ADMIN' | '';
  userStatus?: 'ACTIVE' | 'INACTIVE' | 'DELETED' | '';
  inquiryStatus?: 'RECEIVED' | 'IN_PROGRESS' | 'RESOLVED' | '';
  category?: string;
};

export const adminApi = {
  section: (section: string, keyword: string, page: number, filters: AdminFilters = {}, size = 12) => {
    const query = new URLSearchParams({ keyword, page: String(page), size: String(size) });
    Object.entries(filters).forEach(([key, value]) => { if (value) query.set(key, value); });
    return apiClient.get<AdminSectionResponse>(`/admin/${section}?${query}`, { auth: true });
  },
  userDetail: (userId: number) => apiClient.get<AdminUserDetail>(`/admin/users/${userId}`, { auth: true }),
  updateUserRole: (userId: number, role: 'USER' | 'ADMIN') => apiClient.patch<AdminUserDetail>(`/admin/users/${userId}/role`, { role }, { auth: true }),
  updateUserStatus: (userId: number, status: 'ACTIVE' | 'INACTIVE') => apiClient.patch<AdminUserDetail>(`/admin/users/${userId}/status`, { status }, { auth: true }),
  deleteUser: (userId: number) => apiClient.delete<void>(`/admin/users/${userId}`, { auth: true }),
  updateGroupStatus: (groupId: number, status: 'ACTIVE' | 'INACTIVE') => apiClient.patch<Record<string, unknown>>(`/admin/groups/${groupId}/status`, { status }, { auth: true }),
  cancelSession: (sessionId: number) => apiClient.patch<Record<string, unknown>>(`/admin/sessions/${sessionId}/cancel`, undefined, { auth: true }),
  invalidateMatch: (matchId: number, reason: string) => apiClient.patch<Record<string, unknown>>(`/admin/matches/${matchId}/invalidate`, { reason }, { auth: true }),
  updateInquiry: (inquiryId: number, status: 'RECEIVED' | 'IN_PROGRESS' | 'RESOLVED', memo: string) => apiClient.patch<Record<string, unknown>>(`/admin/inquiries/${inquiryId}`, { status, memo }, { auth: true }),
  sendTestNotification: () => apiClient.post<void>('/admin/notifications/test', undefined, { auth: true }),
};

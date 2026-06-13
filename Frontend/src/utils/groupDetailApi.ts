import { apiClient } from './apiClient';

export type GroupDetailRole = 'OWNER' | 'MANAGER' | 'MEMBER';
export type GroupPermissions = { schedule: boolean; notice: boolean; joinRequests: boolean; members: boolean; posts: boolean; operationLogs: boolean };
export type GroupDetailResponse = {
  id: number; name: string; profileImageUrl: string | null; activityRegion: string; description: string;
  createdAt: string; ownerName: string; memberCount: number; myMemberId: number; myRole: GroupDetailRole; permissions: GroupPermissions;
};
export type GroupSettingsResponse = GroupDetailResponse & {
  newJoinAllowed: boolean; approvalRequired: boolean; guestAllowed: boolean;
  sameDayVoteChangeAllowed: boolean; postDeadlineVoteChangeAllowed: boolean;
  memberPostAllowed: boolean; memberCommentAllowed: boolean; postAttachmentAllowed: boolean;
};
export type PageResponse<T> = { items: T[]; page: number; size: number; totalElements: number; totalPages: number };
export type GroupSessionResponse = { id: number; title: string; startsAt: string; endsAt: string | null; place: string | null; voteDeadline: string | null; attendanceCount: number; attending?: number; undecided?: number; absent?: number; guestCount?: number; myVoteStatus?: string | null; status: string };
export type GroupDashboardResponse = {
  upcomingSession: GroupSessionResponse | null;
  recentSessions: GroupSessionResponse[];
  recentFourWeekSessionCount: number;
  averageAttendance: number;
  peakActivityTime: string;
  myRecentParticipationCount: number;
  myMonthlyParticipationRate: number;
  averageMatchCount: number | null;
  averageDoublesMmr: number;
  averageMixedMmr: number;
  participationTrend: Array<{ week: number; attendance: number }>;
  gradeDistribution: Record<string, number>;
};
export type GroupJoinRequestResponse = { id: number; name: string; gender: string; ageGroup: string; grade: string; message: string; requestedAt: string };
export type GroupPostResponse = { id: number; type: string; title: string; content: string; pinned: boolean; viewCount: number; commentCount: number; authorId: number; authorName: string; attachmentNames: string | null; createdAt: string };
export type GroupMemberResponse = { id: number; name: string; profileImageUrl: string | null; gender: string; ageGroup: string; grade: string; role: GroupDetailRole; participationCount: number; monthlyParticipationRate: number; recentFourWeekParticipationCount: number; doublesMmr: number; mixedMmr: number; memo: string | null };
export type GroupParticipantResponse = { id: number; name: string; profileImageUrl: string | null; gender: string; ageGroup: string; grade: string; role: GroupDetailRole | 'GUEST'; voteStatus: string; guest?: boolean };
export type GroupCommentResponse = { id: number; parentId: number; authorId: number; authorName: string; content: string; createdAt: string };
export type GroupDeletionSummaryResponse = { upcomingCount: number; inProgressCount: number };

const auth = { auth: true };
const root = (groupId: number) => `/groups/${groupId}`;
const query = (params: Record<string, string | number | undefined>) => {
  const value = new URLSearchParams();
  Object.entries(params).forEach(([key, item]) => item !== undefined && value.set(key, String(item)));
  return value.toString();
};

export const groupDetailApi = {
  getGroup: (id: number) => apiClient.get<GroupDetailResponse>(root(id), auth),
  getDashboard: (id: number) => apiClient.get<GroupDashboardResponse>(`${root(id)}/dashboard`, auth),
  getOperationGuide: (id: number) => apiClient.get<{ content: string; updatedAt: string | null; authorName: string | null }>(`${root(id)}/operation-guide`, auth),
  saveOperationGuide: (id: number, content: string) => apiClient.put<void>(`${root(id)}/operation-guide`, { content }, auth),
  deleteOperationGuide: (id: number) => apiClient.delete<void>(`${root(id)}/operation-guide`, auth),
  leave: (id: number) => apiClient.post<void>(`${root(id)}/leave`, undefined, auth),
  getSessions: (id: number, year: number, month: number, day?: number) => apiClient.get<GroupSessionResponse[]>(`${root(id)}/sessions?${query({ year, month, day })}`, auth),
  getMonthlySummary: (id: number, year: number, month: number) => apiClient.get<Record<string, number>>(`${root(id)}/sessions/monthly-summary?${query({ year, month })}`, auth),
  getSession: (id: number, sessionId: number) => apiClient.get<GroupSessionResponse>(`${root(id)}/sessions/${sessionId}`, auth),
  updateSession: (id: number, sessionId: number, body: unknown) => apiClient.put<void>(`${root(id)}/sessions/${sessionId}`, body, auth),
  cancelSession: (id: number, sessionId: number) => apiClient.post<void>(`${root(id)}/sessions/${sessionId}/cancel`, undefined, auth),
  deleteSession: (id: number, sessionId: number) => apiClient.delete<void>(`${root(id)}/sessions/${sessionId}`, auth),
  vote: (id: number, sessionId: number, status: string) => apiClient.put<void>(`${root(id)}/sessions/${sessionId}/vote`, { status }, auth),
  getParticipants: (id: number, sessionId: number, status: string) => apiClient.get<GroupParticipantResponse[]>(`${root(id)}/sessions/${sessionId}/participants?status=${status}`, auth),
  addGuest: (id: number, sessionId: number, body: unknown) => apiClient.post<Record<string, unknown>>(`${root(id)}/sessions/${sessionId}/guests`, body, auth),
  updateGuest: (id: number, sessionId: number, guestId: number, body: unknown) => apiClient.put<void>(`${root(id)}/sessions/${sessionId}/guests/${guestId}`, body, auth),
  deleteGuest: (id: number, sessionId: number, guestId: number) => apiClient.delete<void>(`${root(id)}/sessions/${sessionId}/guests/${guestId}`, auth),
  getPosts: (id: number, params: Record<string, string | number | undefined>) => apiClient.get<PageResponse<GroupPostResponse>>(`${root(id)}/posts?${query(params)}`, auth),
  getPost: (id: number, postId: number) => apiClient.get<GroupPostResponse>(`${root(id)}/posts/${postId}`, auth),
  createPost: (id: number, body: unknown) => apiClient.post<GroupPostResponse>(`${root(id)}/posts`, body, auth),
  uploadPostAttachments: (id: number, files: File[]) => { const body = new FormData(); files.forEach(file => body.append('files', file)); return apiClient.post<Array<{ name: string; url: string }>>(`${root(id)}/posts/attachments`, body, auth); },
  updatePost: (id: number, postId: number, body: unknown) => apiClient.put<void>(`${root(id)}/posts/${postId}`, body, auth),
  deletePost: (id: number, postId: number) => apiClient.delete<void>(`${root(id)}/posts/${postId}`, auth),
  togglePin: (id: number, postId: number) => apiClient.put<void>(`${root(id)}/posts/${postId}/pin`, undefined, auth),
  getComments: (id: number, postId: number) => apiClient.get<GroupCommentResponse[]>(`${root(id)}/posts/${postId}/comments`, auth),
  createComment: (id: number, postId: number, content: string) => apiClient.post<GroupCommentResponse>(`${root(id)}/posts/${postId}/comments`, { content }, auth),
  createReply: (id: number, postId: number, commentId: number, content: string) => apiClient.post<GroupCommentResponse>(`${root(id)}/posts/${postId}/comments/${commentId}/replies`, { content }, auth),
  updateComment: (id: number, postId: number, commentId: number, content: string) => apiClient.put<void>(`${root(id)}/posts/${postId}/comments/${commentId}`, { content }, auth),
  deleteComment: (id: number, postId: number, commentId: number) => apiClient.delete<void>(`${root(id)}/posts/${postId}/comments/${commentId}`, auth),
  getMembers: (id: number, params: Record<string, string | number | undefined>) => apiClient.get<PageResponse<GroupMemberResponse>>(`${root(id)}/members?${query(params)}`, auth),
  getMember: (id: number, memberId: number) => apiClient.get<GroupMemberResponse>(`${root(id)}/members/${memberId}`, auth),
  saveMemo: (id: number, memberId: number, memo: string) => apiClient.put<void>(`${root(id)}/members/${memberId}/memo`, { memo }, auth),
  updateRole: (id: number, memberId: number, role: GroupDetailRole) => apiClient.put<void>(`${root(id)}/members/${memberId}/role`, { role }, auth),
  getPermissions: (id: number, memberId: number) => apiClient.get<GroupPermissions>(`${root(id)}/members/${memberId}/permissions`, auth),
  updatePermissions: (id: number, memberId: number, body: GroupPermissions) => apiClient.put<void>(`${root(id)}/members/${memberId}/permissions`, body, auth),
  transferOwner: (id: number, memberId: number) => apiClient.put<void>(`${root(id)}/owner`, { memberId }, auth),
  removeMember: (id: number, memberId: number) => apiClient.delete<void>(`${root(id)}/members/${memberId}`, auth),
  getJoinRequests: (id: number, page = 0, size = 6) => apiClient.get<PageResponse<GroupJoinRequestResponse>>(`${root(id)}/join-requests?${query({ page, size })}`, auth),
  approveRequest: (id: number, requestId: number) => apiClient.post<void>(`${root(id)}/join-requests/${requestId}/approve`, undefined, auth),
  rejectRequest: (id: number, requestId: number) => apiClient.post<void>(`${root(id)}/join-requests/${requestId}/reject`, undefined, auth),
  approveAllRequests: (id: number) => apiClient.post<void>(`${root(id)}/join-requests/approve-all`, undefined, auth),
  rejectAllRequests: (id: number) => apiClient.post<void>(`${root(id)}/join-requests/reject-all`, undefined, auth),
  getOperationLogs: (id: number, page = 0, size = 11) => apiClient.get<PageResponse<Record<string, unknown>>>(`${root(id)}/operation-logs?${query({ page, size })}`, auth),
  getSettings: (id: number) => apiClient.get<GroupSettingsResponse>(`${root(id)}/settings`, auth),
  getDeletionSummary: (id: number) => apiClient.get<GroupDeletionSummaryResponse>(`${root(id)}/deletion-summary`, auth),
  saveBasicSettings: (id: number, body: unknown) => apiClient.put<void>(`${root(id)}/settings/basic`, body, auth),
  saveJoinSettings: (id: number, body: unknown) => apiClient.put<void>(`${root(id)}/settings/join`, body, auth),
  saveScheduleSettings: (id: number, body: unknown) => apiClient.put<void>(`${root(id)}/settings/schedule`, body, auth),
  saveBoardSettings: (id: number, body: unknown) => apiClient.put<void>(`${root(id)}/settings/board`, body, auth),
  updateImage: (id: number, image: File) => { const body = new FormData(); body.append('image', image); return apiClient.put<{ imageUrl: string }>(`${root(id)}/image`, body, auth); },
  resetImage: (id: number) => apiClient.delete<void>(`${root(id)}/image`, auth),
  deleteGroup: (id: number) => apiClient.delete<void>(root(id), auth),
};

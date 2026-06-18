import { apiClient } from './apiClient';
import { isGalleryPreviewMode, previewNow } from './galleryPreview';

export type GroupDetailRole = 'OWNER' | 'MANAGER' | 'MEMBER';
export type GroupPermissions = { schedule: boolean; notice: boolean; joinRequests: boolean; members: boolean; posts: boolean; operationLogs: boolean; guests: boolean };
export type GroupDetailResponse = {
  id: number; name: string; profileImageUrl: string | null; activityRegion: string; description: string;
  createdAt: string; ownerName: string; memberCount: number; myMemberId: number | null; myRole: GroupDetailRole; permissions: GroupPermissions; guestAllowed: boolean; serviceAdmin?: boolean;
};
export type GroupSettingsResponse = GroupDetailResponse & {
  newJoinAllowed: boolean; approvalRequired: boolean; guestAllowed: boolean;
  sameDayVoteChangeAllowed: boolean; postDeadlineVoteChangeAllowed: boolean;
  memberPostAllowed: boolean; memberCommentAllowed: boolean; postAttachmentAllowed: boolean;
};
export type PageResponse<T> = { items: T[]; page: number; size: number; totalElements: number; totalPages: number };
export type GroupSessionResponse = { id: number; entryCode?: string; title: string; startsAt: string; endsAt: string | null; place: string | null; voteDeadline: string | null; sessionType?: string; courtCount?: number; votingAllowed?: boolean; guestLinkAllowed?: boolean; guestAllowed?: boolean; attendanceCount: number; attending?: number; undecided?: number; absent?: number; guestCount?: number; myVoteStatus?: string | null; status: string };
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
export type GroupJoinRequestResponse = { id: number; name: string; profileImageUrl: string | null; gender: string | null; ageGroup: string | null; grade: string | null; message: string; requestedAt: string };
export type GroupJoinLinkResponse = {
  groupId: number;
  groupName: string;
  profileImageUrl: string | null;
  approvalRequired: boolean;
  status: 'AVAILABLE' | 'JOINED' | 'REQUESTED' | 'ALREADY_MEMBER' | 'CLOSED' | 'PROFILE_REQUIRED';
};
export type GroupPostResponse = { id: number; type: string; title: string; content: string; pinned: boolean; viewCount: number; commentCount: number; authorId: number; authorName: string; attachmentNames: string | null; createdAt: string };
export type GroupMemberResponse = { id: number; name: string; profileImageUrl: string | null; gender: string; ageGroup: string; grade: string; role: GroupDetailRole; participationCount: number; monthlyParticipationRate: number; recentFourWeekParticipationCount: number; doublesMmr: number; mixedMmr: number; memo: string | null };
export type GroupGuestResponse = { id: number; name: string; profileImageUrl: string | null; gender: string; ageGroup: string; grade: string; registered: boolean; userId: number | null; participationCount: number; lastParticipationAt: string | null; doublesMmr: number | null; mixedMmr: number | null; winRate: number | null; averageMatchCount: number | null; memo: string | null };
export type GroupParticipantResponse = { id: number; name: string; profileImageUrl: string | null; gender: string; ageGroup: string; grade: string; role: GroupDetailRole | 'GUEST'; voteStatus: string; guest?: boolean };
export type GroupCommentResponse = { id: number; parentId: number; authorId: number; authorName: string; content: string; createdAt: string };
export type GroupDeletionSummaryResponse = { upcomingCount: number; inProgressCount: number };

const previewPermissions: GroupPermissions = {
  schedule: false,
  notice: false,
  joinRequests: false,
  members: false,
  posts: false,
  operationLogs: false,
  guests: false,
};

const previewGroup: GroupDetailResponse = {
  id: 1,
  name: '강남 배드민턴 클럽',
  profileImageUrl: null,
  activityRegion: '서울특별시 강남구',
  description: '매주 화·목 저녁에 함께 운동하는 생활체육 배드민턴 모임입니다.',
  createdAt: previewNow(-120),
  ownerName: '홍길동',
  memberCount: 28,
  myMemberId: 1,
  myRole: 'OWNER',
  permissions: previewPermissions,
  guestAllowed: true,
  serviceAdmin: false,
};

const previewSessions: GroupSessionResponse[] = [
  { id: 101, entryCode: 'A7K9P2QW', title: '6월 정기 운동', startsAt: previewNow(1), endsAt: previewNow(1, 22), place: '강남구민회관', voteDeadline: previewNow(1, 17), sessionType: 'REGULAR', courtCount: 2, votingAllowed: true, guestLinkAllowed: true, guestAllowed: true, attendanceCount: 18, attending: 18, undecided: 3, absent: 2, guestCount: 4, myVoteStatus: 'ATTENDING', status: 'CREATED' },
  { id: 102, entryCode: 'B8M4T6RU', title: '초급자 클리닉', startsAt: previewNow(3, 20), endsAt: previewNow(3, 22), place: '서초 실내체육관', voteDeadline: previewNow(3, 18), sessionType: 'TRAINING', courtCount: 1, votingAllowed: true, guestLinkAllowed: false, guestAllowed: true, attendanceCount: 12, attending: 12, undecided: 2, absent: 1, guestCount: 2, myVoteStatus: 'UNDECIDED', status: 'CREATED' },
];

const previewDashboard: GroupDashboardResponse = {
  upcomingSession: previewSessions[0],
  recentSessions: previewSessions,
  recentFourWeekSessionCount: 8,
  averageAttendance: 18,
  peakActivityTime: '평일 19:00',
  myRecentParticipationCount: 7,
  myMonthlyParticipationRate: 82,
  averageMatchCount: 4,
  averageDoublesMmr: 1240,
  averageMixedMmr: 1180,
  participationTrend: [{ week: 1, attendance: 14 }, { week: 2, attendance: 18 }, { week: 3, attendance: 20 }, { week: 4, attendance: 17 }],
  gradeDistribution: { A: 4, B: 12, C: 10, D: 2 },
};

const previewPosts: GroupPostResponse[] = [
  { id: 1, type: 'NOTICE', title: '6월 정기 운동 안내', content: '이번 주 정기 운동은 강남구민회관에서 진행합니다.', pinned: true, viewCount: 124, commentCount: 5, authorId: 1, authorName: '홍길동', attachmentNames: null, createdAt: previewNow(-2) },
  { id: 2, type: 'FREE', title: '운동 후 식사 참석 조사', content: '운동 후 가볍게 식사하실 분들은 댓글 남겨주세요.', pinned: false, viewCount: 58, commentCount: 12, authorId: 2, authorName: '김셔틀', attachmentNames: null, createdAt: previewNow(-1) },
];

const previewMembers: GroupMemberResponse[] = [
  { id: 1, name: '홍길동', profileImageUrl: null, gender: 'MALE', ageGroup: 'THIRTIES', grade: 'A', role: 'OWNER', participationCount: 42, monthlyParticipationRate: 86, recentFourWeekParticipationCount: 8, doublesMmr: 1320, mixedMmr: 1210, memo: null },
  { id: 2, name: '김셔틀', profileImageUrl: null, gender: 'FEMALE', ageGroup: 'THIRTIES', grade: 'B', role: 'MANAGER', participationCount: 31, monthlyParticipationRate: 76, recentFourWeekParticipationCount: 6, doublesMmr: 1210, mixedMmr: 1190, memo: null },
  { id: 3, name: '박트리거', profileImageUrl: null, gender: 'MALE', ageGroup: 'FORTIES', grade: 'B', role: 'MEMBER', participationCount: 18, monthlyParticipationRate: 64, recentFourWeekParticipationCount: 4, doublesMmr: 1180, mixedMmr: 1160, memo: null },
];

const previewGuests: GroupGuestResponse[] = [
  { id: 1, name: '이게스트', profileImageUrl: null, gender: 'MALE', ageGroup: 'TWENTIES', grade: 'C', registered: false, userId: null, participationCount: 2, lastParticipationAt: previewNow(-7), doublesMmr: null, mixedMmr: null, winRate: null, averageMatchCount: null, memo: null },
];

const previewJoinRequests: GroupJoinRequestResponse[] = [
  { id: 1, name: '최셔틀', profileImageUrl: null, gender: 'FEMALE', ageGroup: 'TWENTIES', grade: 'C', message: '', requestedAt: previewNow(-1) },
  { id: 2, name: '한스매시', profileImageUrl: null, gender: 'MALE', ageGroup: 'THIRTIES', grade: 'B', message: '', requestedAt: previewNow(-2) },
];

const previewParticipants: GroupParticipantResponse[] = [
  { id: 1, name: '홍길동', profileImageUrl: null, gender: 'MALE', ageGroup: 'THIRTIES', grade: 'A', role: 'OWNER', voteStatus: 'ATTENDING' },
  { id: 2, name: '이게스트', profileImageUrl: null, gender: 'MALE', ageGroup: 'TWENTIES', grade: 'C', role: 'GUEST', voteStatus: 'ATTENDING', guest: true },
];

const page = <T>(items: T[], pageNumber = 0, size = 10): PageResponse<T> => ({
  items,
  page: pageNumber,
  size,
  totalElements: items.length,
  totalPages: 1,
});

const auth = { auth: true };
const root = (groupId: number) => `/groups/${groupId}`;
const query = (params: Record<string, string | number | undefined>) => {
  const value = new URLSearchParams();
  Object.entries(params).forEach(([key, item]) => item !== undefined && value.set(key, String(item)));
  return value.toString();
};

export const groupDetailApi = {
  getGroup: (id: number) => isGalleryPreviewMode() ? Promise.resolve({ ...previewGroup, id }) : apiClient.get<GroupDetailResponse>(root(id), auth),
  getDashboard: (_id: number) => isGalleryPreviewMode() ? Promise.resolve(previewDashboard) : apiClient.get<GroupDashboardResponse>(`${root(_id)}/dashboard`, auth),
  getOperationGuide: (id: number) => isGalleryPreviewMode() ? Promise.resolve({ content: '', updatedAt: null, authorName: null }) : apiClient.get<{ content: string; updatedAt: string | null; authorName: string | null }>(`${root(id)}/operation-guide`, auth),
  saveOperationGuide: (id: number, content: string) => apiClient.put<void>(`${root(id)}/operation-guide`, { content }, auth),
  deleteOperationGuide: (id: number) => apiClient.delete<void>(`${root(id)}/operation-guide`, auth),
  leave: (id: number) => apiClient.post<void>(`${root(id)}/leave`, undefined, auth),
  getJoinPreview: (id: number) => apiClient.get<GroupJoinLinkResponse>(`${root(id)}/join`, auth),
  joinBySharedLink: (id: number) => apiClient.post<GroupJoinLinkResponse>(`${root(id)}/join`, undefined, auth),
  getSessions: (id: number, year: number, month: number, day?: number) => isGalleryPreviewMode() ? Promise.resolve(previewSessions) : apiClient.get<GroupSessionResponse[]>(`${root(id)}/sessions?${query({ year, month, day })}`, auth),
  getMonthlySummary: (id: number, year: number, month: number) => isGalleryPreviewMode() ? Promise.resolve({ [new Date(previewSessions[0].startsAt).toISOString().slice(0, 10)]: 1 }) : apiClient.get<Record<string, number>>(`${root(id)}/sessions/monthly-summary?${query({ year, month })}`, auth),
  createSession: (id: number, body: unknown) => apiClient.post<GroupSessionResponse>(`${root(id)}/sessions`, body, auth),
  getSession: (id: number, sessionId: number) => isGalleryPreviewMode() ? Promise.resolve(previewSessions.find(session => session.id === sessionId) ?? previewSessions[0]) : apiClient.get<GroupSessionResponse>(`${root(id)}/sessions/${sessionId}`, auth),
  updateSession: (id: number, sessionId: number, body: unknown) => apiClient.put<void>(`${root(id)}/sessions/${sessionId}`, body, auth),
  cancelSession: (id: number, sessionId: number) => apiClient.post<void>(`${root(id)}/sessions/${sessionId}/cancel`, undefined, auth),
  deleteSession: (id: number, sessionId: number) => apiClient.delete<void>(`${root(id)}/sessions/${sessionId}`, auth),
  vote: (id: number, sessionId: number, status: string) => apiClient.put<void>(`${root(id)}/sessions/${sessionId}/vote`, { status }, auth),
  getParticipants: (id: number, sessionId: number, status: string) => isGalleryPreviewMode() ? Promise.resolve(previewParticipants) : apiClient.get<GroupParticipantResponse[]>(`${root(id)}/sessions/${sessionId}/participants?status=${status}`, auth),
  addGuest: (id: number, sessionId: number, body: unknown) => apiClient.post<Record<string, unknown>>(`${root(id)}/sessions/${sessionId}/guests`, body, auth),
  updateGuest: (id: number, sessionId: number, guestId: number, body: unknown) => apiClient.put<void>(`${root(id)}/sessions/${sessionId}/guests/${guestId}`, body, auth),
  deleteGuest: (id: number, sessionId: number, guestId: number) => apiClient.delete<void>(`${root(id)}/sessions/${sessionId}/guests/${guestId}`, auth),
  getPosts: (id: number, params: Record<string, string | number | undefined>) => isGalleryPreviewMode() ? Promise.resolve(page(previewPosts, Number(params.page ?? 0), Number(params.size ?? 10))) : apiClient.get<PageResponse<GroupPostResponse>>(`${root(id)}/posts?${query(params)}`, auth),
  getPost: (id: number, postId: number) => isGalleryPreviewMode() ? Promise.resolve(previewPosts.find(post => post.id === postId) ?? previewPosts[0]) : apiClient.get<GroupPostResponse>(`${root(id)}/posts/${postId}`, auth),
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
  getMembers: (id: number, params: Record<string, string | number | undefined>) => isGalleryPreviewMode() ? Promise.resolve(page(previewMembers, Number(params.page ?? 0), Number(params.size ?? 10))) : apiClient.get<PageResponse<GroupMemberResponse>>(`${root(id)}/members?${query(params)}`, auth),
  getMember: (id: number, memberId: number) => isGalleryPreviewMode() ? Promise.resolve(previewMembers.find(member => member.id === memberId) ?? previewMembers[0]) : apiClient.get<GroupMemberResponse>(`${root(id)}/members/${memberId}`, auth),
  saveMemo: (id: number, memberId: number, memo: string) => apiClient.put<void>(`${root(id)}/members/${memberId}/memo`, { memo }, auth),
  updateRole: (id: number, memberId: number, role: GroupDetailRole) => apiClient.put<void>(`${root(id)}/members/${memberId}/role`, { role }, auth),
  getPermissions: (id: number, memberId: number) => isGalleryPreviewMode() ? Promise.resolve(previewPermissions) : apiClient.get<GroupPermissions>(`${root(id)}/members/${memberId}/permissions`, auth),
  updatePermissions: (id: number, memberId: number, body: GroupPermissions) => apiClient.put<void>(`${root(id)}/members/${memberId}/permissions`, body, auth),
  transferOwner: (id: number, memberId: number) => apiClient.put<void>(`${root(id)}/owner`, { memberId }, auth),
  removeMember: (id: number, memberId: number) => apiClient.delete<void>(`${root(id)}/members/${memberId}`, auth),
  getGuests: (id: number, params: Record<string, string | number | undefined>) => isGalleryPreviewMode() ? Promise.resolve(page(previewGuests, Number(params.page ?? 0), Number(params.size ?? 10))) : apiClient.get<PageResponse<GroupGuestResponse>>(`${root(id)}/guests?${query(params)}`, auth),
  getGuest: (id: number, guestId: number) => isGalleryPreviewMode() ? Promise.resolve(previewGuests.find(guest => guest.id === guestId) ?? previewGuests[0]) : apiClient.get<GroupGuestResponse>(`${root(id)}/guests/${guestId}`, auth),
  saveGuestMemo: (id: number, guestId: number, memo: string) => apiClient.put<void>(`${root(id)}/guests/${guestId}/memo`, { memo }, auth),
  getJoinRequests: (id: number, pageNumber = 0, size = 6) => isGalleryPreviewMode() ? Promise.resolve(page(previewJoinRequests, pageNumber, size)) : apiClient.get<PageResponse<GroupJoinRequestResponse>>(`${root(id)}/join-requests?${query({ page: pageNumber, size })}`, auth),
  approveRequest: (id: number, requestId: number) => apiClient.post<void>(`${root(id)}/join-requests/${requestId}/approve`, undefined, auth),
  rejectRequest: (id: number, requestId: number) => apiClient.post<void>(`${root(id)}/join-requests/${requestId}/reject`, undefined, auth),
  approveAllRequests: (id: number) => apiClient.post<void>(`${root(id)}/join-requests/approve-all`, undefined, auth),
  rejectAllRequests: (id: number) => apiClient.post<void>(`${root(id)}/join-requests/reject-all`, undefined, auth),
  getOperationLogs: (id: number, pageNumber = 0, size = 11) => isGalleryPreviewMode() ? Promise.resolve(page([{ id: 1, actorName: '홍길동', action: '일정 생성', detail: '6월 정기 운동', createdAt: previewNow(-1) }, { id: 2, actorName: '김셔틀', action: '멤버 권한 변경', detail: '일정 권한 변경', createdAt: previewNow(-2) }], pageNumber, size)) : apiClient.get<PageResponse<Record<string, unknown>>>(`${root(id)}/operation-logs?${query({ page: pageNumber, size })}`, auth),
  getSettings: (id: number) => isGalleryPreviewMode() ? Promise.resolve({ ...previewGroup, newJoinAllowed: true, approvalRequired: true, guestAllowed: true, sameDayVoteChangeAllowed: true, postDeadlineVoteChangeAllowed: false, memberPostAllowed: true, memberCommentAllowed: true, postAttachmentAllowed: true }) : apiClient.get<GroupSettingsResponse>(`${root(id)}/settings`, auth),
  getDeletionSummary: (id: number) => isGalleryPreviewMode() ? Promise.resolve({ upcomingCount: 2, inProgressCount: 0 }) : apiClient.get<GroupDeletionSummaryResponse>(`${root(id)}/deletion-summary`, auth),
  saveBasicSettings: (id: number, body: unknown) => apiClient.put<void>(`${root(id)}/settings/basic`, body, auth),
  saveJoinSettings: (id: number, body: unknown) => apiClient.put<void>(`${root(id)}/settings/join`, body, auth),
  saveScheduleSettings: (id: number, body: unknown) => apiClient.put<void>(`${root(id)}/settings/schedule`, body, auth),
  saveBoardSettings: (id: number, body: unknown) => apiClient.put<void>(`${root(id)}/settings/board`, body, auth),
  updateImage: (id: number, image: File) => { const body = new FormData(); body.append('image', image); return apiClient.put<{ imageUrl: string }>(`${root(id)}/image`, body, auth); },
  resetImage: (id: number) => apiClient.delete<void>(`${root(id)}/image`, auth),
  deleteGroup: (id: number) => apiClient.delete<void>(root(id), auth),
};

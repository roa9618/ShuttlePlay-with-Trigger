import { apiClient } from './apiClient';
import { isGalleryPreviewMode, previewNow } from './galleryPreview';

export type GroupRole = 'OWNER' | 'MANAGER' | 'MEMBER';

export type GroupHighlightResponse = {
  groupId: number;
  groupName: string;
  scheduleAt: string | null;
  participationCount: number | null;
  accessedAt: string | null;
};

export type GroupOverviewResponse = {
  nearestSchedule: GroupHighlightResponse | null;
  frequentGroup: GroupHighlightResponse | null;
  recentAccessGroup: GroupHighlightResponse | null;
  totalGroupCount: number;
  ownerGroupCount: number;
  memberGroupCount: number;
  totalActiveMemberCount: number;
  weeklyScheduleCount: number;
};

export type GroupListItemResponse = {
  id: number;
  name: string;
  profileImageUrl: string | null;
  role: GroupRole;
  activeMembers: number;
  lastParticipationAt: string | null;
  nextScheduleAt: string | null;
  activityRegion: string;
  description: string;
};

export type GroupListResponse = {
  items: GroupListItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type GroupActivitySummaryResponse = {
  groupId: number;
  name: string;
  profileImageUrl: string | null;
  role: GroupRole;
  activityRegion: string;
  organizerName: string;
  createdAt: string;
  operationNotice: string | null;
  monthlyParticipationRate: number;
  recentFourWeekParticipationCount: number;
  averageParticipationIntervalDays: number;
  recentFourWeekScheduleCount: number;
  averageAttendance: number;
  peakActivityTime: string;
};

export type CreateGroupRequest = {
  name: string;
  profileImageUrl: string | null;
  activityRegion: string;
  description: string;
  operationNotice: string | null;
};

export type CreateGroupResponse = {
  id: number;
  name: string;
};

export type GroupImageUploadResponse = {
  imageUrl: string;
};

type GetMyGroupsParams = {
  keyword: string;
  role: GroupRole | null;
  page: number;
  size: number;
};

const previewGroups: GroupListItemResponse[] = [
  { id: 1, name: '강남 배드민턴 클럽', profileImageUrl: null, role: 'OWNER', activeMembers: 28, lastParticipationAt: previewNow(-2), nextScheduleAt: previewNow(1), activityRegion: '서울특별시 강남구', description: '매주 화·목 저녁에 함께 운동하는 생활체육 모임입니다.' },
  { id: 2, name: '서초 아침 운동', profileImageUrl: null, role: 'MANAGER', activeMembers: 16, lastParticipationAt: previewNow(-5), nextScheduleAt: previewNow(3, 7, 30), activityRegion: '서울특별시 서초구', description: '출근 전 가볍게 몸을 푸는 초중급 모임입니다.' },
  { id: 3, name: '주말 복식 모임', profileImageUrl: null, role: 'MEMBER', activeMembers: 34, lastParticipationAt: previewNow(-7), nextScheduleAt: previewNow(5, 15, 0), activityRegion: '서울특별시 송파구', description: '복식 경기 위주로 즐겁게 운영하는 주말 모임입니다.' },
];

const previewOverview: GroupOverviewResponse = {
  nearestSchedule: { groupId: 1, groupName: '강남 배드민턴 클럽', scheduleAt: previewNow(1), participationCount: null, accessedAt: null },
  frequentGroup: { groupId: 1, groupName: '강남 배드민턴 클럽', scheduleAt: null, participationCount: 24, accessedAt: null },
  recentAccessGroup: { groupId: 2, groupName: '서초 아침 운동', scheduleAt: null, participationCount: null, accessedAt: previewNow(-1) },
  totalGroupCount: 3,
  ownerGroupCount: 1,
  memberGroupCount: 2,
  totalActiveMemberCount: 78,
  weeklyScheduleCount: 4,
};

const previewSummary: GroupActivitySummaryResponse = {
  groupId: 1,
  name: '강남 배드민턴 클럽',
  profileImageUrl: null,
  role: 'OWNER',
  activityRegion: '서울특별시 강남구',
  organizerName: '홍길동',
  createdAt: previewNow(-120),
  operationNotice: null,
  monthlyParticipationRate: 82,
  recentFourWeekParticipationCount: 7,
  averageParticipationIntervalDays: 4,
  recentFourWeekScheduleCount: 8,
  averageAttendance: 18,
  peakActivityTime: '평일 19:00',
};

export function getGroupOverview() {
  if (isGalleryPreviewMode()) {
    return Promise.resolve(previewOverview);
  }

  return apiClient.get<GroupOverviewResponse>('/groups/me/overview', {
    auth: true,
  });
}

export function getMyGroups({
  keyword,
  role,
  page,
  size,
}: GetMyGroupsParams) {
  if (isGalleryPreviewMode()) {
    const filtered = role ? previewGroups.filter(group => group.role === role) : previewGroups;
    return Promise.resolve({
      items: filtered,
      page,
      size,
      totalElements: filtered.length,
      totalPages: 1,
    });
  }

  const searchParams = new URLSearchParams({
    keyword,
    page: page.toString(),
    size: size.toString(),
  });

  if (role) {
    searchParams.set('role', role);
  }

  return apiClient.get<GroupListResponse>(`/groups?${searchParams.toString()}`, {
    auth: true,
  });
}

export function getManageableGroups({
  scheduleOnly,
  page,
  size,
}: {
  scheduleOnly: boolean;
  page: number;
  size: number;
}) {
  if (isGalleryPreviewMode()) {
    const filtered = previewGroups.filter(group => group.role !== 'MEMBER');
    return Promise.resolve({
      items: filtered,
      page,
      size,
      totalElements: filtered.length,
      totalPages: 1,
    });
  }

  const searchParams = new URLSearchParams({
    scheduleOnly: String(scheduleOnly),
    page: String(page),
    size: String(size),
  });

  return apiClient.get<GroupListResponse>(`/groups/manageable?${searchParams.toString()}`, {
    auth: true,
  });
}

export function getGroupActivitySummary(groupId: number) {
  if (isGalleryPreviewMode()) {
    return Promise.resolve({ ...previewSummary, groupId });
  }

  return apiClient.get<GroupActivitySummaryResponse>(
    `/groups/${groupId}/activity-summary`,
    {
      auth: true,
    },
  );
}

export function createGroup(request: CreateGroupRequest) {
  return apiClient.post<CreateGroupResponse>('/groups', request, {
    auth: true,
  });
}

export function uploadGroupImage(image: File) {
  const formData = new FormData();
  formData.append('image', image);

  return apiClient.post<GroupImageUploadResponse>('/groups/images', formData, {
    auth: true,
  });
}

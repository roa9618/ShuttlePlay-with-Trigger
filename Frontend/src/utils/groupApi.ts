import { apiClient } from './apiClient';

export type GroupRole = 'OWNER' | 'MEMBER';

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

type GetMyGroupsParams = {
  keyword: string;
  role: GroupRole | null;
  page: number;
  size: number;
};

export function getGroupOverview() {
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

export function getGroupActivitySummary(groupId: number) {
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

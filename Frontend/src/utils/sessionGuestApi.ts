import { apiClient } from './apiClient';

export type GuestJoinParticipantType = 'MEMBER' | 'USER_GUEST' | 'GUEST';
export type GuestJoinVoteStatus = 'ATTENDING' | 'UNDECIDED' | 'ABSENT';

export type GuestJoinPreviewResponse = {
  groupId: number;
  groupName: string;
  sessionId: number;
  title: string;
  startsAt: string;
  endsAt: string | null;
  place: string | null;
  voteDeadline: string | null;
  sessionType: string;
  status: string;
  votingAllowed: boolean;
  guestAllowed: boolean;
  guestLinkAllowed: boolean;
  attending: number;
  undecided: number;
  absent: number;
  participantType: GuestJoinParticipantType;
  profileCompleted: boolean;
  name?: string | null;
  gender?: string | null;
  ageGroup?: string | null;
  grade?: string | null;
  profileImageUrl?: string | null;
  currentVoteStatus?: GuestJoinVoteStatus | null;
};

export type GuestJoinRequest = {
  status: GuestJoinVoteStatus;
  name?: string;
  gender?: string;
  ageGroup?: string;
  grade?: string;
};

const options = { auth: true };

export const sessionGuestApi = {
  getPreview: (sessionId: number) =>
    apiClient.get<GuestJoinPreviewResponse>(`/sessions/${sessionId}/guest-join`, options),
  submit: (sessionId: number, body: GuestJoinRequest) =>
    apiClient.post<GuestJoinPreviewResponse>(`/sessions/${sessionId}/guest-join`, body, options),
};

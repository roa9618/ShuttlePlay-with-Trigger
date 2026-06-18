import { apiClient } from './apiClient';

export type SessionEntryStatus = 'REGISTERED' | 'ARRIVED' | 'LATE' | 'ABSENT';
export type SessionEntryPreview = {
  sessionId: number; entryCode: string; groupId: number; groupName: string; title: string;
  startsAt: string; endsAt: string | null; place: string | null; status: string;
  entryOpen: boolean; entryOpensAt: string; loggedIn: boolean; profileCompleted: boolean;
  operator: boolean;
  registered: boolean; participantType: 'MEMBER' | 'GUEST' | 'UNKNOWN'; name?: string;
  voteStatus?: string | null; attendanceStatus?: SessionEntryStatus;
  canRegister: boolean; restrictionReason?: string | null;
  guestAllowed: boolean; guestLinkAllowed: boolean; groupGuestAllowed: boolean;
};

export type SessionEntryParticipantStatus = SessionEntryPreview & {
  expectedArrivalAt?: string | null;
  lateReason?: string | null;
  arrivedAt?: string | null;
  gameStatus: 'WAITING' | 'PLAYING' | 'NEXT' | 'RESTING';
  nextMatch?: {
    court: number;
    partner?: string | null;
    opponents?: string[];
  } | null;
  todayStats: {
    games: number;
    wins: number;
    losses: number;
  };
};

const options = { auth: true, credentials: 'include' as RequestCredentials };
const withCode = (path: string, code?: string | null) => code ? `${path}?code=${encodeURIComponent(code)}` : path;
export const sessionEntryApi = {
  byCode: (code: string) => apiClient.get<SessionEntryPreview>(`/session-entry/code/${encodeURIComponent(code)}`, options),
  bySession: (sessionId: number, code?: string | null) => apiClient.get<SessionEntryPreview>(withCode(`/session-entry/sessions/${sessionId}`, code), options),
  decide: (sessionId: number, body: Record<string, unknown>, code?: string | null) => apiClient.post<SessionEntryPreview>(withCode(`/session-entry/sessions/${sessionId}/decision`, code), body, options),
  attendance: (sessionId: number, body: Record<string, unknown>) => apiClient.post<SessionEntryPreview>(`/session-entry/sessions/${sessionId}/attendance`, body, options),
  status: (sessionId: number) => apiClient.get<SessionEntryParticipantStatus>(`/session-entry/sessions/${sessionId}/status`, options),
};

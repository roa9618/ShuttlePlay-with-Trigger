import { apiClient } from './apiClient';

export type SessionEntryStatus = 'REGISTERED' | 'ARRIVED' | 'LATE' | 'ABSENT';
export type PublicSessionId = number | string;

export type SessionEntryPreview = {
  sessionId: number; entryCode: string; groupId: number; groupName: string; title: string;
  startsAt: string; endsAt: string | null; place: string | null; status: string;
  entryOpen: boolean; entryOpensAt: string; loggedIn: boolean; profileCompleted: boolean;
  operator: boolean;
  registered: boolean; participantType: 'MEMBER' | 'GUEST' | 'UNKNOWN'; name?: string;
  grade?: string | null; gender?: string | null; ageGroup?: string | null;
  voteStatus?: string | null; attendanceStatus?: SessionEntryStatus;
  canRegister: boolean; restrictionReason?: string | null;
  guestAllowed: boolean; guestLinkAllowed: boolean; groupGuestAllowed: boolean;
};

export type ParticipantPlayStatus = 'WAITING' | 'AVAILABLE' | 'NEXT_UP' | 'CALLING' | 'PLAYING' | 'RESTING' | 'LEFT' | 'ABSENT';

export type SessionParticipantMatchSummary = {
  matchQueueId?: number | null;
  matchId?: number | null;
  court: number | null;
  partner?: string | null;
  opponents?: string[];
  matchType?: string | null;
  assignedAt?: string | null;
};

export type SessionParticipantPrompt = {
  type: 'NEXT_UP' | 'CALLING';
  matchQueueId?: number | null;
  matchId?: number | null;
};

export type SessionEntryParticipantStatus = SessionEntryPreview & {
  expectedArrivalAt?: string | null;
  lateReason?: string | null;
  arrivedAt?: string | null;
  playStatus: ParticipantPlayStatus;
  gameStatus: ParticipantPlayStatus;
  nextMatch?: SessionParticipantMatchSummary | null;
  currentMatch?: SessionParticipantMatchSummary | null;
  nextPrompt?: SessionParticipantPrompt | null;
  todayStats: {
    games: number;
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number;
    doublesMmrDelta?: number | null;
    mixedMmrDelta?: number | null;
  };
  lastUpdatedAt?: string;
  realtimeConnected?: boolean;
  guestRecordLimited?: boolean;
};

export type SessionParticipantAlert = SessionEntryParticipantStatus & {
  alertType: 'NEXT_UP' | 'CALLING';
  alertPriority: 'NORMAL' | 'HIGH';
  message: string;
  subMessage: string;
};

export type SessionParticipantCurrentMatch = SessionEntryParticipantStatus & {
  message: string;
  subMessage: string;
  submitted?: boolean;
  resultAlreadySubmitted?: boolean;
  submittedMatchId?: number;
  submittedResult?: 'WIN' | 'LOSS';
  submittedScore?: {
    myScore: number;
    opponentScore: number;
  };
};

export type SessionParticipantReportMatch = {
  matchId: number;
  court: number | null;
  matchType: string;
  partner: string | null;
  opponents: string[];
  myScore: number | null;
  opponentScore: number | null;
  result: 'WIN' | 'LOSS' | 'DRAW' | 'UNKNOWN';
  status: 'RESULT_PENDING' | 'RESULT_ENTERED' | 'RESULT_UPDATED' | 'MMR_PENDING';
  mmrType: 'DOUBLES' | 'MIXED' | null;
  mmrBefore: number | null;
  mmrAfter: number | null;
  mmrDelta: number | null;
  completedAt: string | null;
  resultUpdated: boolean;
};

export type SessionParticipantReport = SessionEntryPreview & {
  guestRecordLimited: boolean;
  canOpenFullRecord: boolean;
  summary: {
    games: number;
    wins: number;
    losses: number;
    winRate: number | null;
    pointsFor: number;
    pointsAgainst: number;
    doublesMmrDelta: number | null;
    mixedMmrDelta: number | null;
  };
  matches: SessionParticipantReportMatch[];
};

const options = { auth: true, credentials: 'include' as RequestCredentials };
const withCode = (path: string, code?: string | null) => code ? `${path}?code=${encodeURIComponent(code)}` : path;
export const sessionEntryApi = {
  byCode: (code: string) => apiClient.get<SessionEntryPreview>(`/session-entry/code/${encodeURIComponent(code)}`, options),
  bySession: (sessionId: PublicSessionId, code?: string | null) => apiClient.get<SessionEntryPreview>(withCode(`/session-entry/sessions/${sessionId}`, code), options),
  decide: (sessionId: PublicSessionId, body: Record<string, unknown>, code?: string | null) => apiClient.post<SessionEntryPreview>(withCode(`/session-entry/sessions/${sessionId}/decision`, code), body, options),
  attendance: (sessionId: PublicSessionId, body: Record<string, unknown>) => apiClient.post<SessionEntryPreview>(`/session-entry/sessions/${sessionId}/attendance`, body, options),
  status: (sessionId: PublicSessionId) => apiClient.get<SessionEntryParticipantStatus>(`/session-entry/sessions/${sessionId}/status`, options),
  toggleRest: (sessionId: PublicSessionId) => apiClient.post<SessionEntryParticipantStatus>(`/session-entry/sessions/${sessionId}/rest`, {}, options),
  leaveEarly: (sessionId: PublicSessionId) => apiClient.post<SessionEntryParticipantStatus>(`/session-entry/sessions/${sessionId}/leave`, {}, options),
  nextMatch: (sessionId: PublicSessionId) => apiClient.get<SessionParticipantAlert>(`/session-entry/sessions/${sessionId}/next-match`, options),
  matchCall: (sessionId: PublicSessionId) => apiClient.get<SessionParticipantAlert>(`/session-entry/sessions/${sessionId}/match-call`, options),
  currentMatch: (sessionId: PublicSessionId) => apiClient.get<SessionParticipantCurrentMatch>(`/session-entry/sessions/${sessionId}/current-match`, options),
  startCurrentMatch: (sessionId: PublicSessionId, matchId?: number | null) => apiClient.post<SessionParticipantCurrentMatch>(`/session-entry/sessions/${sessionId}/current-match/start`, matchId ? { matchId } : {}, options),
  submitMatchResult: (sessionId: PublicSessionId, body: { matchId: number; result: 'WIN' | 'LOSS'; myScore?: number | null; opponentScore?: number | null }) =>
    apiClient.post<SessionParticipantCurrentMatch>(`/session-entry/sessions/${sessionId}/match-result`, body, options),
  myReport: (sessionId: PublicSessionId) => apiClient.get<SessionParticipantReport>(`/session-entry/sessions/${sessionId}/my-report`, options),
};

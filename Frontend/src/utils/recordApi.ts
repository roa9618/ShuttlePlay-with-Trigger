import { apiClient } from './apiClient';

export type RecordMatchType = 'MENS_DOUBLES' | 'WOMENS_DOUBLES' | 'MIXED_DOUBLES' | 'ANY';
export type MmrType = 'DOUBLES' | 'MIXED';

export type MatchRecordItem = {
  id: number;
  matchType: RecordMatchType;
  playedAt: string;
  win: boolean;
  myScore: number;
  opponentScore: number;
  partner: string;
  opponents: string[];
  groupId: number;
  groupName: string;
  sessionId: number;
  sessionTitle: string;
};

export type PeriodRecordStats = {
  hasRecord: boolean;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  pointsFor: number;
  pointsAgainst: number;
  exerciseMinutes: number;
  attendance: number;
  doublesMmrChange: number;
  mixedMmrChange: number;
};

export type MyRecordSummary = {
  profile: { name: string; profileImageUrl: string | null; gender: string | null; ageGroup: string | null; grade: string | null };
  mmr: { doubles: number; mixed: number; doublesMonthlyChange: number; mixedMonthlyChange: number };
  today: PeriodRecordStats;
  month: PeriodRecordStats;
  activity: Array<{
    date: string;
    count: number;
    exerciseMinutes: number;
    schedules: Array<{ groupName: string; sessionTitle: string; startsAt: string; endsAt: string | null }>;
  }>;
  recentMatches: MatchRecordItem[];
  people: {
    partners: Array<{ userId: number; name: string; profileImageUrl: string | null; matches: number }>;
    opponents: Array<{ userId: number; name: string; profileImageUrl: string | null; matches: number }>;
  };
  habit: { averageWeeklySessions: number; consecutiveWeeks: number; favoriteDay: string; favoriteTimeRange: string };
  playStyle: { averageRestMinutes: number; consecutiveMatchRate: number; closeMatchRate: number; blowoutWinRate: number; blowoutLossRate: number; funRate: number; competitiveRate: number; enoughData: boolean };
  groups: Array<{ groupId: number; groupName: string; attendance: number; matches: number; wins: number; losses: number; winRate: number; lastParticipationAt: string | null }>;
  highlights: {
    closestMatch: { match: MatchRecordItem; count: number } | null;
    longestWinStreak: { match: MatchRecordItem; count: number } | null;
    longestLossStreak: { match: MatchRecordItem; count: number } | null;
  };
};

export type MmrHistoryResponse = {
  type: MmrType;
  currentMmr: number;
  totalChange: number;
  points: Array<{ id: number; changedAt: string; beforeMmr: number; afterMmr: number; change: number }>;
};

export type MatchRecordPageResponse = {
  items: MatchRecordItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

const query = (params: Record<string, string | number | undefined | null>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => value !== undefined && value !== null && value !== '' && search.set(key, String(value)));
  return search.toString();
};

export const recordApi = {
  getSummary: (month?: string) => apiClient.get<MyRecordSummary>(`/records/me/summary?${query({ month })}`, { auth: true }),
  getMmrHistory: (type: MmrType, from: string, to: string) => apiClient.get<MmrHistoryResponse>(`/records/me/mmr?${query({ type, from, to })}`, { auth: true }),
  getMatches: (params: { page: number; size: number; from?: string; to?: string; groupId?: number; type?: RecordMatchType; result?: 'WIN' | 'LOSS' }) =>
    apiClient.get<MatchRecordPageResponse>(`/records/me/matches?${query(params)}`, { auth: true }),
};

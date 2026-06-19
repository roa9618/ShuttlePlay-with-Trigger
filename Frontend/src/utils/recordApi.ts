import { apiClient } from './apiClient';
import { isGalleryPreviewMode, previewNow } from './galleryPreview';

export type RecordMatchType = 'MENS_DOUBLES' | 'WOMENS_DOUBLES' | 'SAME_GENDER_DOUBLES' | 'MIXED_DOUBLES' | 'ANY';
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

const previewMatch: MatchRecordItem = {
  id: 1,
  matchType: 'MIXED_DOUBLES',
  playedAt: previewNow(-1),
  win: true,
  myScore: 21,
  opponentScore: 18,
  partner: '김셔틀',
  opponents: ['박트리거', '이배드'],
  groupId: 1,
  groupName: '강남 배드민턴 클럽',
  sessionId: 101,
  sessionTitle: '6월 정기 운동',
};

const previewMatches: MatchRecordItem[] = [
  previewMatch,
  { ...previewMatch, id: 2, playedAt: previewNow(-3), win: false, myScore: 17, opponentScore: 21, partner: '최셔틀', opponents: ['한스매시', '오클리어'] },
  { ...previewMatch, id: 3, playedAt: previewNow(-5), win: true, myScore: 21, opponentScore: 15, partner: '정라켓', opponents: ['강드롭', '송클리어'] },
];

const previewStats: PeriodRecordStats = {
  hasRecord: true,
  matches: 12,
  wins: 7,
  losses: 5,
  winRate: 58,
  pointsFor: 236,
  pointsAgainst: 211,
  exerciseMinutes: 640,
  attendance: 6,
  doublesMmrChange: 24,
  mixedMmrChange: 12,
};

const previewSummary: MyRecordSummary = {
  profile: { name: '홍길동', profileImageUrl: null, gender: 'MALE', ageGroup: 'THIRTIES', grade: 'B' },
  mmr: { doubles: 1246, mixed: 1188, doublesMonthlyChange: 24, mixedMonthlyChange: 12 },
  today: { ...previewStats, matches: 4, wins: 2, losses: 2, winRate: 50, exerciseMinutes: 180, attendance: 1 },
  month: previewStats,
  activity: [
    { date: new Date().toISOString().slice(0, 10), count: 1, exerciseMinutes: 180, schedules: [{ groupName: '강남 배드민턴 클럽', sessionTitle: '6월 정기 운동', startsAt: previewNow(0, 19), endsAt: previewNow(0, 22) }] },
    { date: previewNow(-3).slice(0, 10), count: 1, exerciseMinutes: 140, schedules: [{ groupName: '서초 아침 운동', sessionTitle: '아침 운동', startsAt: previewNow(-3, 7), endsAt: previewNow(-3, 9) }] },
  ],
  recentMatches: previewMatches,
  people: {
    partners: [{ userId: 2, name: '김셔틀', profileImageUrl: null, matches: 8 }, { userId: 3, name: '최셔틀', profileImageUrl: null, matches: 5 }],
    opponents: [{ userId: 4, name: '박트리거', profileImageUrl: null, matches: 7 }, { userId: 5, name: '한스매시', profileImageUrl: null, matches: 4 }],
  },
  habit: { averageWeeklySessions: 2, consecutiveWeeks: 5, favoriteDay: 'THURSDAY', favoriteTimeRange: '19:00 - 22:00' },
  playStyle: { averageRestMinutes: 12, consecutiveMatchRate: 35, closeMatchRate: 42, blowoutWinRate: 18, blowoutLossRate: 8, funRate: 65, competitiveRate: 35, enoughData: true },
  groups: [{ groupId: 1, groupName: '강남 배드민턴 클럽', attendance: 16, matches: 32, wins: 19, losses: 13, winRate: 59, lastParticipationAt: previewNow(-1) }],
  highlights: {
    closestMatch: { match: previewMatch, count: 1 },
    longestWinStreak: { match: previewMatch, count: 4 },
    longestLossStreak: { match: previewMatches[1], count: 2 },
  },
};

export const recordApi = {
  getSummary: (month?: string) => isGalleryPreviewMode() ? Promise.resolve(previewSummary) : apiClient.get<MyRecordSummary>(`/records/me/summary?${query({ month })}`, { auth: true }),
  getMmrHistory: (type: MmrType, from: string, to: string) => isGalleryPreviewMode() ? Promise.resolve({ type, currentMmr: type === 'DOUBLES' ? 1246 : 1188, totalChange: 36, points: [{ id: 1, changedAt: previewNow(-14), beforeMmr: 1210, afterMmr: 1226, change: 16 }, { id: 2, changedAt: previewNow(-7), beforeMmr: 1226, afterMmr: 1246, change: 20 }] }) : apiClient.get<MmrHistoryResponse>(`/records/me/mmr?${query({ type, from, to })}`, { auth: true }),
  getMatches: (params: { page: number; size: number; from?: string; to?: string; groupId?: number; type?: RecordMatchType; result?: 'WIN' | 'LOSS' }) =>
    isGalleryPreviewMode() ? Promise.resolve({ items: previewMatches, page: params.page, size: params.size, totalElements: previewMatches.length, totalPages: 1 }) : apiClient.get<MatchRecordPageResponse>(`/records/me/matches?${query(params)}`, { auth: true }),
};

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dumbbell, ShieldAlert, Swords, Trophy, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ApiClientError } from '../utils/apiClient';
import { setAuthRedirectPath } from '../utils/authSession';
import { connectSessionEntrySocket } from '../utils/sessionEntrySocket';
import { sessionEntryApi, type SessionParticipantCurrentMatch } from '../utils/sessionEntryApi';
import { sessionPath } from '../utils/publicId';

const matchTypeLabel: Record<string, string> = { MENS_DOUBLES: '남복', WOMENS_DOUBLES: '여복', SAME_GENDER_DOUBLES: '동일 성별 복식', MIXED_DOUBLES: '혼복', ANY: '자유 매칭' };

function demoCurrentMatch(): SessionParticipantCurrentMatch {
  const now = new Date().toISOString();
  return {
    sessionId: 0, entryCode: 'DEMO2026', groupId: 1, groupName: '강남 배드민턴 클럽', title: '6월 정기 운동',
    startsAt: now, endsAt: null, place: '강남구민회관', status: 'OPEN', entryOpen: true, entryOpensAt: now,
    loggedIn: false, profileCompleted: false, operator: false, registered: true, participantType: 'GUEST', name: '홍길동',
    grade: 'B', gender: 'MALE', ageGroup: 'THIRTIES', voteStatus: 'ATTENDING', attendanceStatus: 'ARRIVED',
    canRegister: true, restrictionReason: null, guestAllowed: true, guestLinkAllowed: true, groupGuestAllowed: true,
    playStatus: 'PLAYING', gameStatus: 'PLAYING',
    currentMatch: { matchId: 1, court: 2, partner: '김민수', opponents: ['박지영', '이준호'], matchType: 'MIXED_DOUBLES', assignedAt: now },
    nextMatch: null, nextPrompt: null,
    todayStats: { games: 2, wins: 1, losses: 1, pointsFor: 39, pointsAgainst: 36, doublesMmrDelta: 0, mixedMmrDelta: 0 },
    lastUpdatedAt: now, realtimeConnected: true, guestRecordLimited: true,
    message: '현재 경기중이에요', subMessage: '경기가 끝나면 결과를 입력해 주세요.',
  };
}

export default function ParticipantCurrentMatchPage() {
  const { sessionId } = useParams();
  const isDemo = sessionId === 'demo';
  const id = sessionId ?? '';
  const navigate = useNavigate();
  const [data, setData] = useState<SessionParticipantCurrentMatch | null>(null);
  const [error, setError] = useState('');
  const [realtimeConnected, setRealtimeConnected] = useState(isDemo);

  const load = useCallback(async () => {
    if (isDemo) { setData(demoCurrentMatch()); return; }
    if (!id) return;
    try {
      const next = await sessionEntryApi.currentMatch(id);
      setData(next);
      if (!next.currentMatch && next.playStatus !== 'PLAYING') {
        navigate(sessionPath(id, '/status'));
        return;
      }
      setError('');
    } catch (errorValue) {
      if (errorValue instanceof ApiClientError && errorValue.status === 401) {
        const path = sessionPath(id, '/current-match');
        setAuthRedirectPath(path);
        navigate(`/login?redirect=${encodeURIComponent(path)}`);
        return;
      }
      setError('현재 경기 정보를 확인하지 못했어요. 참가자 현황에서 다시 확인해 주세요.');
    }
  }, [id, isDemo, navigate]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!data?.groupId || !data.sessionId || isDemo) return undefined;
    return connectSessionEntrySocket(data.groupId, data.sessionId, load, setRealtimeConnected);
  }, [data?.groupId, data?.sessionId, isDemo, load]);

  if (error) {
    return <Shell><section className="w-full rounded-3xl border-2 border-destructive/20 bg-card p-6 text-center shadow-lg"><ShieldAlert className="mx-auto h-12 w-12 text-destructive" /><h1 className="mt-4 text-2xl font-bold">확인이 필요해요</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p><Button className="mt-5 h-14 w-full rounded-2xl text-base font-bold" onClick={() => navigate(sessionPath(sessionId ?? id, '/status'))}>참가자 현황으로 돌아가기</Button></section></Shell>;
  }
  if (!data) return <Shell><p className="text-center text-muted-foreground">현재 경기 정보를 확인하고 있어요.</p></Shell>;

  const match = data.currentMatch;
  const resultPath = isDemo ? '/sessions/demo/match-result' : sessionPath(id, '/match-result');

  return (
    <Shell>
      <section className="w-full rounded-3xl border-2 border-primary/20 bg-card p-5 text-center shadow-xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary"><Dumbbell className="h-8 w-8" /></span>
        <p className="mt-4 text-sm font-bold text-primary">{data.groupName}</p>
        <h1 className="mt-1 text-3xl font-black tracking-[-0.03em]">{data.message}</h1>
        <p className="mt-2 text-base leading-7 text-muted-foreground">{data.subMessage}</p>

        <div className="mt-4 rounded-[28px] bg-secondary/60 p-4">
          <p className="text-sm font-semibold text-muted-foreground">현재 코트</p>
          <strong className="mt-1 block text-5xl font-black text-primary">{match?.court ? `${match.court}번` : '확인 중'}</strong>
        </div>

        <div className="mt-3 grid gap-2.5 text-left">
          <InfoRow label="내 팀" value={match?.partner ? `나 · ${match.partner}` : '나'} icon={<Trophy className="h-5 w-5" />} />
          <InfoRow label="상대 팀" value={match?.opponents?.join(' · ') || '확인 중'} icon={<Swords className="h-5 w-5" />} />
          <InfoRow label="경기 유형" value={match?.matchType ? matchTypeLabel[match.matchType] ?? match.matchType : '확인 중'} icon={<Dumbbell className="h-5 w-5" />} />
        </div>

        <div className="mt-4 flex items-center justify-center rounded-2xl bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">{realtimeConnected ? <Wifi className="h-4 w-4 text-emerald-600" /> : <WifiOff className="h-4 w-4 text-destructive" />}{realtimeConnected ? '실시간 연결 중' : '연결이 불안정해요'}</span>
        </div>

        <div className="mt-5 grid gap-2.5">
          <Button className="h-16 w-full rounded-2xl text-lg font-bold" onClick={() => navigate(resultPath, { state: { currentMatch: data } })}>경기 결과 입력하기</Button>
          <Button variant="outline" className="h-14 w-full rounded-2xl text-base font-bold hover:border-border hover:bg-secondary hover:text-foreground" onClick={() => navigate(sessionPath(sessionId ?? id, '/status'))}>참가자 현황 보기</Button>
        </div>
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-background"><main className="mx-auto flex min-h-dvh w-full max-w-lg items-center px-4 py-3">{children}</main></div>;
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"><span className="text-primary">{icon}</span><div><p className="text-xs text-muted-foreground">{label}</p><strong className="mt-1 block text-base">{value}</strong></div></div>;
}

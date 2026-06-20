import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BellRing, Clock3, ShieldAlert, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ApiClientError } from '../utils/apiClient';
import { setAuthRedirectPath } from '../utils/authSession';
import { sessionEntryApi, type SessionParticipantAlert } from '../utils/sessionEntryApi';
import { connectSessionEntrySocket, vibrateParticipantAlert } from '../utils/sessionEntrySocket';
import { sessionPath } from '../utils/publicId';

const matchTypeLabel: Record<string, string> = { MENS_DOUBLES: '남복', WOMENS_DOUBLES: '여복', SAME_GENDER_DOUBLES: '동일 성별 복식', MIXED_DOUBLES: '혼복', ANY: '자유 매칭' };

function demoAlert(): SessionParticipantAlert {
  const now = new Date().toISOString();
  return {
    sessionId: 0, entryCode: 'DEMO2026', groupId: 1, groupName: '강남 배드민턴 클럽', title: '6월 정기 운동',
    startsAt: now, endsAt: null, place: '강남구민회관', status: 'OPEN', entryOpen: true, entryOpensAt: now,
    loggedIn: false, profileCompleted: false, operator: false, registered: true, participantType: 'GUEST', name: '홍길동',
    grade: 'B', gender: 'MALE', ageGroup: 'THIRTIES', voteStatus: 'ATTENDING', attendanceStatus: 'ARRIVED',
    canRegister: true, restrictionReason: null, guestAllowed: true, guestLinkAllowed: true, groupGuestAllowed: true,
    playStatus: 'NEXT_UP', gameStatus: 'NEXT_UP',
    nextMatch: { matchQueueId: 1, court: null, partner: '김민수', opponents: ['박지영', '이준호'], matchType: 'MIXED_DOUBLES', assignedAt: now },
    currentMatch: null, nextPrompt: null, todayStats: { games: 2, wins: 1, losses: 1, pointsFor: 39, pointsAgainst: 36 },
    lastUpdatedAt: now, realtimeConnected: true, guestRecordLimited: true,
    alertType: 'NEXT_UP', alertPriority: 'NORMAL', message: '다음 경기 예정이에요', subMessage: '곧 경기 차례가 올 수 있어요. 준비하고 대기해 주세요.',
  };
}

export default function NextMatchPage() {
  const { sessionId } = useParams();
  const isDemo = sessionId === 'demo';
  const id = sessionId ?? '';
  const navigate = useNavigate();
  const [data, setData] = useState<SessionParticipantAlert | null>(null);
  const [error, setError] = useState('');
  const [realtimeConnected, setRealtimeConnected] = useState(isDemo);

  const load = useCallback(async () => {
    if (isDemo) { setData(demoAlert()); return; }
    if (!id) return;
    try {
      setData(await sessionEntryApi.nextMatch(id));
      setError('');
    } catch (errorValue) {
      if (errorValue instanceof ApiClientError && errorValue.status === 401) {
        const path = sessionPath(id, '/next-match');
        setAuthRedirectPath(path);
        navigate(`/login?redirect=${encodeURIComponent(path)}`);
        return;
      }
      setError('다음 경기 정보를 확인하지 못했어요. 참가자 현황에서 다시 확인해 주세요.');
    }
  }, [id, isDemo, navigate]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { vibrateParticipantAlert('NORMAL'); }, []);
  useEffect(() => {
    if (!data?.groupId || !data.sessionId || isDemo) return undefined;
    return connectSessionEntrySocket(data.groupId, data.sessionId, load, setRealtimeConnected);
  }, [data?.groupId, data?.sessionId, isDemo, load]);
  useEffect(() => {
    if (!data || isDemo) return;
    if (data.playStatus === 'PLAYING' && data.currentMatch) navigate(sessionPath(id, '/current-match'), { replace: true });
    else if (data.playStatus === 'CALLING') navigate(sessionPath(id, '/match-call'), { replace: true });
    else if (data.playStatus !== 'NEXT_UP' || !data.nextMatch) navigate(sessionPath(id, '/status'), { replace: true });
  }, [data, id, isDemo, navigate]);

  const confirm = () => {
    if (data?.nextMatch) window.sessionStorage.setItem(`session-next-prompt:${data.sessionId}:${data.nextMatch.matchQueueId ?? data.nextMatch.matchId ?? 'current'}:NEXT_UP`, 'true');
    navigate(sessionPath(id, '/status'));
  };

  if (error) {
    return <div className="min-h-dvh bg-background"><main className="mx-auto flex min-h-dvh max-w-lg items-center px-4"><section className="w-full rounded-3xl border-2 border-destructive/20 bg-card p-6 text-center shadow-lg"><ShieldAlert className="mx-auto h-12 w-12 text-destructive" /><h1 className="mt-4 text-2xl font-bold">확인이 필요해요</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p><Button className="mt-5 h-14 w-full rounded-2xl text-base font-bold" onClick={() => navigate(sessionPath(sessionId ?? id, '/status'))}>참가자 현황으로 돌아가기</Button></section></main></div>;
  }

  if (!data) return <div className="min-h-dvh bg-background"><main className="flex min-h-dvh items-center justify-center text-muted-foreground">다음 경기 정보를 확인하고 있어요.</main></div>;
  const match = data.nextMatch;

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto flex min-h-dvh w-full max-w-lg items-center px-4 py-3">
        <section className="w-full rounded-3xl border-2 border-primary/25 bg-card p-5 text-center shadow-lg">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary"><BellRing className="h-9 w-9" /></span>
          <p className="mt-5 text-sm font-bold text-primary">{data.groupName}</p>
          <h1 className="mt-1 text-[1.9rem] font-black tracking-[-0.03em]">{data.message}</h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground">{data.subMessage}</p>

          <div className="mt-4 rounded-[30px] bg-primary/[0.06] p-4">
            <p className="text-sm text-muted-foreground">코트 안내</p>
            <strong className="mt-1 block text-3xl">{match?.court ? `${match.court}번 코트` : '코트 안내 대기'}</strong>
            <p className="mt-2 text-sm text-muted-foreground">{match?.court ? '코트 근처에서 대기해 주세요.' : '코트는 곧 안내될 예정이에요.'}</p>
          </div>

          <div className="mt-3 grid gap-2.5 text-left">
            <InfoRow label="내 파트너" value={match?.partner ?? '확인 중'} />
            <InfoRow label="상대 팀" value={match?.opponents?.join(' · ') || '확인 중'} />
            <InfoRow label="경기 유형" value={match?.matchType ? matchTypeLabel[match.matchType] ?? match.matchType : '확인 중'} />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">{realtimeConnected ? <Wifi className="h-4 w-4 text-emerald-600" /> : <WifiOff className="h-4 w-4 text-destructive" />}{realtimeConnected ? '실시간 연결 중' : '연결 불안정'}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />방금 배정됨</span>
          </div>

          <Button className="mt-5 h-16 w-full rounded-2xl text-lg font-bold" onClick={confirm}>확인했어요</Button>
        </section>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-card px-4 py-3"><p className="text-xs text-muted-foreground">{label}</p><strong className="mt-1 block text-base">{value}</strong></div>;
}

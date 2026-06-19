import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, BarChart3, Clock3, Dumbbell, LogOut, RefreshCw, ShieldAlert, UserRound, Users, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ApiClientError } from '../utils/apiClient';
import { setAuthRedirectPath } from '../utils/authSession';
import { sessionPath } from '../utils/publicId';
import { sessionEntryApi, type SessionEntryParticipantStatus, type ParticipantPlayStatus } from '../utils/sessionEntryApi';
import { scheduleSessionAutoStart } from '../utils/sessionEntryAutoStart';
import { connectSessionEntrySocket } from '../utils/sessionEntrySocket';

const playStatusLabel: Record<ParticipantPlayStatus, { title: string; description: string }> = {
  WAITING: { title: '경기 대기 중', description: '운영자가 경기를 배정하면 알려드릴게요.' },
  AVAILABLE: { title: '경기 가능', description: '경기 배정을 받을 수 있는 상태예요.' },
  NEXT_UP: { title: '다음 경기 예정', description: '곧 경기 차례가 올 수 있어요.' },
  CALLING: { title: '지금 입장 필요', description: '코트로 이동해야 하는 상태예요.' },
  PLAYING: { title: '경기 중', description: '현재 배정된 코트에서 경기 중이에요.' },
  RESTING: { title: '휴식 중', description: '잠시 쉬는 상태예요.' },
  LEFT: { title: '퇴장', description: '오늘 운동에서 빠진 상태예요.' },
  ABSENT: { title: '경기 제외', description: '오늘 경기에 배정되지 않아요.' },
};

const genderLabel: Record<string, string> = { MALE: '남성', FEMALE: '여성' };
const ageLabel: Record<string, string> = { TEENS: '10대', TWENTIES: '20대', THIRTIES: '30대', FORTIES: '40대', FIFTIES: '50대', SIXTIES_PLUS: '60대 이상' };
const matchTypeLabel: Record<string, string> = { MENS_DOUBLES: '남복', WOMENS_DOUBLES: '여복', MIXED_DOUBLES: '혼복', ANY: '자유 매칭' };

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(value));
}

function formatTime(value: string | null) {
  return value ? new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value)) : '-';
}

function updateText(value?: string) {
  if (!value) return '방금 업데이트됨';
  const date = new Date(value);
  return `${formatTime(date.toISOString())} 기준`;
}

function demoStatus(): SessionEntryParticipantStatus {
  return {
    sessionId: 0,
    entryCode: 'DEMO2026',
    groupId: 1,
    groupName: '강남 배드민턴 클럽',
    title: '6월 정기 운동',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    place: '강남구민회관',
    status: 'OPEN',
    entryOpen: true,
    entryOpensAt: new Date().toISOString(),
    loggedIn: false,
    profileCompleted: false,
    operator: false,
    registered: true,
    participantType: 'GUEST',
    name: '홍길동',
    grade: 'B',
    gender: 'MALE',
    ageGroup: 'THIRTIES',
    voteStatus: 'ATTENDING',
    attendanceStatus: 'ARRIVED',
    canRegister: true,
    restrictionReason: null,
    guestAllowed: true,
    guestLinkAllowed: true,
    groupGuestAllowed: true,
    playStatus: 'AVAILABLE',
    gameStatus: 'AVAILABLE',
    nextMatch: null,
    currentMatch: null,
    nextPrompt: null,
    todayStats: { games: 0, wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, doublesMmrDelta: 0, mixedMmrDelta: 0 },
    lastUpdatedAt: new Date().toISOString(),
    realtimeConnected: true,
    guestRecordLimited: true,
  };
}

function confirmedKey(status: SessionEntryParticipantStatus) {
  const prompt = status.nextPrompt;
  if (!prompt) return null;
  return `session-next-prompt:${status.sessionId}:${prompt.matchQueueId ?? prompt.matchId ?? 'current'}:${prompt.type}`;
}

export default function ParticipantStatusPage() {
  const { sessionId } = useParams();
  const isDemo = sessionId === 'demo';
  const id = sessionId ?? '';
  const navigate = useNavigate();
  const [status, setStatus] = useState<SessionEntryParticipantStatus | null>(null);
  const [error, setError] = useState('');
  const [realtimeConnected, setRealtimeConnected] = useState(isDemo);
  const [busy, setBusy] = useState(false);

  const loadStatus = useCallback(async () => {
    if (isDemo) {
      setStatus(demoStatus());
      setRealtimeConnected(true);
      return;
    }
    if (!id) return;
    try {
      const next = await sessionEntryApi.status(id);
      setStatus(next);
      setError('');
    } catch (errorValue) {
      if (errorValue instanceof ApiClientError && errorValue.status === 401) {
        const path = sessionPath(id, '/status');
        setAuthRedirectPath(path);
        navigate(`/login?redirect=${encodeURIComponent(path)}`);
        return;
      }
      setError(errorValue instanceof ApiClientError && errorValue.status === 403
        ? '참가자 정보를 찾지 못했어요. 일정 입장 화면에서 다시 확인해 주세요.'
        : '참가자 현황을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  }, [id, isDemo, navigate]);

  useEffect(() => { void loadStatus(); }, [loadStatus]);

  useEffect(() => {
    if (!status?.groupId || !status.sessionId || isDemo) return undefined;
    return connectSessionEntrySocket(status.groupId, status.sessionId, loadStatus, setRealtimeConnected);
  }, [isDemo, loadStatus, status?.groupId, status?.sessionId]);

  useEffect(() => {
    if (!status) return;
    if (status.playStatus === 'PLAYING' && status.currentMatch) {
      const matchId = status.currentMatch?.matchId ?? 'current';
      const acknowledged = window.sessionStorage.getItem(`session-match-start-alert:${status.sessionId}:${matchId}`);
      navigate(sessionPath(id, `/${acknowledged ? 'current-match' : 'match-call'}`), { replace: true });
      return;
    }
    const promptType = status.nextPrompt?.type ?? (status.playStatus === 'CALLING' ? 'CALLING' : status.playStatus === 'NEXT_UP' ? 'NEXT_UP' : null);
    if (!promptType) return;
    if (promptType === 'CALLING' && !status.currentMatch && !status.nextMatch) return;
    if (promptType === 'NEXT_UP' && !status.nextMatch) return;
    const key = confirmedKey(status);
    if (key && window.sessionStorage.getItem(key) && promptType !== 'CALLING') return;
    navigate(sessionPath(id, `/${promptType === 'CALLING' ? 'match-call' : 'next-match'}`), { replace: true });
  }, [id, navigate, status]);

  useEffect(() => {
    if (!status || isDemo) return undefined;
    return scheduleSessionAutoStart(status, () => navigate(sessionPath(id, '/current-match')), () => void loadStatus());
  }, [id, isDemo, loadStatus, navigate, status]);

  const toggleRest = async () => {
    if (!status || isDemo) return;
    setBusy(true);
    try {
      setStatus(await sessionEntryApi.toggleRest(id));
    } finally {
      setBusy(false);
    }
  };

  const leaveEarly = async () => {
    if (!status) return;
    if (!window.confirm('조기 퇴장하면 오늘 경기 후보에서 제외돼요. 퇴장할까요?')) return;
    if (isDemo) {
      setStatus({ ...status, playStatus: 'LEFT', gameStatus: 'LEFT' });
      return;
    }
    setBusy(true);
    try {
      setStatus(await sessionEntryApi.leaveEarly(id));
    } catch {
      setError('현재 경기 또는 입장 호출이 끝난 뒤 조기 퇴장할 수 있어요.');
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return <div className="min-h-dvh bg-background"><main className="mx-auto flex min-h-dvh max-w-lg items-center px-4"><section className="w-full rounded-3xl border-2 border-destructive/20 bg-card p-6 text-center shadow-lg"><ShieldAlert className="mx-auto h-12 w-12 text-destructive" /><h1 className="mt-4 text-2xl font-bold">상태 확인이 필요해요</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p><Button className="mt-5 h-14 w-full rounded-2xl text-base font-bold" onClick={() => navigate('/session-entry')}>일정 입장으로 이동</Button></section></main></div>;
  }

  if (!status) {
    return <div className="min-h-dvh bg-background"><main className="flex min-h-dvh items-center justify-center px-4 text-center text-muted-foreground">참가자 현황을 확인하고 있어요.</main></div>;
  }

  const current = playStatusLabel[status.playStatus] ?? playStatusLabel.WAITING;
  const nextMatch = status.nextMatch;
  const stats = status.todayStats;
  const reportPath = isDemo ? '/sessions/demo/my-report' : sessionPath(id, '/my-report');
  const currentMatchPath = isDemo ? '/sessions/demo/current-match' : sessionPath(id, '/current-match');
  const participantInfo = [
    status.name ?? '참가자',
    status.participantType === 'GUEST' ? '게스트' : '회원',
    status.grade ? `${status.grade}급` : null,
    status.gender ? genderLabel[status.gender] ?? status.gender : null,
    status.ageGroup ? ageLabel[status.ageGroup] ?? status.ageGroup : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="min-h-dvh bg-background pb-36">
      <main className="mx-auto flex min-h-[calc(100dvh-104px)] w-full max-w-lg items-center px-4 py-3">
        <section className="w-full rounded-3xl border-2 border-border bg-card p-4 shadow-lg">
          <div className="text-center">
            <p className="text-sm font-bold text-primary">{status.groupName}</p>
            <h1 className="mt-1 text-[1.65rem] font-bold tracking-[-0.02em]">{status.title}</h1>
            <div className="mt-3 grid gap-2 text-sm font-semibold">
              <span className="rounded-2xl bg-primary/5 px-3 py-2.5">{formatDate(status.startsAt)}</span>
              <span className="rounded-2xl bg-primary/5 px-3 py-2.5">{formatTime(status.startsAt)} - {formatTime(status.endsAt)}</span>
              <span className="rounded-2xl bg-primary/5 px-3 py-2.5">{status.place ?? '장소 미정'}</span>
            </div>
          </div>

          <div className="mt-3 rounded-3xl border border-border bg-secondary/30 p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><UserRound /></span>
              <div>
                <p className="text-sm text-muted-foreground">내 참가 정보</p>
                <strong className="text-base">{participantInfo}</strong>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-[28px] border-2 border-primary/25 bg-primary/[0.04] p-4 text-center">
            <Activity className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-2 text-2xl font-bold">{current.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{current.description}</p>
          </div>

          <div className="mt-3 rounded-3xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Users /></span>
              <div>
                <p className="text-sm text-muted-foreground">다음 경기 요약</p>
                <strong className="text-lg">{nextMatch?.court ? `${nextMatch.court}번 코트` : '운영자가 배정하면 여기에 표시돼요'}</strong>
              </div>
            </div>
            {nextMatch && <div className="mt-4 space-y-2 rounded-2xl bg-secondary/40 p-4 text-sm">
              <p><span className="text-muted-foreground">파트너</span> <strong>{nextMatch.partner ?? '확인 중'}</strong></p>
              <p><span className="text-muted-foreground">상대</span> <strong>{nextMatch.opponents?.join(' · ') || '확인 중'}</strong></p>
              <p><span className="text-muted-foreground">경기 유형</span> <strong>{nextMatch.matchType ? matchTypeLabel[nextMatch.matchType] ?? nextMatch.matchType : '확인 중'}</strong></p>
            </div>}
          </div>

          <div className="mt-3">
            <p className="mb-3 px-1 text-sm text-muted-foreground">오늘 기록 요약</p>
            <div className="grid grid-cols-5 gap-2">
              {[['경기', stats.games], ['승', stats.wins], ['패', stats.losses], ['득', stats.pointsFor], ['실', stats.pointsAgainst]].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-border bg-card p-3 text-center">
                  <strong className="block text-xl">{value}</strong>
                  <small className="text-muted-foreground">{label}</small>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-2xl bg-secondary/40 px-4 py-3 text-center text-sm text-muted-foreground">MMR 변화는 경기 결과 입력 후 표시돼요.</p>
          </div>

          {status.guestRecordLimited && <p className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm font-medium text-primary">게스트 기록은 이 일정에서만 확인할 수 있어요.</p>}

          <div className="mt-3 flex items-center justify-between rounded-2xl bg-secondary/40 px-3 py-2.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">{realtimeConnected ? <Wifi className="h-4 w-4 text-emerald-600" /> : <WifiOff className="h-4 w-4 text-destructive" />}{realtimeConnected ? '실시간 연결 중' : '연결이 불안정해요. 새로고침해 주세요.'}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{updateText(status.lastUpdatedAt)}</span>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-2.5">
          <Button variant="outline" disabled={busy || status.playStatus === 'PLAYING' || status.playStatus === 'CALLING'} className="h-14 w-full rounded-2xl hover:bg-secondary hover:text-foreground" onClick={() => void toggleRest()}>
            <Dumbbell className="mr-2 h-5 w-5" />{status.playStatus === 'RESTING' ? '휴식 해제' : '휴식 전환'}
          </Button>
          <Button variant="outline" className="h-14 w-full rounded-2xl hover:bg-secondary hover:text-foreground" onClick={() => void loadStatus()}>
            <RefreshCw className="mr-2 h-5 w-5" />새로고침
          </Button>
          <Button variant="outline" disabled={busy || status.playStatus === 'PLAYING' || status.playStatus === 'CALLING' || status.playStatus === 'NEXT_UP' || status.playStatus === 'LEFT'} className="col-span-2 h-14 w-full rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => void leaveEarly()}>
            <LogOut className="mr-2 h-5 w-5" />{status.playStatus === 'LEFT' ? '조기 퇴장 완료' : '조기 퇴장'}
          </Button>
          {status.currentMatch && (
            <Button className="col-span-2 h-14 w-full rounded-2xl text-base font-bold" onClick={() => navigate(currentMatchPath)}>
              <Activity className="mr-2 h-5 w-5" />현재 경기 보기
            </Button>
          )}
          <Button className="col-span-2 h-14 w-full rounded-2xl text-base font-bold" onClick={() => navigate(reportPath)}>
            <BarChart3 className="mr-2 h-5 w-5" />오늘 내 운동 기록 보기
          </Button>
        </div>
      </div>
    </div>
  );
}

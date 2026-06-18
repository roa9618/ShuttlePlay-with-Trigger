import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BarChart3, Check, Clock, Coffee, UserCheck, X } from 'lucide-react';
import SessionFlowHeader from '../components/SessionFlowHeader';
import { Button } from '../components/ui/button';
import { ApiClientError } from '../utils/apiClient';
import { sessionEntryApi, type SessionEntryParticipantStatus } from '../utils/sessionEntryApi';
import { setAuthRedirectPath } from '../utils/authSession';

const dateTime = (value?: string | null) => value
  ? new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))
  : null;

const attendanceView = {
  REGISTERED: {
    icon: UserCheck,
    title: '참가 등록 완료',
    description: '아직 도착 처리는 되지 않았어요.',
    className: 'border-primary/25 bg-primary/[0.04] text-primary',
  },
  ARRIVED: {
    icon: Check,
    title: '도착 완료',
    description: '경기 가능 상태로 반영됐어요.',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  LATE: {
    icon: Clock,
    title: '지각 예정',
    description: '도착 예정 시간이 운영자 화면에 반영됐어요.',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  ABSENT: {
    icon: X,
    title: '불참',
    description: '오늘 일정은 불참으로 저장됐어요.',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
} as const;

export default function ParticipantStatusPage() {
  const { sessionId } = useParams();
  const isDemo = sessionId === 'demo';
  const id = Number(sessionId);
  const routeSessionId = sessionId ?? String(id);
  const navigate = useNavigate();
  const [status, setStatus] = useState<SessionEntryParticipantStatus | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isDemo) {
      setStatus({
        sessionId: 0,
        entryCode: 'DEMO2026',
        groupId: 1,
        groupName: '강남 배드민턴 클럽',
        title: '6월 정기 운동',
        startsAt: new Date().toISOString(),
        endsAt: null,
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
        voteStatus: 'ATTENDING',
        attendanceStatus: 'ARRIVED',
        canRegister: true,
        restrictionReason: null,
        guestAllowed: true,
        guestLinkAllowed: true,
        groupGuestAllowed: true,
        expectedArrivalAt: null,
        lateReason: null,
        arrivedAt: new Date().toISOString(),
        gameStatus: 'WAITING',
        nextMatch: null,
        todayStats: { games: 0, wins: 0, losses: 0 },
      });
      return;
    }
    if (!Number.isFinite(id)) return;
    void sessionEntryApi.status(id)
      .then(setStatus)
      .catch(errorValue => {
        if (errorValue instanceof ApiClientError && errorValue.status === 401) {
          const path = `/sessions/${id}/status`;
          setAuthRedirectPath(path);
          navigate(`/login?redirect=${encodeURIComponent(path)}`);
          return;
        }
        if (errorValue instanceof ApiClientError && errorValue.status === 403) {
          setError('참가자 정보를 찾지 못했어요. 일정 입장 화면에서 정보를 다시 확인해 주세요.');
          return;
        }
        setError('참가자 상태를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      });
  }, [id, isDemo, navigate]);

  if (error) {
    return <div className="min-h-dvh bg-background"><SessionFlowHeader /><main className="mx-auto flex min-h-[calc(100dvh-84px)] max-w-lg items-center px-4"><section className="w-full rounded-3xl border-2 border-destructive/20 bg-card p-6 text-center shadow-lg"><X className="mx-auto h-12 w-12 text-destructive" /><h1 className="mt-4 text-2xl font-bold">상태 확인이 필요해요</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p><Button className="mt-5 h-14 w-full rounded-2xl text-base font-bold" onClick={() => navigate('/session-entry')}>일정 입장으로 이동</Button></section></main></div>;
  }

  if (!status) {
    return <div className="min-h-dvh bg-background"><SessionFlowHeader /><main className="flex min-h-[calc(100dvh-84px)] items-center justify-center px-4 text-center text-muted-foreground">참가자 상태를 확인하고 있어요…</main></div>;
  }

  const current = attendanceView[status.attendanceStatus ?? 'REGISTERED'];
  const StatusIcon = current.icon;
  const lateTime = dateTime(status.expectedArrivalAt);
  const arrivedTime = dateTime(status.arrivedAt);
  const nextMatch = status.nextMatch;
  const stats = status.todayStats ?? { games: 0, wins: 0, losses: 0 };
  const reportPath = isDemo
    ? '/sessions/demo/my-report'
    : status.participantType === 'GUEST' ? `/sessions/${id}/guest-report` : `/sessions/${id}/my-report`;

  return (
    <div className="min-h-dvh bg-background pb-36">
      <SessionFlowHeader />
      <main className="mx-auto w-full max-w-lg px-4 py-5">
        <section className="rounded-3xl border-2 border-border bg-card p-5 shadow-lg">
          <div className="text-center">
            <p className="text-sm font-bold text-primary">{status.groupName}</p>
            <h1 className="mt-1 text-[1.65rem] font-bold tracking-[-0.02em]">{status.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{status.name ? `${status.name}님` : '참가자'} · {status.participantType === 'GUEST' ? '게스트' : '회원'}</p>
          </div>

          <div className={`mt-5 rounded-[28px] border-2 p-6 text-center ${current.className}`}>
            <StatusIcon className="mx-auto h-12 w-12" />
            <h2 className="mt-3 text-2xl font-bold text-foreground">{current.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{current.description}</p>
            {lateTime && <p className="mt-3 rounded-2xl bg-card/70 px-4 py-3 text-sm font-semibold text-foreground">예상 도착 {lateTime}</p>}
            {arrivedTime && <p className="mt-3 rounded-2xl bg-card/70 px-4 py-3 text-sm font-semibold text-foreground">도착 시간 {arrivedTime}</p>}
            {status.lateReason && <p className="mt-2 text-sm text-muted-foreground">사유: {status.lateReason}</p>}
          </div>

          <div className="mt-4 rounded-3xl border border-border bg-secondary/30 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">현재 경기 상태</p>
                <strong className="text-lg">경기 배정 전</strong>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              경기판 기능과 실제 경기 배정 데이터가 연결되면 이 영역에 코트와 다음 경기 정보가 표시돼요.
            </p>
          </div>

          {nextMatch && (
            <div className="mt-4 rounded-3xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">다음 경기</p>
              <strong className="mt-1 block text-lg">{nextMatch.court}번 코트</strong>
              {nextMatch.partner && <p className="mt-2 text-sm">파트너: {nextMatch.partner}</p>}
              {nextMatch.opponents?.length ? <p className="text-sm">상대: {nextMatch.opponents.join(' · ')}</p> : null}
            </div>
          )}

          <div className="mt-4">
            <p className="mb-3 px-1 text-sm text-muted-foreground">오늘 기록</p>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-border bg-card p-4 text-center"><strong className="block text-2xl">{stats.games}</strong><small className="text-muted-foreground">경기</small></div>
              <div className="rounded-2xl border border-border bg-card p-4 text-center"><strong className="block text-2xl text-primary">{stats.wins}</strong><small className="text-muted-foreground">승</small></div>
              <div className="rounded-2xl border border-border bg-card p-4 text-center"><strong className="block text-2xl text-muted-foreground">{stats.losses}</strong><small className="text-muted-foreground">패</small></div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-2.5">
          <Link to={`/sessions/${routeSessionId}/attendance`}>
            <Button variant="outline" className="h-13 w-full rounded-2xl hover:bg-secondary hover:text-foreground">
              <UserCheck className="mr-2 h-5 w-5" />출석 변경
            </Button>
          </Link>
          <Link to={`/sessions/${routeSessionId}/late`}>
            <Button variant="outline" className="h-13 w-full rounded-2xl hover:bg-secondary hover:text-foreground">
              <Coffee className="mr-2 h-5 w-5" />지각 수정
            </Button>
          </Link>
          <Link to={reportPath} className="col-span-2">
            <Button className="h-14 w-full rounded-2xl text-base font-bold">
              <BarChart3 className="mr-2 h-5 w-5" />오늘 기록 보기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

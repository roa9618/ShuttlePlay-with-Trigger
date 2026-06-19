import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, ChevronRight, CircleDot, ShieldAlert, Trophy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ApiClientError } from '../utils/apiClient';
import { setAuthRedirectPath } from '../utils/authSession';
import { sessionEntryApi, type SessionParticipantReport, type SessionParticipantReportMatch } from '../utils/sessionEntryApi';

const matchTypeLabel: Record<string, string> = { MENS_DOUBLES: '남복', WOMOMENS_DOUBLES: '여복', WOMENS_DOUBLES: '여복', MIXED_DOUBLES: '혼복', ANY: '자유 매칭' };
const resultLabel: Record<string, string> = { WIN: '승', LOSS: '패', DRAW: '무', UNKNOWN: '-' };
const statusLabel: Record<string, string> = {
  RESULT_PENDING: '결과 입력 대기',
  RESULT_ENTERED: '결과 입력 완료',
  RESULT_UPDATED: '수정됨',
  MMR_PENDING: 'MMR 반영 대기',
};

function demoReport(): SessionParticipantReport {
  const now = new Date();
  const completedAt = now.toISOString();
  return {
    sessionId: 0,
    entryCode: 'DEMO2026',
    groupId: 1,
    groupName: '강남 배드민턴 클럽',
    title: '6월 정기 운동',
    startsAt: now.toISOString(),
    endsAt: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    place: '강남구민회관',
    status: 'OPEN',
    entryOpen: true,
    entryOpensAt: now.toISOString(),
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
    guestRecordLimited: true,
    canOpenFullRecord: false,
    summary: { games: 2, wins: 1, losses: 1, winRate: 50, pointsFor: 39, pointsAgainst: 38, doublesMmrDelta: 0, mixedMmrDelta: 0 },
    matches: [
      { matchId: 1, court: 1, matchType: 'MIXED_DOUBLES', partner: '김민수', opponents: ['박지영', '이준호'], myScore: 21, opponentScore: 17, result: 'WIN', status: 'RESULT_ENTERED', mmrType: null, mmrBefore: null, mmrAfter: null, mmrDelta: 0, completedAt, resultUpdated: false },
      { matchId: 2, court: 3, matchType: 'ANY', partner: '최서연', opponents: ['정민재', '강수진'], myScore: 18, opponentScore: 21, result: 'LOSS', status: 'RESULT_UPDATED', mmrType: null, mmrBefore: null, mmrAfter: null, mmrDelta: 0, completedAt, resultUpdated: true },
    ],
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(value));
}

function formatTime(value: string | null) {
  return value ? new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value)) : '-';
}

export default function ParticipantSessionReportPage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const isDemo = sessionId === 'demo' || location.pathname === '/sessions/demo/my-report';
  const id = Number(sessionId);
  const navigate = useNavigate();
  const [report, setReport] = useState<SessionParticipantReport | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (isDemo) { setReport(demoReport()); return; }
    if (!Number.isFinite(id)) return;
    try {
      setReport(await sessionEntryApi.myReport(id));
      setError('');
    } catch (errorValue) {
      if (errorValue instanceof ApiClientError && errorValue.status === 401) {
        const path = `/sessions/${id}/my-report`;
        setAuthRedirectPath(path);
        navigate(`/login?redirect=${encodeURIComponent(path)}`);
        return;
      }
      setError('오늘 내 운동 기록을 확인하지 못했어요. 참가자 현황에서 다시 확인해 주세요.');
    }
  }, [id, isDemo, navigate]);

  useEffect(() => { void load(); }, [load]);

  if (error) {
    return <div className="min-h-dvh bg-background"><main className="mx-auto flex min-h-dvh max-w-lg items-center px-4"><section className="w-full rounded-3xl border-2 border-destructive/20 bg-card p-6 text-center shadow-lg"><ShieldAlert className="mx-auto h-12 w-12 text-destructive" /><h1 className="mt-4 text-2xl font-bold">기록 확인이 필요해요</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p><Button className="mt-5 h-14 w-full rounded-2xl text-base font-bold" onClick={() => navigate(`/sessions/${sessionId ?? 'demo'}/status`)}>참가자 현황으로 돌아가기</Button></section></main></div>;
  }

  if (!report) {
    return <div className="min-h-dvh bg-background"><main className="flex min-h-dvh items-center justify-center px-4 text-center text-muted-foreground">오늘 내 운동 기록을 확인하고 있어요.</main></div>;
  }

  const summary = report.summary;

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto flex min-h-dvh w-full max-w-lg items-center px-4 py-3">
        <section className="w-full rounded-3xl border-2 border-border bg-card p-4 shadow-lg">
          <button type="button" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground" onClick={() => navigate(`/sessions/${sessionId ?? 'demo'}/status`)}>
            <ArrowLeft className="h-4 w-4" /> 참가자 현황
          </button>

          <div className="text-center">
            <p className="text-sm font-bold text-primary">{report.groupName}</p>
            <h1 className="mt-1 text-[1.55rem] font-bold tracking-[-0.02em]">오늘 내 운동 기록</h1>
            <p className="mt-1 text-xs text-muted-foreground">{report.title} · {formatDate(report.startsAt)} · {formatTime(report.startsAt)} - {formatTime(report.endsAt)}</p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <SummaryCard label="경기" value={summary.games} />
            <SummaryCard label="승" value={summary.wins} tone="primary" />
            <SummaryCard label="패" value={summary.losses} />
            <SummaryCard label="승률" value={summary.winRate == null ? '-' : `${summary.winRate}%`} />
            <SummaryCard label="득점" value={summary.pointsFor} />
            <SummaryCard label="실점" value={summary.pointsAgainst} />
          </div>

          <div className="mt-3 rounded-3xl border border-border bg-secondary/30 p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"><BarChart3 /></span>
              <div>
                <p className="text-xs text-muted-foreground">MMR 변화</p>
                <strong className="text-sm">복식 {formatDelta(summary.doublesMmrDelta)} · 혼복 {formatDelta(summary.mixedMmrDelta)}</strong>
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">경기 결과 입력 후 MMR 변화가 반영돼요.</p>
          </div>

          {report.guestRecordLimited && <p className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-center text-xs font-medium text-primary">게스트 기록은 이 일정에서만 확인할 수 있어요.</p>}

          <div className="mt-3">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold">경기별 결과</h2>
            </div>
            {report.matches.length ? (
              <div className="space-y-2">
                {report.matches.slice(0, 2).map((match, index) => <MatchCard key={match.matchId} match={match} index={index} />)}
              </div>
            ) : (
              <div className="rounded-3xl bg-secondary/40 px-5 py-8 text-center">
                <CircleDot className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-3 text-lg font-bold">아직 완료된 경기가 없어요</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">경기가 끝나고 결과가 입력되면 여기에 표시돼요.</p>
              </div>
            )}
          </div>

          {report.canOpenFullRecord && <Button variant="outline" className="mt-3 h-13 w-full rounded-2xl hover:bg-secondary hover:text-foreground" onClick={() => navigate('/my-record')}>
            전체 기록으로 이동 <ChevronRight className="ml-1 h-4 w-4" />
          </Button>}
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string | number; tone?: 'primary' }) {
  return <div className="rounded-2xl border border-border bg-card p-2.5 text-center"><strong className={`block text-lg ${tone === 'primary' ? 'text-primary' : ''}`}>{value}</strong><small className="text-muted-foreground">{label}</small></div>;
}

function MatchCard({ match, index }: { match: SessionParticipantReportMatch; index: number }) {
  return (
    <article className="rounded-3xl border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">{index + 1}경기 · {match.matchType ? matchTypeLabel[match.matchType] ?? match.matchType : '경기 유형 확인 중'}</p>
          <h3 className="mt-1 text-base font-bold">{match.myScore == null || match.opponentScore == null ? '점수 입력 대기' : `${match.myScore} : ${match.opponentScore}`}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${match.result === 'WIN' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>{resultLabel[match.result]}</span>
      </div>
      <div className="mt-2 space-y-1 text-xs">
        <p><span className="text-muted-foreground">파트너</span> <strong>{match.partner ?? '확인 중'}</strong></p>
        <p><span className="text-muted-foreground">상대</span> <strong>{match.opponents.join(' · ') || '확인 중'}</strong></p>
        <p><span className="text-muted-foreground">상태</span> <strong>{statusLabel[match.status] ?? match.status}</strong></p>
      </div>
    </article>
  );
}

function formatDelta(value?: number | null) {
  if (value == null) return '결과 입력 후 표시';
  if (value > 0) return `+${value}`;
  return String(value);
}

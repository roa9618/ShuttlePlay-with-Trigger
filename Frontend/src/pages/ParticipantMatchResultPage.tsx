import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Medal, ShieldAlert, Swords } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ApiClientError } from '../utils/apiClient';
import { setAuthRedirectPath } from '../utils/authSession';
import { sessionEntryApi, type SessionParticipantCurrentMatch } from '../utils/sessionEntryApi';
import { sessionPath } from '../utils/publicId';
import { connectSessionEntrySocket } from '../utils/sessionEntrySocket';

type ResultValue = 'WIN' | 'LOSS';

const matchTypeLabel: Record<string, string> = { MENS_DOUBLES: '남복', WOMENS_DOUBLES: '여복', MIXED_DOUBLES: '혼복', ANY: '자유 매칭' };

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

export default function ParticipantMatchResultPage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const isDemo = sessionId === 'demo';
  const id = sessionId ?? '';
  const navigate = useNavigate();
  const stateData = (location.state as { currentMatch?: SessionParticipantCurrentMatch } | null)?.currentMatch ?? null;
  const [data, setData] = useState<SessionParticipantCurrentMatch | null>(stateData);
  const [result, setResult] = useState<ResultValue | null>(null);
  const [myScore, setMyScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [completedByOther, setCompletedByOther] = useState(false);

  const load = useCallback(async (force = false) => {
    if (stateData && !force) return;
    if (isDemo) { setData(demoCurrentMatch()); return; }
    if (!id) return;
    try {
      const next = await sessionEntryApi.currentMatch(id);
      setData(next);
      if (!next.currentMatch && next.playStatus !== 'PLAYING') {
        setCompletedByOther(true);
        window.setTimeout(() => navigate(sessionPath(id, '/status')), 800);
      }
      setError('');
    } catch (errorValue) {
      if (errorValue instanceof ApiClientError && errorValue.status === 401) {
        const path = sessionPath(id, '/match-result');
        setAuthRedirectPath(path);
        navigate(`/login?redirect=${encodeURIComponent(path)}`);
        return;
      }
      setError('현재 경기 정보를 확인하지 못했어요. 참가자 현황에서 다시 확인해 주세요.');
    }
  }, [id, isDemo, navigate, stateData]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!data?.groupId || !data.sessionId || isDemo) return undefined;
    return connectSessionEntrySocket(data.groupId, data.sessionId, () => load(true));
  }, [data?.groupId, data?.sessionId, isDemo, load]);

  const match = data?.currentMatch;
  const canSubmit = !!result && !busy;
  const scoreGuide = useMemo(() => {
    if (!result) return '먼저 경기 결과를 선택해 주세요.';
    if (!myScore && !opponentScore) return '점수는 입력하지 않아도 저장할 수 있어요.';
    const mine = Number(myScore);
    const opponent = Number(opponentScore);
    if (!Number.isFinite(mine) || !Number.isFinite(opponent)) return '점수는 숫자로 입력해 주세요.';
    if (mine === opponent) return '동점은 저장할 수 없어요.';
    if (result === 'WIN' && mine <= opponent) return '승리를 선택했다면 내 팀 점수가 더 높아야 해요.';
    if (result === 'LOSS' && mine >= opponent) return '패배를 선택했다면 상대 팀 점수가 더 높아야 해요.';
    return '입력한 점수로 저장할게요.';
  }, [myScore, opponentScore, result]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!data || !result) return;
    if ((myScore || opponentScore) && scoreGuide !== '입력한 점수로 저장할게요.') {
      setMessage(scoreGuide);
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      if (isDemo) {
        setMessage('결과가 저장됐어요. 참가자 현황으로 돌아갈게요.');
        window.setTimeout(() => navigate('/sessions/demo/status'), 500);
        return;
      }
      const matchId = match?.matchId;
      if (!matchId) {
        setMessage('현재 경기 정보를 다시 확인해 주세요.');
        return;
      }
      const response = await sessionEntryApi.submitMatchResult(id, {
        matchId,
        result,
        myScore: myScore ? Number(myScore) : null,
        opponentScore: opponentScore ? Number(opponentScore) : null,
      });
      if (response.resultAlreadySubmitted) {
        setCompletedByOther(true);
        setMessage('이미 다른 참가자가 결과를 입력했어요. 참가자 현황으로 돌아갈게요.');
        window.setTimeout(() => navigate(sessionPath(id, '/status')), 700);
        return;
      }
      navigate(sessionPath(id, '/status'));
    } catch {
      setMessage('결과를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return <Shell><section className="w-full rounded-3xl border-2 border-destructive/20 bg-card p-6 text-center shadow-lg"><ShieldAlert className="mx-auto h-12 w-12 text-destructive" /><h1 className="mt-4 text-2xl font-bold">확인이 필요해요</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p><Button className="mt-5 h-14 w-full rounded-2xl text-base font-bold" onClick={() => navigate(sessionPath(sessionId ?? id, '/status'))}>참가자 현황으로 돌아가기</Button></section></Shell>;
  }
  if (!data) return <Shell><p className="text-center text-muted-foreground">결과 입력 정보를 확인하고 있어요.</p></Shell>;

  return (
    <Shell>
      <form onSubmit={submit} className="w-full rounded-3xl border-2 border-primary/20 bg-card p-5 text-center shadow-xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary"><Medal className="h-8 w-8" /></span>
        <p className="mt-4 text-sm font-bold text-primary">{data.groupName}</p>
        <h1 className="mt-1 text-3xl font-black tracking-[-0.03em]">경기 결과 입력</h1>
        <p className="mt-2 text-base leading-7 text-muted-foreground">방금 끝난 경기의 승패를 선택해 주세요.</p>

        <div className="mt-4 rounded-[28px] bg-secondary/60 p-4 text-left">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">현재 경기</p>
              <strong className="mt-1 block text-lg">{match?.court ? `${match.court}번 코트` : '코트 확인 중'} · {match?.matchType ? matchTypeLabel[match.matchType] ?? match.matchType : '경기 유형 확인 중'}</strong>
            </div>
            <Swords className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-3 text-sm font-semibold">내 팀: 나{match?.partner ? ` · ${match.partner}` : ''}</p>
          <p className="mt-1 text-sm text-muted-foreground">상대 팀: {match?.opponents?.join(' · ') || '확인 중'}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button type="button" className={resultButton(result === 'WIN', 'win')} onClick={() => setResult('WIN')}>우리 팀 승리</button>
          <button type="button" className={resultButton(result === 'LOSS', 'loss')} onClick={() => setResult('LOSS')}>상대 팀 승리</button>
        </div>

        <div className="mt-4 rounded-[24px] border border-border bg-card p-4 text-left">
          <p className="text-sm font-bold">점수 입력</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">점수는 선택 입력이에요. 입력하면 오늘 기록에 점수가 같이 표시돼요.</p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <label className="text-sm font-semibold">내 팀 점수<Input inputMode="numeric" type="number" min={0} className="mt-2 h-12 rounded-2xl text-center text-lg font-bold" value={myScore} onChange={event => setMyScore(event.target.value)} placeholder="21" /></label>
            <label className="text-sm font-semibold">상대 점수<Input inputMode="numeric" type="number" min={0} className="mt-2 h-12 rounded-2xl text-center text-lg font-bold" value={opponentScore} onChange={event => setOpponentScore(event.target.value)} placeholder="19" /></label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{scoreGuide}</p>
        </div>

        {message && <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">{message}</div>}
        {completedByOther && !message && <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">이미 결과가 입력됐어요. 참가자 현황으로 돌아갈게요.</div>}

        <div className="mt-5 grid gap-2.5">
          <Button type="submit" className="h-16 w-full rounded-2xl text-lg font-bold" disabled={!canSubmit || completedByOther}>{busy ? '저장 중' : '결과 저장하기'}</Button>
          <Button type="button" variant="outline" className="h-14 w-full rounded-2xl text-base font-bold hover:border-border hover:bg-secondary hover:text-foreground" onClick={() => navigate(sessionPath(sessionId ?? id, '/current-match'))}>현재 경기로 돌아가기</Button>
        </div>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-background"><main className="mx-auto flex min-h-dvh w-full max-w-lg items-center px-4 py-3">{children}</main></div>;
}

function resultButton(selected: boolean, tone: 'win' | 'loss') {
  const selectedTone = tone === 'win' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-rose-500 bg-rose-50 text-rose-700';
  return [
    'h-16 rounded-2xl border-2 bg-card text-base font-black transition-colors hover:border-primary hover:bg-primary/5',
    selected ? selectedTone : 'border-border text-foreground',
  ].join(' ');
}

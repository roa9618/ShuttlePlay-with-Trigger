import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Ban, CheckCircle2, Clock3, Play, RefreshCw, XCircle } from 'lucide-react';
import SessionOperationShell from '../components/SessionOperationShell';
import { OperationToast } from '../components/OperationControls';
import { Button } from '../components/ui/button';
import { sessionOperationApi, type MatchResponse } from '../utils/sessionOperationApi';
import { encodePublicId, sessionPath } from '../utils/publicId';
import { operationStyles as s } from './SessionOperation.styles';
import { useSessionOperationRealtime } from '../utils/useSessionOperationRealtime';

export default function CurrentMatchesPage() {
  const { sessionId = 'demo' } = useParams();
  const [data, setData] = useState<MatchResponse | null>(null);
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => setData(await sessionOperationApi.matches(sessionId)), [sessionId]);
  useEffect(() => { void load(); }, [load]);
  useSessionOperationRealtime(sessionId, data?.groupId, data?.sessionId, load);

  const start = async (matchId: number) => {
    await sessionOperationApi.startMatch(sessionId, matchId);
    setNotice('경기 중 상태로 변경했어요.');
    await load();
  };

  const cancel = async (matchId: number) => { await sessionOperationApi.cancelMatch(sessionId, matchId, '운영자 경기 취소'); setNotice('경기를 취소하고 다음 후보를 확인했어요.'); await load(); };
  const toggleCourt = async (court: number) => { if (!data) return; const disabled = data.disabledCourtNumbers.includes(court); await sessionOperationApi.updateCourts(sessionId, disabled ? data.disabledCourtNumbers.filter(item => item !== court) : [...data.disabledCourtNumbers, court]); setNotice(disabled ? `${court}번 코트를 다시 사용해요.` : `${court}번 코트를 사용 중지했어요.`); await load(); };
  return <SessionOperationShell title="현재 경기" description="코트별 진행 상태와 결과 입력을 한눈에 확인하세요." actions={<Button variant="outline" className={s.outlineButton} onClick={() => void load()}><RefreshCw className={s.iconSm} />새로고침</Button>}>
    {!data ? <div className={s.empty}>현재 경기를 불러오고 있어요.</div> : <div className={s.grid3}>
      {Array.from({ length: data.courtCount }, (_, index) => {
        const court = index + 1;
        const match = data.matches.find(item => item.courtNumber === court);
        const disabled = data.disabledCourtNumbers.includes(court);
        return <section key={court} className={s.card}>
          <div className={s.between}><h2 className="text-xl font-black">{court}번 코트</h2>{disabled ? <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">사용 중지</span> : match && <span className={`rounded-full px-3 py-1 text-sm font-bold ${match.status === 'CALLING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{match.status === 'CALLING' ? '입장 호출' : '경기 중'}</span>}</div>
          {disabled ? <div className="py-10 text-center"><Ban className="mx-auto h-8 w-8 text-red-500" /><p className="mt-3 font-bold text-muted-foreground">사용하지 않는 코트예요.</p><Button variant="outline" className="mt-4 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700" onClick={() => void toggleCourt(court)}>다시 사용</Button></div> : !match ? <div className="py-10 text-center font-bold text-muted-foreground">비어 있는 코트<Button variant="outline" className="mx-auto mt-4 flex border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700" onClick={() => void toggleCourt(court)}><Ban className={s.iconSm} />사용 중지</Button></div> : <>
            <div className="mt-4 space-y-3">
              <div className={s.teamBox}><p className={s.teamTitle}>A팀</p>{match.teams[0]?.players.map(player => <div key={player.attendanceId} className={s.player}><span>{player.name}</span><small>{player.grade}</small></div>)}</div>
              <p className="text-center font-black text-muted-foreground">VS</p>
              <div className={s.teamBox}><p className={s.teamTitle}>B팀</p>{match.teams[1]?.players.map(player => <div key={player.attendanceId} className={s.player}><span>{player.name}</span><small>{player.grade}</small></div>)}</div>
              <p className="flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground"><Clock3 className={s.iconSm} />{new Date(match.startedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 시작</p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {match.status === 'CALLING' && <Button variant="outline" className={`${s.outlineButton} col-span-2`} onClick={() => void start(match.matchId)}><Play className={s.iconSm} />즉시 시작</Button>}
              {match.status === 'PLAYING' && <Link className="col-span-2" to={`${sessionPath(sessionId, '/result/new')}?matchId=${encodePublicId(match.matchId)}`}><Button className={`${s.primaryButton} w-full`}><CheckCircle2 className={s.iconSm} />결과 입력</Button></Link>}<Button variant="outline" className={s.dangerButton} onClick={() => void cancel(match.matchId)}><XCircle className={s.iconSm} />취소</Button>
            </div>
          </>}
        </section>;
      })}
    </div>}
    <OperationToast message={notice} />
  </SessionOperationShell>;
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Save } from 'lucide-react';
import SessionOperationShell from '../components/SessionOperationShell';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { sessionOperationApi, type OperationMatch } from '../utils/sessionOperationApi';
import { decodePublicId, sessionPath } from '../utils/publicId';
import { operationStyles as s } from './SessionOperation.styles';

export default function MatchResultEditPage() {
  const { sessionId = 'demo', matchId = '' } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<OperationMatch | null>(null);
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [reason, setReason] = useState(''); const [error, setError] = useState('');
  const [scoreEntered, setScoreEntered] = useState(true);
  useEffect(() => { void sessionOperationApi.report(sessionId).then(data => { const item = data.matches.find(candidate => candidate.matchId === Number(decodePublicId(matchId))) ?? data.matches[0] ?? null; setMatch(item); if (item) { setA(String(item.teamAScore)); setB(String(item.teamBScore)); setScoreEntered(item.scoreEntered !== false); } }); }, [matchId, sessionId]);
  const save = async () => { if (!match || !reason.trim() || Number(a) === Number(b)) { setError('서로 다른 점수와 수정 사유를 입력해 주세요.'); return; } const winnerA = Number(a) > Number(b); await sessionOperationApi.updateResult(sessionId, match.matchId, { teamAScore: scoreEntered ? Number(a) : winnerA ? 1 : 0, teamBScore: scoreEntered ? Number(b) : winnerA ? 0 : 1, scoreEntered, reason: reason.trim() }); navigate(sessionPath(sessionId, '/report'), { replace: true }); };

  return <SessionOperationShell title="경기 결과 수정" description="수정 전 기록은 보존되고 MMR과 오늘 기록이 다시 계산됩니다.">
    <div className="mx-auto max-w-4xl space-y-5">{!match ? <div className={s.empty}>경기 결과를 불러오고 있어요.</div> : <>
      <div className={s.alert}><AlertTriangle className={s.icon} />결과 수정은 참가자 4명의 승패, 득실점, MMR과 일정 리포트에 모두 반영돼요.</div>
      <section className={s.card}>
        <h2 className={s.sectionTitle}>{match.courtNumber}번 코트 기존 결과</h2>
        <div className="mt-4 grid grid-cols-2 gap-4"><div className={s.teamBox}><p className={s.teamTitle}>A팀 · 기존 {match.teamAScore}점</p>{match.teams[0]?.players.map(player => <strong className="block py-1" key={player.attendanceId}>{player.name}</strong>)}</div><div className={s.teamBox}><p className={s.teamTitle}>B팀 · 기존 {match.teamBScore}점</p>{match.teams[1]?.players.map(player => <strong className="block py-1" key={player.attendanceId}>{player.name}</strong>)}</div></div>
        <div className={s.divider} />
        <div className="grid grid-cols-2 gap-4"><label><span className={s.label}>변경할 A팀 점수</span><Input className={s.input} value={a} onChange={event => setA(event.target.value.replace(/\D/g, ''))} /></label><label><span className={s.label}>변경할 B팀 점수</span><Input className={s.input} value={b} onChange={event => setB(event.target.value.replace(/\D/g, ''))} /></label></div>
        <label className="mt-4 flex items-center gap-3 rounded-xl bg-secondary/60 px-4 py-3 font-bold"><input type="checkbox" checked={scoreEntered} onChange={event => setScoreEntered(event.target.checked)} />점수까지 기록하기</label>
        <label className="mt-4 block"><span className={s.label}>수정 사유</span><Input className={s.input} value={reason} onChange={event => setReason(event.target.value)} placeholder="예: 점수 오입력 수정" /></label>
        {error && <p className="mt-4 font-bold text-red-600">{error}</p>}
        <Button className={`${s.primaryButton} mt-6 w-full`} onClick={() => void save()}><Save className={s.icon} />수정 저장 및 기록 재계산</Button>
        {match.resultHistory && match.resultHistory.length > 0 && <div className="mt-6 border-t border-border pt-5"><h3 className={s.sectionTitle}>수정 이력</h3>{match.resultHistory.map((item, index) => <p key={`${item.modifiedAt}-${index}`} className="mt-2 rounded-xl bg-secondary/60 px-4 py-3 text-sm"><strong>{item.previousScore} → {item.newScore}</strong> · {item.reason} · {item.modifiedBy}</p>)}</div>}
      </section>
    </>}</div>
  </SessionOperationShell>;
}

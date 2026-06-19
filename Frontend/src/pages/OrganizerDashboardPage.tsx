import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, QrCode, RefreshCw, Sparkles, X } from 'lucide-react';
import SessionOperationShell from '../components/SessionOperationShell';
import { Button } from '../components/ui/button';
import { sessionOperationApi, type DashboardResponse, isDemoSession } from '../utils/sessionOperationApi';
import { connectSessionEntrySocket } from '../utils/sessionEntrySocket';
import { operationStyles as s } from './SessionOperation.styles';
import { createSessionEntryUrl, generateSessionEntryQrDataUrl } from '../utils/sessionEntryQr';
import { sessionPath } from '../utils/publicId';

const statusLabels: Record<string, string> = { WAITING: '경기 대기', AVAILABLE: '경기 가능', NEXT_UP: '다음 경기 예정', CALLING: '입장 호출', PLAYING: '경기 중', RESTING: '휴식 중', LEFT: '조기 퇴장', ABSENT: '불참' };
const genderLabels: Record<string, string> = { MALE: '남성', FEMALE: '여성' };
const ageLabels: Record<string, string> = { TEENS: '10대', TWENTIES: '20대', THIRTIES: '30대', FORTIES: '40대', FIFTIES: '50대', SIXTIES_AND_ABOVE: '60대 이상' };
const statItems = [['attendanceCount', '출석'], ['availableCount', '경기 가능'], ['nextUpCount', '다음 경기'], ['playingCount', '경기 중'], ['restingCount', '휴식'], ['queueCount', '후보 큐']] as const;

export default function OrganizerDashboardPage() {
  const { sessionId = 'demo' } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [qrOpen, setQrOpen] = useState(false);
  const [connected, setConnected] = useState(isDemoSession(sessionId));
  const socketGroupId = data?.groupId;
  const socketSessionId = data?.sessionId;
  const load = useCallback(async () => { try { setData(await sessionOperationApi.dashboard(sessionId)); setError(''); } catch { setError('운영 현황을 불러오지 못했어요.'); } }, [sessionId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (!data?.entryCode) return; void generateSessionEntryQrDataUrl(createSessionEntryUrl(data.sessionId, data.entryCode)).then(setQrUrl); }, [data?.entryCode, data?.sessionId]);
  useEffect(() => { if (!socketGroupId || !socketSessionId || isDemoSession(sessionId)) return; return connectSessionEntrySocket(socketGroupId, socketSessionId, load, setConnected); }, [load, sessionId, socketGroupId, socketSessionId]);
  const actions = <><Button variant="outline" className={s.outlineButton} onClick={() => void load()}><RefreshCw className={s.iconSm} />새로고침</Button><Link to={sessionPath(sessionId, '/queue')}><Button className={s.primaryButton}><Sparkles className={s.iconSm} />자동 매칭</Button></Link></>;
  const closeSession = async () => { if (!window.confirm('진행 중인 경기가 없을 때만 일정을 종료할 수 있어요. 종료할까요?')) return; try { await sessionOperationApi.close(sessionId); navigate(sessionPath(sessionId, '/report')); } catch { setError('진행 중이거나 입장 호출 중인 경기를 먼저 정리해 주세요.'); } };
  return <SessionOperationShell title="운영자 대시보드" description="현재 필요한 조작만 한 화면에서 확인하세요." actions={actions}>
    {error && <div className={s.alert}><AlertTriangle className={s.icon} />{error}</div>}
    {!data ? <div className={s.empty}>운영 현황을 불러오고 있어요.</div> : <div className={s.stack}>
      <section className={s.card}><div className={s.between}><div><h2 className={s.sectionTitle}>{data.groupName} · {data.title}</h2><p className={s.sectionDescription}>{new Date(data.startsAt).toLocaleString('ko-KR')} · {data.place} · {data.courtCount}코트</p></div><div className={s.row}><Button variant="outline" className={s.outlineButton} onClick={() => setQrOpen(true)}><QrCode className={s.iconSm} />QR·참여 코드</Button><Button variant="outline" className={s.dangerButton} onClick={() => void closeSession()}>일정 종료</Button><span className={`text-sm font-bold ${connected ? 'text-emerald-600' : 'text-red-600'}`}>● {connected ? '실시간 연결 중' : '연결 불안정 · 새로고침 필요'}</span></div></div></section>
      <section className={s.stats}>{statItems.map(([key, label]) => <div className={s.stat} key={key}><p className={s.statLabel}>{label}</p><strong className={s.statValue}>{data.summary[key] ?? 0}</strong></div>)}</section>
      {data.alerts.map(alert => <div key={alert} className={s.alert}><AlertTriangle className={s.icon} />{alert}</div>)}
      <section className={s.grid2}>
        <div className={s.card}><div className={s.between}><h2 className={s.sectionTitle}>현재 경기</h2><Link className="font-bold text-primary" to={sessionPath(sessionId, '/current')}>전체 보기</Link></div><div className="mt-4 space-y-3">{data.currentMatches.length ? data.currentMatches.map(match => <div key={match.matchId} className="rounded-xl border border-border p-4"><div className={s.between}><strong>{match.courtNumber}번 코트</strong><span className="font-bold text-primary">{statusLabels[match.status] ?? match.status}</span></div><p className="mt-2 text-sm font-bold">{match.teams[0]?.players.map(player => player.name).join(' · ')} <span className="mx-2 text-muted-foreground">VS</span> {match.teams[1]?.players.map(player => player.name).join(' · ')}</p></div>) : <div className={s.empty}>현재 진행 중인 경기가 없어요.</div>}</div></div>
        <div className={s.card}><div className={s.between}><h2 className={s.sectionTitle}>다음 경기 후보</h2><Link className="font-bold text-primary" to={sessionPath(sessionId, '/queue')}>후보 관리</Link></div><div className="mt-4 space-y-3">{data.queues.length ? data.queues.map(queue => <div key={queue.queueId} className="rounded-xl bg-secondary/60 p-4"><div className={s.between}><strong>후보 {queue.queueOrder}</strong><span className="text-sm font-bold">품질 {queue.score ?? '-'}</span></div><p className="mt-2 text-sm font-bold">{queue.teams[0]?.players.map(player => player.name).join(' · ')} <span className="mx-2 text-muted-foreground">VS</span> {queue.teams[1]?.players.map(player => player.name).join(' · ')}</p></div>) : <div className={s.empty}>후보가 없어요. 자동 매칭을 생성해 주세요.</div>}</div></div>
      </section>
      <section className={s.card}><div className={s.between}><h2 className={s.sectionTitle}>참가자 현황</h2><Link className="font-bold text-primary" to={sessionPath(sessionId, '/participants')}>참가자 관리</Link></div><div className="mt-4 grid grid-cols-5 gap-2">{data.participants.map(item => <div key={item.attendanceId} className="rounded-xl border border-border px-3 py-3"><div className={s.between}><strong>{item.name}</strong><span className="text-xs font-bold text-primary">{statusLabels[item.playStatus] ?? item.playStatus}</span></div><p className="mt-1 text-sm text-muted-foreground">{genderLabels[item.gender] ?? item.gender} · {ageLabels[item.ageGroup] ?? item.ageGroup} · {item.grade}급</p><p className="mt-1 text-sm text-muted-foreground">{item.games}경기 · 휴식 {item.consecutiveRestCount}회</p></div>)}</div></section>
    </div>}
    {data && qrOpen && <div className={s.modalBackdrop}><div className={`${s.modal} max-w-md text-center`}><div className={s.between}><h2 className={s.modalTitle}>QR·참여 코드</h2><button aria-label="닫기" onClick={() => setQrOpen(false)}><X /></button></div>{qrUrl && <img className="mx-auto mt-5 h-56 w-56 rounded-2xl" src={qrUrl} alt="일정 참여 QR 코드" />}<p className="mt-4 text-3xl font-black tracking-[0.2em] text-primary">{data.entryCode ?? '-'}</p></div></div>}
  </SessionOperationShell>;
}

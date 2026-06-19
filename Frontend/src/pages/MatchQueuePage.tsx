import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Edit3, ListPlus, Play, RefreshCw, Sparkles, Trash2, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import SessionOperationShell from '../components/SessionOperationShell';
import { OperationSelect, OperationToast } from '../components/OperationControls';
import { Button } from '../components/ui/button';
import { sessionOperationApi, type OperationQueue, type QueueResponse } from '../utils/sessionOperationApi';
import { useSessionOperationRealtime } from '../utils/useSessionOperationRealtime';
import { operationStyles as s } from './SessionOperation.styles';

const typeLabels: Record<string, string> = { ANY: '성별 무관', MENS_DOUBLES: '남자 복식', WOMENS_DOUBLES: '여자 복식', MIXED_DOUBLES: '혼합 복식' };
const playLabels: Record<string, string> = { WAITING: '경기 대기', AVAILABLE: '경기 가능', NEXT_UP: '다음 경기 예정', CALLING: '입장 호출', PLAYING: '경기 중' };
const genderLabels: Record<string, string> = { MALE: '남성', FEMALE: '여성' };
const ageLabels: Record<string, string> = { TEENS: '10대', TWENTIES: '20대', THIRTIES: '30대', FORTIES: '40대', FIFTIES: '50대', SIXTIES_AND_ABOVE: '60대 이상' };
const typeOptions = Object.entries(typeLabels).map(([value, label]) => ({ value, label }));
const styleOptions = [{ value: 'FUN', label: '즐겜 · 참여 균형' }, { value: 'COMPETITIVE', label: '빡겜 · 실력 균형' }];

export default function MatchQueuePage() {
  const { sessionId = 'demo' } = useParams();
  const [data, setData] = useState<QueueResponse | null>(null);
  const [matchType, setMatchType] = useState('ANY');
  const [playStyle, setPlayStyle] = useState('FUN');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<OperationQueue | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [forcedPlayers, setForcedPlayers] = useState<number[]>([]);
  const [excludedPlayers, setExcludedPlayers] = useState<number[]>([]);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualPlayers, setManualPlayers] = useState(['', '', '', '']);
  const [manualType, setManualType] = useState('ANY');
  const [manualStyle, setManualStyle] = useState('FUN');
  const load = useCallback(async () => setData(await sessionOperationApi.queues(sessionId)), [sessionId]);
  useEffect(() => { void load(); }, [load]);
  useSessionOperationRealtime(sessionId, data?.groupId, data?.sessionId, load);

  const participantLabel = (id: number) => {
    const item = data?.participants.find(participant => participant.attendanceId === id);
    return item ? `${item.name} · ${genderLabels[item.gender] ?? item.gender} · ${ageLabels[item.ageGroup] ?? item.ageGroup} · ${item.grade}급` : String(id);
  };
  const participantOptions = data?.participants.map(item => ({ value: String(item.attendanceId), label: participantLabel(item.attendanceId) })) ?? [];
  const generate = async () => {
    const result = await sessionOperationApi.generate(sessionId, { matchType, playStyle, courtCount: data?.courtCount ?? 1, preservedQueueIds: data?.queues.map(item => item.queueId) ?? [], forcedParticipantIds: forcedPlayers, excludedParticipantIds: excludedPlayers });
    setNotice(result.message); await load();
  };
  const createManual = async () => {
    const ids = manualPlayers.map(Number);
    if (ids.some(id => !id) || new Set(ids).size !== 4) { setNotice('서로 다른 참가자 네 명을 선택해 주세요.'); return; }
    try {
      await sessionOperationApi.createManualQueue(sessionId, { teamAIds: ids.slice(0, 2), teamBIds: ids.slice(2), matchType: manualType, playStyle: manualStyle });
      setManualOpen(false); setManualPlayers(['', '', '', '']); setNotice('수동 매칭을 경기 후보 큐에 추가했어요.'); await load();
    } catch { setNotice('선택한 경기 유형과 참가자의 성별 또는 상태를 확인해 주세요.'); }
  };
  const assignEmptyCourts = async () => {
    try { const result = await sessionOperationApi.assignEmptyCourts(sessionId); setNotice(result.message); await load(); }
    catch { setNotice('빈 코트와 호출 가능한 경기 후보를 다시 확인해 주세요.'); }
  };
  const cancel = async (queueId: number) => { await sessionOperationApi.cancelQueue(sessionId, queueId); setNotice('경기 후보를 취소했어요.'); await load(); };
  const openEdit = (queue: OperationQueue) => { setEditing(queue); setSelectedPlayers(queue.teams.flatMap(team => team.players.map(player => player.attendanceId))); };
  const saveEdit = async () => {
    if (!editing || new Set(selectedPlayers).size !== 4) { setNotice('서로 다른 참가자 네 명을 선택해 주세요.'); return; }
    try { await sessionOperationApi.updateQueue(sessionId, editing.queueId, { teamAIds: selectedPlayers.slice(0, 2), teamBIds: selectedPlayers.slice(2, 4) }); setEditing(null); setNotice('후보 참가자 구성을 변경했어요.'); await load(); }
    catch { setNotice('경기 유형과 참가자의 성별 또는 상태를 확인해 주세요.'); }
  };
  const reorder = async (queue: OperationQueue, direction: -1 | 1) => { await sessionOperationApi.reorderQueue(sessionId, queue.queueId, Math.max(1, queue.queueOrder + direction)); await load(); };

  return <SessionOperationShell title="경기 후보 큐" description="자동 또는 수동으로 경기를 구성하고, 빈 코트에는 호출 가능한 후보가 순서대로 배정돼요." actions={<><Button className={s.primaryButton} onClick={() => void assignEmptyCourts()}><Play className={s.iconSm} />빈 코트 경기 배정</Button><Button variant="outline" className={s.outlineButton} onClick={() => void load()}><RefreshCw className={s.iconSm} />새로고침</Button></>}>
    {!data ? <div className={s.empty}>경기 후보를 불러오고 있어요.</div> : <div className={s.stack}>
      <section className={s.card}><div className="grid grid-cols-[1fr_1fr_auto_auto] items-end gap-4"><label><span className={s.label}>경기 유형</span><OperationSelect value={matchType} onValueChange={setMatchType} options={typeOptions} /></label><label><span className={s.label}>운영 방식</span><OperationSelect value={playStyle} onValueChange={setPlayStyle} options={styleOptions} /></label><Button className={s.primaryButton} onClick={() => void generate()}><Sparkles className={s.iconSm} />자동 매칭 생성</Button><Button variant="outline" className={s.outlineButton} onClick={() => setManualOpen(true)}><ListPlus className={s.iconSm} />수동 매칭 생성</Button></div><div className="mt-4 grid grid-cols-2 gap-4"><label><span className={s.label}>가능한 한 우선 포함</span><select multiple className="h-28 w-full rounded-xl border border-border bg-background p-2 text-sm font-semibold focus:border-primary focus:outline-none" value={forcedPlayers.map(String)} onChange={event => setForcedPlayers(Array.from(event.target.selectedOptions, option => Number(option.value)).filter(id => !excludedPlayers.includes(id)))}>{data.participants.map(item => <option key={item.attendanceId} value={item.attendanceId}>{participantLabel(item.attendanceId)} · {item.games}경기 · 휴식 {item.consecutiveRestCount}회</option>)}</select></label><label><span className={s.label}>이번 자동 매칭에서 제외</span><select multiple className="h-28 w-full rounded-xl border border-border bg-background p-2 text-sm font-semibold focus:border-primary focus:outline-none" value={excludedPlayers.map(String)} onChange={event => setExcludedPlayers(Array.from(event.target.selectedOptions, option => Number(option.value)).filter(id => !forcedPlayers.includes(id)))}>{data.participants.map(item => <option key={item.attendanceId} value={item.attendanceId}>{participantLabel(item.attendanceId)} · {playLabels[item.playStatus] ?? item.playStatus}</option>)}</select></label></div><p className="mt-3 text-sm font-bold text-muted-foreground">경기 중이거나 다음 경기 예정인 참가자도 후속 후보에 포함할 수 있어요. 실제 호출할 때 겹치면 다음 가능한 후보를 먼저 올립니다.</p></section>
      {data.queues.length < data.courtCount && <div className={s.alert}><AlertTriangle className={s.icon} />코트 수보다 경기 후보가 적어요. 후보를 추가해 주세요.</div>}
      {data.queues.length ? data.queues.map(queue => <section key={queue.queueId} className={s.card}><div className={s.between}><div className={s.row}><span className="rounded-full bg-primary px-3 py-1 text-sm font-black text-primary-foreground">후보 {queue.queueOrder}</span><button aria-label="순서 올리기" onClick={() => void reorder(queue, -1)}><ChevronUp className={s.iconSm} /></button><button aria-label="순서 내리기" onClick={() => void reorder(queue, 1)}><ChevronDown className={s.iconSm} /></button><strong>{typeLabels[queue.matchType] ?? queue.matchType}</strong><span className="text-sm font-bold text-muted-foreground">품질 {queue.score ?? '-'}</span></div><div className={s.row}><Button variant="outline" className={s.outlineButton} onClick={() => openEdit(queue)}><Edit3 className={s.iconSm} />참가자 교체</Button><Button variant="outline" className={s.dangerButton} onClick={() => void cancel(queue.queueId)}><Trash2 className={s.iconSm} />취소</Button></div></div><div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4"><div className={s.teamBox}><p className={s.teamTitle}>A팀</p>{queue.teams[0]?.players.map(player => <div className={s.player} key={player.attendanceId}><span>{player.name}</span><small>{player.grade}급</small></div>)}</div><strong className="text-muted-foreground">VS</strong><div className={s.teamBox}><p className={s.teamTitle}>B팀</p>{queue.teams[1]?.players.map(player => <div className={s.player} key={player.attendanceId}><span>{player.name}</span><small>{player.grade}급</small></div>)}</div></div><div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"><strong>매칭 설명</strong>{queue.explanations?.map(text => <p className="mt-1 text-sm text-muted-foreground" key={text}>• {text}</p>)}</div></section>) : <div className={s.empty}>생성된 후보가 없어요.</div>}
    </div>}
    {manualOpen && data && <div className={s.modalBackdrop}><div className={s.modal}><div className={s.between}><div><h2 className={s.modalTitle}>수동 매칭 생성</h2><p className={s.sectionDescription}>직접 구성한 경기도 동일하게 후보 큐의 마지막 순서에 추가돼요.</p></div><button aria-label="닫기" onClick={() => setManualOpen(false)}><X /></button></div><div className="mt-5 grid grid-cols-2 gap-3">{manualPlayers.map((value, index) => <label key={index}><span className={s.label}>{index < 2 ? `A팀 ${index + 1}` : `B팀 ${index - 1}`}</span><OperationSelect value={value || undefined} placeholder="참가자 선택" options={participantOptions} onValueChange={next => setManualPlayers(current => current.map((item, itemIndex) => itemIndex === index ? next : item))} /></label>)}</div><div className="mt-4 grid grid-cols-2 gap-3"><label><span className={s.label}>경기 유형</span><OperationSelect value={manualType} options={typeOptions} onValueChange={setManualType} /></label><label><span className={s.label}>운영 방식</span><OperationSelect value={manualStyle} options={styleOptions} onValueChange={setManualStyle} /></label></div><Button className={`${s.primaryButton} mt-6 w-full`} onClick={() => void createManual()}>후보 큐에 추가</Button></div></div>}
    {editing && data && <div className={s.modalBackdrop}><div className={s.modal}><div className={s.between}><div><h2 className={s.modalTitle}>후보 참가자 교체</h2><p className={s.sectionDescription}>위에서부터 A팀 2명, B팀 2명이에요.</p></div><button aria-label="닫기" onClick={() => setEditing(null)}><X /></button></div><div className="mt-5 grid grid-cols-2 gap-3">{[0, 1, 2, 3].map(index => <label key={index}><span className={s.label}>{index < 2 ? `A팀 ${index + 1}` : `B팀 ${index - 1}`}</span><OperationSelect value={String(selectedPlayers[index] ?? '') || undefined} placeholder="참가자 선택" options={participantOptions} onValueChange={next => setSelectedPlayers(current => current.map((value, itemIndex) => itemIndex === index ? Number(next) : value))} /></label>)}</div><Button className={`${s.primaryButton} mt-6 w-full`} onClick={() => void saveEdit()}>변경 저장</Button></div></div>}
    <OperationToast message={notice} />
  </SessionOperationShell>;
}

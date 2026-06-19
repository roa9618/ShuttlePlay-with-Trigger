import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, CopyPlus, Edit3, ListPlus, Play, RefreshCw, Sparkles, Trash2, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import SessionOperationShell from '../components/SessionOperationShell';
import { OperationSelect, OperationToast } from '../components/OperationControls';
import { Button } from '../components/ui/button';
import { sessionOperationApi, type OperationQueue, type QueueResponse } from '../utils/sessionOperationApi';
import { useSessionOperationRealtime } from '../utils/useSessionOperationRealtime';
import { operationStyles as s } from './SessionOperation.styles';

const typeLabels: Record<string, string> = { ANY: '성별 무관', SAME_GENDER_DOUBLES: '동일 성별 복식', MENS_DOUBLES: '남자 복식', WOMENS_DOUBLES: '여자 복식', MIXED_DOUBLES: '혼합 복식' };
const genderLabels: Record<string, string> = { MALE: '남성', FEMALE: '여성' };
const ageLabels: Record<string, string> = { TEENS: '10대', TWENTIES: '20대', THIRTIES: '30대', FORTIES: '40대', FIFTIES: '50대', SIXTIES_AND_ABOVE: '60대 이상' };
const typeOptions = ['ANY', 'SAME_GENDER_DOUBLES', 'MIXED_DOUBLES'].map(value => ({ value, label: typeLabels[value] }));
const styleOptions = [{ value: 'FUN', label: '즐겜 · 참여 균형' }, { value: 'COMPETITIVE', label: '빡겜 · 실력 균형' }];
const affiliationOptions = [{ value: 'MIX_AFFILIATIONS', label: '소속 섞기' }, { value: 'SAME_AFFILIATION', label: '같은 소속 우선' }, { value: 'IGNORE', label: '소속 무관' }];

export default function MatchQueuePage() {
  const { sessionId = 'demo' } = useParams();
  const [data, setData] = useState<QueueResponse | null>(null);
  const [matchType, setMatchType] = useState('ANY');
  const [playStyle, setPlayStyle] = useState('FUN');
  const [targetGames, setTargetGames] = useState(1);
  const [affiliationStrategy, setAffiliationStrategy] = useState('MIX_AFFILIATIONS');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<OperationQueue | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [forcedPlayers, setForcedPlayers] = useState<number[]>([]);
  const [excludedPlayers, setExcludedPlayers] = useState<number[]>([]);
  const [planParticipantSearch, setPlanParticipantSearch] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [manualPlayers, setManualPlayers] = useState(['', '', '', '']);
  const [manualType, setManualType] = useState('ANY');
  const [manualStyle, setManualStyle] = useState('FUN');
  const [manualSearch, setManualSearch] = useState('');
  const load = useCallback(async () => setData(await sessionOperationApi.queues(sessionId)), [sessionId]);
  useEffect(() => { void load(); }, [load]);
  useSessionOperationRealtime(sessionId, data?.groupId, data?.sessionId, load);

  const participantLabel = (id: number) => {
    const item = data?.participants.find(participant => participant.attendanceId === id);
    return item ? `${item.name} · ${genderLabels[item.gender] ?? item.gender} · ${ageLabels[item.ageGroup] ?? item.ageGroup} · ${item.grade}급` : String(id);
  };
  const sortedParticipants = [...(data?.participants ?? [])].sort((left, right) => left.name.localeCompare(right.name, 'ko-KR') || left.attendanceId - right.attendanceId);
  const participantOptions = sortedParticipants.map(item => ({ value: String(item.attendanceId), label: participantLabel(item.attendanceId) }));
  const toggleForcedPlayer = (attendanceId: number) => {
    setForcedPlayers(current => current.includes(attendanceId) ? current.filter(id => id !== attendanceId) : [...current, attendanceId]);
    setExcludedPlayers(current => current.filter(id => id !== attendanceId));
  };
  const toggleExcludedPlayer = (attendanceId: number) => {
    setExcludedPlayers(current => current.includes(attendanceId) ? current.filter(id => id !== attendanceId) : [...current, attendanceId]);
    setForcedPlayers(current => current.filter(id => id !== attendanceId));
  };
  const generate = async () => {
    const result = await sessionOperationApi.generate(sessionId, { matchType, playStyle, affiliationStrategy, courtCount: data?.courtCount ?? 1, preservedQueueIds: data?.queues.map(item => item.queueId) ?? [], forcedParticipantIds: forcedPlayers, excludedParticipantIds: excludedPlayers });
    setNotice(result.message); await load();
  };
  const generatePlan = async () => {
    try {
      const result = await sessionOperationApi.generatePlan(sessionId, { matchType, playStyle, targetGamesPerParticipant: targetGames, affiliationStrategy, forcedParticipantIds: forcedPlayers, excludedParticipantIds: excludedPlayers });
      setNotice(`${result.message} 총 ${result.generatedCount}경기를 추가했어요.`); await load();
    } catch { setNotice('모든 참가자의 보장 경기 수를 채울 수 없습니다. 경기 가능한 참가자와 제외 설정을 확인해 주세요.'); }
  };
  const createManual = async (keepOpen = false) => {
    const ids = manualPlayers.map(Number);
    if (ids.some(id => !id) || new Set(ids).size !== 4) { setNotice('서로 다른 참가자 네 명을 선택해 주세요.'); return; }
    try {
      await sessionOperationApi.createManualQueue(sessionId, { teamAIds: ids.slice(0, 2), teamBIds: ids.slice(2), matchType: manualType, playStyle: manualStyle });
      setManualOpen(keepOpen); setManualPlayers(['', '', '', '']); setNotice(keepOpen ? '추가했어요. 다음 경기를 바로 선택해 주세요.' : '수동 매칭을 경기 후보 큐에 추가했어요.'); await load();
    } catch { setNotice('선택한 경기 유형과 참가자의 성별 또는 상태를 확인해 주세요.'); }
  };
  const selectManualPlayer = (attendanceId: number) => setManualPlayers(current => {
    const value = String(attendanceId);
    if (current.includes(value)) return [...current.filter(item => item !== value), ''].slice(0, 4);
    const emptyIndex = current.findIndex(item => !item);
    if (emptyIndex < 0) return current;
    return current.map((item, index) => index === emptyIndex ? value : item);
  });
  const cloneQueue = (queue: OperationQueue) => {
    setManualPlayers(queue.teams.flatMap(team => team.players.map(player => String(player.attendanceId))));
    setManualType(queue.matchType); setManualStyle(queue.playStyle ?? 'FUN'); setManualOpen(true);
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

  return <SessionOperationShell title="경기 후보 큐" description="대진표를 준비한 뒤 게임 배정을 시작하면, 이후 빈 코트는 자동으로 다음 경기로 채워져요." actions={<><Button className={s.primaryButton} onClick={() => void assignEmptyCourts()}><Play className={s.iconSm} />{data?.matchAssignmentStarted ? '빈 코트 바로 채우기' : '게임 배정 시작'}</Button><Button variant="outline" className={s.outlineButton} onClick={() => void load()}><RefreshCw className={s.iconSm} />새로고침</Button></>}>
    {!data ? <div className={s.empty}>경기 후보를 불러오고 있어요.</div> : <div className={s.stack}>
      <section className={s.card}>
        <div className="grid grid-cols-4 gap-4">
          <label><span className={s.label}>경기 유형</span><OperationSelect value={matchType} onValueChange={setMatchType} options={typeOptions} /></label>
          <label><span className={s.label}>운영 방식</span><OperationSelect value={playStyle} onValueChange={setPlayStyle} options={styleOptions} /></label>
          <label><span className={s.label}>1인 보장 경기 수</span><input type="number" min={1} max={20} value={targetGames} onChange={event => setTargetGames(Math.max(1, Math.min(20, Number(event.target.value) || 1)))} className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base font-bold focus:border-primary focus:outline-none" /></label>
          <label><span className={s.label}>교류전 소속 조합</span><OperationSelect value={data.sessionType === 'EXCHANGE' ? affiliationStrategy : undefined} onValueChange={setAffiliationStrategy} options={affiliationOptions} disabled={data.sessionType !== 'EXCHANGE'} placeholder="교류전에서 사용" /></label>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-4"><div><strong className="text-base">참가자별 예외 설정</strong><p className="mt-1 text-sm text-muted-foreground">필요한 사람만 선택하세요. 선택하지 않아도 모든 경기 가능 참가자는 보장 경기 수만큼 배정됩니다.</p></div><input value={planParticipantSearch} onChange={event => setPlanParticipantSearch(event.target.value)} className="h-10 w-64 rounded-xl border border-border bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none" placeholder="참가자 이름 검색" /></div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-primary/20 bg-background p-4"><div className="flex items-start justify-between gap-3"><div><strong>우선 배정</strong><p className="mt-1 text-sm text-muted-foreground">보장 수는 그대로 유지하고, 남는 자리나 동점 조합에서 먼저 고려합니다.</p></div>{forcedPlayers.length > 0 && <button type="button" className="text-sm font-bold text-primary" onClick={() => setForcedPlayers([])}>전체 해제</button>}</div><div className="mt-3 grid max-h-40 grid-cols-4 gap-2 overflow-y-auto pr-1">{sortedParticipants.filter(item => item.name.includes(planParticipantSearch.trim())).map(item => <button type="button" key={item.attendanceId} onClick={() => toggleForcedPlayer(item.attendanceId)} className={`min-h-12 w-full rounded-xl border px-2 py-2 text-center text-sm font-bold ${forcedPlayers.includes(item.attendanceId) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary'}`}><span className="block truncate">{item.name}</span><small className="block opacity-70">{item.games}경기</small></button>)}</div></div>
            <div className="rounded-xl border border-destructive/20 bg-background p-4"><div className="flex items-start justify-between gap-3"><div><strong>이번 생성에서 제외</strong><p className="mt-1 text-sm text-muted-foreground">참가자 상태와 별개로, 운영자가 특별히 이번 생성에서만 빼야 하는 사람을 선택합니다.</p></div>{excludedPlayers.length > 0 && <button type="button" className="text-sm font-bold text-destructive" onClick={() => setExcludedPlayers([])}>전체 해제</button>}</div><div className="mt-3 grid max-h-40 grid-cols-4 gap-2 overflow-y-auto pr-1">{sortedParticipants.filter(item => item.name.includes(planParticipantSearch.trim())).map(item => <button type="button" key={item.attendanceId} onClick={() => toggleExcludedPlayer(item.attendanceId)} className={`min-h-12 w-full rounded-xl border px-2 py-2 text-center text-sm font-bold ${excludedPlayers.includes(item.attendanceId) ? 'border-destructive bg-destructive text-destructive-foreground' : 'border-border bg-background hover:border-destructive'}`}><span className="block truncate">{item.name}</span><small className="block truncate opacity-70">{genderLabels[item.gender] ?? item.gender} · {ageLabels[item.ageGroup] ?? item.ageGroup} · {item.grade}급</small></button>)}</div></div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4"><div><strong>전체 대진표 생성</strong><p className="mt-1 text-sm text-muted-foreground">설정한 보장 경기 수를 모든 대상 참가자가 채우도록 필요한 최소 경기만 큐에 추가합니다.</p></div><Button className={s.primaryButton} onClick={() => void generatePlan()}><Sparkles className={s.iconSm} />전체 대진표 생성</Button></div>
        <div className="mt-3 grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-2xl border border-border p-4"><div><strong>지금 필요한 후보만 추가</strong><p className="mt-1 text-sm text-muted-foreground">전체 대진표 대신 현재 코트 수만큼 추천 경기를 만들어 큐 마지막에 추가합니다.</p></div><Button variant="outline" className={s.outlineButton} onClick={() => void generate()}><Sparkles className={s.iconSm} />코트 수만큼 후보 추가</Button><Button variant="outline" className={s.outlineButton} onClick={() => setManualOpen(true)}><ListPlus className={s.iconSm} />직접 경기 추가</Button></div>
      </section>
      {data.queues.length < data.courtCount && <div className={s.alert}><AlertTriangle className={s.icon} />코트 수보다 경기 후보가 적어요. 후보를 추가해 주세요.</div>}
      {data.queues.length ? data.queues.map(queue => <section key={queue.queueId} className={s.card}><div className={s.between}><div className={s.row}><span className="rounded-full bg-primary px-3 py-1 text-sm font-black text-primary-foreground">후보 {queue.queueOrder}</span><button aria-label="순서 올리기" onClick={() => void reorder(queue, -1)}><ChevronUp className={s.iconSm} /></button><button aria-label="순서 내리기" onClick={() => void reorder(queue, 1)}><ChevronDown className={s.iconSm} /></button><strong>{typeLabels[queue.matchType] ?? queue.matchType}</strong><span className="text-sm font-bold text-muted-foreground">품질 {queue.score ?? '-'}</span></div><div className={s.row}><Button variant="outline" className={s.outlineButton} onClick={() => cloneQueue(queue)}><CopyPlus className={s.iconSm} />복제</Button><Button variant="outline" className={s.outlineButton} onClick={() => openEdit(queue)}><Edit3 className={s.iconSm} />참가자 교체</Button><Button variant="outline" className={s.dangerButton} onClick={() => void cancel(queue.queueId)}><Trash2 className={s.iconSm} />취소</Button></div></div><div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4"><div className={s.teamBox}><p className={s.teamTitle}>A팀</p>{queue.teams[0]?.players.map(player => <div className={s.player} key={player.attendanceId}><span>{player.name}</span><small>{player.grade}급</small></div>)}</div><strong className="text-muted-foreground">VS</strong><div className={s.teamBox}><p className={s.teamTitle}>B팀</p>{queue.teams[1]?.players.map(player => <div className={s.player} key={player.attendanceId}><span>{player.name}</span><small>{player.grade}급</small></div>)}</div></div><div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"><strong>매칭 설명</strong>{queue.explanations?.map(text => <p className="mt-1 text-sm text-muted-foreground" key={text}>• {text}</p>)}</div></section>) : <div className={s.empty}>생성된 후보가 없어요.</div>}
    </div>}
    {manualOpen && data && <div className={s.modalBackdrop}><div className={s.modal}><div className={s.between}><div><h2 className={s.modalTitle}>빠른 수동 경기 추가</h2><p className={s.sectionDescription}>참가자를 누르는 순서대로 A팀 2명, B팀 2명이 구성돼요.</p></div><button aria-label="닫기" onClick={() => setManualOpen(false)}><X /></button></div><div className="mt-5 grid grid-cols-4 gap-2">{manualPlayers.map((value, index) => <button type="button" key={index} onClick={() => value && selectManualPlayer(Number(value))} className="min-h-16 rounded-xl border border-primary/30 bg-primary/5 px-2 text-sm font-bold"><small className="block text-primary">{index < 2 ? `A팀 ${index + 1}` : `B팀 ${index - 1}`}</small>{value ? data.participants.find(item => item.attendanceId === Number(value))?.name : '선택'}</button>)}</div><input value={manualSearch} onChange={event => setManualSearch(event.target.value)} className="mt-4 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-semibold focus:border-primary focus:outline-none" placeholder="이름으로 빠르게 찾기" /><div className="mt-3 grid max-h-52 grid-cols-3 gap-2 overflow-y-auto pr-1">{sortedParticipants.filter(item => item.name.includes(manualSearch.trim())).map(item => <button type="button" key={item.attendanceId} onClick={() => selectManualPlayer(item.attendanceId)} className={`min-h-12 rounded-xl border px-3 text-left text-sm font-bold ${manualPlayers.includes(String(item.attendanceId)) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary'}`}><span className="block">{item.name}</span><small className="opacity-70">{item.grade}급 · {item.games}경기{item.affiliation ? ` · ${item.affiliation}` : ''}</small></button>)}</div><div className="mt-4 grid grid-cols-2 gap-3"><label><span className={s.label}>경기 유형</span><OperationSelect value={manualType} options={typeOptions} onValueChange={setManualType} /></label><label><span className={s.label}>운영 방식</span><OperationSelect value={manualStyle} options={styleOptions} onValueChange={setManualStyle} /></label></div><div className="mt-6 grid grid-cols-2 gap-3"><Button variant="outline" className={s.outlineButton} onClick={() => void createManual(true)}>추가하고 계속</Button><Button className={s.primaryButton} onClick={() => void createManual(false)}>추가하고 닫기</Button></div></div></div>}
    {editing && data && <div className={s.modalBackdrop}><div className={s.modal}><div className={s.between}><div><h2 className={s.modalTitle}>후보 참가자 교체</h2><p className={s.sectionDescription}>위에서부터 A팀 2명, B팀 2명이에요.</p></div><button aria-label="닫기" onClick={() => setEditing(null)}><X /></button></div><div className="mt-5 grid grid-cols-2 gap-3">{[0, 1, 2, 3].map(index => <label key={index}><span className={s.label}>{index < 2 ? `A팀 ${index + 1}` : `B팀 ${index - 1}`}</span><OperationSelect value={String(selectedPlayers[index] ?? '') || undefined} placeholder="참가자 선택" options={participantOptions} onValueChange={next => setSelectedPlayers(current => current.map((value, itemIndex) => itemIndex === index ? Number(next) : value))} /></label>)}</div><Button className={`${s.primaryButton} mt-6 w-full`} onClick={() => void saveEdit()}>변경 저장</Button></div></div>}
    <OperationToast message={notice} />
  </SessionOperationShell>;
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock3, Plus, RefreshCw, Trash2, Users, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import SessionOperationShell from '../components/SessionOperationShell';
import { OperationSelect, OperationToast } from '../components/OperationControls';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { sessionOperationApi, type OperationParticipant, type ParticipantRelation, type ParticipantResponse } from '../utils/sessionOperationApi';
import { operationStyles as s } from './SessionOperation.styles';
import { useSessionOperationRealtime } from '../utils/useSessionOperationRealtime';

const playLabels: Record<string, string> = {
  WAITING: '대기',
  AVAILABLE: '경기 가능',
  NEXT_UP: '다음 경기',
  CALLING: '입장 호출',
  PLAYING: '경기 중',
  RESTING: '휴식',
  LEFT: '조기 퇴장',
  ABSENT: '불참',
};
const attendanceLabels: Record<string, string> = {
  REGISTERED: '도착 전',
  ARRIVED: '도착 완료',
  LATE: '지각 예정',
  ABSENT: '불참',
};
const relationLabels: Record<string, string> = {
  FIXED_PARTNER: '고정 파트너',
  TEAM_PREFERENCE: '같은 팀 선호',
  TEAM_AVOID: '같은 팀 회피',
  MATCH_AVOID: '같은 경기 회피',
  STRONG_PAIR_LIMIT: '강한 조합 제한',
};
const genderLabel = (gender: string) => gender === 'MALE' ? '남성' : gender === 'FEMALE' ? '여성' : gender;
const ageLabel = (age: string) => ({
  TEENS: '10대',
  TWENTIES: '20대',
  THIRTIES: '30대',
  FORTIES: '40대',
  FIFTIES: '50대',
  SIXTIES_AND_ABOVE: '60대 이상',
}[age] ?? age);
const participantLabel = (item: OperationParticipant) => `${item.name} · ${genderLabel(item.gender)} · ${ageLabel(item.ageGroup)} · ${item.grade}`;

export default function ParticipantManagementPage() {
  const { sessionId = 'demo' } = useParams();
  const [data, setData] = useState<ParticipantResponse | null>(null);
  const [attendanceFilter, setAttendanceFilter] = useState('ALL');
  const [playFilter, setPlayFilter] = useState('ALL');
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [relationType, setRelationType] = useState('FIXED_PARTNER');
  const [notice, setNotice] = useState('');
  const [lateTarget, setLateTarget] = useState<OperationParticipant | null>(null);
  const [lateExpectedAt, setLateExpectedAt] = useState('');
  const [lateReason, setLateReason] = useState('');

  const load = useCallback(async () => setData(await sessionOperationApi.participants(sessionId)), [sessionId]);
  useEffect(() => { void load(); }, [load]);
  useSessionOperationRealtime(sessionId, data?.groupId, data?.sessionId, load);

  const filtered = useMemo(() => data?.participants.filter(item =>
    (attendanceFilter === 'ALL' || item.attendanceStatus === attendanceFilter)
    && (playFilter === 'ALL' || item.playStatus === playFilter)) ?? [], [attendanceFilter, data, playFilter]);

  const counts = useMemo(() => Object.keys(attendanceLabels).reduce<Record<string, number>>((result, status) => {
    result[status] = data?.participants.filter(item => item.attendanceStatus === status).length ?? 0;
    return result;
  }, {}), [data]);

  const changeStatus = async (attendanceId: number, playStatus: string) => {
    await sessionOperationApi.changeParticipantStatus(sessionId, attendanceId, playStatus);
    setNotice('경기 상태를 변경했어요.');
    await load();
  };

  const changeAttendance = async (item: OperationParticipant, attendanceStatus: string) => {
    if (attendanceStatus === 'LATE') {
      setLateTarget(item);
      setLateExpectedAt(item.lateExpectedAt?.slice(0, 16) ?? data?.startsAt.slice(0, 16) ?? '');
      setLateReason(item.lateReason ?? '');
      return;
    }
    await sessionOperationApi.changeParticipantAttendance(sessionId, item.attendanceId, { attendanceStatus });
    setNotice('출석 현황을 변경했어요.');
    await load();
  };

  const saveLate = async () => {
    if (!lateTarget || !lateExpectedAt) return;
    await sessionOperationApi.changeParticipantAttendance(sessionId, lateTarget.attendanceId, {
      attendanceStatus: 'LATE',
      expectedArrivalAt: lateExpectedAt,
      lateReason,
    });
    setLateTarget(null);
    setNotice('지각 예정 정보를 저장했어요.');
    await load();
  };

  const saveMemo = async (attendanceId: number, memo: string) => {
    await sessionOperationApi.updateParticipantMemo(sessionId, attendanceId, memo);
    setNotice('운영 메모를 저장했어요.');
  };

  const addRelation = async () => {
    if (!first || !second || first === second) {
      setNotice('서로 다른 참가자 2명을 선택해 주세요.');
      return;
    }
    const relation = await sessionOperationApi.saveRelation(sessionId, {
      firstAttendanceId: Number(first),
      secondAttendanceId: Number(second),
      relationType,
    });
    setData(current => current ? {
      ...current,
      relations: [...current.relations.filter(item => item.relationId !== relation.relationId), relation],
    } : current);
    setFirst('');
    setSecond('');
    setNotice('고정·회피 조합을 저장했어요.');
  };

  const removeRelation = async (relation: ParticipantRelation) => {
    await sessionOperationApi.deleteRelation(sessionId, relation.relationId);
    setNotice('조합 설정을 삭제했어요.');
    await load();
  };

  return <SessionOperationShell
    title="참가자 관리"
    description="회원과 게스트 전체 명단의 출석, 지각, 경기 상태, 운영 메모, 고정·회피 조합을 관리하세요."
    actions={<Button variant="outline" className={s.outlineButton} onClick={() => void load()}><RefreshCw className={s.iconSm} />새로고침</Button>}
  >
    {!data ? <div className={s.empty}>전체 참가 명단을 불러오고 있어요.</div> : <div className={s.stack}>
      <section className="grid grid-cols-5 gap-3">
        {[
          ['ALL', '전체', data.participants.length],
          ['REGISTERED', '도착 전', counts.REGISTERED],
          ['ARRIVED', '도착 완료', counts.ARRIVED],
          ['LATE', '지각 예정', counts.LATE],
          ['ABSENT', '불참', counts.ABSENT],
        ].map(([status, label, count]) => (
          <button key={String(status)} type="button" className={`${s.stat} text-left ${attendanceFilter === status ? 'border-primary bg-primary/5' : ''}`} onClick={() => setAttendanceFilter(String(status))}>
            <p className={s.statLabel}>{label}</p>
            <strong className={s.statValue}>{count}</strong>
          </button>
        ))}
      </section>

      <section className={s.card}>
        <div className={s.between}>
          <div>
            <h2 className={s.sectionTitle}>고정·회피 조합</h2>
            <p className={s.sectionDescription}>두 참가자의 관계를 설정하면 자동 매칭 후보 생성에 반영돼요.</p>
          </div>
          <Users className="h-7 w-7 text-primary" />
        </div>
        <div className="mt-4 grid grid-cols-[1fr_1fr_1fr_auto] gap-3">
          <OperationSelect value={first || undefined} placeholder="첫 번째 참가자" onValueChange={setFirst} options={data.participants.map(item => ({ value: String(item.attendanceId), label: participantLabel(item) }))} />
          <OperationSelect value={second || undefined} placeholder="두 번째 참가자" onValueChange={setSecond} options={data.participants.map(item => ({ value: String(item.attendanceId), label: participantLabel(item), disabled: String(item.attendanceId) === first }))} />
          <OperationSelect value={relationType} onValueChange={setRelationType} options={Object.entries(relationLabels).map(([value, label]) => ({ value, label }))} />
          <Button className={s.primaryButton} onClick={() => void addRelation()}><Plus className={s.iconSm} />추가</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.relations.length ? data.relations.map(relation => (
            <span key={relation.relationId} className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-sm font-bold text-primary">
              {relation.firstName} · {relation.secondName} / {relationLabels[relation.relationType] ?? relation.relationType}
              <button type="button" aria-label="조합 삭제" onClick={() => void removeRelation(relation)}><Trash2 className="h-4 w-4" /></button>
            </span>
          )) : <span className="text-sm font-semibold text-muted-foreground">아직 설정된 고정·회피 조합이 없어요.</span>}
        </div>
      </section>

      <section className={s.card}>
        <div className={s.row}>
          <strong>출석 현황</strong>
          <OperationSelect className="w-44" value={attendanceFilter} onValueChange={setAttendanceFilter} options={[{ value: 'ALL', label: '전체' }, ...Object.entries(attendanceLabels).map(([value, label]) => ({ value, label }))]} />
          <strong className="ml-3">경기 상태</strong>
          <OperationSelect className="w-44" value={playFilter} onValueChange={setPlayFilter} options={[{ value: 'ALL', label: '전체' }, ...Object.entries(playLabels).map(([value, label]) => ({ value, label }))]} />
          <span className="ml-auto font-bold text-muted-foreground">표시 {filtered.length}명</span>
        </div>
      </section>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th className={s.th}>참가자</th><th className={s.th}>출석 현황</th><th className={s.th}>지각 정보</th><th className={s.th}>급수·MMR</th><th className={s.th}>오늘 경기</th><th className={s.th}>운영 메모</th><th className={s.th}>경기 상태</th></tr></thead>
          <tbody>{filtered.map(item => (
            <tr key={item.attendanceId}>
              <td className={s.td}><strong className="text-base">{item.name}</strong><p className="text-muted-foreground">{item.participantType === 'MEMBER' ? '회원' : '게스트'} · {genderLabel(item.gender)} · {ageLabel(item.ageGroup)}</p></td>
              <td className={s.td}><OperationSelect className="h-10 w-36" ariaLabel={`${item.name} 출석 현황`} value={item.attendanceStatus} disabled={item.attendanceStatus === 'ARRIVED'} onValueChange={value => void changeAttendance(item, value)} options={Object.entries(attendanceLabels).map(([value, label]) => ({ value, label }))} /></td>
              <td className={s.td}>{item.attendanceStatus === 'LATE' ? <div><strong className="text-amber-700">{item.lateExpectedAt ? new Date(item.lateExpectedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '시간 미정'}</strong><p className="max-w-40 text-muted-foreground">{item.lateReason || '사유 없음'}</p></div> : <span className="text-muted-foreground">-</span>}</td>
              <td className={s.td}>{item.grade}<br /><span className="text-muted-foreground">복식 {item.doublesMmr} · 혼복 {item.mixedMmr}</span></td>
              <td className={s.td}>{item.games}경기<br /><span className="text-muted-foreground">연속 경기 {item.consecutivePlayCount} · 휴식 {item.consecutiveRestCount}</span></td>
              <td className={s.td}><input aria-label={`${item.name} 운영 메모`} className="h-10 w-40 rounded-lg border border-border bg-background px-3" defaultValue={item.memo ?? ''} placeholder="메모 입력" onBlur={event => void saveMemo(item.attendanceId, event.target.value)} /></td>
              <td className={s.td}><OperationSelect className="h-10 w-36" ariaLabel={`${item.name} 경기 상태`} value={item.playStatus} onValueChange={value => void changeStatus(item.attendanceId, value)} options={Object.entries(playLabels).map(([value, label]) => ({ value, label }))} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>}

    {lateTarget && <div className={s.modalBackdrop}>
      <div className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl">
        <div className={s.between}>
          <div><h2 className={s.modalTitle}>{lateTarget.name}님 지각 예정</h2><p className={s.sectionDescription}>도착 예정 시간과 사유를 입력하세요.</p></div>
          <button type="button" aria-label="닫기" onClick={() => setLateTarget(null)}><X /></button>
        </div>
        <label className="mt-5 block"><span className={s.label}><Clock3 className="mr-2 inline h-4 w-4" />도착 예정 시간</span><Input type="datetime-local" className={s.input} value={lateExpectedAt} onChange={event => setLateExpectedAt(event.target.value)} /></label>
        <label className="mt-4 block"><span className={s.label}>지각 사유</span><Input className={s.input} value={lateReason} onChange={event => setLateReason(event.target.value)} placeholder="예: 교통 지연" /></label>
        <Button className={`${s.primaryButton} mt-6 w-full`} disabled={!lateExpectedAt} onClick={() => void saveLate()}>지각 예정 저장</Button>
      </div>
    </div>}
    <OperationToast message={notice} />
  </SessionOperationShell>;
}

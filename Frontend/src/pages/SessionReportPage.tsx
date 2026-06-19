import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, Printer, RefreshCw, Trash2 } from 'lucide-react';
import SessionOperationShell from '../components/SessionOperationShell';
import { OperationToast } from '../components/OperationControls';
import { Button } from '../components/ui/button';
import { sessionOperationApi, type ReportResponse } from '../utils/sessionOperationApi';
import { encodePublicId, sessionPath } from '../utils/publicId';
import { useSessionOperationRealtime } from '../utils/useSessionOperationRealtime';
import { operationStyles as s } from './SessionOperation.styles';

export default function SessionReportPage() {
  const { sessionId = 'demo' } = useParams();
  const [data, setData] = useState<ReportResponse | null>(null);
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => setData(await sessionOperationApi.report(sessionId)), [sessionId]);
  useEffect(() => { void load(); }, [load]);
  useSessionOperationRealtime(sessionId, data?.groupId, data?.sessionId, load);
  const resetMatches = async () => {
    if (!data?.matches.length) return;
    if (!window.confirm('이 일정의 경기, 후보 큐, 결과, MMR 변동과 오늘 기록을 모두 삭제할까요? 삭제한 데이터는 복구할 수 없어요.')) return;
    setData(await sessionOperationApi.resetMatches(sessionId));
    setNotice('경기 운영 데이터와 기록을 모두 초기화했어요.');
  };
  const exportCsv = () => { if (!data) return; const rows = [['이름', '구분', '경기', '승', '패', '승률', '득점', '실점', 'MMR 변화'], ...data.participantRecords.map(item => [item.name, item.participantType, item.games, item.wins ?? 0, item.losses ?? 0, item.winRate ?? 0, item.pointsFor ?? 0, item.pointsAgainst ?? 0, item.mmrDelta ?? 0])]; const blob = new Blob(['\uFEFF' + rows.map(row => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${data.title}-리포트.csv`; anchor.click(); URL.revokeObjectURL(url); };

  return <SessionOperationShell title="일정 리포트" description="운영 중에는 임시 집계로, 일정 종료 후에는 최종 기록으로 확인하세요." actions={<><Button variant="outline" className={s.dangerButton} disabled={!data?.matches.length} onClick={() => void resetMatches()}><Trash2 className={s.iconSm} />경기 기록 초기화</Button><Button variant="outline" className={s.outlineButton} onClick={() => void load()}><RefreshCw className={s.iconSm} />새로고침</Button><Button variant="outline" className={s.outlineButton} onClick={() => window.print()}><Printer className={s.iconSm} />PDF·인쇄</Button><Button className={s.primaryButton} onClick={exportCsv}><Download className={s.iconSm} />CSV 저장</Button></>}>
    <OperationToast message={notice} />
    {!data ? <div className={s.empty}>리포트를 불러오고 있어요.</div> : <div className={s.stack}>
      <section className="grid grid-cols-4 gap-4">{[['참가자', data.summary.participantCount], ['완료 경기', data.summary.totalMatchCount], ['평균 경기', data.summary.averageMatchCount], ['결과 대기', data.summary.pendingResultCount]].map(([label, value]) => <div className={s.stat} key={label}><p className={s.statLabel}>{label}</p><strong className={s.statValue}>{value}</strong></div>)}</section>
      {data.summary.pendingResultCount > 0 && <div className={s.alert}>결과 입력 대기 경기가 있어 현재 리포트는 임시 집계예요.</div>}
      <section className={s.card}><h2 className={s.sectionTitle}>운영 분석</h2><div className="mt-4 grid grid-cols-4 gap-3"><div className={s.teamBox}><p className={s.statLabel}>총 경기 시간</p><strong className="text-2xl">{data.analysis.totalPlayMinutes}분</strong></div><div className={s.teamBox}><p className={s.statLabel}>중복 파트너 조합</p><strong className="text-2xl">{data.analysis.partnerDuplicatePairs}</strong></div><div className={s.teamBox}><p className={s.statLabel}>중복 상대 조합</p><strong className="text-2xl">{data.analysis.opponentDuplicatePairs}</strong></div><div className={s.teamBox}><p className={s.statLabel}>경기 유형</p><strong>{Object.entries(data.analysis.matchTypes).filter(([, count]) => count > 0).map(([type, count]) => `${type} ${count}`).join(' · ') || '-'}</strong></div></div></section>
      <div className={s.tableWrap}><table className={s.table}><thead><tr><th className={s.th}>참가자</th><th className={s.th}>경기</th><th className={s.th}>승·패</th><th className={s.th}>승률</th><th className={s.th}>득·실</th><th className={s.th}>MMR 변화</th></tr></thead><tbody>{data.participantRecords.map(item => <tr key={item.attendanceId}><td className={s.td}><strong>{item.name}</strong><p className="text-muted-foreground">{item.participantType === 'MEMBER' ? '회원' : '게스트'} · {item.grade}</p></td><td className={s.td}>{item.games}</td><td className={s.td}>{item.wins ?? 0}승 {item.losses ?? 0}패</td><td className={s.td}>{item.winRate ?? 0}%</td><td className={s.td}>{item.pointsFor ?? 0} · {item.pointsAgainst ?? 0}</td><td className={s.td}><strong className={(item.mmrDelta ?? 0) >= 0 ? 'text-primary' : 'text-red-600'}>{(item.mmrDelta ?? 0) > 0 ? '+' : ''}{item.mmrDelta ?? 0}</strong></td></tr>)}</tbody></table></div>
      <section className={s.card}><h2 className={s.sectionTitle}>경기 결과</h2><div className="mt-4 space-y-2">{data.matches.map(match => <div key={match.matchId} className="grid grid-cols-[100px_1fr_100px_120px] items-center rounded-xl border border-border px-4 py-3"><strong>{match.courtNumber}번 코트</strong><span>{match.teams[0]?.players.map(player => player.name).join(' / ')} VS {match.teams[1]?.players.map(player => player.name).join(' / ')}</span><strong>{match.scoreEntered === false ? '승패만' : `${match.teamAScore} : ${match.teamBScore}`}</strong><Link className="text-right font-bold text-primary" to={sessionPath(sessionId, `/result/${encodePublicId(match.matchId)}/edit`)}>결과 수정</Link></div>)}</div></section>
    </div>}
  </SessionOperationShell>;
}

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Swords } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { recordApi, type MatchRecordItem, type MatchRecordPageResponse, type MyRecordSummary, type RecordMatchType } from '../utils/recordApi';
import { sessionPath } from '../utils/publicId';
import { styles } from './RecordDetailPage.styles';

const typeLabels: Record<string, string> = { MENS_DOUBLES: '남자 복식', WOMENS_DOUBLES: '여자 복식', SAME_GENDER_DOUBLES: '동일 성별 복식', MIXED_DOUBLES: '혼합 복식', ANY: '자유 복식' };
const PAGE_SIZE = 10;

export default function MatchHistoryPage() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const [groupId, setGroupId] = useState(searchParams.get('groupId') ?? 'ALL');
  const [type, setType] = useState<'ALL' | RecordMatchType>('ALL'); const [result, setResult] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [data, setData] = useState<MatchRecordPageResponse | null>(null);
  const [groups, setGroups] = useState<MyRecordSummary['groups']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { recordApi.getSummary().then(response => setGroups(response.groups)).catch(() => setGroups([])); }, []);
  useEffect(() => { let ignore = false; setLoading(true); recordApi.getMatches({ page, size: PAGE_SIZE, from: from || undefined, to: to || undefined, groupId: groupId === 'ALL' ? undefined : Number(groupId), type: type === 'ALL' ? undefined : type, result: result === 'ALL' ? undefined : result }).then(response => { if (!ignore) setData(response); }).catch(() => { if (!ignore) setData(null); }).finally(() => { if (!ignore) setLoading(false); }); return () => { ignore = true; }; }, [from, groupId, page, result, to, type]);
  const updateFilter = <T,>(setter: (value: T) => void, value: T) => { setter(value); setPage(0); };
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const firstVisiblePage = Math.max(0, Math.min(page - 2, totalPages - 5));
  const visiblePages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstVisiblePage + index);

  return <div className={styles.page}><main className={styles.pageShell}>
    <header className={styles.pageHeader}><div><h1>전체 경기 기록</h1><p>기간과 모임, 경기 유형, 승패로 경기 기록을 찾아볼 수 있습니다.</p></div></header>
    <section className={styles.panel}><div className={styles.panelHeading}><Filter /><div><h2>기록 필터</h2><p>원하는 조건을 선택하면 바로 반영됩니다.</p></div></div><div className={styles.filters}>
      <label><span>시작일</span><Input type="date" className={styles.filterInput} value={from} onChange={event => updateFilter(setFrom, event.target.value)} /></label>
      <label><span>종료일</span><Input type="date" className={styles.filterInput} value={to} onChange={event => updateFilter(setTo, event.target.value)} /></label>
      <label><span>모임</span><Select value={groupId} onValueChange={value => updateFilter(setGroupId, value)}><SelectTrigger className={styles.selectTrigger}><SelectValue /></SelectTrigger><SelectContent className={styles.selectContent}><SelectItem className={styles.selectItem} value="ALL">전체 모임</SelectItem>{groups.map(group => <SelectItem className={styles.selectItem} key={group.groupId} value={String(group.groupId)}>{group.groupName}</SelectItem>)}</SelectContent></Select></label>
      <label><span>경기 유형</span><Select value={type} onValueChange={value => updateFilter(setType, value as typeof type)}><SelectTrigger className={styles.selectTrigger}><SelectValue /></SelectTrigger><SelectContent className={styles.selectContent}><SelectItem className={styles.selectItem} value="ALL">전체 유형</SelectItem>{Object.entries(typeLabels).map(([value, label]) => <SelectItem className={styles.selectItem} key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
      <label><span>결과</span><Select value={result} onValueChange={value => updateFilter(setResult, value as typeof result)}><SelectTrigger className={styles.selectTrigger}><SelectValue /></SelectTrigger><SelectContent className={styles.selectContent}><SelectItem className={styles.selectItem} value="ALL">전체 결과</SelectItem><SelectItem className={styles.selectItem} value="WIN">승</SelectItem><SelectItem className={styles.selectItem} value="LOSS">패</SelectItem></SelectContent></Select></label>
    </div></section>
    <section className={styles.panel}><div className={styles.listHeader}><div><Swords /><strong>경기 기록</strong></div><span>총 {data?.totalElements ?? 0}경기</span></div>
      {loading ? <Empty text="경기 기록을 불러오는 중입니다." /> : data?.items.length ? <div className={styles.matchList}>{data.items.map(match => <MatchRow key={match.id} match={match} />)}</div> : <Empty text="조건에 맞는 경기 기록이 없습니다." />}
    </section>
    <nav className={styles.pagination} aria-label="경기 기록 페이지 이동">
      <button type="button" className={styles.paginationArrow} disabled={page === 0} onClick={() => setPage(value => value - 1)} aria-label="이전 페이지"><ChevronLeft /></button>
      {visiblePages.map(pageNumber => <button key={pageNumber} type="button" className={styles.paginationPage(pageNumber === page)} onClick={() => setPage(pageNumber)}>{pageNumber + 1}</button>)}
      <button type="button" className={styles.paginationArrow} disabled={page + 1 >= totalPages} onClick={() => setPage(value => value + 1)} aria-label="다음 페이지"><ChevronRight /></button>
    </nav>
  </main></div>;
}

function MatchRow({ match }: { match: MatchRecordItem }) { return <Link to={sessionPath(match.sessionId, '/my-report')} className={styles.matchRow}><span className={styles.result(match.win)}>{match.win ? '승' : '패'}</span><div><strong>{match.groupName} · {match.sessionTitle}</strong><small><CalendarDays /> {new Date(match.playedAt).toLocaleDateString('ko-KR')} · {typeLabels[match.matchType]}</small><p>파트너 {match.partner} · 상대 {match.opponents.join(', ') || '-'}</p></div><b>{match.myScore} : {match.opponentScore}</b><ChevronRight /></Link>; }
function Empty({ text }: { text: string }) { return <div className={styles.empty}><Swords /><strong>{text}</strong></div>; }

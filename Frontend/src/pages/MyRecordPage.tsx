import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, BarChart3, CalendarDays, ChevronLeft, ChevronRight, Clock3,
  Flame, Gauge, History, Medal, Minus, Sparkles, Swords, TrendingDown,
  TrendingUp, Trophy, UserRound, UsersRound,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { recordApi, type MatchRecordItem, type MyRecordSummary, type PeriodRecordStats } from '../utils/recordApi';
import { sessionPath } from '../utils/publicId';
import { styles } from './MyRecordPage.styles';

const ageLabels: Record<string, string> = { TEENS: '10대', TWENTIES: '20대', THIRTIES: '30대', FORTIES: '40대', FIFTIES: '50대', SIXTIES_AND_ABOVE: '60대 이상' };
const genderLabels: Record<string, string> = { MALE: '남성', FEMALE: '여성' };
const dayLabels: Record<string, string> = { MONDAY: '월요일', TUESDAY: '화요일', WEDNESDAY: '수요일', THURSDAY: '목요일', FRIDAY: '금요일', SATURDAY: '토요일', SUNDAY: '일요일' };
const matchTypeLabels: Record<string, string> = { MENS_DOUBLES: '남자 복식', WOMENS_DOUBLES: '여자 복식', SAME_GENDER_DOUBLES: '동일 성별 복식', MIXED_DOUBLES: '혼합 복식', ANY: '자유 복식' };

function monthValue(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; }
function formatMinutes(value: number) { const hours = Math.floor(value / 60); const minutes = value % 60; return hours ? `${hours}시간 ${minutes ? `${minutes}분` : ''}` : `${minutes}분`; }
function formatDate(value: string) { return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(new Date(value)); }
function localDateKey(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`; }
function formatFullDate(value: string) { return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${value}T00:00:00`)); }
function changeTone(change: number) { return change > 0 ? 'up' : change < 0 ? 'down' : 'same'; }
function activityTitle(item: MyRecordSummary['activity'][number] | undefined, date: string) {
  if (!item) return `${formatFullDate(date)} · 운동 기록 없음`;
  const schedules = item.schedules.map(schedule => {
    const time = new Date(schedule.startsAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    return `${time} ${schedule.groupName} · ${schedule.sessionTitle}`;
  }).join('\n');
  return `${formatFullDate(date)} · ${item.count}회 · ${formatMinutes(item.exerciseMinutes)}\n${schedules}`;
}

export default function MyRecordPage() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(monthValue());
  const [data, setData] = useState<MyRecordSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true); setError('');
    recordApi.getSummary(selectedMonth).then(response => { if (!ignore) setData(response); })
      .catch(() => { if (!ignore) setError('내 기록을 불러오지 못했습니다.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [selectedMonth]);

  const activityMap = useMemo(() => new Map(data?.activity.map(item => [item.date, item]) ?? []), [data]);
  const heatmapDays = useMemo(() => {
    const today = new Date(); const first = new Date(today); first.setDate(today.getDate() - 364);
    return Array.from({ length: 365 }, (_, index) => { const date = new Date(first); date.setDate(first.getDate() + index); return localDateKey(date); });
  }, []);
  const selectedActivity = selectedDay ? activityMap.get(selectedDay) : undefined;

  const moveMonth = (distance: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    setSelectedMonth(monthValue(new Date(year, month - 1 + distance, 1)));
  };

  if (loading && !data) return <PageState icon={<Activity />} title="내 기록을 불러오는 중입니다" />;
  if (error || !data) return <PageState icon={<History />} title={error || '기록을 확인할 수 없습니다'} />;

  return (
    <div className={styles.page}>
      <main className={styles.pageShell}>
        <header className={styles.pageHeader}><h1>내 기록</h1></header>

        <section className={styles.profileSummary}>
          {data.profile.profileImageUrl ? <img src={data.profile.profileImageUrl} alt={`${data.profile.name} 프로필`} /> : <span>{data.profile.name.slice(0, 1)}</span>}
          <div><h2>{data.profile.name}</h2><p>{genderLabels[data.profile.gender ?? ''] ?? '성별 미설정'} · {ageLabels[data.profile.ageGroup ?? ''] ?? '연령대 미설정'} · {data.profile.grade ? `${data.profile.grade}급` : '급수 미설정'}</p></div>
        </section>

        <section className={styles.section}>
          <SectionHeading icon={<Gauge />} title="MMR 현황" description="현재 MMR과 이번 달 변화를 확인합니다." />
          <div className={styles.mmrGrid}>
            <MmrButton title="복식 MMR" value={data.mmr.doubles} change={data.mmr.doublesMonthlyChange} onClick={() => navigate('/my-record/mmr?type=DOUBLES')} />
            <MmrButton title="혼복 MMR" value={data.mmr.mixed} change={data.mmr.mixedMonthlyChange} onClick={() => navigate('/my-record/mmr?type=MIXED')} />
          </div>
        </section>

        <section className={styles.section}>
          <SectionHeading icon={<CalendarDays />} title="오늘의 운동 기록" description="오늘 참여한 모든 운동 일정을 합산한 기록입니다." />
          {data.today.hasRecord ? <Stats data={data.today} includeAttendance={false} /> : <EmptyState text="오늘 운동한 기록이 없습니다." />}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeaderWithAction}>
            <SectionHeading icon={<BarChart3 />} title="이번 달 기록" description="선택한 달의 운동과 경기 기록입니다." />
            <div className={styles.monthPicker}><Button variant="ghost" size="icon" className={styles.monthButton} onClick={() => moveMonth(-1)}><ChevronLeft /></Button><strong>{selectedMonth.replace('-', '년 ')}월</strong><Button variant="ghost" size="icon" className={styles.monthButton} disabled={selectedMonth === monthValue()} onClick={() => moveMonth(1)}><ChevronRight /></Button></div>
          </div>
          {data.month.hasRecord ? <Stats data={data.month} includeAttendance /> : <EmptyState text="선택한 달에 운동한 기록이 없습니다." />}
        </section>

        <section className={styles.section}>
          <SectionHeading icon={<Activity />} title="운동 활동" description="최근 1년 동안 운동한 횟수를 한눈에 확인합니다." />
          <div className={styles.heatmapFrame}>
            <div className={styles.heatmapScroll}><div className={styles.heatmap}>{heatmapDays.map(date => { const item = activityMap.get(date); return <button key={date} type="button" className={styles.heatmapCell(item?.count ?? 0)} title={activityTitle(item, date)} aria-label={date} onClick={() => item && setSelectedDay(date)} />; })}</div></div>
            <div className={styles.heatmapLegend}><span>적음</span>{[0, 1, 2, 3, 4].map(level => <i key={level} className={styles.heatmapCell(level)} />)}<span>많음</span></div>
          </div>
          {selectedActivity && <div className={styles.activityDetail}><div><strong>{formatFullDate(selectedActivity.date)}</strong><span>{selectedActivity.count}회 · {formatMinutes(selectedActivity.exerciseMinutes)}</span></div>{selectedActivity.schedules.map((schedule, index) => <p key={`${schedule.sessionTitle}-${index}`}><CalendarDays /> <b>{schedule.groupName}</b><span>{schedule.sessionTitle}</span><time>{new Date(schedule.startsAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</time></p>)}</div>}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeaderWithAction}><SectionHeading icon={<Swords />} title="최근 경기 기록" description="가장 최근에 완료한 5경기입니다." /><Link to="/my-record/matches" className={styles.textLink}>전체 기록 보기 <ChevronRight /></Link></div>
          {data.recentMatches.length ? <div className={styles.matchList}>{data.recentMatches.map(match => <MatchRow key={match.id} match={match} />)}</div> : <EmptyState text="아직 완료된 경기 기록이 없습니다." />}
        </section>

        <section className={styles.twoColumn}>
          <div className={styles.section}><SectionHeading icon={<UsersRound />} title="자주 함께한 사람" description="경기 횟수가 많은 파트너와 상대 TOP 3입니다." /><PeopleList title="파트너" people={data.people.partners} /><PeopleList title="상대" people={data.people.opponents} /></div>
          <div className={styles.section}><SectionHeading icon={<Clock3 />} title="운동 패턴" description="가입 후 누적된 활동을 기준으로 계산합니다." /><MetricList items={[['평균 주간 운동 횟수', `${data.habit.averageWeeklySessions}회`], ['연속 운동 주차', `${data.habit.consecutiveWeeks}주`], ['가장 자주 운동한 요일', dayLabels[data.habit.favoriteDay] ?? data.habit.favoriteDay], ['가장 자주 운동한 시간대', data.habit.favoriteTimeRange]]} /></div>
        </section>

        <section className={styles.section}>
          <SectionHeading icon={<Sparkles />} title="플레이 스타일" description="완료된 경기의 시간과 점수를 기준으로 분석합니다." />
          {data.playStyle.enoughData ? <MetricGrid items={[['평균 휴식 간격', `${data.playStyle.averageRestMinutes}분`], ['연속 경기 비율', `${data.playStyle.consecutiveMatchRate}%`], ['접전 경기 비율', `${data.playStyle.closeMatchRate}%`], ['대승 / 대패 비율', `${data.playStyle.blowoutWinRate}% / ${data.playStyle.blowoutLossRate}%`], ['즐겜 / 빡겜 참여', `${data.playStyle.funRate}% / ${data.playStyle.competitiveRate}%`]]} /> : <EmptyState text="플레이 스타일을 분석하려면 3경기 이상의 기록이 필요합니다." />}
        </section>

        <section className={styles.section}>
          <SectionHeading icon={<UserRound />} title="모임별 기록" description="모임별 누적 출석과 경기 결과입니다." />
          {data.groups.length ? <div className={styles.groupList}>{data.groups.map(group => <Link key={group.groupId} to={`/my-record/matches?groupId=${group.groupId}`}><strong>{group.groupName}</strong><span>출석 {group.attendance}회</span><span>{group.matches}경기</span><span>{group.wins}승 {group.losses}패</span><span>승률 {group.winRate}%</span><time>{group.lastParticipationAt ? formatDate(group.lastParticipationAt) : '-'}</time><ChevronRight /></Link>)}</div> : <EmptyState text="아직 모임별 기록이 없습니다." />}
        </section>

        <section className={styles.section}>
          <SectionHeading icon={<Medal />} title="기록 하이라이트" description="지금까지의 경기에서 기억할 만한 기록입니다." />
          <div className={styles.highlightGrid}><Highlight title="가장 접전이었던 경기" value={data.highlights.closestMatch ? `${data.highlights.closestMatch.match.myScore} : ${data.highlights.closestMatch.match.opponentScore}` : '-'} match={data.highlights.closestMatch?.match} /><Highlight title="최다 연승" value={data.highlights.longestWinStreak ? `${data.highlights.longestWinStreak.count}연승` : '-'} match={data.highlights.longestWinStreak?.match} /><Highlight title="최다 연패" value={data.highlights.longestLossStreak ? `${data.highlights.longestLossStreak.count}연패` : '-'} match={data.highlights.longestLossStreak?.match} /></div>
        </section>
      </main>
    </div>
  );
}

function SectionHeading({ icon, title, description }: { icon: ReactNode; title: string; description: string }) { return <div className={styles.sectionHeading}><span>{icon}</span><div><h2>{title}</h2><p>{description}</p></div></div>; }
function MmrButton({ title, value, change, onClick }: { title: string; value: number; change: number; onClick: () => void }) { const tone = changeTone(change); const Icon = tone === 'up' ? TrendingUp : tone === 'down' ? TrendingDown : Minus; return <button type="button" className={styles.mmrButton(tone)} onClick={onClick}><span><Trophy /></span><div><small>{title}</small><strong>{value.toLocaleString()}</strong><p><Icon /> 이번 달 {change > 0 ? '+' : ''}{change}</p></div><ChevronRight /></button>; }
function Stats({ data, includeAttendance }: { data: PeriodRecordStats; includeAttendance: boolean }) { const items = [['총 경기', `${data.matches}`], ['승', `${data.wins}`], ['패', `${data.losses}`], ['승률', `${data.winRate}%`], ['득점', `${data.pointsFor}`], ['실점', `${data.pointsAgainst}`], ['운동 시간', formatMinutes(data.exerciseMinutes)], ...(includeAttendance ? [['출석', `${data.attendance}회`]] : []), ['복식 MMR', `${data.doublesMmrChange > 0 ? '+' : ''}${data.doublesMmrChange}`], ['혼복 MMR', `${data.mixedMmrChange > 0 ? '+' : ''}${data.mixedMmrChange}`]]; return <MetricGrid items={items} />; }
function MetricGrid({ items }: { items: string[][] }) { return <div className={styles.metricGrid}>{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>; }
function MetricList({ items }: { items: string[][] }) { return <div className={styles.metricList}>{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>; }
function MatchRow({ match }: { match: MatchRecordItem }) { return <Link to={sessionPath(match.sessionId, '/my-report')} className={styles.matchRow}><span className={styles.resultBadge(match.win)}>{match.win ? '승' : '패'}</span><div><strong>{match.groupName} · {match.sessionTitle}</strong><small>{formatDate(match.playedAt)} · {matchTypeLabels[match.matchType]}</small><p>파트너 {match.partner} · 상대 {match.opponents.join(', ') || '-'}</p></div><b>{match.myScore} : {match.opponentScore}</b><ChevronRight /></Link>; }
function PeopleList({ title, people }: { title: string; people: MyRecordSummary['people']['partners'] }) { return <div className={styles.peopleBlock}><strong>{title}</strong>{people.length ? people.map((person, index) => <div key={person.userId}><b>{index + 1}</b>{person.profileImageUrl ? <img src={person.profileImageUrl} alt="" /> : <span>{person.name.slice(0, 1)}</span>}<p>{person.name}</p><small>{person.matches}경기</small></div>) : <p className={styles.inlineEmpty}>표시할 기록이 없습니다.</p>}</div>; }
function Highlight({ title, value, match }: { title: string; value: string; match?: MatchRecordItem }) { const content = <><Flame /><span>{title}</span><strong>{value}</strong>{match && <small>{formatDate(match.playedAt)} · {match.groupName}</small>}</>; return match ? <Link to={sessionPath(match.sessionId, '/my-report')} className={styles.highlight}>{content}</Link> : <div className={styles.highlight}>{content}</div>; }
function EmptyState({ text }: { text: string }) { return <div className={styles.emptyState}><Activity /><strong>{text}</strong></div>; }
function PageState({ icon, title }: { icon: ReactNode; title: string }) { return <div className={styles.page}><div className={styles.pageState}>{icon}<strong>{title}</strong></div></div>; }

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Minus, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import { recordApi, type MmrHistoryResponse, type MmrType } from '../utils/recordApi';
import { styles } from './RecordDetailPage.styles';

function today() { return new Date().toISOString().slice(0, 10); }

export default function MmrHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type: MmrType = searchParams.get('type') === 'MIXED' ? 'MIXED' : 'DOUBLES';
  const [data, setData] = useState<MmrHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false; setLoading(true);
    recordApi.getMmrHistory(type, '2000-01-01', today()).then(response => { if (!ignore) setData(response); })
      .catch(() => { if (!ignore) setData(null); }).finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [type]);

  const chart = useMemo(() => {
    if (!data?.points.length) return null;
    const values = data.points.flatMap(point => [point.beforeMmr, point.afterMmr]);
    const min = Math.min(...values) - 10; const max = Math.max(...values) + 10; const range = Math.max(1, max - min);
    const points = data.points.map((point, index) => ({ ...point, x: data.points.length === 1 ? 50 : (index / (data.points.length - 1)) * 100, y: 90 - ((point.afterMmr - min) / range) * 75 }));
    return { min, max, points, line: points.map(point => `${point.x},${point.y}`).join(' ') };
  }, [data]);

  const change = data?.totalChange ?? 0; const ChangeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  return <div className={styles.page}><main className={styles.pageShell}>
    <header className={styles.pageHeader}><div><h1>MMR 변동</h1><p>날짜별 MMR 변화량을 확인합니다.</p></div></header>
    <div className={styles.segmented}>{(['DOUBLES', 'MIXED'] as MmrType[]).map(item => <button key={item} type="button" className={styles.segmentButton(item === type)} onClick={() => setSearchParams({ type: item })}>{item === 'DOUBLES' ? '복식 MMR' : '혼복 MMR'}</button>)}</div>
    <section className={styles.panel}>
      <div className={styles.mmrSummary}><span><Trophy /></span><div><small>{type === 'DOUBLES' ? '현재 복식 MMR' : '현재 혼복 MMR'}</small><strong>{data?.currentMmr.toLocaleString() ?? '-'}</strong></div><p className={styles.change(change)}><ChangeIcon /> 전체 기간 {change > 0 ? '+' : ''}{change}</p></div>
      {loading ? <Empty text="MMR 이력을 불러오는 중입니다." /> : chart ? <div className={styles.chartWrap}>
        <div className={styles.chartAxis}><span>{chart.max}</span><span>{chart.min}</span></div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.lineChart} role="img" aria-label="MMR 변화 그래프"><polyline points={chart.line} fill="none" vectorEffect="non-scaling-stroke" /></svg>
        <div className={styles.chartDates}><span>{new Date(chart.points[0].changedAt).toLocaleDateString('ko-KR')}</span><span>{new Date(chart.points.at(-1)!.changedAt).toLocaleDateString('ko-KR')}</span></div>
      </div> : <Empty text="아직 MMR 변동 기록이 없습니다." />}
    </section>
    <section className={styles.panel}><div className={styles.panelHeading}><Activity /><div><h2>변동 내역</h2><p>MMR이 변경된 날짜와 수치입니다.</p></div></div>{data?.points.length ? <div className={styles.historyList}>{[...data.points].reverse().map(point => <div key={point.id}><time>{new Date(point.changedAt).toLocaleDateString('ko-KR')}</time><span>{point.beforeMmr} → {point.afterMmr}</span><strong className={styles.change(point.change)}>{point.change > 0 ? '+' : ''}{point.change}</strong></div>)}</div> : <Empty text="표시할 변동 내역이 없습니다." />}</section>
  </main></div>;
}

function Empty({ text }: { text: string }) { return <div className={styles.empty}><Activity /><strong>{text}</strong></div>; }

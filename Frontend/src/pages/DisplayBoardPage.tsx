import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Ban, Clock3, Wifi } from 'lucide-react';
import Logo from '../components/Logo';
import { connectSessionEntrySocket } from '../utils/sessionEntrySocket';
import { isDemoSession, sessionOperationApi, type OperationMatch, type OperationQueue, type OperationSession } from '../utils/sessionOperationApi';

type DisplayData = OperationSession & { currentMatches: OperationMatch[]; nextMatches: OperationQueue[]; lastUpdatedAt: string };

export default function DisplayBoardPage() {
  const { sessionId = 'demo' } = useParams();
  const [data, setData] = useState<DisplayData | null>(null);
  const [connected, setConnected] = useState(isDemoSession(sessionId));
  const [now, setNow] = useState(() => new Date());
  const load = useCallback(async () => setData(await sessionOperationApi.display(sessionId)), [sessionId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1_000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    if (!data?.groupId || !data.sessionId || isDemoSession(sessionId)) return;
    return connectSessionEntrySocket(data.groupId, data.sessionId, load, setConnected);
  }, [data?.groupId, data?.sessionId, load, sessionId]);

  if (!data) return <div className="flex min-h-screen items-center justify-center bg-[#120b1f] text-2xl font-bold text-white">경기판을 불러오고 있어요.</div>;

  const gridClass = data.courtCount <= 3 ? 'grid-cols-3' : 'grid-cols-4';

  return <div className="flex h-screen min-w-[1180px] flex-col overflow-hidden bg-[#120b1f] px-12 py-10 text-white">
    <header className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-white/15 pb-7">
      <Logo size="md" />
      <div className="text-center"><h1 className="text-4xl font-black">{data.groupName}</h1><p className="mt-2 text-xl text-white/70">{data.title}</p></div>
      <div className="justify-self-end text-right"><p className="flex items-center justify-end gap-2 text-xl font-bold"><Clock3 className="h-5 w-5" />{now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p><p className={`mt-2 flex items-center gap-2 font-bold ${connected ? 'text-emerald-400' : 'text-red-400'}`}><Wifi className="h-5 w-5" />{connected ? '실시간 연결 중' : '연결이 불안정해요'}</p></div>
    </header>

    <main className="flex min-h-0 flex-1 flex-col justify-center gap-12">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <h2 className="text-3xl font-black">현재 경기</h2>
        <div className={`mt-7 grid gap-8 ${gridClass}`}>
          {Array.from({ length: data.courtCount }, (_, index) => {
            const court = index + 1;
            const disabled = data.disabledCourtNumbers.includes(court);
            const match = data.currentMatches.find(item => item.courtNumber === court);
            return <section key={court} className={`min-h-[240px] rounded-3xl border-2 p-7 ${disabled ? 'border-red-400/50 bg-red-400/5' : match?.status === 'CALLING' ? 'border-amber-400 bg-amber-400/10' : 'border-[#a855f7] bg-white/5'}`}>
              <div className="flex items-center justify-between"><h3 className="text-3xl font-black">{court}코트</h3>{disabled ? <span className="rounded-full bg-red-400 px-4 py-2 font-black text-black">사용 중지</span> : match && <span className={`rounded-full px-4 py-2 font-black ${match.status === 'CALLING' ? 'bg-amber-400 text-black' : 'bg-[#a855f7]'}`}>{match.status === 'CALLING' ? '지금 입장' : '경기 중'}</span>}</div>
              {disabled ? <div className="mt-14 text-center text-red-300"><Ban className="mx-auto h-10 w-10" /><p className="mt-3 text-2xl font-bold">사용하지 않는 코트</p></div> : match ? <div className="mt-7 text-center"><p className="text-2xl font-black">{match.teams[0]?.players.map(player => player.name).join(' · ')}</p><p className="my-4 text-lg font-black text-white/50">VS</p><p className="text-2xl font-black">{match.teams[1]?.players.map(player => player.name).join(' · ')}</p></div> : <p className="mt-16 text-center text-2xl font-bold text-white/40">비어 있음</p>}
            </section>;
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-amber-300/20 bg-amber-300/[0.04] p-8">
        <h2 className="text-3xl font-black text-amber-300">다음 경기</h2>
        {data.nextMatches.length ? <div className={`mt-7 grid gap-8 ${gridClass}`}>{data.nextMatches.slice(0, data.courtCount).map(queue => <div key={queue.queueId} className="min-h-[160px] rounded-3xl border border-white/15 bg-white/10 p-6"><p className="text-lg font-black text-amber-300">다음 {queue.queueOrder}번째</p><p className="mt-3 text-xl font-black">{queue.teams[0]?.players.map(player => player.name).join(' · ')}</p><p className="my-3 font-bold text-white/40">VS</p><p className="text-xl font-black">{queue.teams[1]?.players.map(player => player.name).join(' · ')}</p></div>)}</div> : <p className="mt-7 rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-center text-xl font-bold text-white/45">대기 중인 다음 경기가 없어요.</p>}
      </section>
    </main>

    <footer className="flex shrink-0 items-center justify-between pt-7 text-lg font-bold text-white/60"><span>개인 화면에서 내 경기 순서를 확인해 주세요.</span><span>{new Date(data.lastUpdatedAt).toLocaleTimeString('ko-KR')} 갱신</span></footer>
  </div>;
}

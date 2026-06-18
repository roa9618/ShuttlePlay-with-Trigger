import { BarChart3, Calendar, Camera, Check, Clock, Coffee, Keyboard, MapPin, QrCode, UserCheck, UserPlus, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { SessionFlowIcon, SessionFlowPage } from '../components/SessionFlowLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const sessionInfo = <>
  <div className="mb-4 text-center">
    <p className="text-sm font-bold text-primary">강남 배드민턴 클럽</p>
    <h1 className="mt-1 text-[1.65rem] font-bold tracking-[-0.02em]">6월 정기 운동</h1>
  </div>
  <div className="mb-4 grid grid-cols-[1.2fr_0.8fr] gap-2.5 md:grid-cols-3">
    <p className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary/40 px-3.5 text-center text-sm font-semibold"><Calendar className="h-5 w-5 shrink-0 text-primary" />6월 20일 (토)</p>
    <p className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary/40 px-3.5 text-center text-sm font-semibold"><Clock className="h-5 w-5 shrink-0 text-primary" />19:00</p>
    <p className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary/40 px-3.5 text-center text-sm font-semibold md:col-span-1"><MapPin className="h-5 w-5 shrink-0 text-primary" />강남구민회관</p>
  </div>
</>;

const choiceCard = 'min-h-[104px] rounded-2xl border-2 p-4 text-left transition-colors';

export default function SessionEntryPreviewPage() {
  const { previewType = 'code-input' } = useParams();

  if (previewType === 'camera') return <SessionFlowPage tone="info">
    <div className="text-center"><SessionFlowIcon tone="info"><Camera className="h-9 w-9" /></SessionFlowIcon><h1 className="mt-4 text-[1.65rem] font-bold">QR 코드를 비춰 주세요</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">인식되면 자동으로 다음 화면으로 이동해요.</p></div>
    <div className="relative mt-4 flex aspect-[4/3] max-h-[350px] items-center justify-center overflow-hidden rounded-[24px] bg-foreground"><div className="absolute inset-8 rounded-2xl border-2 border-white/50" /><QrCode className="h-24 w-24 text-background/70" /></div>
    <Button variant="outline" className="mt-3 h-14 w-full rounded-2xl text-base font-semibold hover:border-primary hover:bg-primary/10 hover:text-primary">직접 코드 입력하기</Button>
  </SessionFlowPage>;

  if (previewType === 'registration-choice') return <SessionFlowPage wide>
    {sessionInfo}
    <h2 className="text-center text-lg font-bold">참여 정보를 선택해 주세요</h2>
    <div className="mt-3 grid grid-cols-2 gap-2.5">
      <button className={`${choiceCard} border-primary bg-primary/10`}><UserCheck className="mb-2 h-7 w-7 text-primary" /><strong className="block text-base">이미 등록했어요</strong><p className="mt-1 text-xs leading-5 text-muted-foreground">투표했거나 미리 등록된 참가자</p></button>
      <button className={`${choiceCard} border-border hover:border-primary hover:bg-primary/10`}><UserPlus className="mb-2 h-7 w-7 text-primary" /><strong className="block text-base">등록 안 했어요</strong><p className="mt-1 text-xs leading-5 text-muted-foreground">지금 새로 참가 등록하기</p></button>
    </div>
    <Button className="mt-3 h-14 w-full rounded-2xl text-[17px] font-bold">출석 선택으로 계속</Button>
  </SessionFlowPage>;

  if (previewType === 'guest-info') return <SessionFlowPage tone="info" wide>
    {sessionInfo}
    <h2 className="text-center text-lg font-bold">기본 정보를 입력해 주세요</h2>
    <div className="mt-3 space-y-2.5"><Input className="h-13 rounded-2xl" value="홍길동" readOnly /><div className="grid grid-cols-2 gap-2.5"><Button variant="outline" className="h-13 justify-between rounded-2xl hover:bg-primary/10 hover:text-primary">성별 <span>남성</span></Button><Button variant="outline" className="h-13 justify-between rounded-2xl hover:bg-primary/10 hover:text-primary">연령 <span>50대</span></Button></div><Button variant="outline" className="h-13 w-full justify-between rounded-2xl hover:bg-primary/10 hover:text-primary">급수 <span>D</span></Button></div>
    <Button className="mt-3 h-14 w-full rounded-2xl text-[17px] font-bold">게스트로 등록하기</Button>
  </SessionFlowPage>;

  if (previewType === 'attendance') return <SessionFlowPage tone="success">
    <div className="text-center"><SessionFlowIcon tone="success"><Check className="h-9 w-9" /></SessionFlowIcon><h1 className="mt-4 text-[1.65rem] font-bold leading-tight">오늘 출석은<br className="sm:hidden" /> 어떻게 할까요?</h1><p className="mt-2 text-sm text-muted-foreground">강남 배드민턴 클럽 · 6월 정기 운동</p></div>
    <div className="mt-4 space-y-2.5"><Button className="h-16 w-full justify-start rounded-2xl bg-emerald-600 px-5 text-lg font-bold hover:bg-emerald-700"><Check className="mr-3 h-6 w-6" />도착했어요</Button><Button variant="outline" className="h-16 w-full justify-start rounded-2xl border-amber-200 bg-amber-50/50 px-5 text-lg font-bold text-amber-900 hover:bg-amber-100 hover:text-amber-950"><Clock className="mr-3 h-6 w-6 text-amber-700" />조금 늦어요</Button><Button variant="outline" className="h-16 w-full justify-start rounded-2xl border-rose-200 bg-rose-50/50 px-5 text-lg font-bold text-rose-800 hover:bg-rose-100 hover:text-rose-900"><X className="mr-3 h-6 w-6" />오늘 못 가요</Button></div>
  </SessionFlowPage>;

  if (previewType === 'late') return <SessionFlowPage>
    <div className="text-center"><SessionFlowIcon><Clock className="h-9 w-9" /></SessionFlowIcon><h1 className="mt-4 text-[1.65rem] font-bold">조금 늦어요</h1><p className="mt-2 text-sm text-muted-foreground">예상 지각 시간을 알려주세요.</p></div>
    <label className="mt-4 block font-bold">몇 분 정도 늦나요?</label><Input className="mt-2 h-14 rounded-2xl text-lg" value="10" readOnly /><label className="mt-3 block font-bold">이유 <span className="font-normal text-muted-foreground">(선택)</span></label><Input className="mt-2 h-14 rounded-2xl" value="교통이 막혀요" readOnly /><Button className="mt-4 h-14 w-full rounded-2xl text-[17px] font-bold">도착 예정 알리기</Button>
  </SessionFlowPage>;

  if (previewType === 'status') return <div className="min-h-dvh bg-background pb-36">
    <div className="mx-auto w-full max-w-lg px-4 py-5">
      <section className="rounded-3xl border-2 border-border bg-card p-5 shadow-lg">
        <div className="text-center">
          <p className="text-sm font-bold text-primary">강남 배드민턴 클럽</p>
          <h1 className="mt-1 text-[1.65rem] font-bold tracking-[-0.02em]">6월 정기 운동</h1>
          <p className="mt-2 text-sm text-muted-foreground">홍길동님 · 게스트</p>
        </div>
        <div className="mt-5 rounded-[28px] border-2 border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-700">
          <Check className="mx-auto h-12 w-12" />
          <h2 className="mt-3 text-2xl font-bold text-foreground">도착 완료</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">경기 가능 상태로 반영됐어요.</p>
          <p className="mt-3 rounded-2xl bg-card/70 px-4 py-3 text-sm font-semibold text-foreground">도착 시간 19:03</p>
        </div>
        <div className="mt-4 rounded-3xl border border-border bg-secondary/30 p-5">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Clock className="h-5 w-5" /></span><div><p className="text-sm text-muted-foreground">현재 경기 상태</p><strong className="text-lg">경기 배정 전</strong></div></div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">경기판 기능과 실제 경기 배정 데이터가 연결되면 이 영역에 코트와 다음 경기 정보가 표시돼요.</p>
        </div>
        <div className="mt-4">
          <p className="mb-3 px-1 text-sm text-muted-foreground">오늘 기록</p>
          <div className="grid grid-cols-3 gap-2.5"><div className="rounded-2xl border border-border bg-card p-4 text-center"><strong className="block text-2xl">0</strong><small className="text-muted-foreground">경기</small></div><div className="rounded-2xl border border-border bg-card p-4 text-center"><strong className="block text-2xl text-primary">0</strong><small className="text-muted-foreground">승</small></div><div className="rounded-2xl border border-border bg-card p-4 text-center"><strong className="block text-2xl text-muted-foreground">0</strong><small className="text-muted-foreground">패</small></div></div>
        </div>
      </section>
    </div>
    <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-4 py-4 backdrop-blur">
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-2.5"><Button variant="outline" className="h-13 w-full rounded-2xl hover:bg-secondary hover:text-foreground"><UserCheck className="mr-2 h-5 w-5" />출석 변경</Button><Button variant="outline" className="h-13 w-full rounded-2xl hover:bg-secondary hover:text-foreground"><Coffee className="mr-2 h-5 w-5" />지각 수정</Button><Button className="col-span-2 h-14 w-full rounded-2xl text-base font-bold"><BarChart3 className="mr-2 h-5 w-5" />오늘 기록 보기</Button></div>
    </div>
  </div>;

  return <SessionFlowPage>
    <div className="text-center"><SessionFlowIcon><QrCode className="h-9 w-9" /></SessionFlowIcon><h1 className="mt-4 text-[1.65rem] font-bold">일정에 입장할게요</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">QR을 촬영하거나 입장 코드를 입력해 주세요.</p></div>
    <Button variant="outline" className="mt-4 h-14 w-full rounded-2xl border-2 text-base font-semibold hover:border-primary hover:bg-primary/10 hover:text-primary"><Camera className="mr-2 h-5 w-5 text-primary" />QR 촬영하기</Button>
    <label className="mt-3 block font-bold" htmlFor="preview-code"><Keyboard className="mr-2 inline h-5 w-5 text-primary" />일정 입장 코드</label><Input id="preview-code" className="mt-2 h-14 rounded-2xl text-center text-xl font-bold tracking-[0.18em]" value="A7K3M9Q2" readOnly /><Button className="mt-3 h-14 w-full rounded-2xl text-[17px] font-bold">일정 확인하기</Button>
  </SessionFlowPage>;
}

import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, UserCheck, UserPlus } from 'lucide-react';
import SessionFlowHeader from '../components/SessionFlowHeader';
import { SessionFlowPage } from '../components/SessionFlowLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ApiClientError } from '../utils/apiClient';
import { sessionEntryApi, type SessionEntryPreview } from '../utils/sessionEntryApi';
import { setAuthRedirectPath } from '../utils/authSession';

const date = (value: string) => new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(value));
const time = (value: string) => new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value));
const selectableRestrictions = new Set(['REGISTRATION_CLOSED', 'NON_MEMBER_LINK_DISABLED']);
const resultSlug = (reason: string) => reason.toLowerCase().replaceAll('_', '-');

function FlowSelect({ value, placeholder, options, onChange, className = '' }: { value: string; placeholder: string; options: Array<[string, string]>; onChange: (value: string) => void; className?: string }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger className={`h-12 rounded-xl focus-visible:border-primary focus-visible:ring-primary/20 ${className}`}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent className="border-primary/20">{options.map(([optionValue, label]) => <SelectItem key={optionValue} value={optionValue} className="focus:bg-primary/10 focus:text-primary data-[state=checked]:text-primary">{label}</SelectItem>)}</SelectContent></Select>;
}

export default function JoinSessionPage() {
  const { sessionId } = useParams(); const id = Number(sessionId); const navigate = useNavigate(); const location = useLocation(); const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const [entry, setEntry] = useState<SessionEntryPreview | null>((location.state as { entry?: SessionEntryPreview } | null)?.entry ?? null);
  const [loading, setLoading] = useState(!entry); const [error, setError] = useState(''); const [registered, setRegistered] = useState<boolean | null>(null);
  const [form, setForm] = useState({ name: '', gender: '', ageGroup: '', grade: '' });

  const moveToLogin = useCallback(() => { const path = `${location.pathname}${location.search}`; setAuthRedirectPath(path); navigate(`/login?redirect=${encodeURIComponent(path)}`); }, [location.pathname, location.search, navigate]);
  const moveToResult = useCallback((reason: string, current: SessionEntryPreview | null = entry) => navigate(`/sessions/${id}/entry-result/${resultSlug(reason)}`, { state: { entry: current, code } }), [code, entry, id, navigate]);

  useEffect(() => {
    if (!Number.isFinite(id) || entry) return;
    void sessionEntryApi.bySession(id, code).then(setEntry).catch(errorValue => {
      if (errorValue instanceof ApiClientError && errorValue.status === 401) moveToLogin();
      else if (errorValue instanceof ApiClientError && (errorValue.status === 403 || errorValue.status === 404)) navigate('/session-entry/result/session-not-found');
      else setError('일정 정보를 불러오지 못했어요.');
    }).finally(() => setLoading(false));
  }, [code, entry, id, moveToLogin, navigate]);

  useEffect(() => {
    if (entry?.loggedIn && !entry.profileCompleted && !entry.registered) moveToResult('PROFILE_REQUIRED', entry);
  }, [entry, moveToResult]);

  useEffect(() => {
    if (entry?.profileCompleted && searchParams.get('intent') === 'new-register') setRegistered(false);
  }, [entry?.profileCompleted, searchParams]);

  const blocked = Boolean(entry && (!entry.entryOpen || entry.restrictionReason && !selectableRestrictions.has(entry.restrictionReason)));
  useEffect(() => {
    if (blocked && entry) moveToResult(entry.restrictionReason ?? 'TOO_EARLY', entry);
  }, [blocked, entry, moveToResult]);

  const decide = async () => {
    if (registered === null) return;
    setLoading(true); setError('');
    try {
      const next = await sessionEntryApi.decide(id, { registered, ...form }, code);
      setEntry(next);
      if (next.restrictionReason) { moveToResult(next.restrictionReason, next); return; }
      if (!registered && next.registered && entry?.registered === false) { moveToResult('EXISTING_REGISTRATION_FOUND', next); return; }
      navigate(`/sessions/${id}/attendance`, { state: { entry: next, code } });
    } catch (errorValue) {
      if (errorValue instanceof ApiClientError && errorValue.status === 401) moveToLogin();
      else setError('입장 정보를 확인하지 못했어요. 입력 내용을 다시 확인해 주세요.');
    } finally { setLoading(false); }
  };

  if (loading && !entry) return <div className="min-h-dvh bg-background"><SessionFlowHeader /><p className="p-10 text-center">일정을 확인하고 있어요…</p></div>;
  if (!entry) return <div className="min-h-dvh bg-background"><SessionFlowHeader /><div className="mx-auto max-w-lg p-8 text-center"><p>{error}</p><Button className="mt-4" onClick={() => navigate('/session-entry')}>코드 다시 입력하기</Button></div></div>;
  if (blocked) return <div className="min-h-dvh bg-background"><SessionFlowHeader /><p className="p-10 text-center">입장 가능 여부를 확인하고 있어요…</p></div>;

  return <SessionFlowPage wide><div className="mb-4 text-center"><p className="text-sm font-bold text-primary">{entry.groupName}</p><h1 className="mt-1 text-[1.65rem] font-bold tracking-[-0.02em] md:text-4xl">{entry.title}</h1></div><div className="mb-4 grid grid-cols-[1.2fr_0.8fr] gap-2.5 md:grid-cols-3"><p className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary/40 px-3.5 text-center text-sm font-semibold"><Calendar className="h-5 w-5 shrink-0 text-primary" />{date(entry.startsAt)}</p><p className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary/40 px-3.5 text-center text-sm font-semibold"><Clock className="h-5 w-5 shrink-0 text-primary" />{time(entry.startsAt)}</p><p className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary/40 px-3.5 text-center text-sm font-semibold md:col-span-1"><MapPin className="h-5 w-5 shrink-0 text-primary" />{entry.place || '장소 미정'}</p></div><h2 className="text-center text-lg font-bold">참여 정보를 선택해 주세요</h2><div className="mt-3 grid grid-cols-2 gap-2.5"><button className={`min-h-[104px] rounded-2xl border-2 p-4 text-left transition-colors ${registered === true ? 'border-primary bg-primary/10' : 'border-border hover:border-primary hover:bg-primary/10'}`} onClick={() => setRegistered(true)}><UserCheck className="mb-2 h-7 w-7 text-primary" /><strong className="block text-base">이미 등록했어요</strong><p className="mt-1 text-xs leading-5 text-muted-foreground">투표했거나 미리 등록된 참가자</p></button><button className={`min-h-[104px] rounded-2xl border-2 p-4 text-left transition-colors ${registered === false ? 'border-primary bg-primary/10' : 'border-border hover:border-primary hover:bg-primary/10'}`} onClick={() => setRegistered(false)}><UserPlus className="mb-2 h-7 w-7 text-primary" /><strong className="block text-base">등록 안 했어요</strong><p className="mt-1 text-xs leading-5 text-muted-foreground">지금 새로 참가 등록하기</p></button></div>{registered !== null && !entry.loggedIn && (!registered || !entry.registered) && <div className="mt-3 grid grid-cols-2 gap-2.5 rounded-2xl bg-secondary/30 p-3"><Input className="col-span-2 h-12 rounded-xl" placeholder="이름" value={form.name} onChange={event => setForm({...form, name:event.target.value})}/><FlowSelect value={form.gender} placeholder="성별" options={[["MALE","남성"],["FEMALE","여성"]]} onChange={gender => setForm({...form, gender})}/><FlowSelect value={form.ageGroup} placeholder="연령" options={[["TEENS","10대"],["TWENTIES","20대"],["THIRTIES","30대"],["FORTIES","40대"],["FIFTIES","50대"],["SIXTIES_AND_ABOVE","60대 이상"]]} onChange={ageGroup => setForm({...form, ageGroup})}/><FlowSelect className="col-span-2" value={form.grade} placeholder="급수" options={['E','D','C','B','A','S','SS'].map(value => [value, value])} onChange={grade => setForm({...form, grade})}/></div>}<p className="min-h-7 pt-1 text-center text-sm text-destructive">{error}</p><Button className="h-14 w-full rounded-2xl text-[17px] font-bold" disabled={registered === null || loading} onClick={decide}>출석 선택으로 계속</Button></SessionFlowPage>;
}

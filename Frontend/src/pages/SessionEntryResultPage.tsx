import { AlertTriangle, Camera, Check, Clock, LockKeyhole, SearchX, UserRoundCheck, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SessionFlowIcon, SessionFlowNotice, SessionFlowPage, type SessionFlowTone } from '../components/SessionFlowLayout';
import { Button } from '../components/ui/button';
import { setAuthRedirectPath } from '../utils/authSession';
import { groupPath, sessionPath } from '../utils/publicId';
import type { SessionEntryPreview } from '../utils/sessionEntryApi';

const results = {
  'invalid-code-format': ['코드 형식을 확인해 주세요', '영문 대문자와 숫자로 된 8자리 코드를 입력해 주세요.', SearchX, '0, O, 1, I는 사용하지 않아요.'],
  'session-not-found': ['일정을 찾을 수 없어요', '코드가 잘못됐거나 삭제된 일정이에요.', SearchX, '입장 코드를 다시 확인해 주세요.'],
  'camera-unavailable': ['카메라를 사용할 수 없어요', '브라우저 지원 또는 카메라 권한을 확인해 주세요.', Camera, '카메라 없이 입장 코드를 직접 입력할 수도 있어요.'],
  'too-early': ['아직 입장 시간이 아니에요', '운동 시작 1시간 전부터 입장할 수 있어요.', Clock, '모임 상세 또는 홈에서 잠시 기다려 주세요.'],
  cancelled: ['취소된 일정이에요', '이 일정은 운영자에 의해 취소되었어요.', X, '모임 상세에서 다른 일정을 확인해 주세요.'],
  closed: ['이미 종료된 일정이에요', '이 일정에는 더 이상 입장할 수 없어요.', LockKeyhole, '참여 권한에 맞는 일정 리포트를 확인할 수 있어요.'],
  'group-guest-disabled': ['모임 멤버만 참여할 수 있어요', '이 모임은 게스트 참여를 허용하지 않아요.', LockKeyhole, '로그인하거나 회원가입한 뒤 모임 가입을 확인해 주세요.'],
  'session-guest-disabled': ['게스트 참여를 받지 않아요', '이번 일정은 모임 멤버만 참여할 수 있어요.', LockKeyhole, '모임 상세에서 다른 일정을 확인해 주세요.'],
  'non-member-link-disabled': ['운영자가 등록한 게스트만 참여할 수 있어요', '새로운 비회원 등록은 닫혀 있어요.', LockKeyhole, '이미 등록했다면 이전 화면에서 “이미 등록했어요”를 선택해 주세요.'],
  'registration-closed': ['참가 등록이 마감되었어요', '투표 마감 또는 당일 변경 정책에 따라 새로 등록할 수 없어요.', LockKeyhole, '모임 상세에서 다음 일정을 확인해 주세요.'],
  'registration-not-found': ['등록된 정보를 찾지 못했어요', '입력한 정보와 일치하는 참가자가 없어요.', SearchX, '정보를 확인하거나 “등록 안 했어요”를 선택해 주세요.'],
  'absent-locked': ['이미 불참으로 등록된 일정이에요', '현재 정책에서는 참석 상태로 변경할 수 없어요.', LockKeyhole, '변경이 필요하면 운영자에게 문의해 주세요.'],
  'participation-change-locked': ['참여 상태를 변경할 수 없어요', '당일 또는 투표 마감 후 상태 변경이 제한된 일정이에요.', LockKeyhole, '기존 참여 상태가 유지돼요.'],
  'profile-required': ['추가 정보가 필요해요', '일정 참여 전에 이름·성별·연령·급수를 완료해 주세요.', UserRoundCheck, '입력 완료 후 같은 일정으로 돌아와요.'],
  'existing-registration-found': ['등록된 참가 정보를 찾았어요', '입력한 정보와 일치하는 기존 참가자로 연결할 수 있어요.', UserRoundCheck, '계속하면 출석 선택으로 이동해요.'],
  'arrival-complete': ['도착 처리가 완료됐어요', '경기 가능 상태로 저장했어요.', Check, '참가자 현황에서 내 상태를 확인해 주세요.'],
  'late-complete': ['지각 예정이 전달됐어요', '예상 도착 시간과 사유를 저장했어요.', Clock, '도착하면 출석 체크에서 “도착했어요”로 변경할 수 있어요.'],
  'absence-complete': ['불참으로 저장했어요', '오늘 일정에는 참여하지 않는 것으로 처리했어요.', Check, '모임 상세에서 다음 일정을 확인할 수 있어요.'],
} as const;

const groupDetailResults = new Set(['too-early', 'cancelled', 'closed', 'session-guest-disabled', 'registration-closed', 'absence-complete']);
const dangerResults = new Set(['invalid-code-format', 'session-not-found', 'camera-unavailable', 'cancelled']);
const warningResults = new Set(['too-early', 'closed', 'group-guest-disabled', 'session-guest-disabled', 'non-member-link-disabled', 'registration-closed', 'registration-not-found', 'absent-locked', 'participation-change-locked']);
const successResults = new Set(['arrival-complete', 'existing-registration-found']);

function withQueryParam(path: string, key: string, value: string) {
  const [basePath, search = ''] = path.split('?');
  const params = new URLSearchParams(search);
  params.set(key, value);
  return `${basePath}?${params.toString()}`;
}

function resultTone(resultType: string): SessionFlowTone {
  if (dangerResults.has(resultType)) return 'danger';
  if (warningResults.has(resultType)) return 'warning';
  if (successResults.has(resultType)) return 'success';
  if (resultType === 'late-complete' || resultType === 'profile-required') return 'info';
  return 'brand';
}

export default function SessionEntryResultPage() {
  const { sessionId: routeSessionId, resultType = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const preview = location.pathname.includes('/session-entry/previews/');
  const state = location.state as { entry?: SessionEntryPreview; code?: string | null } | null;
  const entry = state?.entry;
  const sessionId = routeSessionId ?? (preview ? 'demo' : '');
  const groupId = entry?.groupId ?? (preview ? '1' : null);
  const result = results[resultType as keyof typeof results] ?? ['안내를 확인해 주세요', '일정 입장 상태를 확인하지 못했어요.', AlertTriangle, '코드를 다시 입력해 주세요.'] as const;
  const [title, description, Icon, detail] = result;
  const joinPath = `${sessionPath(sessionId, '/join')}${state?.code ? `?code=${encodeURIComponent(state.code)}` : ''}`;
  const retryCode = ['invalid-code-format', 'session-not-found', 'camera-unavailable'].includes(resultType);
  const canViewReport = preview || entry?.operator || entry?.participantType === 'MEMBER' || entry?.participantType === 'GUEST';
  const tone = resultTone(resultType);

  const goToLogin = () => {
    setAuthRedirectPath(joinPath);
    navigate(`/login?redirect=${encodeURIComponent(joinPath)}`);
  };

  const goToReport = () => {
    if (entry?.operator) navigate(sessionPath(sessionId, '/report'));
    else if (entry?.participantType === 'GUEST') navigate(sessionPath(sessionId, '/guest-report'));
    else navigate(sessionPath(sessionId, '/my-report'));
  };

  const primaryAction = () => {
    if (resultType === 'profile-required') {
      const returnPath = withQueryParam(joinPath, 'intent', 'new-register');
      setAuthRedirectPath(returnPath);
      navigate(`/social-signup?redirect=${encodeURIComponent(returnPath)}`);
    } else if (resultType === 'existing-registration-found') navigate(sessionPath(sessionId, '/attendance'), { state });
    else if (resultType === 'arrival-complete') navigate(sessionPath(sessionId, '/status'));
    else if (resultType === 'late-complete') navigate(sessionPath(sessionId, '/attendance'), { state });
    else if (resultType === 'closed') {
      if (canViewReport) goToReport();
      else navigate('/');
    }
    else if (resultType === 'group-guest-disabled') goToLogin();
    else if (['registration-not-found', 'non-member-link-disabled', 'registration-closed'].includes(resultType)) navigate(joinPath, { state });
    else if (retryCode) navigate('/session-entry');
    else navigate('/');
  };

  const primaryLabel = resultType === 'profile-required' ? '추가 정보 입력하기'
    : resultType === 'existing-registration-found' ? '출석 선택으로 계속'
      : resultType === 'arrival-complete' ? '참가자 현황으로 이동'
        : resultType === 'late-complete' ? '출석 체크로 돌아가기'
          : resultType === 'closed' ? canViewReport ? '일정 리포트 보기' : '홈으로'
            : resultType === 'group-guest-disabled' ? '로그인하기'
              : retryCode ? '코드 다시 입력하기'
                : resultType.includes('registration') || resultType === 'non-member-link-disabled' ? '이전 화면으로' : '홈으로';

  return <SessionFlowPage tone={tone}>
    <div className="text-center">
      <SessionFlowIcon tone={tone}><Icon className="h-9 w-9" strokeWidth={2.2} /></SessionFlowIcon>
      {entry && <p className="mt-2 text-sm font-semibold text-foreground/70">{entry.groupName} · {entry.title}</p>}
      <h1 className="mt-4 text-[1.65rem] font-bold leading-tight tracking-[-0.02em] md:text-4xl">{title}</h1>
      <p className="mt-2.5 text-[15px] leading-6 text-muted-foreground md:text-base">{description}</p>
    </div>
    <div className="my-5"><SessionFlowNotice tone={tone}>{detail}</SessionFlowNotice></div>
    <div className="space-y-2.5">
      <Button className="h-14 w-full rounded-2xl text-[17px] font-bold shadow-sm" onClick={primaryAction}>{primaryLabel}</Button>
      {resultType === 'group-guest-disabled' && <Button variant="outline" className="h-14 w-full rounded-2xl border-border text-base font-semibold hover:border-border hover:bg-secondary hover:text-foreground" onClick={() => navigate('/signup')}>회원가입하기</Button>}
      {groupId && groupDetailResults.has(resultType) && <Button variant="outline" className="h-14 w-full rounded-2xl border-border text-base font-semibold hover:border-border hover:bg-secondary hover:text-foreground" onClick={() => navigate(groupPath(groupId))}>모임 상세로 이동</Button>}
      {resultType !== 'existing-registration-found' && resultType !== 'group-guest-disabled' && !retryCode && <Button variant="ghost" className="h-12 w-full rounded-2xl text-base hover:bg-secondary hover:text-secondary-foreground" onClick={() => navigate('/session-entry')}>다른 코드 입력하기</Button>}
      {resultType === 'group-guest-disabled' && <Button variant="ghost" className="h-12 w-full rounded-2xl text-base hover:bg-secondary hover:text-secondary-foreground" onClick={() => navigate('/')}>홈으로</Button>}
    </div>
  </SessionFlowPage>;
}

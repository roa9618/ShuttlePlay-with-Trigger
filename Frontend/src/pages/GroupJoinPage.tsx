import { AlertTriangle, Check, Clock3, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { ApiClientError } from '../utils/apiClient';
import { groupDetailApi, type GroupJoinLinkResponse } from '../utils/groupDetailApi';
import { styles } from './GroupJoinPage.styles';

type JoinState =
  | { status: 'loading' }
  | { status: 'ready'; result: GroupJoinLinkResponse }
  | { status: 'processing'; result: GroupJoinLinkResponse }
  | { status: 'success'; result: GroupJoinLinkResponse }
  | { status: 'error'; message: string };

const statusContent = {
  JOINED: {
    icon: Check,
    title: '모임 가입이 완료되었습니다.',
    description: '가입한 모임의 상세 페이지에서 활동을 시작할 수 있습니다.',
  },
  REQUESTED: {
    icon: Clock3,
    title: '가입 신청을 보냈습니다.',
    description: '운영자가 승인하면 모임에 참여할 수 있습니다.',
  },
  ALREADY_MEMBER: {
    icon: Check,
    title: '이미 가입한 모임입니다.',
    description: '모임 상세 페이지에서 활동을 확인할 수 있습니다.',
  },
  CLOSED: {
    icon: AlertTriangle,
    title: '현재 신규 가입을 받고 있지 않습니다.',
    description: '모임 운영자에게 가입 가능 여부를 확인해 주세요.',
  },
} as const;

export default function GroupJoinPage() {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [state, setState] = useState<JoinState>({ status: 'loading' });
  const requestedRef = useRef(false);
  const numericGroupId = Number(groupId);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    if (!Number.isFinite(numericGroupId) || numericGroupId <= 0) {
      setState({ status: 'error', message: '유효하지 않은 모임 링크입니다.' });
      return;
    }

    if (session?.profileCompleted === false) {
      const returnPath = `${location.pathname}${location.search}${location.hash}`;
      navigate(`/social-signup?redirect=${encodeURIComponent(returnPath)}`, { replace: true });
      return;
    }

    void groupDetailApi.getJoinPreview(numericGroupId)
      .then(result => {
        if (result.status === 'PROFILE_REQUIRED') {
          const returnPath = `${location.pathname}${location.search}${location.hash}`;
          navigate(`/social-signup?redirect=${encodeURIComponent(returnPath)}`, { replace: true });
          return;
        }
        setState({ status: result.status === 'AVAILABLE' ? 'ready' : 'success', result });
      })
      .catch(error => {
        const message = error instanceof ApiClientError && error.status === 404
          ? '모임을 찾을 수 없거나 더 이상 사용할 수 없는 링크입니다.'
          : '가입 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        setState({ status: 'error', message });
      });
  }, [location.hash, location.pathname, location.search, navigate, numericGroupId, session?.profileCompleted]);

  const handleJoin = async () => {
    if (state.status !== 'ready') return;

    setState({ status: 'processing', result: state.result });
    try {
      const result = await groupDetailApi.joinBySharedLink(numericGroupId);
      setState({ status: 'success', result });
    } catch {
      setState({ status: 'error', message: '가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
    }
  };

  const result = state.status === 'ready' || state.status === 'processing' || state.status === 'success'
    ? state.result
    : null;
  const content = useMemo(() => {
    if (!result || result.status === 'AVAILABLE' || result.status === 'PROFILE_REQUIRED') return null;
    return statusContent[result.status];
  }, [result]);

  const Icon = content?.icon ?? UserCheck;
  const detailPath = result ? `/groups/${result.groupId}` : '/groups';

  return (
    <div className = {styles.page}>
      <div className = {styles.backgroundGlowTop} />
      <div className = {styles.backgroundGlowBottom} />

      <main className = {styles.shell}>
        <section className = {styles.card}>
          <header className = {styles.header}>
            <span className = {styles.headerEyebrow}>모임 공유 링크</span>
            <h1 className = {styles.title}>
              {state.status === 'loading'
                ? '모임 가입을 준비하고 있습니다.'
                : state.status === 'ready' || state.status === 'processing'
                  ? '모임 가입을 확인해 주세요.'
                  : content?.title ?? '가입을 처리하지 못했습니다.'}
            </h1>
            <p className = {styles.description}>
              로그인한 회원 계정으로 모임 가입 절차를 진행합니다.
            </p>
          </header>

          <div className = {styles.body}>
            <div className = {styles.imageWrap}>
              {result?.profileImageUrl ? (
                <img src = {result.profileImageUrl} alt = "" className = {styles.image} />
              ) : (
                <Icon className = {styles.icon} />
              )}
            </div>

            {state.status === 'loading' && (
              <>
                <strong className = {styles.groupName}>잠시만 기다려 주세요.</strong>
                <p className = {styles.statusText}>공유 링크와 가입 가능 여부를 확인하고 있습니다.</p>
                <span className = {styles.loadingDot} aria-hidden = "true" />
              </>
            )}

            {(state.status === 'ready' || state.status === 'processing') && result && (
              <>
                <strong className = {styles.groupName}>{result.groupName}</strong>
                <p className = {styles.statusText}>
                  {result.approvalRequired
                    ? '가입 요청을 보내면 운영자의 승인 후 모임에 참여할 수 있습니다.'
                    : '가입을 확인하면 바로 모임에 참여할 수 있습니다.'}
                </p>
                <div className = {styles.actions}>
                  <Button asChild variant = "outline" className = {styles.secondaryButton}>
                    <Link to = "/groups">취소</Link>
                  </Button>
                  <Button
                    className = {state.status === 'processing' ? styles.disabledButton : styles.primaryButton}
                    disabled = {state.status === 'processing'}
                    onClick = {handleJoin}
                  >
                    {state.status === 'processing' ? '처리 중' : result.approvalRequired ? '가입 요청 보내기' : '모임 가입하기'}
                  </Button>
                </div>
              </>
            )}

            {state.status === 'success' && content && result && (
              <>
                <strong className = {styles.groupName}>{result.groupName}</strong>
                <p className = {styles.statusText}>{content.description}</p>
                <div className = {styles.actions}>
                  <Button asChild className = {styles.primaryButton}>
                    <Link to = {result.status === 'REQUESTED' || result.status === 'CLOSED' ? '/groups' : detailPath}>
                      {result.status === 'REQUESTED' || result.status === 'CLOSED' ? '내 모임으로 이동' : '모임 상세로 이동'}
                    </Link>
                  </Button>
                </div>
              </>
            )}

            {state.status === 'error' && (
              <>
                <strong className = {styles.groupName}>링크를 확인해 주세요.</strong>
                <p className = {styles.statusText}>{state.message}</p>
                <div className = {styles.actions}>
                  <Button asChild variant = "outline" className = {styles.secondaryButton}>
                    <Link to = "/groups">내 모임으로 이동</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

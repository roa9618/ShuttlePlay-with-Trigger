import { AlertTriangle, Check, Clock3, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ApiClientError } from '../utils/apiClient';
import { groupDetailApi, type GroupJoinLinkResponse } from '../utils/groupDetailApi';
import { styles } from './GroupJoinPage.styles';

type JoinState =
  | { status: 'loading' }
  | { status: 'success'; result: GroupJoinLinkResponse }
  | { status: 'error'; message: string };

const statusContent = {
  JOINED: {
    icon: Check,
    title: '모임 가입이 완료되었습니다.',
    description: '내 모임 목록에서 가입한 모임을 확인할 수 있습니다.',
  },
  REQUESTED: {
    icon: Clock3,
    title: '가입 신청을 보냈습니다.',
    description: '운영자가 승인하면 모임에 참여할 수 있습니다.',
  },
  ALREADY_MEMBER: {
    icon: Check,
    title: '모임 가입이 완료되었습니다.',
    description: '내 모임 목록에서 가입한 모임을 확인할 수 있습니다.',
  },
  CLOSED: {
    icon: AlertTriangle,
    title: '현재 신규 가입을 받고 있지 않습니다.',
    description: '모임 운영자에게 가입 가능 여부를 확인해 주세요.',
  },
} as const;

export default function GroupJoinPage() {
  const { groupId } = useParams();
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

    void groupDetailApi.joinBySharedLink(numericGroupId)
      .then(result => setState({ status: 'success', result }))
      .catch(error => {
        const message = error instanceof ApiClientError && error.status === 404
          ? '모임을 찾을 수 없거나 더 이상 사용할 수 없는 링크입니다.'
          : '가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        setState({ status: 'error', message });
      });
  }, [numericGroupId]);

  const content = useMemo(() => {
    if (state.status !== 'success') return null;
    return statusContent[state.result.status];
  }, [state]);

  const Icon = content?.icon ?? UserCheck;

  return (
    <div className = {styles.page}>
      <div className = {styles.backgroundGlowTop} />
      <div className = {styles.backgroundGlowBottom} />

      <main className = {styles.shell}>
        <section className = {styles.card}>
          <header className = {styles.header}>
            <span className = {styles.headerEyebrow}>모임 공유 링크</span>
            <h1 className = {styles.title}>
              {state.status === 'loading' ? '모임 가입을 준비하고 있습니다.' : content?.title ?? '가입을 처리하지 못했습니다.'}
            </h1>
            <p className = {styles.description}>
              로그인한 회원 계정으로 모임 가입 절차를 진행합니다.
            </p>
          </header>

          <div className = {styles.body}>
            <div className = {styles.imageWrap}>
              {state.status === 'success' && state.result.profileImageUrl ? (
                <img src = {state.result.profileImageUrl} alt = "" className = {styles.image} />
              ) : (
                <Icon className = {styles.icon} />
              )}
            </div>

            {state.status === 'loading' && (
              <>
                <strong className = {styles.groupName}>잠시만 기다려 주세요.</strong>
                <p className = {styles.statusText}>공유 링크를 확인하고 가입 가능 여부를 확인하고 있습니다.</p>
                <span className = {styles.loadingDot} aria-hidden = "true" />
              </>
            )}

            {state.status === 'success' && content && (
              <>
                <strong className = {styles.groupName}>{state.result.groupName}</strong>
                <p className = {styles.statusText}>{content.description}</p>
                <div className = {styles.actions}>
                  <Button asChild className = {styles.primaryButton}>
                    <Link to = "/groups">내 모임으로 이동</Link>
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

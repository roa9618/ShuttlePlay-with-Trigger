import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { consumeAuthRedirectPath, getAuthRedirectPath, startTokenAuthSession, type AuthSession, type UserRole } from '../utils/authSession';
import { styles } from './LoginPage.styles';

function normalizeRole(role: string | null): UserRole {
  if (role === 'ADMIN') {
    return 'ADMIN';
  }

  return 'USER';
}

function normalizeProfileCompleted(value: string | null) {
  return value === 'true';
}

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSessionFromStorage } = useAuth();

  useEffect(() => {
    const error = searchParams.get('error');
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (error) {
      navigate('/login', {
        replace: true,
        state: {
          error,
        },
      });
      return;
    }

    if (!accessToken || !refreshToken) {
      navigate('/login', {
        replace: true,
        state: {
          error: '소셜 로그인 정보를 확인할 수 없습니다.',
        },
      });
      return;
    }

    const profileCompleted = normalizeProfileCompleted(searchParams.get('profileCompleted'));

    const session: AuthSession = {
      id: Number(searchParams.get('id')) || undefined,
      email: searchParams.get('email') ?? '',
      name: searchParams.get('name') ?? '회원',
      role: normalizeRole(searchParams.get('role')),
      provider: searchParams.get('provider') ?? undefined,
      profileCompleted,
    };

    startTokenAuthSession(session, {
      accessToken,
      refreshToken,
    });

    setSessionFromStorage();

    const redirectPath = getAuthRedirectPath();

    if (profileCompleted) {
      consumeAuthRedirectPath();
    }

    navigate(profileCompleted ? redirectPath : `/social-signup?redirect=${encodeURIComponent(redirectPath)}`, {
      replace: true,
    });
  }, [navigate, searchParams, setSessionFromStorage]);

  return (
    <div className = {styles.page}>
      <div className = {styles.decorativeShape} />

      <div className = {styles.decorativeShape2}>
        <ShuttlecockIcon size = {120} className = {styles.shuttlecockIcon} />
      </div>
      <div className = {styles.decorativeShape3}>
        <ShuttlecockIcon size = {80} className = {styles.shuttlecockIcon} />
      </div>
      <div className = {styles.decorativeShape4}>
        <Sparkles className = {styles.sparklesIcon} />
      </div>

      <div className = {styles.stack}>
        <div className = {styles.stack2}>
          <div className = {styles.row}>
            <Logo size = "lg" />
          </div>
          <div className = {styles.stack3}>
            <h1 className = {styles.pageTitle}>소셜 로그인 처리 중</h1>
            <p className = {styles.descriptionText}>
              로그인 정보를 확인하고 있어요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

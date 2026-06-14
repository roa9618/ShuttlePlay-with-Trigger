import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, ChevronDown, ChevronRight, ClipboardCheck, Download, LogIn, LogOut, QrCode, Settings, UserPlus, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAuthAccessToken, getAuthSession, updateAuthTokens } from '../utils/authSession';
import { usePwaInstall } from '../utils/usePwaInstall';
import { styles } from './HomePage.styles';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { install, isInstalled, installGuide } = usePwaInstall();
  const { session, isAuthenticated, refreshSession, setSessionFromStorage, logout } = useAuth();
  const [toastMessage, setToastMessage] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const oauthHandledRef = useRef(false);
  const displaySession = session ?? (getAuthAccessToken() ? getAuthSession() : null);

  const mainActions = [
    {
      title: '모임 참여',
      description: '초대 링크나 QR로 오늘 모임에 참여하세요',
      path: '/sessions/demo/join',
      icon: QrCode,
      badge: '참가자',
      tone: 'accent',
      requiresAuth: false,
    },
    {
      title: '모임 운영',
      description: '출석, 매칭, 결과 입력을 한곳에서 관리하세요',
      path: '/groups',
      icon: ClipboardCheck,
      badge: '운영자',
      tone: 'primary',
      requiresAuth: true,
      managesGroups: true,
    },
  ];

  const quickLinks = [
    { title: '내 모임', path: '/groups', icon: Users },
    { title: '일정 생성', path: '/groups/entry/create-session', icon: Calendar },
    { title: '내 기록', path: '/my-record', icon: ClipboardCheck },
    { title: '설정', path: '/settings', icon: Settings },
  ];

  useEffect(() => {
    if (oauthHandledRef.current) {
      return;
    }

    const accessToken = searchParams.get('accessToken') ?? searchParams.get('access_token');
    const refreshToken = searchParams.get('refreshToken') ?? searchParams.get('refresh_token');
    const profileCompleted = searchParams.get('profileCompleted');

    if (!accessToken || !refreshToken) {
      return;
    }

    oauthHandledRef.current = true;

    const handleOAuthRedirect = async () => {
      updateAuthTokens({
        accessToken,
        refreshToken,
      });

      window.history.replaceState(null, '', window.location.pathname);

      if (profileCompleted === 'false') {
        navigate('/social-signup', {
          replace: true,
        });
        return;
      }

      const nextSession = await refreshSession();

      if (nextSession) {
        navigate('/', {
          replace: true,
        });
        return;
      }

      navigate('/login', {
        replace: true,
        state: {
          error: '소셜 로그인 정보를 확인할 수 없습니다.',
        },
      });
    };

    handleOAuthRedirect();
  }, [searchParams, refreshSession, navigate]);

  useEffect(() => {
    if (!session && getAuthAccessToken()) {
      setSessionFromStorage();
    }
  }, [session, setSessionFromStorage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) {
        return;
      }

      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);

      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    toastTimer.current = setTimeout(() => {
      setToastMessage('');
      toastTimer.current = null;
    }, 3000);
  };

  const handleInstall = async () => {
    if (isInstalled) {
      showToast('이미 앱으로 설치되어 있습니다.');
      return;
    }

    const result = await install();

    if (result === 'installed') {
      showToast('셔틀플레이 설치를 시작했습니다.');
      return;
    }

    if (result === 'unavailable') {
      showToast(installGuide);
    }
  };

  const handleProtectedNavigation = (path: string) => {
    const hasAccessToken = getAuthAccessToken() !== null;

    if (isAuthenticated || hasAccessToken) {
      if (!session) {
        setSessionFromStorage();
      }

      navigate(path);
      return;
    }

    navigate('/login', {
      state: {
        from: path,
      },
    });
  };

  const handleProfileNavigation = (path: string) => {
    setProfileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate('/', {
      replace: true,
    });
  };

  return (
    <div className = {styles.page}>
      <div className = {styles.header}>
        <div className = {styles.headerInner}>
          <Logo size = "md" />

          {displaySession ? (
            <div ref = {profileMenuRef} className = {styles.profileMenuWrapper}>
              <button
                type = "button"
                className = {styles.profileButton}
                onClick = {() => setProfileMenuOpen((prev) => !prev)}
                aria-expanded = {profileMenuOpen}
                aria-haspopup = "menu"
              >
                <span className = {styles.profileName}>{displaySession.name}</span>
                <ChevronDown className = {styles.chevronDownIcon(profileMenuOpen)} />
              </button>

              {profileMenuOpen && (
                <div className = {styles.profileDropdown} role = "menu">
                  <div className = {styles.profileSummary}>
                    <div className = {styles.profileSummaryAvatar}>
                      {displaySession.name.slice(0, 1)}
                    </div>
                    <div className = {styles.profileSummaryText}>
                      <strong className = {styles.profileSummaryName}>{displaySession.name}</strong>
                      <span className = {styles.profileSummaryEmail}>{displaySession.email}</span>
                    </div>
                  </div>

                  <div className = {styles.menuDivider} />

                  <button
                    type = "button"
                    className = {styles.profileMenuItem}
                    onClick = {() => handleProfileNavigation('/groups')}
                    role = "menuitem"
                  >
                    <Users className = {styles.profileMenuIcon} />
                    내 모임
                  </button>

                  <button
                    type = "button"
                    className = {styles.profileMenuItem}
                    onClick = {() => handleProfileNavigation('/my-record')}
                    role = "menuitem"
                  >
                    <ClipboardCheck className = {styles.profileMenuIcon} />
                    내 기록
                  </button>

                  <button
                    type = "button"
                    className = {styles.profileMenuItem}
                    onClick = {() => handleProfileNavigation('/settings')}
                    role = "menuitem"
                  >
                    <Settings className = {styles.profileMenuIcon} />
                    설정
                  </button>

                  <div className = {styles.menuDivider} />

                  <button
                    type = "button"
                    className = {styles.logoutMenuItem}
                    onClick = {handleLogout}
                    role = "menuitem"
                  >
                    <LogOut className = {styles.profileMenuIcon} />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className = {styles.row}>
              <Link to = "/login">
                <Button variant = "ghost" className = {styles.loginButton}>
                  <LogIn className = {styles.logInIcon} />
                  로그인
                </Button>
              </Link>
              <Link to = "/signup">
                <Button className = {styles.signupButton}>
                  <UserPlus className = {styles.logInIcon} />
                  가입
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <main className = {styles.mainArea}>
        <div className = {styles.decorations} aria-hidden = "true">
          <ShuttlecockIcon size = {120} className = {styles.shuttlecockTop} />
          <ShuttlecockIcon size = {84} className = {styles.shuttlecockLeft} />
          <ShuttlecockIcon size = {96} className = {styles.shuttlecockRight} />
          <ShuttlecockIcon size = {72} className = {styles.shuttlecockBottom} />
          <Calendar className = {styles.calendarDecoration} />
          <Users className = {styles.usersDecoration} />
          <ClipboardCheck className = {styles.clipboardDecoration} />
        </div>

        <div className = {styles.content}>
          <div className = {styles.sectionHeader}>
            <h1 className = {styles.pageTitle}>오늘은 어떻게 시작할까요?</h1>
            <p className = {styles.descriptionText}>
              참여하거나 모임을 운영할 화면을 선택하세요.
            </p>
          </div>

          <div className = {styles.cardGrid}>
            {mainActions.map((action) => {
              const Icon = action.icon;

              if (action.requiresAuth) {
                return (
                  <button
                    key = {action.title}
                    type = "button"
                    className = {styles.cardButton}
                    onClick = {() => action.managesGroups
                      ? handleProtectedNavigation('/groups/entry/manage')
                      : handleProtectedNavigation(action.path)}
                  >
                    <div className = {styles.actionCard(action.tone)}>
                      <div className = {styles.betweenRow}>
                        <div className = {styles.row2}>
                          <Icon className = {styles.iconIcon(action.tone)} />
                        </div>
                        <Badge className = {styles.actionBadge(action.tone)}>
                          {action.badge}
                        </Badge>
                      </div>
                      <div className = {styles.betweenRow2}>
                        <div>
                          <h2 className = {styles.sectionTitle}>{action.title}</h2>
                          <p className = {styles.descriptionText2}>{action.description}</p>
                        </div>
                        <ChevronRight className = {styles.chevronRightIcon} />
                      </div>
                    </div>
                  </button>
                );
              }

              return (
                <Link key = {action.title} to = {action.path} className = {styles.cardLink}>
                  <div className = {styles.actionCard(action.tone)}>
                    <div className = {styles.betweenRow}>
                      <div className = {styles.row2}>
                        <Icon className = {styles.iconIcon(action.tone)} />
                      </div>
                      <Badge className = {styles.actionBadge(action.tone)}>
                        {action.badge}
                      </Badge>
                    </div>
                    <div className = {styles.betweenRow2}>
                      <div>
                        <h2 className = {styles.sectionTitle}>{action.title}</h2>
                        <p className = {styles.descriptionText2}>{action.description}</p>
                      </div>
                      <ChevronRight className = {styles.chevronRightIcon} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className = {styles.header2}>
            <h2 className = {styles.sectionTitle2}>바로가기</h2>
            <div className = {styles.cardGrid2}>
              {quickLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <button
                    key = {link.title}
                    type = "button"
                    className = {styles.quickLinkButton}
                    onClick = {() => handleProtectedNavigation(link.path)}
                  >
                    <div className = {styles.summaryBox}>
                      <Icon className = {styles.iconIcon2} />
                      <p className = {styles.summaryText}>{link.title}</p>
                    </div>
                  </button>
                );
              })}
              <button type = "button" className = {styles.installButton} onClick = {handleInstall}>
                <Download className = {styles.iconIcon2} />
                <p className = {styles.summaryText}>앱 설치</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {toastMessage && (
        <div className = {styles.toast} role = "status">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Award, CalendarDays, ChevronDown, Clock, ClipboardCheck, LogIn, LogOut, MapPin, Settings, User, UserPlus, Users } from 'lucide-react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { ApiClientError } from '../utils/apiClient';
import { getAuthAccessToken, getAuthSession, setAuthRedirectPath } from '../utils/authSession';
import { sessionGuestApi, type GuestJoinPreviewResponse, type GuestJoinVoteStatus } from '../utils/sessionGuestApi';
import { sessionPath } from '../utils/publicId';
import { styles } from './GuestJoinPage.styles';

const genderOptions = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];

const ageOptions = [
  { value: 'TEENS', label: '10대' },
  { value: 'TWENTIES', label: '20대' },
  { value: 'THIRTIES', label: '30대' },
  { value: 'FORTIES', label: '40대' },
  { value: 'FIFTIES', label: '50대' },
  { value: 'SIXTIES_AND_ABOVE', label: '60대 이상' },
];

const gradeOptions = ['E', 'D', 'C', 'B', 'A', 'S', 'SS'].map(value => ({ value, label: value }));
const voteOptions: Array<{ value: GuestJoinVoteStatus; label: string; description: string }> = [
  { value: 'ATTENDING', label: '참여', description: '운동에 참여할게요.' },
  { value: 'UNDECIDED', label: '미정', description: '아직 결정하지 못했어요.' },
  { value: 'ABSENT', label: '불참', description: '이번 일정은 어렵습니다.' },
];

export default function GuestJoinPage() {
  const { sessionId } = useParams();
  const currentSessionId = sessionId ?? '';
  const navigate = useNavigate();
  const { isAuthenticated, session } = useAuth();
  const isLoggedIn = isAuthenticated || Boolean(session) || Boolean(getAuthAccessToken() && getAuthSession());
  const [preview, setPreview] = useState<GuestJoinPreviewResponse | null>(null);
  const [selectedVote, setSelectedVote] = useState<GuestJoinVoteStatus>('ATTENDING');
  const [formData, setFormData] = useState({ name: '', gender: '', ageGroup: '', grade: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedVoteStatus, setCompletedVoteStatus] = useState<GuestJoinVoteStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = sessionPath(sessionId ?? '', '/guest-join');

  useEffect(() => {
    if (!currentSessionId) {
      setErrorMessage('운동 일정 링크가 올바르지 않습니다.');
      setIsLoading(false);
      return;
    }

    let mounted = true;

    sessionGuestApi.getPreview(currentSessionId)
      .then(data => {
        if (!mounted) return;

        if (isLoggedIn && data.profileCompleted === false) {
          navigate(`/social-signup?redirect=${encodeURIComponent(redirectPath)}`, { replace: true });
          return;
        }

        setPreview(data);
        setCompletedVoteStatus(!isLoggedIn && data.participantType === 'GUEST' ? data.currentVoteStatus ?? null : null);
        setSelectedVote(data.currentVoteStatus ?? 'ATTENDING');
        setFormData({
          name: data.name ?? '',
          gender: data.gender ?? '',
          ageGroup: data.ageGroup ?? '',
          grade: data.grade ?? '',
        });
      })
      .catch(error => setErrorMessage(getErrorMessage(error, '운동 일정 정보를 불러오지 못했습니다.')))
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, [currentSessionId, isLoggedIn, navigate, redirectPath]);

  const isGuestFormVisible = preview?.participantType === 'GUEST';
  const profileSummary = useMemo(() => {
    if (!preview || preview.participantType === 'GUEST') return null;
    return [
      preview.name,
      formatGender(preview.gender),
      formatAgeGroup(preview.ageGroup),
      formatGrade(preview.grade),
    ].filter(Boolean).join(' · ');
  }, [preview]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!preview || !currentSessionId) return;

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const result = await sessionGuestApi.submit(currentSessionId, {
        status: selectedVote,
        ...(isGuestFormVisible ? formData : {}),
      });

      const nextVoteStatus = result.currentVoteStatus ?? selectedVote;

      setPreview(current => current ? { ...current, ...result, currentVoteStatus: nextVoteStatus } : result);
      setSelectedVote(nextVoteStatus);
      setCompletedVoteStatus(nextVoteStatus);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '참여 투표를 반영하지 못했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageShell redirectPath = {redirectPath}><div className = {styles.loadingBox}>운동 일정 정보를 불러오는 중입니다.</div></PageShell>;
  }

  if (!preview) {
    return <PageShell redirectPath = {redirectPath}><div className = {styles.loadingBox}>{errorMessage || '운동 일정 정보를 확인할 수 없습니다.'}</div></PageShell>;
  }

  if (completedVoteStatus) {
    return (
      <PageShell redirectPath = {redirectPath}>
        <div className = {styles.completionCard}>
          <h1 className = {styles.completionTitle}>참여 투표가 완료되었습니다</h1>
          <p className = {styles.completionText}>
            {getVoteStatusLabel(completedVoteStatus)}로 참여 투표가 저장되었습니다.
          </p>
          <SessionSummaryCard preview = {preview} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell redirectPath = {redirectPath}>
      <div className = {styles.stack}>
        <div>
          <h1 className = {styles.pageTitle}>게스트 일정 참여</h1>
          <p className = {styles.descriptionText}>
            운동 일정을 확인하고 참여 여부를 알려주세요.
          </p>
        </div>
      </div>

      <div className = {styles.header2}>
        <form onSubmit = {handleSubmit} className = {styles.form}>
          {!isLoggedIn && (
            <section className = {styles.authChoice}>
              <p className = {styles.authChoiceText}>
                회원이라면 로그인 후 저장된 프로필로 바로 참여할 수 있고,<br />
                비회원도 아래 정보를 입력해 참여할 수 있습니다.
              </p>
              <div className = {styles.authChoiceActions}>
                <Link to = {`/login?redirect=${encodeURIComponent(redirectPath)}`} onClick = {() => setAuthRedirectPath(redirectPath)}>
                  <Button variant = "ghost" className = {styles.headerButton}>
                    <LogIn className = {styles.logInIcon} />
                    로그인
                  </Button>
                </Link>
                <Link to = {`/signup?redirect=${encodeURIComponent(redirectPath)}`} onClick = {() => setAuthRedirectPath(redirectPath)}>
                  <Button className = {styles.headerPrimaryButton}>
                    <UserPlus className = {styles.logInIcon} />
                    가입
                  </Button>
                </Link>
              </div>
            </section>
          )}

          <SessionSummaryCard preview = {preview} />

          {profileSummary && (
            <section>
              <h2 className = {styles.sectionTitle}>
                <div className = {styles.row2}>
                  <User className = {styles.userIcon} />
                </div>
                내 참여 정보
              </h2>
              <div className = {styles.profileBox}>{profileSummary}</div>
            </section>
          )}

          {isGuestFormVisible && (
            <section>
              <h2 className = {styles.sectionTitle}>
                <div className = {styles.row2}>
                  <User className = {styles.userIcon} />
                </div>
                기본 정보
              </h2>

              <div className = {styles.stack2}>
                <div className = {styles.stack3}>
                  <Label htmlFor = "name">이름 *</Label>
                  <Input id = "name" type = "text" autoComplete = "new-password" placeholder = "이름을 입력하세요" className = {styles.input} value = {formData.name} onChange = {event => setFormData({ ...formData, name: event.target.value })} required />
                </div>

                <div className = {styles.cardGrid}>
                  <SelectField label = "성별 *" value = {formData.gender} placeholder = "성별 선택" options = {genderOptions} onChange = {value => setFormData({ ...formData, gender: value })} />
                  <SelectField label = "연령대 *" value = {formData.ageGroup} placeholder = "연령대 선택" options = {ageOptions} onChange = {value => setFormData({ ...formData, ageGroup: value })} />
                </div>

                <SelectField label = "급수 *" value = {formData.grade} placeholder = "급수 선택" options = {gradeOptions} onChange = {value => setFormData({ ...formData, grade: value })} icon = {Award} />
              </div>
            </section>
          )}

          <section className = {styles.footerActions}>
            <h2 className = {styles.sectionTitle}>
              <div className = {styles.row2}>
                <Award className = {styles.userIcon} />
              </div>
              참여 투표
            </h2>
            <div className = {styles.voteGrid}>
              {voteOptions.map(option => (
                <button key = {option.value} type = "button" className = {styles.voteButton(selectedVote === option.value)} onClick = {() => setSelectedVote(option.value)}>
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
            {preview.voteDeadline && <p className = {styles.descriptionText2}>투표 마감: {formatDateTime(preview.voteDeadline)}</p>}
          </section>

          {errorMessage && <p className = {styles.errorText}>{errorMessage}</p>}

          <div className = {styles.footerActions2}>
            <Button type = "submit" className = {styles.submitButton} size = "lg" disabled = {isSubmitting}>
              <UserPlus className = {styles.userPlusIcon2} />
              {isSubmitting ? '반영 중' : '참여 투표하기'}
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function SessionSummaryCard({ preview }: { preview: GuestJoinPreviewResponse }) {
  return (
    <section className = {styles.sessionCard}>
      <div className = {styles.sessionHeader}>
        <div>
          <span className = {styles.groupName}>{preview.groupName}</span>
          <h2 className = {styles.sessionTitle}>{preview.title}</h2>
        </div>
        <span className = {styles.statusBadge}>{getSessionTypeLabel(preview.sessionType)}</span>
      </div>
      <div className = {styles.sessionMeta}>
        <span><CalendarDays className = {styles.metaIcon} />{formatDate(preview.startsAt)}</span>
        <span><Clock className = {styles.metaIcon} />{formatTimeRange(preview.startsAt, preview.endsAt)}</span>
        <span><MapPin className = {styles.metaIcon} />{preview.place || '장소 미정'}</span>
      </div>
    </section>
  );
}

function PageShell({ children, redirectPath }: { children: ReactNode; redirectPath: string }) {
  const navigate = useNavigate();
  const { session, setSessionFromStorage, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const displaySession = session ?? (getAuthAccessToken() ? getAuthSession() : null);

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
    };
  }, []);

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
      <div className = {styles.backgroundGlowTop} />
      <div className = {styles.backgroundGlowBottom} />
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

                  <button type = "button" className = {styles.profileMenuItem} onClick = {() => handleProfileNavigation('/groups')} role = "menuitem">
                    <Users className = {styles.profileMenuIcon} />
                    내 모임
                  </button>

                  <button type = "button" className = {styles.profileMenuItem} onClick = {() => handleProfileNavigation('/my-record')} role = "menuitem">
                    <ClipboardCheck className = {styles.profileMenuIcon} />
                    내 기록
                  </button>

                  <button type = "button" className = {styles.profileMenuItem} onClick = {() => handleProfileNavigation('/settings')} role = "menuitem">
                    <Settings className = {styles.profileMenuIcon} />
                    설정
                  </button>

                  <div className = {styles.menuDivider} />

                  <button type = "button" className = {styles.logoutMenuItem} onClick = {handleLogout} role = "menuitem">
                    <LogOut className = {styles.profileMenuIcon} />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className = {styles.headerActions}>
              <Link to = {`/login?redirect=${encodeURIComponent(redirectPath)}`} onClick = {() => setAuthRedirectPath(redirectPath)}>
                <Button variant = "ghost" className = {styles.headerButton}>
                  <LogIn className = {styles.logInIcon} />
                  로그인
                </Button>
              </Link>
              <Link to = {`/signup?redirect=${encodeURIComponent(redirectPath)}`} onClick = {() => setAuthRedirectPath(redirectPath)}>
                <Button className = {styles.headerPrimaryButton}>
                  <UserPlus className = {styles.logInIcon} />
                  회원가입
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <main className = {styles.content}>
        <Logo size = "lg" className = {styles.logo} />
        {children}
      </main>
    </div>
  );
}

function SelectField({ label, value, placeholder, options, onChange }: {
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  icon?: typeof Award;
}) {
  return (
    <div className = {styles.stack3}>
      <Label>{label}</Label>
      <Select value = {value} onValueChange = {onChange} required>
        <SelectTrigger className = {styles.input}>
          <SelectValue placeholder = {placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => <SelectItem key = {option.value} value = {option.value} className = {styles.selectItem}>{option.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) return error.detail || error.message || fallback;
  return fallback;
}

function formatGender(value?: string | null) {
  return value === 'MALE' ? '남성' : value === 'FEMALE' ? '여성' : '';
}

function formatAgeGroup(value?: string | null) {
  const labels: Record<string, string> = {
    TEENS: '10대',
    TWENTIES: '20대',
    THIRTIES: '30대',
    FORTIES: '40대',
    FIFTIES: '50대',
    SIXTIES_AND_ABOVE: '60대 이상',
  };
  return value ? labels[value] || value : '';
}

function formatGrade(value?: string | null) {
  return value ? `${value}급` : '';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(value));
}

function formatTimeRange(startsAt: string, endsAt: string | null) {
  const start = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(startsAt));
  if (!endsAt) return start;
  const end = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(endsAt));
  return `${start} - ${end}`;
}

function formatDateTime(value: string) {
  return `${formatDate(value)} ${formatTimeRange(value, null)}`;
}

function getVoteStatusLabel(value: GuestJoinVoteStatus) {
  const labels: Record<GuestJoinVoteStatus, string> = {
    ATTENDING: '참여',
    UNDECIDED: '미정',
    ABSENT: '불참',
  };
  return labels[value];
}

function getSessionTypeLabel(value: string) {
  const labels: Record<string, string> = {
    REGULAR: '정기 모임',
    LIGHTNING: '번개 모임',
    EXCHANGE: '교류전',
    TOURNAMENT: '대회',
    OTHER: '기타',
  };
  return labels[value] || value;
}

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  LockKeyhole,
  Smartphone,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { ApiClientError } from '../utils/apiClient';
import { endAuthSession } from '../utils/authSession';
import {
  disableSystemNotifications,
  enableSystemNotifications,
  getSystemNotificationStatus,
  type SystemNotificationStatus,
} from '../utils/pushNotification';
import {
  deleteUserAccount,
  deleteUserProfileImage,
  getCurrentUser,
  getUserNotificationSettings,
  updateUserNotificationSettings,
  updateUserPassword,
  updateUserProfile,
  uploadUserProfileImage,
  type CurrentUserResponse,
  type UserNotificationSettingsResponse,
} from '../utils/userApi';
import { usePwaInstall } from '../utils/usePwaInstall';
import { styles } from './SettingsPage.styles';

type FeedbackTone = 'success' | 'error';

type Feedback = {
  tone: FeedbackTone;
  message: string;
} | null;

type ProfileForm = {
  name: string;
  gender: string;
  ageGroup: string;
  grade: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

const genderOptions = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];

const ageGroupOptions = [
  { value: 'TEENS', label: '10대' },
  { value: 'TWENTIES', label: '20대' },
  { value: 'THIRTIES', label: '30대' },
  { value: 'FORTIES', label: '40대' },
  { value: 'FIFTIES', label: '50대' },
  { value: 'SIXTIES_AND_ABOVE', label: '60대 이상' },
];

const gradeOptions = ['E', 'D', 'C', 'B', 'A', 'S', 'SS'].map(value => ({ value, label: value }));

const providerLabels: Record<string, string> = {
  LOCAL: '일반 계정',
  GOOGLE: 'Google 계정',
  KAKAO: 'Kakao 계정',
  NAVER: 'Naver 계정',
};

const notificationItems: Array<{
  key: keyof UserNotificationSettingsResponse;
  title: string;
  description: string;
}> = [
  {
    key: 'nextMatchEnabled',
    title: '다음 경기 배정 알림',
    description: '내 다음 경기가 정해졌을 때 알림을 받습니다.',
  },
  {
    key: 'matchStartEnabled',
    title: '경기 시작 알림',
    description: '경기가 시작되거나 코트에 입장해야 할 때 알림을 받습니다.',
  },
  {
    key: 'courtChangeEnabled',
    title: '코트 이동/상태 변경 알림',
    description: '코트 이동, 대기 상태 변경 같은 진행 알림을 받습니다.',
  },
  {
    key: 'resultRequestEnabled',
    title: '결과 입력 요청 알림',
    description: '경기 결과 입력이 필요할 때 알림을 받습니다.',
  },
  {
    key: 'scheduleChangeEnabled',
    title: '모임/일정 변경 알림',
    description: '참여 중인 모임이나 일정에 변경이 있을 때 알림을 받습니다.',
  },
];

function createSquareImagePreview(file: File) {
  return new Promise<{ previewUrl: string; imageFile: File }>((resolve, reject) => {
    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 640;
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - sourceSize) / 2;
      const sourceY = (image.naturalHeight - sourceSize) / 2;

      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext('2d');
      context?.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);

      canvas.toBlob(blob => {
        URL.revokeObjectURL(sourceUrl);

        if (!blob) {
          reject(new Error('이미지를 처리하지 못했습니다.'));
          return;
        }

        resolve({
          previewUrl: URL.createObjectURL(blob),
          imageFile: new File([blob], 'user-profile.webp', { type: 'image/webp' }),
        });
      }, 'image/webp', 0.86);
    };

    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error('이미지를 불러오지 못했습니다.'));
    };

    image.src = sourceUrl;
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    return error.detail ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function toProfileForm(user: CurrentUserResponse): ProfileForm {
  return {
    name: user.name ?? '',
    gender: user.gender ?? '',
    ageGroup: user.ageGroup ?? '',
    grade: user.grade ?? '',
  };
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '',
    gender: '',
    ageGroup: '',
    grade: '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });
  const [notificationSettings, setNotificationSettings] = useState<UserNotificationSettingsResponse>({
    nextMatchEnabled: true,
    matchStartEnabled: true,
    courtChangeEnabled: true,
    resultRequestEnabled: true,
    scheduleChangeEnabled: true,
  });
  const [systemNotificationStatus, setSystemNotificationStatus] = useState<SystemNotificationStatus>('unsubscribed');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [savingNotificationKey, setSavingNotificationKey] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { install, canInstall, isInstalled, installGuide } = usePwaInstall();

  const showFeedback = (tone: FeedbackTone, message: string) => {
    setFeedback({ tone, message });
  };

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

  useEffect(() => {
    let ignore = false;

    const loadSettings = async () => {
      try {
        setIsLoading(true);

        const [currentUser, nextNotificationSettings, nextSystemNotificationStatus] = await Promise.all([
          getCurrentUser(),
          getUserNotificationSettings(),
          getSystemNotificationStatus().catch(() => 'disabled' as const),
        ]);

        if (ignore) {
          return;
        }

        setUser(currentUser);
        setProfileForm(toProfileForm(currentUser));
        setNotificationSettings(nextNotificationSettings);
        setSystemNotificationStatus(nextSystemNotificationStatus);
      } catch (error) {
        if (!ignore) {
          showFeedback('error', getErrorMessage(error, '설정 정보를 불러오지 못했습니다.'));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showFeedback('error', '이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showFeedback('error', '이미지는 10MB 이하로 업로드해주세요.');
      return;
    }

    try {
      setIsUploadingImage(true);
      const processed = await createSquareImagePreview(file);

      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      setImagePreviewUrl(processed.previewUrl);
      const uploadedImage = await uploadUserProfileImage(processed.imageFile);
      const nextUser = user ? { ...user, profileImageUrl: uploadedImage.imageUrl } : await getCurrentUser();

      setUser(nextUser);
      void refreshSession();
      showFeedback('success', '프로필 이미지를 변경했습니다.');
    } catch (error) {
      showFeedback('error', getErrorMessage(error, '프로필 이미지를 변경하지 못했습니다.'));
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await processImageFile(file);
  };

  const handleImageDrag = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsImageDragging(true);
  };

  const handleImageDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsImageDragging(false);
  };

  const handleImageDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsImageDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      await processImageFile(file);
    }
  };

  const handleDeleteImage = async () => {
    try {
      setIsUploadingImage(true);
      const nextUser = await deleteUserProfileImage();

      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }

      setUser(nextUser);
      void refreshSession();
      showFeedback('success', '프로필 이미지를 삭제했습니다.');
    } catch (error) {
      showFeedback('error', getErrorMessage(error, '프로필 이미지를 삭제하지 못했습니다.'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSavingProfile(true);
      const nextUser = await updateUserProfile(profileForm);

      setUser(nextUser);
      setProfileForm(toProfileForm(nextUser));
      void refreshSession();
      showFeedback('success', '프로필을 저장했습니다.');
    } catch (error) {
      showFeedback('error', getErrorMessage(error, '프로필을 저장하지 못했습니다.'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSavingPassword(true);
      await updateUserPassword(passwordForm);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
      });
      showFeedback('success', '비밀번호를 변경했습니다. 다른 기기의 자동 로그인은 해제됩니다.');
    } catch (error) {
      showFeedback('error', getErrorMessage(error, '비밀번호를 변경하지 못했습니다.'));
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSystemNotification = async () => {
    try {
      setSavingNotificationKey('system');

      if (systemNotificationStatus === 'subscribed') {
        await disableSystemNotifications();
        setSystemNotificationStatus('unsubscribed');
        showFeedback('success', 'PWA 시스템 알림을 해제했습니다.');
        return;
      }

      const status = await enableSystemNotifications(true);
      setSystemNotificationStatus(status);

      const statusMessage = {
        subscribed: 'PWA 시스템 알림을 받을 수 있습니다.',
        denied: '브라우저 설정에서 알림 권한을 허용해주세요.',
        unsupported: '현재 브라우저에서는 PWA 시스템 알림을 지원하지 않습니다.',
        disabled: '서버의 PWA 시스템 알림 설정이 필요합니다.',
        unsubscribed: '알림 권한을 허용하면 PWA 시스템 알림을 받을 수 있습니다.',
      }[status];

      showFeedback(status === 'subscribed' ? 'success' : 'error', statusMessage);
    } catch (error) {
      showFeedback('error', getErrorMessage(error, 'PWA 시스템 알림을 설정하지 못했습니다.'));
    } finally {
      setSavingNotificationKey(null);
    }
  };

  const handleNotificationToggle = async (key: keyof UserNotificationSettingsResponse) => {
    const previousSettings = notificationSettings;
    const nextSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key],
    };

    setNotificationSettings(nextSettings);

    try {
      setSavingNotificationKey(key);
      const savedSettings = await updateUserNotificationSettings(nextSettings);

      setNotificationSettings(savedSettings);
      showFeedback('success', '알림 설정을 변경했습니다.');
    } catch (error) {
      setNotificationSettings(previousSettings);
      showFeedback('error', getErrorMessage(error, '알림 설정을 변경하지 못했습니다.'));
    } finally {
      setSavingNotificationKey(null);
    }
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

  const confirmDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      await deleteUserAccount();
      endAuthSession();
      navigate('/login', { replace: true });
    } catch (error) {
      showFeedback('error', getErrorMessage(error, '계정을 탈퇴하지 못했습니다.'));
      setIsDeletingAccount(false);
      setDeleteModalOpen(false);
    }
  };

  const profileInitial = (profileForm.name || user?.email || '회원').trim().charAt(0).toUpperCase();
  const providerLabel = user?.provider ? providerLabels[user.provider] ?? user.provider : '';
  const isLocalAccount = user?.provider === 'LOCAL';
  const displayImageUrl = imagePreviewUrl ?? user?.profileImageUrl ?? null;

  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlowTop} />
      <div className={styles.backgroundGlowBottom} />

      <main className={styles.pageShell}>
        <div className={styles.pageHeader}>
          <div>
            <h1>설정</h1>
          </div>
        </div>

        {feedback && (
          <div className={styles.feedback(feedback.tone)}>
            {feedback.message}
          </div>
        )}

        {isLoading ? (
          <section className={styles.panel}>
            <p className={styles.mutedText}>설정 정보를 불러오는 중입니다.</p>
          </section>
        ) : (
          <>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleBox}>
                  <span className={styles.panelIconBox}><User /></span>
                  <div>
                    <h2>프로필 설정</h2>
                    <p>모임과 경기 화면에 표시되는 기본 정보를 관리합니다.</p>
                  </div>
                </div>
              </div>
              <div className={styles.panelBody}>
                <div className={styles.settingsGrid}>
                  <div
                    className={styles.imageSetting(isImageDragging)}
                    onDragEnter={handleImageDrag}
                    onDragOver={handleImageDrag}
                    onDragLeave={handleImageDragLeave}
                    onDrop={handleImageDrop}
                  >
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className={styles.hiddenInput}
                      onChange={handleImageChange}
                    />
                    {displayImageUrl ? (
                      <img src={displayImageUrl} alt="프로필" />
                    ) : (
                      <span className={styles.profileFallback}>{profileInitial}</span>
                    )}
                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        className={styles.textButton}
                        disabled={isUploadingImage}
                        onClick={() => imageInputRef.current?.click()}
                      >
                        이미지 변경
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className={styles.dangerTextButton}
                        disabled={isUploadingImage || !displayImageUrl}
                        onClick={handleDeleteImage}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>

                  <form className={styles.settingsForm} onSubmit={handleProfileSubmit}>
                    <label>
                      <span>이름</span>
                      <Input
                        value={profileForm.name}
                        onChange={event => setProfileForm(current => ({ ...current, name: event.target.value }))}
                        className={styles.input}
                        required
                      />
                    </label>

                    <label>
                      <span>이메일</span>
                      <Input value={user?.email ?? ''} className={styles.input} disabled />
                      <small>이메일은 변경할 수 없습니다.</small>
                    </label>

                    <label>
                      <span>가입 유형</span>
                      <Input value={providerLabel} className={styles.input} disabled />
                    </label>

                    <label>
                      <span>성별</span>
                      <Select
                        value={profileForm.gender}
                        onValueChange={value => setProfileForm(current => ({ ...current, gender: value }))}
                      >
                        <SelectTrigger className={styles.selectTriggerWide}>
                          <SelectValue placeholder="성별 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map(option => (
                            <SelectItem className={styles.selectItem} key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                    <label>
                      <span>연령대</span>
                      <Select
                        value={profileForm.ageGroup}
                        onValueChange={value => setProfileForm(current => ({ ...current, ageGroup: value }))}
                      >
                        <SelectTrigger className={styles.selectTriggerWide}>
                          <SelectValue placeholder="연령대 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {ageGroupOptions.map(option => (
                            <SelectItem className={styles.selectItem} key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                    <label>
                      <span>급수</span>
                      <Select
                        value={profileForm.grade}
                        onValueChange={value => setProfileForm(current => ({ ...current, grade: value }))}
                      >
                        <SelectTrigger className={styles.selectTriggerWide}>
                          <SelectValue placeholder="급수 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map(option => (
                            <SelectItem className={styles.selectItem} key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                    <Button type="submit" className={styles.saveButton} disabled={isSavingProfile}>
                      <Camera />
                      프로필 저장
                    </Button>
                  </form>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleBox}>
                  <span className={styles.panelIconBox}><LockKeyhole /></span>
                  <div>
                    <h2>계정 보안</h2>
                    <p>로그인 방식에 맞는 보안 설정을 관리합니다.</p>
                  </div>
                </div>
              </div>

              <div className={styles.panelBody}>
                {isLocalAccount ? (
                  <form className={styles.settingsForm} onSubmit={handlePasswordSubmit}>
                    <label>
                      <span>현재 비밀번호</span>
                      <Input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={event => setPasswordForm(current => ({ ...current, currentPassword: event.target.value }))}
                        className={styles.input}
                        required
                      />
                    </label>
                    <label>
                      <span>새 비밀번호</span>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={event => setPasswordForm(current => ({ ...current, newPassword: event.target.value }))}
                        className={styles.input}
                        required
                      />
                    </label>
                    <label>
                      <span>새 비밀번호 확인</span>
                      <Input
                        type="password"
                        value={passwordForm.newPasswordConfirm}
                        onChange={event => setPasswordForm(current => ({ ...current, newPasswordConfirm: event.target.value }))}
                        className={styles.input}
                        required
                      />
                    </label>
                    <Button type="submit" className={styles.saveButton} disabled={isSavingPassword}>
                      비밀번호 변경
                    </Button>
                  </form>
                ) : (
                  <div className={styles.noticeBox}>
                    <strong>{providerLabel}</strong>
                    <span>소셜 로그인 계정은 ShuttlePlay에서 비밀번호를 관리하지 않습니다.</span>
                  </div>
                )}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleBox}>
                  <span className={styles.panelIconBox}><Bell /></span>
                  <div>
                    <h2>알림 설정</h2>
                    <p>PWA 시스템 알림과 경기 진행 알림 수신 여부를 관리합니다.</p>
                  </div>
                </div>
              </div>

              <div className={styles.panelBody}>
                <div className={styles.permissionOptionList}>
                  <SettingButton
                    title="PWA 시스템 알림 받기"
                    description="기기 알림으로 경기와 모임 소식을 받을 수 있습니다."
                    checked={systemNotificationStatus === 'subscribed'}
                    disabled={savingNotificationKey !== null}
                    onClick={() => void handleSystemNotification()}
                  />

                  {notificationItems.map(item => (
                    <SettingButton
                      key={item.key}
                      title={item.title}
                      description={item.description}
                      checked={notificationSettings[item.key]}
                      disabled={savingNotificationKey !== null}
                      onClick={() => void handleNotificationToggle(item.key)}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleBox}>
                  <span className={styles.panelIconBox}><Smartphone /></span>
                  <div>
                    <h2>PWA/앱 설치</h2>
                    <p>홈 화면에서 ShuttlePlay를 앱처럼 실행할 수 있습니다.</p>
                  </div>
                </div>
              </div>

              <div className={styles.panelBody}>
                <div className={styles.appInstallBox}>
                  <div>
                    <strong>{isInstalled ? '앱 설치됨' : canInstall ? '앱 설치 가능' : '설치 안내'}</strong>
                    <span>{isInstalled ? '현재 기기에서 앱 모드로 실행 중입니다.' : installGuide}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className={styles.appInstallButton}
                    disabled={isInstalled}
                    onClick={handleInstall}
                  >
                    <Smartphone />
                    {isInstalled ? '설치 완료' : '앱 설치'}
                  </Button>
                </div>
              </div>
            </section>

            <section className={styles.dangerSection}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleBox}>
                  <span className={styles.panelIconBox}><AlertTriangle /></span>
                  <div>
                    <h2>위험 영역</h2>
                    <p>계정 탈퇴는 되돌릴 수 없습니다.</p>
                  </div>
                </div>
              </div>

              <div className={styles.panelBody}>
                <div className={styles.dangerZone}>
                  <strong>계정 탈퇴</strong>
                  <p>탈퇴하면 계정이 삭제 상태로 전환되고 다시 로그인할 수 없습니다.</p>
                  <Button
                    type="button"
                    variant="destructive"
                    className={`${styles.roundButton} ${styles.destructiveButton}`}
                    disabled={isDeletingAccount}
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <Trash2 />
                    계정 탈퇴
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {deleteModalOpen && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={() => setDeleteModalOpen(false)}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            onMouseDown={event => event.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <h2 id="delete-account-title">계정 탈퇴</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={styles.iconButton}
                disabled={isDeletingAccount}
                onClick={() => setDeleteModalOpen(false)}
              >
                <X />
              </Button>
            </header>
            <div className={styles.modalBody}>
              <div className={styles.confirmContent}>
                <span className={styles.warningIconBox}><AlertTriangle /></span>
                <p>계정을 탈퇴하면 다시 로그인할 수 없습니다. 계속 진행하시겠습니까?</p>
                <div className="modal-actions">
                  <Button
                    type="button"
                    variant="outline"
                    className={styles.roundButton}
                    disabled={isDeletingAccount}
                    onClick={() => setDeleteModalOpen(false)}
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeletingAccount}
                    onClick={() => void confirmDeleteAccount()}
                  >
                    <Trash2 />
                    탈퇴하기
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {toastMessage && (
        <div className={styles.toast} role="status">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

function SettingButton({
  title,
  description,
  checked,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles.permissionOption(checked)} disabled={disabled} onClick={onClick}>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span>
        {checked && <Check />}
        {checked ? '받기' : '받지 않음'}
      </span>
    </button>
  );
}

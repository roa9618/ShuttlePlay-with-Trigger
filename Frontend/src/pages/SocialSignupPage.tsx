import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FooterModal from '../components/FooterModal';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiClientError } from '../utils/apiClient';
import { updateAuthTokens } from '../utils/authSession';
import { footerDocuments, type FooterDocumentKey } from '../utils/footerContent';
import { getCurrentUser, getProfileCompletion, updateProfileCompletion } from '../utils/userApi';
import { styles } from './SignupPage.styles';

type FeedbackField = 'name' | 'gender' | 'ageGroup' | 'grade' | 'agreement';

type FieldFeedback = {
  field: FeedbackField;
  message: string;
  tone: 'error' | 'success';
} | null;

function getSocialNameFromParams(searchParams: URLSearchParams) {
  return searchParams.get('name')
    ?? searchParams.get('nickname')
    ?? searchParams.get('displayName')
    ?? searchParams.get('display_name')
    ?? '';
}

export default function SocialSignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSession, setSessionFromStorage } = useAuth();
  const [fieldFeedback, setFieldFeedback] = useState<FieldFeedback>(null);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<FooterDocumentKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: getSocialNameFromParams(searchParams),
    gender: '',
    ageGroup: '',
    grade: '',
  });

  const moveToMainPage = () => {
    navigate('/', {
      replace: true,
    });

    window.setTimeout(() => {
      window.location.replace('/');
    }, 0);
  };

  useEffect(() => {
    const accessToken = searchParams.get('accessToken') ?? searchParams.get('access_token');
    const refreshToken = searchParams.get('refreshToken') ?? searchParams.get('refresh_token');
    const socialName = getSocialNameFromParams(searchParams);

    if (socialName) {
      setFormData((current) => ({
        ...current,
        name: current.name || socialName,
      }));
    }

    if (!accessToken || !refreshToken) {
      return;
    }

    updateAuthTokens({
      accessToken,
      refreshToken,
    });

    window.history.replaceState(null, '', window.location.pathname);
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;

    const loadProfileCompletion = async () => {
      try {
        const [profile, currentUser] = await Promise.allSettled([
          getProfileCompletion(),
          getCurrentUser(),
        ]);

        if (ignore) {
          return;
        }

        const profileData = profile.status === 'fulfilled' ? profile.value : null;
        const userData = currentUser.status === 'fulfilled' ? currentUser.value : null;

        setFormData((current) => ({
          name: profileData?.name ?? userData?.name ?? current.name,
          gender: profileData?.gender ?? userData?.gender ?? current.gender,
          ageGroup: profileData?.ageGroup ?? userData?.ageGroup ?? current.ageGroup,
          grade: profileData?.grade ?? userData?.grade ?? current.grade,
        }));

        setAgreementChecked(profileData?.agreementAccepted ?? false);

        if (profileData?.profileCompleted || userData?.profileCompleted) {
          void refreshSession()
            .catch(() => null)
            .finally(() => {
              setSessionFromStorage();
            });

          if (!ignore) {
            moveToMainPage();
          }
        }
      } catch {
        if (ignore) {
          return;
        }
      }
    };

    loadProfileCompletion();

    return () => {
      ignore = true;
    };
  }, [refreshSession, setSessionFromStorage]);

  const showFieldFeedback = (field: FeedbackField, message: string, tone: 'error' | 'success' = 'error') => {
    setFieldFeedback({ field, message, tone });
  };

  const clearFieldFeedback = (field: FeedbackField) => {
    setFieldFeedback((current) => current?.field === field ? null : current);
  };

  const renderFieldFeedback = (field: FeedbackField) => {
    if (fieldFeedback?.field !== field) {
      return null;
    }

    return (
      <span className = {styles.fieldMessage(fieldFeedback.tone)}>
        {fieldFeedback.message}
      </span>
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showFieldFeedback('name', '이름을 입력해주세요.');
      return;
    }

    if (!formData.gender) {
      showFieldFeedback('gender', '성별을 선택해주세요.');
      return;
    }

    if (!formData.ageGroup) {
      showFieldFeedback('ageGroup', '연령을 선택해주세요.');
      return;
    }

    if (!formData.grade) {
      showFieldFeedback('grade', '급수를 선택해주세요.');
      return;
    }

    if (!agreementChecked) {
      showFieldFeedback('agreement', '이용약관 및 개인정보 처리방침에 동의해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldFeedback(null);

      await updateProfileCompletion({
        name: formData.name.trim(),
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        grade: formData.grade,
        agreementAccepted: agreementChecked,
      });

      void refreshSession()
        .catch(() => null)
        .finally(() => {
          setSessionFromStorage();
        });

      moveToMainPage();
    } catch (error) {
      showFieldFeedback(
        'agreement',
        error instanceof ApiClientError
          ? error.detail ?? error.message
          : '기본 정보 저장 중 오류가 발생했습니다.',
      );
      setIsSubmitting(false);
    }
  };

  return (
    <>
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

            <div className = {styles.titleGroup}>
              <h1 className = {styles.pageTitle}>기본 정보 입력</h1>
              <p className = {styles.descriptionText}>
                소셜 계정으로 사용할 플레이 정보를 입력해주세요
              </p>
            </div>
          </div>

          <div className = {styles.header}>
            <form onSubmit = {handleSubmit} className = {styles.form}>
              <div className = {styles.stack3}>
                <div className = {styles.labelRow}>
                  <Label htmlFor = "name">이름</Label>
                  {renderFieldFeedback('name')}
                </div>
                <Input
                  id = "name"
                  type = "text"
                  placeholder = "이름을 입력하세요"
                  className = {styles.input}
                  value = {formData.name}
                  onChange = {(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    clearFieldFeedback('name');
                  }}
                  required
                />
              </div>

              <div className = {styles.stack3}>
                <div className = {styles.labelRow}>
                  <Label htmlFor = "gender">성별</Label>
                  {renderFieldFeedback('gender')}
                </div>
                <Select value = {formData.gender} onValueChange = {(value) => {
                  setFormData({ ...formData, gender: value });
                  clearFieldFeedback('gender');
                }} required>
                  <SelectTrigger id = "gender" className = {styles.input}>
                    <SelectValue placeholder = "성별 선택" />
                  </SelectTrigger>
                  <SelectContent className = {styles.selectContent}>
                    <SelectItem className = {styles.selectItem} value = "MALE">남성</SelectItem>
                    <SelectItem className = {styles.selectItem} value = "FEMALE">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className = {styles.stack3}>
                <div className = {styles.labelRow}>
                  <Label htmlFor = "age-group">연령</Label>
                  {renderFieldFeedback('ageGroup')}
                </div>
                <Select value = {formData.ageGroup} onValueChange = {(value) => {
                  setFormData({ ...formData, ageGroup: value });
                  clearFieldFeedback('ageGroup');
                }} required>
                  <SelectTrigger id = "age-group" className = {styles.input}>
                    <SelectValue placeholder = "연령 선택" />
                  </SelectTrigger>
                  <SelectContent className = {styles.selectContent}>
                    <SelectItem className = {styles.selectItem} value = "TEENS">10대</SelectItem>
                    <SelectItem className = {styles.selectItem} value = "TWENTIES">20대</SelectItem>
                    <SelectItem className = {styles.selectItem} value = "THIRTIES">30대</SelectItem>
                    <SelectItem className = {styles.selectItem} value = "FORTIES">40대</SelectItem>
                    <SelectItem className = {styles.selectItem} value = "FIFTIES">50대</SelectItem>
                    <SelectItem className = {styles.selectItem} value = "SIXTIES_AND_ABOVE">60대 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className = {styles.stack3}>
                <div className = {styles.labelRow}>
                  <Label htmlFor = "grade">급수</Label>
                  {renderFieldFeedback('grade')}
                </div>
                <Select value = {formData.grade} onValueChange = {(value) => {
                  setFormData({ ...formData, grade: value });
                  clearFieldFeedback('grade');
                }} required>
                  <SelectTrigger id = "grade" className = {styles.input}>
                    <SelectValue placeholder = "급수 선택" />
                  </SelectTrigger>
                  <SelectContent className = {styles.selectContent}>
                    <SelectItem className = {styles.selectItem} value = "E">E</SelectItem>
                    <SelectItem className = {styles.selectItem} value = "D">D</SelectItem>
                    <SelectItem className = {styles.selectItem} value = "C">C</SelectItem>
                    <SelectItem className = {styles.selectItem} value = "B">B</SelectItem>
                    <SelectItem className = {styles.selectItem} value = "A">A</SelectItem>
                    <SelectItem className = {styles.selectItem} value = "S">S</SelectItem>
                    <SelectItem className = {styles.selectItem} value = "SS">SS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className = {styles.agreementArea}>
                <div className = {styles.agreementRow}>
                  <input
                    id = "social-signup-agreement"
                    type = "checkbox"
                    className = {styles.agreementCheckbox}
                    checked = {agreementChecked}
                    onChange = {(e) => {
                      setAgreementChecked(e.target.checked);
                      clearFieldFeedback('agreement');
                    }}
                  />
                  <p className = {styles.agreementText}>
                    <button
                      type = "button"
                      className = {styles.agreementLinkButton}
                      onClick = {() => setSelectedDocument('terms')}
                    >
                      이용약관
                    </button>
                    {' 및 '}
                    <button
                      type = "button"
                      className = {styles.agreementLinkButton}
                      onClick = {() => setSelectedDocument('privacy')}
                    >
                      개인정보 처리방침
                    </button>
                    에 동의합니다.
                  </p>
                </div>

                <div className = {styles.agreementMessageRow}>
                  {renderFieldFeedback('agreement')}
                </div>
              </div>

              <Button type = "submit" className = {styles.submitButton} size = "lg" disabled = {isSubmitting}>
                {isSubmitting ? '저장 중' : '시작하기'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <FooterModal
        documentKey = {selectedDocument}
        document = {selectedDocument ? footerDocuments[selectedDocument] : null}
        onClose = {() => setSelectedDocument(null)}
      />
    </>
  );
}
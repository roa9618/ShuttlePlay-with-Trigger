import { Link } from 'react-router-dom';
import FooterModal from '../components/FooterModal';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ApiClientError } from '../utils/apiClient';
import {
  checkEmailAvailability,
  confirmEmailVerification,
  sendEmailVerification,
} from '../utils/authApi';
import { footerDocuments, type FooterDocumentKey } from '../utils/footerContent';
import { styles } from './SignupPage.styles';

type SignupStep = 1 | 2;
type EmailCheckStatus = 'idle' | 'checking' | 'available' | 'duplicate';
type EmailVerificationStatus = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified';
type FeedbackField = 'name' | 'email' | 'verification' | 'password' | 'passwordConfirm' | 'gender' | 'ageGroup' | 'grade' | 'agreement';
type FieldFeedback = {
  field: FeedbackField;
  message: string;
  tone: 'error' | 'success';
} | null;

const VERIFICATION_TIME_LIMIT = 10 * 60;

const passwordRules = [
  {
    key: 'length',
    label: '8자 이상',
    validate: (password: string) => password.length >= 8,
  },
  {
    key: 'letter',
    label: '영문 포함',
    validate: (password: string) => /[A-Za-z]/.test(password),
  },
  {
    key: 'number',
    label: '숫자 포함',
    validate: (password: string) => /\d/.test(password),
  },
];

export default function SignupPage() {
  const [step, setStep] = useState<SignupStep>(1);
  const [signupCompleted, setSignupCompleted] = useState(false);
  const [fieldFeedback, setFieldFeedback] = useState<FieldFeedback>(null);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<FooterDocumentKey | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    verificationCode: '',
    password: '',
    passwordConfirm: '',
    gender: '',
    ageGroup: '',
    grade: '',
  });

  const [emailCheckStatus, setEmailCheckStatus] = useState<EmailCheckStatus>('idle');
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<EmailVerificationStatus>('idle');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [remainingVerificationSeconds, setRemainingVerificationSeconds] = useState(0);

  const isPasswordValid = useMemo(
    () => passwordRules.every((rule) => rule.validate(formData.password)),
    [formData.password],
  );

  const isPasswordConfirmValid = formData.passwordConfirm.length > 0 && formData.password === formData.passwordConfirm;
  const isEmailChecked = emailCheckStatus === 'available';
  const isEmailVerified = emailVerificationStatus === 'verified' && verifiedEmail === formData.email;
  const isEmailLocked = emailVerificationStatus !== 'idle';
  const isVerificationCodeLocked = emailVerificationStatus === 'idle'
    || emailVerificationStatus === 'sending'
    || emailVerificationStatus === 'verified';
  const formattedVerificationTime = `${String(Math.floor(remainingVerificationSeconds / 60)).padStart(2, '0')}:${String(remainingVerificationSeconds % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (emailVerificationStatus !== 'sent' && emailVerificationStatus !== 'verifying') {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingVerificationSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [emailVerificationStatus]);

  useEffect(() => {
    if (remainingVerificationSeconds > 0 || (emailVerificationStatus !== 'sent' && emailVerificationStatus !== 'verifying')) {
      return;
    }

    setEmailVerificationStatus('idle');
    setFormData((current) => ({
      ...current,
      verificationCode: '',
    }));
    showFieldFeedback('verification', '인증 시간이 만료되었습니다. 코드를 다시 발송해주세요.');
  }, [emailVerificationStatus, remainingVerificationSeconds]);

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

  const resetEmailValidation = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      email,
      verificationCode: '',
    }));
    setEmailCheckStatus('idle');
    setEmailVerificationStatus('idle');
    setVerifiedEmail('');
    setRemainingVerificationSeconds(0);
    clearFieldFeedback('email');
    clearFieldFeedback('verification');
  };

  const handleCheckEmail = async () => {
    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail) {
      showFieldFeedback('email', '이메일을 입력해주세요.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      showFieldFeedback('email', '올바른 이메일 형식으로 입력해주세요.');
      return;
    }

    try {
      setEmailCheckStatus('checking');

      const response = await checkEmailAvailability(trimmedEmail);

      if (!response.available) {
        setEmailCheckStatus('duplicate');
        showFieldFeedback('email', '이미 사용 중인 이메일입니다.');
        return;
      }

      setFormData((current) => ({
        ...current,
        email: trimmedEmail,
      }));
      setEmailCheckStatus('available');
      showFieldFeedback('email', '사용 가능한 이메일입니다.', 'success');
    } catch (error) {
      setEmailCheckStatus('idle');
      showFieldFeedback(
        'email',
        error instanceof ApiClientError
          ? error.detail ?? error.message
          : '이메일 중복 확인 중 오류가 발생했습니다.',
      );
    }
  };

  const handleSendVerificationCode = async () => {
    const trimmedEmail = formData.email.trim();

    if (!isEmailChecked) {
      showFieldFeedback('email', '먼저 중복 확인을 완료해주세요.');
      return;
    }

    try {
      setEmailVerificationStatus('sending');
      setFormData((current) => ({
        ...current,
        verificationCode: '',
      }));

      const response = await sendEmailVerification(trimmedEmail);
      const expiresInSeconds = response.expiresInMinutes > 0
        ? response.expiresInMinutes * 60
        : VERIFICATION_TIME_LIMIT;

      setRemainingVerificationSeconds(expiresInSeconds);
      setEmailVerificationStatus('sent');
      showFieldFeedback('verification', '인증코드를 이메일로 발송했습니다.', 'success');
    } catch (error) {
      setEmailVerificationStatus('idle');
      setRemainingVerificationSeconds(0);
      showFieldFeedback(
        'verification',
        error instanceof ApiClientError
          ? error.detail ?? error.message
          : '인증코드 발송 중 오류가 발생했습니다.',
      );
    }
  };

  const handleVerifyEmailCode = async () => {
    const trimmedEmail = formData.email.trim();
    const trimmedCode = formData.verificationCode.trim();

    if (emailVerificationStatus !== 'sent') {
      showFieldFeedback('verification', '먼저 인증코드를 발송해주세요.');
      return;
    }

    if (remainingVerificationSeconds <= 0) {
      showFieldFeedback('verification', '인증 시간이 만료되었습니다. 코드를 다시 발송해주세요.');
      return;
    }

    if (!trimmedCode) {
      showFieldFeedback('verification', '인증코드를 입력해주세요.');
      return;
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      showFieldFeedback('verification', '인증코드는 6자리 숫자로 입력해주세요.');
      return;
    }

    try {
      setEmailVerificationStatus('verifying');

      const response = await confirmEmailVerification(trimmedEmail, trimmedCode);

      if (!response.verified) {
        setEmailVerificationStatus('sent');
        showFieldFeedback('verification', '인증코드가 일치하지 않습니다.');
        return;
      }

      setVerifiedEmail(response.email);
      setEmailVerificationStatus('verified');
      setRemainingVerificationSeconds(0);
      showFieldFeedback('verification', '이메일 인증이 완료되었습니다.', 'success');
    } catch (error) {
      setEmailVerificationStatus('sent');
      showFieldFeedback(
        'verification',
        error instanceof ApiClientError
          ? error.detail ?? error.message
          : '이메일 인증 확인 중 오류가 발생했습니다.',
      );
    }
  };

  const validateAccountStep = () => {
    if (!formData.name.trim()) {
      showFieldFeedback('name', '이름을 입력해주세요.');
      return false;
    }

    if (!formData.email.trim()) {
      showFieldFeedback('email', '이메일을 입력해주세요.');
      return false;
    }

    if (!isEmailChecked) {
      showFieldFeedback('email', '중복 확인을 완료해주세요.');
      return false;
    }

    if (!isEmailVerified) {
      showFieldFeedback('verification', '이메일 인증을 완료해주세요.');
      return false;
    }

    if (!isPasswordValid) {
      showFieldFeedback('password', '비밀번호 규칙을 확인해주세요.');
      return false;
    }

    if (!isPasswordConfirmValid) {
      showFieldFeedback('passwordConfirm', '비밀번호가 일치하지 않습니다.');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (!validateAccountStep()) {
      return;
    }

    setStep(2);
    setFieldFeedback(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateAccountStep()) {
      setStep(1);
      return;
    }

    if (!formData.gender) {
      showFieldFeedback('gender', '성별을 선택해주세요.');
      return;
    }

    if (!formData.ageGroup) {
      showFieldFeedback('ageGroup', '나이대를 선택해주세요.');
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

    setSignupCompleted(true);
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
              <h1 className = {styles.pageTitle}>
                {signupCompleted ? '회원가입이 완료되었습니다' : '회원가입'}
              </h1>
              <p className = {styles.descriptionText}>
                {signupCompleted
                  ? '이제 셔틀플레이를 시작할 수 있습니다'
                  : step === 1
                    ? '계정 정보를 입력해주세요'
                    : '플레이 정보를 입력해주세요'}
              </p>
            </div>

            {!signupCompleted && (
              <div className = {styles.stepIndicator}>
                <div className = {step === 1 ? styles.stepActive : styles.stepDone}>1</div>
                <div className = {styles.stepLine} />
                <div className = {step === 2 ? styles.stepActive : styles.stepInactive}>2</div>
              </div>
            )}
          </div>

          <div className = {styles.header}>
            {signupCompleted ? (
              <div className = {styles.completionContent}>
                <p className = {styles.completionText}>
                  가입한 이메일과 비밀번호로 로그인해주세요.
                </p>
                <Link to = "/login">
                  <Button type = "button" className = {styles.completionButton} size = "lg">
                    로그인하러 가기
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit = {handleSubmit} className = {styles.form}>
                {step === 1 && (
                  <>
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
                        <Label htmlFor = "email">이메일</Label>
                        {renderFieldFeedback('email')}
                      </div>
                      <div className = {styles.actionRow}>
                        <Input
                          id = "email"
                          type = "email"
                          placeholder = "이메일을 입력하세요"
                          className = {styles.input}
                          value = {formData.email}
                          onChange = {(e) => resetEmailValidation(e.target.value)}
                          disabled = {isEmailLocked}
                          required
                        />
                        <Button
                          type = "button"
                          variant = "outline"
                          className = {styles.inlineButton}
                          onClick = {handleCheckEmail}
                          disabled = {emailCheckStatus === 'checking' || isEmailLocked}
                        >
                          {emailCheckStatus === 'checking' ? '확인 중' : '중복 확인'}
                        </Button>
                      </div>
                    </div>

                    <div className = {styles.stack3}>
                      <div className = {styles.labelRow}>
                        <Label htmlFor = "verification-code">이메일 인증</Label>
                        <div className = {styles.verificationStatus}>
                          {(emailVerificationStatus === 'sent' || emailVerificationStatus === 'verifying') && (
                            <span className = {styles.verificationTimer}>
                              {formattedVerificationTime}
                            </span>
                          )}
                          {renderFieldFeedback('verification')}
                        </div>
                      </div>
                      <div className = {styles.verificationRow}>
                        <Input
                          id = "verification-code"
                          type = "text"
                          inputMode = "numeric"
                          maxLength = {6}
                          placeholder = "인증코드 6자리"
                          className = {styles.input}
                          value = {formData.verificationCode}
                          onChange = {(e) => {
                            setFormData({ ...formData, verificationCode: e.target.value });
                            clearFieldFeedback('verification');
                          }}
                          disabled = {isVerificationCodeLocked}
                          required
                        />
                        <Button
                          type = "button"
                          variant = "outline"
                          className = {styles.inlineButton}
                          onClick = {handleSendVerificationCode}
                          disabled = {!isEmailChecked || emailVerificationStatus === 'sending' || emailVerificationStatus === 'verifying' || emailVerificationStatus === 'verified'}
                        >
                          {emailVerificationStatus === 'sending'
                            ? '발송 중'
                            : emailVerificationStatus === 'sent' || emailVerificationStatus === 'verifying'
                              ? '재발송'
                              : '코드 발송'}
                        </Button>
                        <Button
                          type = "button"
                          variant = "outline"
                          className = {styles.inlineButton}
                          onClick = {handleVerifyEmailCode}
                          disabled = {emailVerificationStatus !== 'sent'}
                        >
                          {emailVerificationStatus === 'verifying' ? '확인 중' : '인증 확인'}
                        </Button>
                      </div>
                    </div>

                    <div className = {styles.stack3}>
                      <div className = {styles.labelRow}>
                        <Label htmlFor = "password">비밀번호</Label>
                        {renderFieldFeedback('password')}
                      </div>
                      <Input
                        id = "password"
                        type = "password"
                        placeholder = "영문+숫자 포함 8자 이상"
                        className = {styles.input}
                        value = {formData.password}
                        onChange = {(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          clearFieldFeedback('password');
                        }}
                        required
                      />
                      <div className = {styles.ruleList}>
                        {passwordRules.map((rule) => {
                          const isValid = rule.validate(formData.password);

                          return (
                            <span key = {rule.key} className = {isValid ? styles.ruleValid : styles.ruleDefault}>
                              {rule.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className = {styles.stack3}>
                      <div className = {styles.labelRow}>
                        <Label htmlFor = "password-confirm">비밀번호 확인</Label>
                        {renderFieldFeedback('passwordConfirm')}
                      </div>
                      <Input
                        id = "password-confirm"
                        type = "password"
                        placeholder = "비밀번호를 다시 입력하세요"
                        className = {styles.input}
                        value = {formData.passwordConfirm}
                        onChange = {(e) => {
                          setFormData({ ...formData, passwordConfirm: e.target.value });
                          clearFieldFeedback('passwordConfirm');
                        }}
                        required
                      />
                    </div>

                    <Button type = "button" className = {styles.submitButton} size = "lg" onClick = {handleNextStep}>
                      다음 단계
                    </Button>
                  </>
                )}

                {step === 2 && (
                  <>
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
                        <Label htmlFor = "age-group">나이대</Label>
                        {renderFieldFeedback('ageGroup')}
                      </div>
                      <Select value = {formData.ageGroup} onValueChange = {(value) => {
                        setFormData({ ...formData, ageGroup: value });
                        clearFieldFeedback('ageGroup');
                      }} required>
                        <SelectTrigger id = "age-group" className = {styles.input}>
                          <SelectValue placeholder = "나이대 선택" />
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
                          id = "signup-agreement"
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

                    <div className = {styles.buttonRow}>
                      <Button
                        type = "button"
                        variant = "outline"
                        className = {styles.backButton}
                        onClick = {() => setStep(1)}
                      >
                        이전
                      </Button>
                      <Button type = "submit" className = {styles.submitButton} size = "lg">
                        회원가입 완료
                      </Button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>

          {!signupCompleted && (
            <div className = {styles.centeredBlock}>
              <span className = {styles.mutedText}>이미 회원이신가요? </span>
              <Link to = "/login" className = {styles.primaryLink}>
                로그인
              </Link>
            </div>
          )}
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
import { Link, useSearchParams } from 'react-router-dom';
import { useMemo, useState, type FormEvent } from 'react';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Sparkles } from 'lucide-react';
import { ApiClientError } from '../utils/apiClient';
import { confirmPasswordReset } from '../utils/authApi';
import { styles } from './PasswordResetPage.styles';

type FeedbackField = 'password' | 'passwordConfirm';

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

export default function PasswordResetConfirmPage() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token') ?? '';
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
  });
  const [fieldFeedback, setFieldFeedback] = useState<{
    field: FeedbackField;
    message: string;
  } | null>(null);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPasswordValid = useMemo(
    () => passwordRules.every((rule) => rule.validate(formData.password)),
    [formData.password],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!resetToken) {
      setFieldFeedback({
        field: 'password',
        message: '비밀번호 재설정 링크가 올바르지 않습니다.',
      });
      return;
    }

    if (!isPasswordValid) {
      setFieldFeedback({
        field: 'password',
        message: '비밀번호 규칙을 확인해주세요.',
      });
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setFieldFeedback({
        field: 'passwordConfirm',
        message: '비밀번호가 일치하지 않습니다.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldFeedback(null);

      const response = await confirmPasswordReset(
        resetToken,
        formData.password,
        formData.passwordConfirm,
      );

      if (response.resetCompleted === false) {
        setFieldFeedback({
          field: 'password',
          message: '비밀번호 변경에 실패했습니다. 다시 시도해주세요.',
        });
        return;
      }

      setResetCompleted(true);
    } catch (error) {
      setFieldFeedback({
        field: 'password',
        message: error instanceof ApiClientError
          ? error.detail ?? error.message
          : '비밀번호 변경 중 오류가 발생했습니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <div className = {styles.authPanel}>
        <div className = {styles.sectionHeader}>
          <div className = {styles.row}>
            <Logo size = "lg" />
          </div>
          <div className = {styles.stack}>
            <h1 className = {styles.pageTitle}>
              {resetCompleted ? '비밀번호가 변경되었습니다' : '새 비밀번호 설정'}
            </h1>
            <p className = {styles.descriptionText}>
              {resetCompleted ? '새 비밀번호로 다시 로그인해주세요' : '앞으로 사용할 비밀번호를 입력해주세요'}
            </p>
          </div>
        </div>

        <div className = {styles.header}>
          {resetCompleted ? (
            <div className = {styles.completionContent}>
              <p className = {styles.completionText}>
                변경한 비밀번호로 셔틀플레이에 로그인할 수 있습니다.
              </p>
              <Link to = "/login">
                <Button type = "button" className = {styles.completionButton} size = "lg">
                  로그인하러 가기
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit = {handleSubmit} className = {styles.form} noValidate>
              <div className = {styles.stack}>
                <div className = {styles.labelRow}>
                  <Label htmlFor = "password">새 비밀번호</Label>
                  {fieldFeedback?.field === 'password' && (
                    <span className = {styles.fieldMessage}>
                      {fieldFeedback.message}
                    </span>
                  )}
                </div>
                <Input
                  id = "password"
                  type = "password"
                  placeholder = "새 비밀번호를 입력하세요"
                  value = {formData.password}
                  onChange = {(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setFieldFeedback((current) => current?.field === 'password' ? null : current);
                  }}
                  required
                  className = {styles.roundedControl}
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

              <div className = {styles.stack}>
                <div className = {styles.labelRow}>
                  <Label htmlFor = "password-confirm">새 비밀번호 확인</Label>
                  {fieldFeedback?.field === 'passwordConfirm' && (
                    <span className = {styles.fieldMessage}>
                      {fieldFeedback.message}
                    </span>
                  )}
                </div>
                <Input
                  id = "password-confirm"
                  type = "password"
                  placeholder = "새 비밀번호를 다시 입력하세요"
                  value = {formData.passwordConfirm}
                  onChange = {(e) => {
                    setFormData({ ...formData, passwordConfirm: e.target.value });
                    setFieldFeedback((current) => current?.field === 'passwordConfirm' ? null : current);
                  }}
                  required
                  className = {styles.roundedControl}
                />
              </div>

              <Button type = "submit" className = {styles.submitButton} size = "lg" disabled = {isSubmitting}>
                {isSubmitting ? '변경 중' : '비밀번호 변경하기'}
              </Button>
            </form>
          )}
        </div>

        {!resetCompleted && (
          <div className = {styles.centeredBlock}>
            <span className = {styles.mutedText}>비밀번호가 기억나셨나요? </span>
            <Link to = "/login" className = {styles.primaryLink}>
              로그인
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
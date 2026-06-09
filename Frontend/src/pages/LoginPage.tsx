import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import googleLogo from '../assets/social/google_logo.svg';
import kakaoLogo from '../assets/social/kakao_logo.png';
import naverLogo from '../assets/social/naver_logo.svg';
import { authenticateMockAccount, startAuthSession } from '../utils/authSession';
import { styles } from './LoginPage.styles';

type FeedbackField = 'email' | 'password';

function AppleLogo() {
  return (
    <svg viewBox = "0 0 24 24" className = {styles.appleIcon} aria-hidden = "true">
      <path fill = "currentColor" d = "M16.52 12.22c-.02-2.16 1.77-3.2 1.85-3.25-1.01-1.48-2.58-1.68-3.13-1.7-1.33-.14-2.6.78-3.27.78-.68 0-1.72-.76-2.83-.74-1.46.02-2.8.85-3.55 2.15-1.51 2.62-.39 6.5 1.09 8.63.72 1.04 1.58 2.21 2.71 2.17 1.09-.04 1.5-.7 2.82-.7 1.31 0 1.69.7 2.84.68 1.17-.02 1.92-1.06 2.63-2.11.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.29-.88-2.35-3.47zM14.37 5.86c.6-.73 1-1.74.89-2.75-.86.03-1.9.57-2.52 1.3-.55.64-1.03 1.67-.9 2.65.96.07 1.94-.49 2.53-1.2z" />
    </svg>
  );
}

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [fieldFeedback, setFieldFeedback] = useState<{
    field: FeedbackField;
    message: string;
  } | null>(null);

  const socialProviders = [
    { name: '구글', loginLabel: '구글로 로그인', image: googleLogo, tone: 'google' },
    { name: '카카오', loginLabel: '카카오로 로그인', image: kakaoLogo, tone: 'kakao' },
    { name: '네이버', loginLabel: '네이버로 로그인', image: naverLogo, tone: 'naver' },
    { name: '애플', loginLabel: '애플로 로그인', icon: AppleLogo, tone: 'apple' },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail) {
      setFieldFeedback({
        field: 'email',
        message: '이메일을 입력해주세요.',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFieldFeedback({
        field: 'email',
        message: '올바른 이메일 형식으로 입력해주세요.',
      });
      return;
    }

    if (!formData.password) {
      setFieldFeedback({
        field: 'password',
        message: '비밀번호를 입력해주세요.',
      });
      return;
    }

    const account = authenticateMockAccount(trimmedEmail, formData.password);

    if (!account) {
      setFieldFeedback({
        field: 'password',
        message: '이메일 또는 비밀번호를 확인해주세요.',
      });
      return;
    }

    setFieldFeedback(null);
    startAuthSession(account);
    navigate(location.state?.from ?? '/groups', {
      replace: true,
    });
  };
  return (
    <div className = {styles.page}>
      {/* Background Pattern */}
      <div className = {styles.decorativeShape} />

      {/* Decorative Elements */}
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
            <h1 className = {styles.pageTitle}>로그인</h1>
            <p className = {styles.descriptionText}>
              배드민턴 모임에 참여해보세요
            </p>
          </div>
        </div>

        <div className = {styles.header}>
          <form onSubmit = {handleSubmit} className = {styles.form} noValidate>
            <div className = {styles.stack3}>
              <div className = {styles.labelRow}>
                <Label htmlFor = "email">이메일</Label>
                {fieldFeedback?.field === 'email' && (
                  <span className = {styles.fieldMessage}>
                    {fieldFeedback.message}
                  </span>
                )}
              </div>
              <Input id = "email" type = "email" placeholder = "이메일을 입력하세요" className = {styles.input} value = {formData.email} onChange = {(e) => {
                setFormData({ ...formData, email: e.target.value });
                setFieldFeedback((current) => current?.field === 'email' ? null : current);
              }}
                required
              />
            </div>

            <div className = {styles.stack3}>
              <div className = {styles.labelRow}>
                <Label htmlFor = "password">비밀번호</Label>
                {fieldFeedback?.field === 'password' && (
                  <span className = {styles.fieldMessage}>
                    {fieldFeedback.message}
                  </span>
                )}
              </div>
              <Input id = "password" type = "password" placeholder = "비밀번호를 입력하세요" className = {styles.input} value = {formData.password} onChange = {(e) => {
                setFormData({ ...formData, password: e.target.value });
                setFieldFeedback((current) => current?.field === 'password' ? null : current);
              }}
                required
              />
            </div>

            <Link to = "/password-reset" className = {styles.cardLink}
            >
              비밀번호 찾기
            </Link>

            <Button type = "submit" className = {styles.submitButton} size = "lg">
              로그인
            </Button>
          </form>

          <div className = {styles.row2}>
            <div className = {styles.row3} />
            <span className = {styles.mutedText}>또는</span>
            <div className = {styles.row3} />
          </div>

          <div className = {styles.stack4}>
            {socialProviders.map((provider) => (
              <Button key = {provider.name} type = "button" variant = "outline" className = {styles.socialButton(provider.tone)}>
                <span className = {styles.inlineText}>
                  {provider.image ? (
                    <img src = {provider.image} alt = "" className = {styles.image} />
                  ) : provider.icon ? (
                    <provider.icon />
                  ) : null}
                </span>
                {provider.loginLabel}
              </Button>
            ))}
          </div>

        </div>

        <div className = {styles.centeredBlock}>
          <span className = {styles.mutedText2}>아직 회원이 아니신가요? </span>
          <Link to = "/signup" className = {styles.primaryLink}>
            회원가입
          </Link>
        </div>

      </div>
    </div>
  );
}

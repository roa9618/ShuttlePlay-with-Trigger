import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useActionFeedback } from '../utils/useActionFeedback';
import googleLogo from '../assets/social/google_logo.svg';
import kakaoLogo from '../assets/social/kakao_logo.png';
import naverLogo from '../assets/social/naver_logo.svg';
import { styles } from './LoginPage.styles';

function AppleLogo() {
  return (
    <svg viewBox = "0 0 24 24" className = {styles.socialIcon} aria-hidden = "true">
      <path fill = "currentColor" d = "M16.52 12.22c-.02-2.16 1.77-3.2 1.85-3.25-1.01-1.48-2.58-1.68-3.13-1.7-1.33-.14-2.6.78-3.27.78-.68 0-1.72-.76-2.83-.74-1.46.02-2.8.85-3.55 2.15-1.51 2.62-.39 6.5 1.09 8.63.72 1.04 1.58 2.21 2.71 2.17 1.09-.04 1.5-.7 2.82-.7 1.31 0 1.69.7 2.84.68 1.17-.02 1.92-1.06 2.63-2.11.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.29-.88-2.35-3.47zM14.37 5.86c.6-.73 1-1.74.89-2.75-.86.03-1.9.57-2.52 1.3-.55.64-1.03 1.67-.9 2.65.96.07 1.94-.49 2.53-1.2z" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { message, showMessage } = useActionFeedback();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const socialProviders = [
    { name: '구글', image: googleLogo, tone: 'google' },
    { name: '카카오톡', image: kakaoLogo, tone: 'kakao' },
    { name: '네이버', image: naverLogo, tone: 'naver' },
    { name: '애플', icon: AppleLogo, tone: 'apple' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/groups');
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
        <Link to = "/" className = {styles.backLink}>
          <ArrowLeft className = {styles.arrowLeftIcon} />
          돌아가기
        </Link>

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
          <form onSubmit = {handleSubmit} className = {styles.form}>
            <div className = {styles.stack3}>
              <Label htmlFor = "email">이메일</Label>
              <Input id = "email" type = "email" placeholder = "이메일을 입력하세요" className = {styles.input} value = {formData.email} onChange = {(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className = {styles.stack3}>
              <Label htmlFor = "password">비밀번호</Label>
              <Input id = "password" type = "password" placeholder = "비밀번호를 입력하세요" className = {styles.input} value = {formData.password} onChange = {(e) => setFormData({ ...formData, password: e.target.value })}
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
              <Button key = {provider.name} type = "button" variant = "outline" className = {styles.socialButton(provider.tone)} onClick = {() => showMessage(`${provider.name} 로그인 연결을 준비했습니다.`)}
              >
                <span className = {styles.inlineText}>
                  {provider.image ? (
                    <img src = {provider.image} alt = "" className = {styles.image} />
                  ) : provider.icon ? (
                    <provider.icon />
                  ) : null}
                </span>
                {provider.name}로 로그인
              </Button>
            ))}
          </div>

          {message && (
            <div className = {styles.contentBox}>
              {message}
            </div>
          )}
        </div>

        <div className = {styles.centeredBlock}>
          <span className = {styles.mutedText2}>아직 회원이 아니신가요? </span>
          <Link to = "/signup" className = {styles.primaryLink}>
            회원가입
          </Link>
        </div>

        {/* Decorative Badge */}
        <div className = {styles.row}>
          <div className = {styles.summaryBox}>
            <div className = {styles.row4}>
              <ShuttlecockIcon size = {16} className = {styles.shuttlecockIcon} />
              <span>셔틀플레이와 함께하세요</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

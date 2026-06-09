import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Sparkles } from 'lucide-react';
import { styles } from './PasswordResetPage.styles';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailFeedback('이메일을 입력해주세요.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailFeedback('올바른 이메일 형식으로 입력해주세요.');
      return;
    }

    // 이메일 전송 처리
    setEmailFeedback('');
    setEmailSent(true);
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
              {emailSent ? '이메일을 보냈어요' : '비밀번호 찾기'}
            </h1>
            <p className = {styles.descriptionText}>
              {emailSent ? `${email}로 재설정 링크를 보냈습니다` : '가입하신 이메일 주소를 입력해주세요'}
            </p>
          </div>
        </div>

        <div className = {styles.header}>
          {!emailSent ? (
            <form onSubmit = {handleSubmit} className = {styles.form} noValidate>
              <div className = {styles.stack}>
                <div className = {styles.labelRow}>
                  <Label htmlFor = "email">이메일</Label>
                  {emailFeedback && (
                    <span className = {styles.fieldMessage}>
                      {emailFeedback}
                    </span>
                  )}
                </div>
                <Input id = "email" type = "email" placeholder = "example@email.com" value = {email} onChange = {(e) => {
                  setEmail(e.target.value);
                  setEmailFeedback('');
                }}
                  required className = {styles.roundedControl}
                />
                <p className = {styles.inputGuideText}>
                  비밀번호 재설정 링크를 보내드립니다
                </p>
              </div>

              <Button type = "submit" className = {styles.submitButton} size = "lg"
              >
                재설정 링크 보내기
              </Button>
            </form>
          ) : (
            <>
              <div className = {styles.summaryBox}>
                <h3 className = {styles.cardTitle}>다음 단계</h3>
                <ol className = {styles.stack2}>
                  <li>1. 이메일을 확인하세요</li>
                  <li>2. 비밀번호 재설정 링크를 클릭하세요</li>
                  <li>3. 새로운 비밀번호를 설정하세요</li>
                  <li>4. 새 비밀번호로 로그인하세요</li>
                </ol>
              </div>

              <div className = {styles.stack3}>
                <p className = {styles.descriptionText3}>
                  이메일이 오지 않았나요?
                </p>
                <Button variant = "outline" className = {styles.secondaryButton} onClick = {() => setEmailSent(false)}
                >
                  다시 보내기
                </Button>
              </div>
            </>
          )}
        </div>

        <div className = {styles.centeredBlock}>
          <span className = {styles.mutedText}>비밀번호가 기억나셨나요? </span>
          <Link to = "/login" className = {styles.primaryLink}>
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}

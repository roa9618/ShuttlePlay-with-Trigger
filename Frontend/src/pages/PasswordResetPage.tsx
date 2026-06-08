import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Mail, Check } from 'lucide-react';
import { styles } from './PasswordResetPage.styles';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 이메일 전송 처리
    setEmailSent(true);
  };

  return (
    <div className = {styles.page}>
      <div className = {styles.authPanel}>
        <div className = {styles.sectionHeader}>
          <Logo size = "lg" className = {styles.sectionHeader2} />
        </div>

        <div className = {styles.header}>
          {!emailSent ? (
            <>
              <div className = {styles.sectionHeader}>
                <div className = {styles.row}>
                  <Mail className = {styles.mailIcon} />
                </div>
                <h1 className = {styles.pageTitle}>비밀번호 찾기</h1>
                <p className = {styles.descriptionText}>
                  가입하신 이메일 주소를 입력해주세요
                </p>
              </div>

              <form onSubmit = {handleSubmit} className = {styles.form}>
                <div className = {styles.stack}>
                  <Label htmlFor = "email">이메일</Label>
                  <Input id = "email" type = "email" placeholder = "example@email.com" value = {email} onChange = {(e) => setEmail(e.target.value)}
                    required className = {styles.roundedControl}
                  />
                  <p className = {styles.descriptionText2}>
                    비밀번호 재설정 링크를 보내드립니다
                  </p>
                </div>

                <Button type = "submit" className = {styles.submitButton} size = "lg"
                >
                  재설정 링크 보내기
                </Button>

                <Link to = "/login">
                  <Button variant = "outline" className = {styles.submitButton} size = "lg" type = "button"
                  >
                    <ArrowLeft className = {styles.arrowLeftIcon} />
                    로그인으로 돌아가기
                  </Button>
                </Link>
              </form>
            </>
          ) : (
            <>
              <div className = {styles.sectionHeader}>
                <div className = {styles.row}>
                  <Check className = {styles.mailIcon} />
                </div>
                <h1 className = {styles.pageTitle}>이메일을 보냈어요</h1>
                <p className = {styles.descriptionText}>
                  {email}로 비밀번호 재설정 링크를 보냈습니다
                </p>
              </div>

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
                <Button variant = "outline" className = {styles.submitButton} onClick = {() => setEmailSent(false)}
                >
                  다시 보내기
                </Button>
                <Link to = "/login">
                  <Button variant = "outline" className = {styles.submitButton}
                  >
                    <ArrowLeft className = {styles.arrowLeftIcon} />
                    로그인으로 돌아가기
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>

        <div className = {styles.centeredBlock}>
          <p className = {styles.descriptionText2}>
            계정이 없으신가요?{' '}
            <Link to = "/signup" className = {styles.primaryLink}>
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

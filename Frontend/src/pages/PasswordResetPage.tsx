import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Mail, Check } from 'lucide-react';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 이메일 전송 처리
    setEmailSent(true);
  };

  return (
    <div className = "min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className = "w-full max-w-md">
        <div className = "text-center mb-8">
          <Logo size = "lg" className = "justify-center mb-6" />
        </div>

        <div className = "bg-card border border-border rounded-3xl p-8 shadow-lg">
          {!emailSent ? (
            <>
              <div className = "text-center mb-8">
                <div className = "w-16 h-16 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-4">
                  <Mail className = "w-8 h-8 text-primary" />
                </div>
                <h1 className = "text-3xl font-medium mb-2">비밀번호 찾기</h1>
                <p className = "text-muted-foreground">
                  가입하신 이메일 주소를 입력해주세요
                </p>
              </div>

              <form onSubmit = {handleSubmit} className = "space-y-6">
                <div className = "space-y-2">
                  <Label htmlFor = "email">이메일</Label>
                  <Input id = "email" type = "email" placeholder = "example@email.com" value = {email} onChange = {(e) => setEmail(e.target.value)}
                    required className = "rounded-xl"
                  />
                  <p className = "text-sm text-muted-foreground">
                    비밀번호 재설정 링크를 보내드립니다
                  </p>
                </div>

                <Button type = "submit" className = "w-full rounded-full" size = "lg"
                >
                  재설정 링크 보내기
                </Button>

                <Link to = "/login">
                  <Button variant = "outline" className = "w-full rounded-full" size = "lg" type = "button"
                  >
                    <ArrowLeft className = "w-4 h-4 mr-2" />
                    로그인으로 돌아가기
                  </Button>
                </Link>
              </form>
            </>
          ) : (
            <>
              <div className = "text-center mb-8">
                <div className = "w-16 h-16 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-4">
                  <Check className = "w-8 h-8 text-primary" />
                </div>
                <h1 className = "text-3xl font-medium mb-2">이메일을 보냈어요</h1>
                <p className = "text-muted-foreground">
                  {email}로 비밀번호 재설정 링크를 보냈습니다
                </p>
              </div>

              <div className = "bg-secondary rounded-2xl p-6 mb-6">
                <h3 className = "font-medium mb-2">다음 단계</h3>
                <ol className = "space-y-2 text-sm text-muted-foreground">
                  <li>1. 이메일을 확인하세요</li>
                  <li>2. 비밀번호 재설정 링크를 클릭하세요</li>
                  <li>3. 새로운 비밀번호를 설정하세요</li>
                  <li>4. 새 비밀번호로 로그인하세요</li>
                </ol>
              </div>

              <div className = "space-y-3">
                <p className = "text-sm text-muted-foreground text-center">
                  이메일이 오지 않았나요?
                </p>
                <Button variant = "outline" className = "w-full rounded-full" onClick = {() => setEmailSent(false)}
                >
                  다시 보내기
                </Button>
                <Link to = "/login">
                  <Button variant = "outline" className = "w-full rounded-full"
                  >
                    <ArrowLeft className = "w-4 h-4 mr-2" />
                    로그인으로 돌아가기
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>

        <div className = "text-center mt-6">
          <p className = "text-sm text-muted-foreground">
            계정이 없으신가요?{' '}
            <Link to = "/signup" className = "text-primary hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

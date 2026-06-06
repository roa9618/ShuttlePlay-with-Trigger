import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useActionFeedback } from '../hooks/useActionFeedback';
import googleLogo from '../../assets/social/google_logo.svg';
import kakaoLogo from '../../assets/social/kakao_logo.png';
import naverLogo from '../../assets/social/naver_logo.svg';

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="currentColor" d="M16.52 12.22c-.02-2.16 1.77-3.2 1.85-3.25-1.01-1.48-2.58-1.68-3.13-1.7-1.33-.14-2.6.78-3.27.78-.68 0-1.72-.76-2.83-.74-1.46.02-2.8.85-3.55 2.15-1.51 2.62-.39 6.5 1.09 8.63.72 1.04 1.58 2.21 2.71 2.17 1.09-.04 1.5-.7 2.82-.7 1.31 0 1.69.7 2.84.68 1.17-.02 1.92-1.06 2.63-2.11.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.29-.88-2.35-3.47zM14.37 5.86c.6-.73 1-1.74.89-2.75-.86.03-1.9.57-2.52 1.3-.55.64-1.03 1.67-.9 2.65.96.07 1.94-.49 2.53-1.2z" />
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
    { name: '구글', image: googleLogo, className: 'bg-card border-border text-foreground' },
    { name: '카카오톡', image: kakaoLogo, className: 'bg-[#FEE500] border-[#FEE500] text-[#181600]' },
    { name: '네이버', image: naverLogo, className: 'bg-[#03C75A] border-[#03C75A] text-white' },
    { name: '애플', icon: AppleLogo, className: 'bg-foreground border-foreground text-background' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/groups');
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/20 to-background" />

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 opacity-10">
        <ShuttlecockIcon size={120} className="text-primary" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-10">
        <ShuttlecockIcon size={80} className="text-primary" />
      </div>
      <div className="absolute top-1/3 left-20 opacity-5">
        <Sparkles className="w-16 h-16 text-primary" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Link>

        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-medium">로그인</h1>
            <p className="text-lg text-muted-foreground">
              배드민턴 모임에 참여해보세요
            </p>
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border-2 border-border rounded-3xl p-10 shadow-2xl shadow-primary/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                className="rounded-xl h-12"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="rounded-xl h-12"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Link
              to="/password-reset"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors text-right w-full"
            >
              비밀번호 찾기
            </Link>

            <Button type="submit" className="w-full rounded-full shadow-lg shadow-primary/20" size="lg">
              로그인
            </Button>
          </form>

          <div className="flex items-center gap-3 mt-9 mb-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground">또는</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="space-y-3">
            {socialProviders.map((provider) => (
              <Button
                key={provider.name}
                type="button"
                variant="outline"
                className={`w-full rounded-full h-12 justify-start gap-3 border-2 ${provider.className}`}
                onClick={() => showMessage(`${provider.name} 로그인 연결을 준비했습니다.`)}
              >
                <span className="w-7 h-7 rounded-full bg-background/90 text-foreground flex items-center justify-center">
                  {provider.image ? (
                    <img src={provider.image} alt="" className="w-5 h-5 object-contain" />
                  ) : provider.icon ? (
                    <provider.icon />
                  ) : null}
                </span>
                {provider.name}로 로그인
              </Button>
            ))}
          </div>

          {message && (
            <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-3 text-center text-sm text-primary">
              {message}
            </div>
          )}
        </div>

        <div className="text-center">
          <span className="text-muted-foreground">아직 회원이 아니신가요? </span>
          <Link to="/signup" className="text-primary hover:underline font-medium">
            회원가입
          </Link>
        </div>

        {/* Decorative Badge */}
        <div className="flex justify-center">
          <div className="bg-secondary/50 rounded-full px-6 py-3 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShuttlecockIcon size={16} className="text-primary" />
              <span>셔틀플레이와 함께하세요</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

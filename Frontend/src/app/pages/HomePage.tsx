import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, ChevronRight, ClipboardCheck, LogIn, QrCode, Settings, UserPlus, Users } from 'lucide-react';

export default function HomePage() {
  const mainActions = [
    {
      title: '오늘 운동 참여',
      description: 'QR 또는 공유 링크로 들어온 참가자',
      path: '/sessions/demo/join',
      icon: QrCode,
      badge: '참가자',
      tone: 'accent',
    },
    {
      title: '모임 운영',
      description: '출석, 매칭, 결과 입력을 관리',
      path: '/sessions/demo/dashboard',
      icon: ClipboardCheck,
      badge: '운영자',
      tone: 'primary',
    },
  ];

  const quickLinks = [
    { title: '내 모임', path: '/groups', icon: Users },
    { title: '세션 만들기', path: '/groups/1/create-session', icon: Calendar },
    { title: '내 기록', path: '/my-record', icon: ClipboardCheck },
    { title: '설정', path: '/settings', icon: Settings },
  ];

  return (
    <div className = "min-h-screen bg-background">
      <div className = "border-b border-border bg-card">
        <div className = "max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Logo size = "md" />
          <div className = "flex gap-2">
            <Link to = "/login">
              <Button variant = "outline" className = "rounded-full">
                <LogIn className = "w-4 h-4 mr-2" />
                로그인
              </Button>
            </Link>
            <Link to = "/signup">
              <Button className = "rounded-full">
                <UserPlus className = "w-4 h-4 mr-2" />
                가입
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className = "max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className = "mb-8 md:mb-10">
          <Badge variant = "outline" className = "mb-4">ShuttlePlay</Badge>
          <h1 className = "text-4xl md:text-5xl font-medium mb-3">무엇을 하시나요?</h1>
          <p className = "text-muted-foreground text-lg">
            오늘 할 일에 맞는 화면으로 바로 이동합니다.
          </p>
        </div>

        <div className = "grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {mainActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key = {action.title} to = {action.path} className = "block">
                <div className = {`min-h-48 rounded-3xl border-2 p-6 md:p-8 transition-all hover:shadow-xl ${
                  action.tone === 'accent'
                    ? 'bg-accent/15 border-accent/50 hover:border-accent'
                    : 'bg-primary/10 border-primary/40 hover:border-primary'
                }`}>
                  <div className = "flex items-start justify-between gap-4">
                    <div className = "w-16 h-16 rounded-2xl bg-card flex items-center justify-center">
                      <Icon className = "w-8 h-8 text-primary" />
                    </div>
                    <Badge className = {action.tone === 'accent' ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}>
                      {action.badge}
                    </Badge>
                  </div>
                  <div className = "mt-8 flex items-end justify-between gap-4">
                    <div>
                      <h2 className = "text-3xl font-medium mb-2">{action.title}</h2>
                      <p className = "text-muted-foreground">{action.description}</p>
                    </div>
                    <ChevronRight className = "w-7 h-7 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className = "bg-card border border-border rounded-3xl p-5 md:p-6">
          <h2 className = "text-xl font-medium mb-4">바로가기</h2>
          <div className = "grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key = {link.title} to = {link.path}>
                  <div className = "h-full rounded-2xl border border-border bg-secondary/30 p-4 hover:border-primary transition-colors">
                    <Icon className = "w-5 h-5 text-primary mb-3" />
                    <p className = "font-medium">{link.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

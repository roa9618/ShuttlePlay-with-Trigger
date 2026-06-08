import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, ChevronRight, ClipboardCheck, LogIn, QrCode, Settings, UserPlus, Users } from 'lucide-react';
import { styles } from './HomePage.styles';

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
    <div className = {styles.page}>
      <div className = {styles.header}>
        <div className = {styles.headerInner}>
          <Logo size = "md" />
          <div className = {styles.row}>
            <Link to = "/login">
              <Button variant = "outline" className = {styles.roundButton}>
                <LogIn className = {styles.logInIcon} />
                로그인
              </Button>
            </Link>
            <Link to = "/signup">
              <Button className = {styles.roundButton}>
                <UserPlus className = {styles.logInIcon} />
                가입
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className = {styles.content}>
        <div className = {styles.sectionHeader}>
          <Badge variant = "outline" className = {styles.badge}>ShuttlePlay</Badge>
          <h1 className = {styles.pageTitle}>무엇을 하시나요?</h1>
          <p className = {styles.descriptionText}>
            오늘 할 일에 맞는 화면으로 바로 이동합니다.
          </p>
        </div>

        <div className = {styles.cardGrid}>
          {mainActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key = {action.title} to = {action.path} className = {styles.cardLink}>
                <div className = {styles.actionCard(action.tone)}>
                  <div className = {styles.betweenRow}>
                    <div className = {styles.row2}>
                      <Icon className = {styles.iconIcon} />
                    </div>
                    <Badge className = {styles.actionBadge(action.tone)}>
                      {action.badge}
                    </Badge>
                  </div>
                  <div className = {styles.betweenRow2}>
                    <div>
                      <h2 className = {styles.sectionTitle}>{action.title}</h2>
                      <p className = {styles.descriptionText2}>{action.description}</p>
                    </div>
                    <ChevronRight className = {styles.chevronRightIcon} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className = {styles.header2}>
          <h2 className = {styles.sectionTitle2}>바로가기</h2>
          <div className = {styles.cardGrid2}>
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key = {link.title} to = {link.path}>
                  <div className = {styles.summaryBox}>
                    <Icon className = {styles.iconIcon2} />
                    <p className = {styles.summaryText}>{link.title}</p>
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

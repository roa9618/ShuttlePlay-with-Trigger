import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, ChevronRight, ClipboardCheck, Download, LogIn, QrCode, Settings, UserPlus, Users } from 'lucide-react';
import { usePwaInstall } from '../utils/usePwaInstall';
import { styles } from './HomePage.styles';

export default function HomePage() {
  const { install, isInstalled, installGuide } = usePwaInstall();
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mainActions = [
    {
      title: '모임 참여',
      description: '초대 링크나 QR로 오늘 모임에 참여하세요',
      path: '/sessions/demo/join',
      icon: QrCode,
      badge: '참가자',
      tone: 'accent',
    },
    {
      title: '모임 운영',
      description: '출석, 매칭, 결과 입력을 한곳에서 관리하세요',
      path: '/sessions/demo/dashboard',
      icon: ClipboardCheck,
      badge: '운영자',
      tone: 'primary',
    },
  ];

  const quickLinks = [
    { title: '내 모임', path: '/groups', icon: Users },
    { title: '일정 생성', path: '/groups/1/create-session', icon: Calendar },
    { title: '내 기록', path: '/my-record', icon: ClipboardCheck },
    { title: '설정', path: '/settings', icon: Settings },
  ];

  useEffect(() => () => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    toastTimer.current = setTimeout(() => {
      setToastMessage('');
      toastTimer.current = null;
    }, 3000);
  };

  const handleInstall = async () => {
    if (isInstalled) {
      showToast('이미 앱으로 설치되어 있습니다.');
      return;
    }

    const result = await install();

    if (result === 'installed') {
      showToast('셔틀플레이 설치를 시작했습니다.');
      return;
    }

    if (result === 'unavailable') {
      showToast(installGuide);
    }
  };

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

      <main className = {styles.mainArea}>
        <div className = {styles.decorations} aria-hidden = "true">
          <ShuttlecockIcon size = {120} className = {styles.shuttlecockTop} />
          <ShuttlecockIcon size = {84} className = {styles.shuttlecockLeft} />
          <ShuttlecockIcon size = {96} className = {styles.shuttlecockRight} />
          <ShuttlecockIcon size = {72} className = {styles.shuttlecockBottom} />
          <Calendar className = {styles.calendarDecoration} />
          <Users className = {styles.usersDecoration} />
          <ClipboardCheck className = {styles.clipboardDecoration} />
        </div>

        <div className = {styles.content}>
          <div className = {styles.sectionHeader}>
            <h1 className = {styles.pageTitle}>오늘은 어떻게 시작할까요?</h1>
            <p className = {styles.descriptionText}>
              참여하거나 모임을 운영할 화면을 선택하세요.
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
              <button type = "button" className = {styles.installButton} onClick = {handleInstall}>
                <Download className = {styles.iconIcon2} />
                <p className = {styles.summaryText}>앱 설치</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {toastMessage && (
        <div className = {styles.toast} role = "status">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

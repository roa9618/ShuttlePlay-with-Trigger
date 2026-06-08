import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import {
  Home,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Grid3x3
} from 'lucide-react';
import { Button } from './ui/button';
import { styles } from './DesktopSidebar.styles';

export default function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: '홈', path: '/', icon: Home },
    { name: '내 모임', path: '/groups', icon: Users },
    { name: '내 기록', path: '/my-record', icon: BarChart3 },
    { name: '설정', path: '/settings', icon: Settings },
    { name: '페이지 갤러리', path: '/gallery', icon: Grid3x3 },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className = {styles.header}>
      <div className = {styles.contentBox}>
        <Logo size = "md" />
      </div>

      <nav className = {styles.row}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link key = {item.path} to = {item.path} className = {styles.navLink(active)}
            >
              <Icon className = {styles.iconIcon} />
              <span className = {styles.labelText}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className = {styles.footerActions}>
        <Button variant = "ghost" className = {styles.fullWidthButton} onClick = {() => navigate('/')}
        >
          <LogOut className = {styles.logOutIcon} />
          로그아웃
        </Button>
      </div>
    </div>
  );
}

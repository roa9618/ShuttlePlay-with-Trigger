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
    <div className = "desktop-sidebar w-64 h-screen bg-card border-r border-border flex flex-col sticky top-0">
      <div className = "p-6 border-b border-border">
        <Logo size = "md" />
      </div>

      <nav className = "flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link key = {item.path} to = {item.path} className = {`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }
              `}
            >
              <Icon className = "w-5 h-5" />
              <span className = "font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className = "p-4 border-t border-border">
        <Button variant = "ghost" className = "w-full justify-start gap-2 text-muted-foreground hover:text-destructive rounded-xl" onClick = {() => navigate('/')}
        >
          <LogOut className = "w-4 h-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}

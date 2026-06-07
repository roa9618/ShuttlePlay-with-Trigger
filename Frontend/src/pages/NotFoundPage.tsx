import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Home, Search, Users } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className = "min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className = "w-full max-w-lg text-center space-y-8">
        <div className = "flex justify-center">
          <Logo size = "lg" />
        </div>

        <div className = "space-y-4">
          <div className = "w-20 h-20 rounded-full bg-secondary mx-auto flex items-center justify-center">
            <Search className = "w-10 h-10 text-primary" />
          </div>
          <div>
            <p className = "text-sm font-medium text-primary mb-3">404</p>
            <h1 className = "text-4xl font-medium mb-3">페이지를 찾을 수 없습니다</h1>
            <p className = "text-muted-foreground">
              주소가 잘못되었거나, 아직 준비되지 않은 화면입니다.
            </p>
          </div>
        </div>

        <div className = "grid gap-3">
          <Link to = "/">
            <Button className = "w-full rounded-full" size = "lg">
              <Home className = "w-5 h-5 mr-2" />
              홈으로 가기
            </Button>
          </Link>
          <Link to = "/groups">
            <Button variant = "outline" className = "w-full rounded-full" size = "lg">
              <Users className = "w-5 h-5 mr-2" />
              내 모임 보기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

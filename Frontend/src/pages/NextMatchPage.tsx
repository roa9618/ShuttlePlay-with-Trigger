import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Bell, Users } from 'lucide-react';

export default function NextMatchPage() {
  const { sessionId } = useParams();

  return (
    <div className = "min-h-screen bg-gradient-to-b from-accent/20 to-secondary/20">
      <div className = "px-4 py-6">
        <Logo size = "sm" className = "justify-center" />
      </div>

      <div className = "max-w-md mx-auto px-4 pb-12 space-y-6">
        <div className = "text-center space-y-4">
          <div className = "w-24 h-24 rounded-full bg-accent mx-auto flex items-center justify-center animate-pulse">
            <Bell className = "w-12 h-12 text-accent-foreground" />
          </div>
          <div>
            <Badge className = "mb-3 bg-accent text-accent-foreground hover:bg-accent">
              다음 경기 예정
            </Badge>
            <h1 className = "text-3xl font-medium mb-2">2번 코트로 이동해주세요</h1>
            <p className = "text-lg text-muted-foreground">
              잠시 후 경기가 시작됩니다
            </p>
          </div>
        </div>

        <div className = "bg-card border-2 border-accent rounded-3xl p-8 shadow-lg space-y-6">
          <div className = "text-center pb-4 border-b border-border">
            <p className = "text-sm text-muted-foreground mb-2">코트 번호</p>
            <p className = "text-5xl font-medium text-primary">2</p>
          </div>

          <div className = "space-y-4">
            <div>
              <div className = "flex items-center gap-2 mb-3">
                <Users className = "w-5 h-5 text-primary" />
                <h3 className = "font-medium">파트너</h3>
              </div>
              <div className = "bg-secondary rounded-xl p-4">
                <p className = "font-medium">김민수</p>
                <p className = "text-sm text-muted-foreground">B · 복식 MMR 1450</p>
              </div>
            </div>

            <div>
              <div className = "flex items-center gap-2 mb-3">
                <Users className = "w-5 h-5 text-muted-foreground" />
                <h3 className = "font-medium">상대팀</h3>
              </div>
              <div className = "space-y-2">
                <div className = "bg-secondary rounded-xl p-4">
                  <p className = "font-medium">박지영</p>
                  <p className = "text-sm text-muted-foreground">A · 복식 MMR 1520</p>
                </div>
                <div className = "bg-secondary rounded-xl p-4">
                  <p className = "font-medium">이준호</p>
                  <p className = "text-sm text-muted-foreground">B · 복식 MMR 1480</p>
                </div>
              </div>
            </div>
          </div>

          <div className = "border-t border-border pt-4 space-y-3 text-sm">
            <div className = "flex justify-between">
              <span className = "text-muted-foreground">경기 유형</span>
              <span className = "font-medium">복식</span>
            </div>
            <div className = "flex justify-between">
              <span className = "text-muted-foreground">플레이 스타일</span>
              <span className = "font-medium">경쟁 모드</span>
            </div>
          </div>

          <Link to = {`/sessions/${sessionId}/status`}>
            <Button className = "w-full rounded-full" size = "lg">
              확인했어요
            </Button>
          </Link>
        </div>

        <div className = "bg-accent/30 rounded-2xl p-6 border border-accent text-center">
          <p className = "text-sm text-accent-foreground">
            준비운동을 하고 2번 코트 옆에서 대기해주세요
          </p>
        </div>
      </div>
    </div>
  );
}

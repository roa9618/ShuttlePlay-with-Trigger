import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Badge } from '../components/ui/badge';
import { MapPin, Calendar, Clock, QrCode, UserCheck, UserPlus } from 'lucide-react';

export default function JoinSessionPage() {
  const { sessionId } = useParams();

  return (
    <div className = "min-h-screen bg-background flex flex-col">
      <div className = "border-b border-border bg-card px-4 py-4">
        <Logo size = "md" className = "justify-center" />
      </div>

      <div className = "flex-1 px-4 py-6 md:py-12">
        <div className = "w-full max-w-2xl mx-auto space-y-6">
          <div className = "text-center space-y-4 pt-2">
            <div className = "w-24 h-24 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 mx-auto flex items-center justify-center mb-4">
              <QrCode className = "w-12 h-12 text-accent-foreground" />
            </div>
            <div>
              <h1 className = "text-4xl font-medium mb-3">오늘 운동 참여</h1>
              <p className = "text-lg text-muted-foreground">강남 배드민턴 클럽</p>
            </div>
          </div>

          <div className = "bg-card border-2 border-border rounded-3xl p-5 md:p-8 shadow-lg">
            <div className = "grid gap-3 mb-6">
              <div className = "flex items-center gap-3 p-4 bg-secondary/30 rounded-xl">
                <Calendar className = "w-5 h-5 text-primary flex-shrink-0" />
                <div className = "min-w-0">
                  <p className = "text-xs text-muted-foreground">날짜</p>
                  <p className = "font-medium truncate">6월 3일 (화)</p>
                </div>
              </div>
              <div className = "flex items-center gap-3 p-4 bg-secondary/30 rounded-xl">
                <Clock className = "w-5 h-5 text-primary flex-shrink-0" />
                <div className = "min-w-0">
                  <p className = "text-xs text-muted-foreground">시간</p>
                  <p className = "font-medium truncate">19:00 - 22:00</p>
                </div>
              </div>
              <div className = "flex items-center gap-3 p-4 bg-secondary/30 rounded-xl">
                <MapPin className = "w-5 h-5 text-primary flex-shrink-0" />
                <div className = "min-w-0">
                  <p className = "text-xs text-muted-foreground">장소</p>
                  <p className = "font-medium truncate">강남구민회관</p>
                </div>
              </div>
            </div>

            <div className = "space-y-3">
              <Link to = {`/sessions/${sessionId}/attendance`} className = "block">
                <div className = "bg-primary text-primary-foreground border-2 border-primary rounded-2xl p-6 hover:shadow-lg transition-all group cursor-pointer">
                  <div className = "flex items-center gap-4">
                    <div className = "w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                      <UserCheck className = "w-7 h-7 text-primary-foreground" />
                    </div>
                    <div className = "flex-1">
                      <p className = "text-2xl font-medium mb-1">참여하기</p>
                      <p className = "text-sm opacity-90">회원이거나 이미 등록한 사람</p>
                    </div>
                    <Badge className = "bg-primary-foreground text-primary">추천</Badge>
                  </div>
                </div>
              </Link>

              <Link to = {`/sessions/${sessionId}/guest-join`} className = "block">
                <div className = "bg-card border-2 border-border rounded-2xl p-6 hover:border-primary transition-all group cursor-pointer">
                  <div className = "flex items-center gap-4">
                    <div className = "w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserPlus className = "w-6 h-6 text-primary" />
                    </div>
                    <div className = "flex-1">
                      <p className = "text-xl font-medium mb-1">처음 왔어요</p>
                      <p className = "text-sm text-muted-foreground">이름과 급수를 먼저 입력</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className = "text-center">
            <p className = "text-muted-foreground">
              이미 참여하셨나요?{' '}
              <Link to = {`/sessions/${sessionId}/status`} className = "text-primary hover:underline font-medium">
                출석 체크하기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

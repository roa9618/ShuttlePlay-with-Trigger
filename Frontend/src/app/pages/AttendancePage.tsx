import { Link, useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Check, Clock, X, Calendar, Users, MapPin } from 'lucide-react';
import { useActionFeedback } from '../hooks/useActionFeedback';

export default function AttendancePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { message, showMessage } = useActionFeedback();

  const handleCheckIn = () => {
    navigate(`/sessions/${sessionId}/status`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-4 py-4">
        <Logo size="md" className="justify-center" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto flex items-center justify-center mb-4">
            <Check className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-medium mb-3">도착하셨나요?</h1>
            <p className="text-lg text-muted-foreground">
              현재 상태를 선택하세요.
            </p>
          </div>
        </div>

        <div className="bg-card border-2 border-border rounded-3xl p-8 md:p-10 shadow-sm">
          <div className="mb-8 pb-8 border-b border-border">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-medium mb-2">6월 3일 (화) 운동</h2>
                <Badge variant="outline">강남 배드민턴 클럽</Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">날짜</p>
                  <p className="font-medium truncate">6월 3일 (화)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">시간</p>
                  <p className="font-medium truncate">19:00 - 22:00</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">장소</p>
                  <p className="font-medium truncate">강남구민회관</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleCheckIn}
              className="w-full rounded-2xl h-auto p-7 shadow-lg shadow-primary/20"
              size="lg"
            >
              <div className="flex items-center gap-4 w-full">
                <div className="w-16 h-16 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-2xl font-medium">도착했어요</p>
                  <p className="text-sm opacity-90">경기에 참여할 수 있어요</p>
                </div>
              </div>
            </Button>

            <Link to={`/sessions/${sessionId}/late`} className="block">
              <Button
                variant="outline"
                className="w-full rounded-2xl h-auto p-6 border-2"
                size="lg"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-lg font-medium">조금 늦어요</p>
                    <p className="text-sm text-muted-foreground">도착 예정 시간 등록</p>
                  </div>
                </div>
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full rounded-2xl h-auto p-6 border-2 border-destructive/30 hover:bg-destructive/5"
              size="lg"
              onClick={() => {
                showMessage('불참 처리되었습니다.');
                window.setTimeout(() => navigate('/'), 500);
              }}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <X className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-lg font-medium text-destructive">오늘 못 가요</p>
                  <p className="text-sm text-muted-foreground">오늘 참여할 수 없어요</p>
                </div>
              </div>
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-6 border-2 border-accent/40">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-accent-foreground">!</span>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-accent-foreground">현재 상태</p>
              <p className="text-sm text-accent-foreground/80">
                참여 등록 완료 · 아직 체육관에 도착하지 않음
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="fixed left-4 right-4 bottom-4 bg-card border border-border rounded-2xl p-4 shadow-xl text-center text-sm font-medium">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

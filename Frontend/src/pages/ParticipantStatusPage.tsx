import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Clock, UserCheck, Coffee, BarChart3 } from 'lucide-react';

type ViewStatus = 'waiting' | 'playing' | 'next' | 'resting';

function getMockStatus(): ViewStatus {
  return 'waiting';
}

export default function ParticipantStatusPage() {
  const { sessionId } = useParams();
  const [resting, setResting] = useState(false);
  // 실제로는 서버에서 받아올 데이터
  const myStatus = getMockStatus();
  const hasNextMatch = true;
  const nextMatch = {
    court: 2,
    partner: '박지영',
    opponents: ['이준호', '최서연'],
  };
  const todayStats = {
    games: 3,
    wins: 2,
    losses: 1,
  };

  return (
    <div className = "min-h-screen bg-background pb-20">
      {/* Simple Header */}
      <div className = "border-b border-border bg-card sticky top-0 z-10">
        <div className = "px-4 py-4">
          <Logo size = "sm" className = "justify-center" />
        </div>
      </div>

      <div className = "px-4 py-6 space-y-6">
        {/* 1. 현재 상태 - 가장 크고 명확하게 */}
        {myStatus === 'waiting' && (
          <div className = "bg-card border-2 border-primary/30 rounded-3xl p-8 text-center">
            <Clock className = "w-12 h-12 text-primary mx-auto mb-4" />
            <p className = "text-2xl font-medium mb-2">대기 중</p>
            <p className = "text-muted-foreground">경기 배정을 기다리고 있습니다</p>
          </div>
        )}

        {myStatus === 'playing' && (
          <div className = "bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary rounded-3xl p-8 text-center">
            <div className = "w-12 h-12 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
              <span className = "text-white text-lg font-medium">2</span>
            </div>
            <p className = "text-2xl font-medium mb-2">경기 중</p>
            <p className = "text-muted-foreground">2번 코트</p>
          </div>
        )}

        {myStatus === 'resting' && (
          <div className = "bg-card border-2 border-border rounded-3xl p-8 text-center">
            <Coffee className = "w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className = "text-2xl font-medium mb-2">휴식 중</p>
            <p className = "text-muted-foreground">잠시 쉬고 계십니다</p>
          </div>
        )}

        {/* 2. 다음 경기 (있는 경우 - 눈에 띄게) */}
        {hasNextMatch && (
          <div className = "bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent/60 rounded-3xl p-6">
            <div className = "flex items-center gap-3 mb-4">
              <div className = "w-10 h-10 rounded-full bg-accent/40 flex items-center justify-center">
                <span className = "text-lg font-medium text-accent-foreground">{nextMatch.court}</span>
              </div>
              <div>
                <p className = "text-sm text-accent-foreground/80">다음 경기</p>
                <p className = "font-medium text-accent-foreground">{nextMatch.court}번 코트</p>
              </div>
            </div>

            <div className = "space-y-3">
              <div className = "bg-card/50 rounded-2xl p-4">
                <p className = "text-xs text-muted-foreground mb-1">파트너</p>
                <p className = "font-medium">{nextMatch.partner}</p>
              </div>
              <div className = "bg-card/50 rounded-2xl p-4">
                <p className = "text-xs text-muted-foreground mb-1">상대</p>
                <p className = "font-medium">{nextMatch.opponents.join(' · ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. 오늘 경기 기록 - 간단하게 */}
        <div>
          <p className = "text-sm text-muted-foreground mb-3 px-1">오늘 기록</p>
          <div className = "grid grid-cols-3 gap-3">
            <div className = "bg-card border border-border rounded-2xl p-5 text-center">
              <p className = "text-3xl font-medium text-foreground mb-1">{todayStats.games}</p>
              <p className = "text-xs text-muted-foreground">경기</p>
            </div>
            <div className = "bg-card border border-border rounded-2xl p-5 text-center">
              <p className = "text-3xl font-medium text-primary mb-1">{todayStats.wins}</p>
              <p className = "text-xs text-muted-foreground">승</p>
            </div>
            <div className = "bg-card border border-border rounded-2xl p-5 text-center">
              <p className = "text-3xl font-medium text-muted-foreground mb-1">{todayStats.losses}</p>
              <p className = "text-xs text-muted-foreground">패</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 하단 고정 액션 버튼 - 한 손으로 쉽게 누를 수 있게 */}
      <div className = "fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-4 space-y-3">
        <div className = "flex gap-3">
          <Link to = {`/sessions/${sessionId}/attendance`} className = "flex-1">
            <Button variant = "outline" className = "w-full rounded-full" size = "lg">
              <UserCheck className = "w-5 h-5 mr-2" />
              출석 체크
            </Button>
          </Link>
          <Link to = {`/sessions/${sessionId}/late`} className = "flex-1">
            <Button variant = "outline" className = "w-full rounded-full" size = "lg">
              <Clock className = "w-5 h-5 mr-2" />
              지각 예정
            </Button>
          </Link>
        </div>
        <Button variant = "outline" className = {`w-full rounded-full ${resting ? 'border-primary bg-primary/5 text-primary' : ''}`} size = "lg" onClick = {() => setResting((value) => !value)}
        >
          <Coffee className = "w-5 h-5 mr-2" />
          {resting ? '휴식 중' : '잠시 휴식'}
        </Button>
        <Link to = {`/sessions/${sessionId}/my-report`}>
          <Button className = "w-full rounded-full" size = "lg">
            <BarChart3 className = "w-5 h-5 mr-2" />
            오늘 기록 보기
          </Button>
        </Link>
      </div>
    </div>
  );
}

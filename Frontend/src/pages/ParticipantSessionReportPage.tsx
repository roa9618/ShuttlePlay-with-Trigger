import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft, CalendarCheck, Clock, Trophy, Users } from 'lucide-react';

const matches = [
  { partner: '박지영', opponents: '이준호 · 최서연', result: '승', score: '21-19', type: '혼합 복식' },
  { partner: '강수진', opponents: '정민재 · 오유진', result: '패', score: '18-21', type: '성별 무관' },
  { partner: '한지우', opponents: '송민호 · 윤서아', result: '승', score: '21-15', type: '남자 복식' },
  { partner: '최서연', opponents: '장현우 · 김나영', result: '승', score: '21-18', type: '혼합 복식' },
];

export default function ParticipantSessionReportPage() {
  const { sessionId } = useParams();

  return (
    <div className = "min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className = "px-4 py-6">
        <Logo size = "sm" className = "justify-center" />
      </div>

      <div className = "max-w-4xl mx-auto px-4 pb-12 space-y-8">
        <Link to = {`/sessions/${sessionId}/status`} className = "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className = "w-4 h-4" />
          내 상태
        </Link>

        <div className = "text-center space-y-2">
          <h1 className = "text-3xl font-medium">오늘 내 운동 기록</h1>
          <p className = "text-muted-foreground">6월 3일 화요일 · 19:00-22:00</p>
        </div>

        <div className = "grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['총 경기', '4'],
            ['승 / 패', '3 / 1'],
            ['승률', '75%'],
            ['운동 시간', '2시간 53분'],
          ].map(([label, value]) => (
            <div key = {label} className = "bg-card border border-border rounded-2xl p-5 text-center">
              <p className = "text-2xl font-medium text-primary">{value}</p>
              <p className = "text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className = "bg-card border border-border rounded-3xl p-6 md:p-8 space-y-5">
          <div className = "flex items-center gap-3">
            <Trophy className = "w-5 h-5 text-primary" />
            <h2 className = "text-2xl font-medium">MMR 변화</h2>
          </div>
          <div className = "grid md:grid-cols-2 gap-4">
            <div className = "rounded-2xl bg-secondary/40 p-5">
              <p className = "text-sm text-muted-foreground">복식 MMR</p>
              <p className = "text-3xl font-medium mt-1">1,450 <span className = "text-primary text-lg">+8</span></p>
            </div>
            <div className = "rounded-2xl bg-secondary/40 p-5">
              <p className = "text-sm text-muted-foreground">혼복 MMR</p>
              <p className = "text-3xl font-medium mt-1">1,380 <span className = "text-primary text-lg">+4</span></p>
            </div>
          </div>
        </div>

        <div className = "bg-card border border-border rounded-3xl p-6 md:p-8 space-y-5">
          <div className = "flex items-center gap-3">
            <Users className = "w-5 h-5 text-primary" />
            <h2 className = "text-2xl font-medium">파트너와 상대</h2>
          </div>
          <div className = "grid md:grid-cols-3 gap-4">
            {[
              ['함께 뛴 파트너', '박지영, 강수진, 한지우, 최서연'],
              ['만난 상대', '이준호, 정민재, 오유진, 송민호 외'],
              ['득점 / 실점', '81 / 73'],
            ].map(([label, value]) => (
              <div key = {label} className = "rounded-2xl border border-border p-5">
                <p className = "text-sm text-muted-foreground mb-2">{label}</p>
                <p className = "font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className = "bg-card border border-border rounded-3xl p-6 md:p-8 space-y-4">
          <div className = "flex items-center gap-3">
            <CalendarCheck className = "w-5 h-5 text-primary" />
            <h2 className = "text-2xl font-medium">경기별 기록</h2>
          </div>
          <div className = "space-y-3">
            {matches.map((match, index) => (
              <div key = {index} className = "rounded-2xl bg-secondary/40 p-4">
                <div className = "flex items-center justify-between mb-3">
                  <div className = "flex items-center gap-2">
                    <Badge className = {match.result === '승' ? 'bg-primary text-primary-foreground' : ''} variant = {match.result === '승' ? 'default' : 'outline'}>
                      {match.result}
                    </Badge>
                    <span className = "text-sm text-muted-foreground">{match.type}</span>
                  </div>
                  <span className = "font-medium">{match.score}</span>
                </div>
                <p className = "text-sm"><span className = "font-medium">파트너</span> {match.partner}</p>
                <p className = "text-sm text-muted-foreground"><span>상대</span> {match.opponents}</p>
              </div>
            ))}
          </div>
        </div>

        <div className = "bg-card border border-border rounded-3xl p-6 md:p-8 flex items-center justify-between gap-4">
          <div className = "flex items-center gap-3">
            <Clock className = "w-5 h-5 text-primary" />
            <div>
              <p className = "font-medium">월별 기록에 반영됨</p>
              <p className = "text-sm text-muted-foreground">출석 횟수, 운동 시간, 승패, MMR 변화가 자동 누적됩니다.</p>
            </div>
          </div>
          <Link to = "/my-record">
            <Button variant = "outline" className = "rounded-full">월별 기록 보기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

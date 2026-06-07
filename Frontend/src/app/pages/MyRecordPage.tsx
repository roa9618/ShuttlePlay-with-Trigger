import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Trophy, TrendingUp, Calendar } from 'lucide-react';

export default function MyRecordPage() {
  const [showAllRecords, setShowAllRecords] = useState(false);
  const recentMatches = [
    { date: '6월 3일', partner: '박지영', opponents: '이준호, 최서연', result: 'win', score: '21-19' },
    { date: '6월 3일', partner: '김민수', opponents: '정민재, 강수진', result: 'loss', score: '18-21' },
    { date: '6월 1일', partner: '오유진', opponents: '한지우, 송민호', result: 'win', score: '21-15' },
    { date: '6월 1일', partner: '최서연', opponents: '윤서아, 장현우', result: 'win', score: '21-18' },
  ];

  const olderMatches = [
    { date: '5월 29일', partner: '강수진', opponents: '장현우, 김나영', result: 'loss', score: '16-21' },
    { date: '5월 25일', partner: '한지우', opponents: '정민재, 오유진', result: 'win', score: '21-17' },
  ];

  // 6월 운동한 날짜들 (예시 데이터)
  const exerciseDates = [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29];

  // 2026년 6월 달력 생성
  const generateCalendar = () => {
    const year = 2026;
    const month = 5; // June (0-indexed)
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendar = [];
    let week = new Array(7).fill(null);

    // Fill in the days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = (firstDay + day - 1) % 7;
      week[dayOfWeek] = day;

      if (dayOfWeek === 6 || day === daysInMonth) {
        calendar.push([...week]);
        week = new Array(7).fill(null);
      }
    }

    return calendar;
  };

  const calendarWeeks = generateCalendar();

  return (
    <div className = "min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className = "px-4 py-6">
        <Logo size = "sm" className = "justify-center" />
      </div>

      <div className = "max-w-4xl mx-auto px-4 pb-12 space-y-8">
        <Link to = "/" className = "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className = "w-4 h-4" />
          홈으로
        </Link>

        <div className = "text-center space-y-4">
          <div className = "w-24 h-24 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-4">
            <span className = "text-4xl font-medium text-primary">김</span>
          </div>
          <div>
            <h1 className = "text-3xl mb-2">김민수</h1>
            <Badge className = "bg-primary text-primary-foreground">B</Badge>
          </div>
          <p className = "text-sm text-muted-foreground">남성 · 30대 · 회원 · 복식 1,450 · 혼복 1,380</p>
        </div>

        <div className = "grid md:grid-cols-2 gap-4">
          <div className = "bg-card border border-border rounded-2xl p-6 text-center">
            <div className = "flex items-center justify-center gap-2 mb-2 text-muted-foreground">
              <Trophy className = "w-5 h-5" />
              <span className = "text-sm">복식 MMR</span>
            </div>
            <p className = "text-4xl font-medium text-primary mb-1">1,450</p>
            <div className = "flex items-center justify-center gap-1 text-sm">
              <TrendingUp className = "w-4 h-4 text-primary" />
              <span className = "text-primary">+25</span>
              <span className = "text-muted-foreground">이번 달</span>
            </div>
          </div>

          <div className = "bg-card border border-border rounded-2xl p-6 text-center">
            <div className = "flex items-center justify-center gap-2 mb-2 text-muted-foreground">
              <Trophy className = "w-5 h-5" />
              <span className = "text-sm">혼복 MMR</span>
            </div>
            <p className = "text-4xl font-medium text-primary mb-1">1,380</p>
            <div className = "flex items-center justify-center gap-1 text-sm">
              <TrendingUp className = "w-4 h-4 text-primary" />
              <span className = "text-primary">+18</span>
              <span className = "text-muted-foreground">이번 달</span>
            </div>
          </div>
        </div>

        <div className = "bg-card border border-border rounded-3xl p-8 space-y-6">
          <div className = "flex items-center gap-3">
            <Calendar className = "w-5 h-5 text-primary" />
            <h2 className = "text-2xl font-medium">오늘 경기 기록</h2>
          </div>

          <div className = "grid grid-cols-3 gap-4">
            <div className = "bg-secondary rounded-xl p-4 text-center">
              <p className = "text-3xl font-medium text-primary mb-1">4</p>
              <p className = "text-sm text-muted-foreground">총 경기</p>
            </div>
            <div className = "bg-secondary rounded-xl p-4 text-center">
              <p className = "text-3xl font-medium text-primary mb-1">3</p>
              <p className = "text-sm text-muted-foreground">승</p>
            </div>
            <div className = "bg-secondary rounded-xl p-4 text-center">
              <p className = "text-3xl font-medium text-muted-foreground mb-1">1</p>
              <p className = "text-sm text-muted-foreground">패</p>
            </div>
          </div>

          <div className = "text-center text-sm text-muted-foreground">
            <p>승률 75% · 득점 81 · 실점 73 · 운동 시간 2시간 53분 · MMR +12</p>
          </div>
        </div>

        <div className = "bg-card border border-border rounded-3xl p-8 space-y-6">
          <h2 className = "text-2xl font-medium">6월 월별 기록</h2>

          <div className = "grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className = "bg-secondary rounded-xl p-4 text-center">
              <p className = "text-2xl font-medium mb-1">12</p>
              <p className = "text-sm text-muted-foreground">총 경기</p>
            </div>
            <div className = "bg-secondary rounded-xl p-4 text-center">
              <p className = "text-2xl font-medium mb-1">8</p>
              <p className = "text-sm text-muted-foreground">승</p>
            </div>
            <div className = "bg-secondary rounded-xl p-4 text-center">
              <p className = "text-2xl font-medium mb-1">4</p>
              <p className = "text-sm text-muted-foreground">패</p>
            </div>
            <div className = "bg-secondary rounded-xl p-4 text-center">
              <p className = "text-2xl font-medium mb-1">67%</p>
              <p className = "text-sm text-muted-foreground">승률</p>
            </div>
            <div className = "bg-secondary rounded-xl p-4 text-center">
              <p className = "text-2xl font-medium mb-1">13</p>
              <p className = "text-sm text-muted-foreground">출석</p>
            </div>
            <div className = "bg-secondary rounded-xl p-4 text-center">
              <p className = "text-2xl font-medium mb-1">28h</p>
              <p className = "text-sm text-muted-foreground">운동 시간</p>
            </div>
          </div>

          <div className = "pt-6 border-t border-border">
            <h3 className = "text-lg font-medium mb-4">운동한 날</h3>
            <div className = "bg-secondary rounded-2xl p-4">
              <div className = "grid grid-cols-7 gap-2 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div key = {day} className = "text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className = "space-y-2">
                {calendarWeeks.map((week, weekIdx) => (
                  <div key = {weekIdx} className = "grid grid-cols-7 gap-2">
                    {week.map((day, dayIdx) => (
                      <div key = {dayIdx} className = {`aspect-square flex items-center justify-center rounded-lg text-sm ${
                          day === null
                            ? ''
                            : exerciseDates.includes(day)
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'bg-background text-muted-foreground'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p className = "text-sm text-muted-foreground mt-4 text-center">
                이번 달 {exerciseDates.length}일 운동했어요
              </p>
            </div>
          </div>
        </div>

        <div className = "bg-card border border-border rounded-3xl p-8 space-y-4">
          <h2 className = "text-2xl font-medium">자주 함께한 사람</h2>
          <div className = "grid md:grid-cols-2 gap-4">
            <div className = "rounded-2xl bg-secondary/40 p-5">
              <p className = "font-medium mb-3">파트너</p>
              <div className = "space-y-2 text-sm">
                <p>박지영 5회 · 승률 80%</p>
                <p>최서연 3회 · 승률 67%</p>
                <p>오유진 2회 · 승률 50%</p>
              </div>
            </div>
            <div className = "rounded-2xl bg-secondary/40 p-5">
              <p className = "font-medium mb-3">상대</p>
              <div className = "space-y-2 text-sm">
                <p>이준호 4회 · 상대 승률 50%</p>
                <p>정민재 3회 · 상대 승률 33%</p>
                <p>한지우 2회 · 상대 승률 50%</p>
              </div>
            </div>
          </div>
        </div>

        <div className = "bg-card border border-border rounded-3xl p-8 space-y-4">
          <h2 className = "text-2xl font-medium">최근 경기</h2>

          <div className = "space-y-3">
            {(showAllRecords ? [...recentMatches, ...olderMatches] : recentMatches).map((match, idx) => (
              <div key = {idx} className = "bg-secondary rounded-xl p-4"
              >
                <div className = "flex items-center justify-between mb-2">
                  <div className = "flex items-center gap-2">
                    <Badge variant = {match.result === 'win' ? 'default' : 'outline'} className = {match.result === 'win' ? 'bg-primary text-primary-foreground' : ''}>
                      {match.result === 'win' ? '승' : '패'}
                    </Badge>
                    <span className = "text-sm text-muted-foreground">{match.date}</span>
                  </div>
                  <span className = "text-sm font-medium">{match.score}</span>
                </div>
                <div className = "text-sm">
                  <span className = "font-medium">파트너:</span> {match.partner}
                </div>
                <div className = "text-sm text-muted-foreground">
                  <span>상대:</span> {match.opponents}
                </div>
              </div>
            ))}
          </div>

          <Button variant = "outline" className = "w-full rounded-full" onClick = {() => setShowAllRecords((show) => !show)}>
            {showAllRecords ? '최근 기록만 보기' : '전체 기록 보기'}
          </Button>
        </div>
      </div>
    </div>
  );
}

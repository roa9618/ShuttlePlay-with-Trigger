import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Download, Users, Play, Clock, Trophy } from 'lucide-react';
import { useActionFeedback } from '../hooks/useActionFeedback';

export default function SessionReportPage() {
  const { sessionId } = useParams();
  const { message, showMessage } = useActionFeedback();

  const participants = [
    { name: '김민수', matches: 5, wins: 3, losses: 2, pointsFor: 101, pointsAgainst: 94 },
    { name: '박지영', matches: 4, wins: 3, losses: 1, pointsFor: 84, pointsAgainst: 71 },
    { name: '이준호', matches: 5, wins: 2, losses: 3, pointsFor: 96, pointsAgainst: 103 },
    { name: '최서연', matches: 4, wins: 2, losses: 2, pointsFor: 78, pointsAgainst: 77 },
    { name: '정민재', matches: 3, wins: 2, losses: 1, pointsFor: 62, pointsAgainst: 55 },
    { name: '강수진', matches: 3, wins: 1, losses: 2, pointsFor: 54, pointsAgainst: 63 },
  ];

  return (
    <div className = "min-h-screen bg-background">
      <div className = "border-b border-border bg-card">
        <div className = "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className = "flex items-center gap-6">
            <Link to = {`/sessions/${sessionId}/dashboard`} className = "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className = "w-4 h-4" />
              대시보드
            </Link>
            <Logo size = "sm" />
          </div>
          <Button className = "rounded-full gap-2" onClick = {() => showMessage('PDF 다운로드를 준비했습니다.')}
          >
            <Download className = "w-4 h-4" />
            PDF 다운로드
          </Button>
        </div>
      </div>
      {message && (
        <div className = "fixed top-20 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-5 py-3 shadow-xl text-sm font-medium z-50">
          {message}
        </div>
      )}

      <div className = "max-w-7xl mx-auto px-6 py-8">
        <div className = "mb-8 text-center">
          <h1 className = "text-4xl font-medium mb-2">오늘의 운동 리포트</h1>
          <p className = "text-muted-foreground">
            6월 3일 (화) 운동 · 19:00 - 22:00
          </p>
        </div>

        <div className = "grid md:grid-cols-5 gap-4 mb-8">
          <div className = "bg-card border border-border rounded-2xl p-6 text-center">
            <div className = "w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-3">
              <Users className = "w-6 h-6 text-primary" />
            </div>
            <p className = "text-3xl font-medium text-primary mb-1">16</p>
            <p className = "text-sm text-muted-foreground">총 참가자</p>
          </div>

          <div className = "bg-card border border-border rounded-2xl p-6 text-center">
            <div className = "w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-3">
              <Play className = "w-6 h-6 text-primary" />
            </div>
            <p className = "text-3xl font-medium text-primary mb-1">24</p>
            <p className = "text-sm text-muted-foreground">총 경기 수</p>
          </div>

          <div className = "bg-card border border-border rounded-2xl p-6 text-center">
            <div className = "w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-3">
              <Clock className = "w-6 h-6 text-primary" />
            </div>
            <p className = "text-3xl font-medium text-primary mb-1">3.0</p>
            <p className = "text-sm text-muted-foreground">평균 경기 수</p>
          </div>

          <div className = "bg-card border border-border rounded-2xl p-6 text-center">
            <div className = "w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-3">
              <Trophy className = "w-6 h-6 text-primary" />
            </div>
            <p className = "text-3xl font-medium text-primary mb-1">4</p>
            <p className = "text-sm text-muted-foreground">사용 코트</p>
          </div>

          <div className = "bg-card border border-border rounded-2xl p-6 text-center">
            <div className = "w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-3">
              <Clock className = "w-6 h-6 text-primary" />
            </div>
            <p className = "text-3xl font-medium text-primary mb-1">2h 53m</p>
            <p className = "text-sm text-muted-foreground">총 운동 시간</p>
          </div>
        </div>

        <div className = "bg-card border border-border rounded-3xl p-8 mb-8">
          <h2 className = "text-2xl font-medium mb-6">참가자별 경기 수</h2>
          <div className = "overflow-x-auto">
            <table className = "w-full">
              <thead className = "bg-secondary">
                <tr>
                  <th className = "text-left px-6 py-4 text-sm font-medium rounded-tl-xl">참가자</th>
                  <th className = "text-center px-6 py-4 text-sm font-medium">경기 수</th>
                  <th className = "text-center px-6 py-4 text-sm font-medium">승</th>
                  <th className = "text-center px-6 py-4 text-sm font-medium">패</th>
                  <th className = "text-center px-6 py-4 text-sm font-medium">득점</th>
                  <th className = "text-center px-6 py-4 text-sm font-medium">실점</th>
                  <th className = "text-center px-6 py-4 text-sm font-medium rounded-tr-xl">승률</th>
                </tr>
              </thead>
              <tbody className = "divide-y divide-border">
                {participants.map((p, idx) => (
                  <tr key = {idx} className = "hover:bg-secondary/50 transition-colors">
                    <td className = "px-6 py-4">
                      <div className = "flex items-center gap-3">
                        <div className = "w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className = "text-sm font-medium text-primary">
                            {p.name[0]}
                          </span>
                        </div>
                        <span className = "font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className = "px-6 py-4 text-center font-medium">{p.matches}</td>
                    <td className = "px-6 py-4 text-center">{p.wins}</td>
                    <td className = "px-6 py-4 text-center">{p.losses}</td>
                    <td className = "px-6 py-4 text-center">{p.pointsFor}</td>
                    <td className = "px-6 py-4 text-center">{p.pointsAgainst}</td>
                    <td className = "px-6 py-4 text-center">
                      {Math.round((p.wins / p.matches) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className = "grid md:grid-cols-2 gap-6">
          <div className = "bg-card border border-border rounded-2xl p-6">
            <h3 className = "font-medium mb-4">경기 유형 분포</h3>
            <div className = "space-y-3">
              <div className = "flex items-center justify-between">
                <span className = "text-sm">복식</span>
                <div className = "flex items-center gap-3">
                  <div className = "w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className = "h-full bg-primary" style = {{ width: '62.5%' }}></div>
                  </div>
                  <span className = "text-sm font-medium">15경기</span>
                </div>
              </div>
              <div className = "flex items-center justify-between">
                <span className = "text-sm">혼복</span>
                <div className = "flex items-center gap-3">
                  <div className = "w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className = "h-full bg-primary" style = {{ width: '37.5%' }}></div>
                  </div>
                  <span className = "text-sm font-medium">9경기</span>
                </div>
              </div>
            </div>
          </div>

          <div className = "bg-card border border-border rounded-2xl p-6">
            <h3 className = "font-medium mb-4">운영 요약</h3>
            <div className = "space-y-3 text-sm">
              <div className = "flex justify-between">
                <span className = "text-muted-foreground">세션 시작</span>
                <span className = "font-medium">19:05</span>
              </div>
              <div className = "flex justify-between">
                <span className = "text-muted-foreground">세션 종료</span>
                <span className = "font-medium">21:58</span>
              </div>
              <div className = "flex justify-between">
                <span className = "text-muted-foreground">실제 운영 시간</span>
                <span className = "font-medium">2시간 53분</span>
              </div>
              <div className = "flex justify-between">
                <span className = "text-muted-foreground">평균 경기 시간</span>
                <span className = "font-medium">약 7분</span>
              </div>
              <div className = "flex justify-between">
                <span className = "text-muted-foreground">최다 경기자</span>
                <span className = "font-medium">김민수 · 이준호 5회</span>
              </div>
              <div className = "flex justify-between">
                <span className = "text-muted-foreground">최장 휴식자</span>
                <span className = "font-medium">문별이 · 18분</span>
              </div>
            </div>
          </div>
        </div>

        <div className = "mt-6 bg-accent/20 rounded-2xl p-6 border border-accent">
          <h3 className = "font-medium mb-3 text-accent-foreground">결과 미입력 경기</h3>
          <p className = "text-sm text-accent-foreground/80 mb-4">
            아직 결과가 입력되지 않은 경기가 1개 있습니다
          </p>
          <Badge variant = "outline" className = "border-accent text-accent-foreground">
            3번 코트: 송민호, 윤서아 vs 장현우, 김나영
          </Badge>
        </div>
      </div>
    </div>
  );
}

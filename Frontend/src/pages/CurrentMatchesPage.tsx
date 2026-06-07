import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';

export default function CurrentMatchesPage() {
  const { sessionId } = useParams();
  const [endedCourts, setEndedCourts] = useState<number[]>([]);
  const { message, showMessage } = useActionFeedback();

  const courts = [
    {
      number: 1,
      teamA: ['김민수', '박지영'],
      teamB: ['이준호', '최서연'],
      type: '복식',
      style: '경쟁 모드',
    },
    {
      number: 2,
      teamA: ['정민재', '강수진'],
      teamB: ['오유진', '한지우'],
      type: '혼복',
      style: '경쟁 모드',
    },
    {
      number: 3,
      teamA: ['송민호', '윤서아'],
      teamB: ['장현우', '김나영'],
      type: '혼복',
      style: '경쟁 모드',
    },
    {
      number: 4,
      teamA: ['최지훈', '서예린'],
      teamB: ['박준영', '이수민'],
      type: '복식',
      style: '친목 모드',
    },
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
        </div>
      </div>

      <div className = "max-w-7xl mx-auto px-6 py-8">
        <div className = "mb-8">
          <h1 className = "text-4xl font-medium mb-2">현재 경기</h1>
          <p className = "text-muted-foreground">
            진행 중인 경기를 확인하고 결과를 입력하세요
          </p>
        </div>

        <div className = "grid grid-cols-2 gap-6">
          {courts.map((court) => (
            <div key = {court.number} className = "bg-card border border-border rounded-2xl p-6">
              <div className = "flex items-center justify-between mb-6">
                <div className = "flex items-center gap-3">
                  <Badge className = "bg-primary text-primary-foreground text-lg px-4 py-2">
                    {court.number}번 코트
                  </Badge>
                <div className = "text-sm text-muted-foreground">
                    {court.type} · {court.style}
                  </div>
                </div>
                {endedCourts.includes(court.number) && (
                  <Badge variant = "outline">종료됨</Badge>
                )}
                <Link to = {`/sessions/${sessionId}/result/new`}>
                  <Button size = "sm" className = "rounded-full gap-2">
                    <CheckCircle className = "w-4 h-4" />
                    결과 입력
                  </Button>
                </Link>
              </div>

              <div className = "space-y-4">
                <div className = "bg-secondary rounded-xl p-4">
                  <p className = "text-xs text-muted-foreground mb-3">A팀</p>
                  <div className = "space-y-2">
                    {court.teamA.map((player, idx) => (
                      <div key = {idx} className = "flex items-center gap-3">
                        <div className = "w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className = "text-sm font-medium text-primary">
                            {player[0]}
                          </span>
                        </div>
                        <div>
                          <p className = "font-medium">{player}</p>
                          <p className = "text-xs text-muted-foreground">
                            {idx === 0 ? 'B · MMR 1450' : 'A · MMR 1520'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className = "text-center py-2">
                  <span className = "text-xl font-medium text-muted-foreground">vs</span>
                </div>

                <div className = "bg-secondary rounded-xl p-4">
                  <p className = "text-xs text-muted-foreground mb-3">B팀</p>
                  <div className = "space-y-2">
                    {court.teamB.map((player, idx) => (
                      <div key = {idx} className = "flex items-center gap-3">
                        <div className = "w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className = "text-sm font-medium text-primary">
                            {player[0]}
                          </span>
                        </div>
                        <div>
                          <p className = "font-medium">{player}</p>
                          <p className = "text-xs text-muted-foreground">
                            {idx === 0 ? 'B · MMR 1480' : 'C · MMR 1410'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className = "mt-4 flex gap-3">
                <Button variant = "outline" size = "sm" className = "flex-1 rounded-full" onClick = {() => {
                    setEndedCourts((prev) => [...new Set([...prev, court.number])]);
                    showMessage(`${court.number}번 코트 경기를 종료했습니다.`);
                  }}
                >
                  경기 종료
                </Button>
              </div>
            </div>
          ))}
        </div>
        {message && (
          <div className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-5 py-3 shadow-xl text-sm font-medium">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

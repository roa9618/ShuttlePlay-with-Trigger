import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Info } from 'lucide-react';
import { useActionFeedback } from '../hooks/useActionFeedback';

export default function MatchResultInputPage() {
  const { sessionId } = useParams();
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);
  const { message, showMessage } = useActionFeedback();

  return (
    <div className = "min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className = "px-4 py-6">
        <Logo size = "sm" className = "justify-center" />
      </div>

      <div className = "max-w-2xl mx-auto px-4 pb-12 space-y-8">
        <Link to = {`/sessions/${sessionId}/current`} className = "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className = "w-4 h-4" />
          현재 경기로 돌아가기
        </Link>

        <div className = "text-center space-y-2">
          <h1 className = "text-4xl font-medium mb-3">경기 결과 입력</h1>
          <p className = "text-muted-foreground">
            방금 종료된 경기의 결과를 입력하세요
          </p>
        </div>

        <div className = "bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
          <div className = "space-y-4">
            <div className = "flex items-center gap-3 mb-4">
              <Badge className = "bg-primary text-primary-foreground">
                2번 코트
              </Badge>
              <span className = "text-sm text-muted-foreground">복식 · 경쟁 모드</span>
            </div>

            <div className = "grid grid-cols-2 gap-4">
              <div className = "bg-secondary rounded-xl p-4">
                <p className = "text-xs text-muted-foreground mb-3">A팀</p>
                <div className = "space-y-2">
                  <p className = "font-medium">김민수</p>
                  <p className = "font-medium">박지영</p>
                </div>
              </div>

              <div className = "bg-secondary rounded-xl p-4">
                <p className = "text-xs text-muted-foreground mb-3">B팀</p>
                <div className = "space-y-2">
                  <p className = "font-medium">이준호</p>
                  <p className = "font-medium">최서연</p>
                </div>
              </div>
            </div>
          </div>

          <div className = "border-t border-border pt-6 space-y-6">
            <div>
              <Label className = "mb-3 block">승리 팀 선택</Label>
              <div className = "grid grid-cols-2 gap-3">
                <Button variant = "outline" className = {`h-auto py-4 rounded-xl border-2 hover:border-primary hover:bg-primary/5 ${winner === 'A' ? 'border-primary bg-primary/5' : ''}`} onClick = {() => setWinner('A')}
                >
                  A팀 승리
                </Button>
                <Button variant = "outline" className = {`h-auto py-4 rounded-xl border-2 hover:border-primary hover:bg-primary/5 ${winner === 'B' ? 'border-primary bg-primary/5' : ''}`} onClick = {() => setWinner('B')}
                >
                  B팀 승리
                </Button>
              </div>
            </div>

            <div className = "bg-secondary/50 rounded-xl p-6 space-y-4">
              <div className = "flex items-start gap-3">
                <Info className = "w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className = "space-y-2 text-sm">
                  <p className = "font-medium">점수 입력 (선택)</p>
                  <p className = "text-muted-foreground">
                    점수를 입력하면 MMR이 더 세밀하게 계산됩니다
                  </p>
                </div>
              </div>

              <div className = "grid grid-cols-2 gap-4 pt-2">
                <div className = "space-y-2">
                  <Label htmlFor = "score-a">A팀 점수</Label>
                  <Input id = "score-a" type = "number" placeholder = "21" className = "rounded-xl"
                  />
                </div>
                <div className = "space-y-2">
                  <Label htmlFor = "score-b">B팀 점수</Label>
                  <Input id = "score-b" type = "number" placeholder = "19" className = "rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className = "pt-4 space-y-3">
              {message && (
                <div className = "rounded-xl border border-primary/30 bg-primary/5 p-3 text-center text-sm text-primary">
                  {message}
                </div>
              )}
              <Button className = "w-full rounded-full" size = "lg" disabled = {!winner} onClick = {() => showMessage(`${winner}팀 승리로 저장했습니다.`)}
              >
                결과 저장
              </Button>
              <Link to = {`/sessions/${sessionId}/current`}>
                <Button variant = "outline" className = "w-full rounded-full" size = "lg">
                  취소
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

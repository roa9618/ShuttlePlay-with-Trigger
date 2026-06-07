import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, AlertCircle, History, RotateCcw } from 'lucide-react';
import { useActionFeedback } from '../hooks/useActionFeedback';

export default function MatchResultEditPage() {
  const { sessionId } = useParams();
  const [winner, setWinner] = useState<'A' | 'B'>('A');
  const { message, showMessage } = useActionFeedback();

  return (
    <div className = "min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className = "px-4 py-6">
        <Logo size = "sm" className = "justify-center" />
      </div>

      <div className = "max-w-2xl mx-auto px-4 pb-12 space-y-8">
        <Link to = {`/sessions/${sessionId}/dashboard`} className = "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className = "w-4 h-4" />
          대시보드로 돌아가기
        </Link>

        <div className = "text-center space-y-2">
          <h1 className = "text-4xl font-medium mb-3">경기 결과 수정</h1>
          <p className = "text-muted-foreground">
            저장된 경기 결과를 수정할 수 있습니다
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
            <div className = "bg-accent/20 rounded-xl p-4 border border-accent">
              <div className = "flex items-start gap-3">
                <AlertCircle className = "w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                <div className = "text-sm">
                  <p className = "font-medium text-accent-foreground mb-1">기존 결과</p>
                  <p className = "text-accent-foreground/80">
                    A팀 승리 (21-19)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label className = "mb-3 block">수정할 승리 팀 선택</Label>
              <div className = "grid grid-cols-2 gap-3">
                <Button variant = "outline" className = {`h-auto py-4 rounded-xl border-2 ${winner === 'A' ? 'border-primary bg-primary/5' : 'hover:border-primary hover:bg-primary/5'}`} onClick = {() => setWinner('A')}
                >
                  A팀 승리
                </Button>
                <Button variant = "outline" className = {`h-auto py-4 rounded-xl border-2 ${winner === 'B' ? 'border-primary bg-primary/5' : 'hover:border-primary hover:bg-primary/5'}`} onClick = {() => setWinner('B')}
                >
                  B팀 승리
                </Button>
              </div>
            </div>

            <div className = "grid grid-cols-2 gap-4">
              <div className = "space-y-2">
                <Label htmlFor = "score-a">A팀 점수</Label>
                <Input id = "score-a" type = "number" defaultValue = "21" className = "rounded-xl"
                />
              </div>
              <div className = "space-y-2">
                <Label htmlFor = "score-b">B팀 점수</Label>
                <Input id = "score-b" type = "number" defaultValue = "19" className = "rounded-xl"
                />
              </div>
            </div>

            <div className = "space-y-2">
              <Label htmlFor = "reason">수정 사유</Label>
              <Textarea id = "reason" placeholder = "결과를 수정하는 이유를 간단히 입력해주세요" className = "rounded-xl resize-none" rows = {3}
              />
              <p className = "text-sm text-muted-foreground">
                수정 사유는 참가자들에게 공유됩니다
              </p>
            </div>

            <div className = "rounded-2xl bg-secondary/40 p-5 space-y-3">
              <div className = "flex items-center gap-2">
                <RotateCcw className = "w-4 h-4 text-primary" />
                <p className = "font-medium">기록 재계산</p>
              </div>
              <p className = "text-sm text-muted-foreground">
                승패, 점수, 복식·혼복 MMR, 개인 일일 기록, 월별 기록이 수정된 결과 기준으로 다시 반영됩니다.
              </p>
            </div>

            <div className = "rounded-2xl border border-border p-5 space-y-3">
              <div className = "flex items-center gap-2">
                <History className = "w-4 h-4 text-primary" />
                <p className = "font-medium">수정 이력</p>
              </div>
              {[
                '21:18 김민수 입력 · A팀 승리 21-19',
                '21:24 운영자 확인 · 점수 확인 완료',
              ].map((history) => (
                <div key = {history} className = "text-sm text-muted-foreground rounded-xl bg-secondary/40 px-4 py-3">
                  {history}
                </div>
              ))}
            </div>

            <div className = "pt-4 space-y-3">
              {message && (
                <div className = "rounded-xl border border-primary/30 bg-primary/5 p-3 text-center text-sm text-primary">
                  {message}
                </div>
              )}
              <Button className = "w-full rounded-full" size = "lg" onClick = {() => showMessage(`${winner}팀 승리로 수정 저장했습니다.`)}>
                수정 저장
              </Button>
              <Button variant = "destructive" className = "w-full rounded-full" size = "lg" onClick = {() => showMessage('결과 입력을 취소했습니다.')}>
                결과 입력 취소
              </Button>
              <Link to = {`/sessions/${sessionId}/dashboard`}>
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

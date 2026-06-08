import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, AlertCircle, History, RotateCcw } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './MatchResultEditPage.styles';

export default function MatchResultEditPage() {
  const { sessionId } = useParams();
  const [winner, setWinner] = useState<'A' | 'B'>('A');
  const { message, showMessage } = useActionFeedback();

  return (
    <div className = {styles.page}>
      <div className = {styles.emptyState}>
        <Logo size = "sm" className = {styles.logoWrapper} />
      </div>

      <div className = {styles.content}>
        <Link to = {`/sessions/${sessionId}/dashboard`} className = {styles.backLink}>
          <ArrowLeft className = {styles.arrowLeftIcon} />
          대시보드로 돌아가기
        </Link>

        <div className = {styles.stack}>
          <h1 className = {styles.pageTitle}>경기 결과 수정</h1>
          <p className = {styles.descriptionText}>
            저장된 경기 결과를 수정할 수 있습니다
          </p>
        </div>

        <div className = {styles.header}>
          <div className = {styles.stack2}>
            <div className = {styles.row}>
              <Badge className = {styles.badge}>
                2번 코트
              </Badge>
              <span className = {styles.mutedText}>복식 · 경쟁 모드</span>
            </div>

            <div className = {styles.cardGrid}>
              <div className = {styles.summaryBox}>
                <p className = {styles.descriptionText2}>A팀</p>
                <div className = {styles.stack3}>
                  <p className = {styles.summaryText}>김민수</p>
                  <p className = {styles.summaryText}>박지영</p>
                </div>
              </div>

              <div className = {styles.summaryBox}>
                <p className = {styles.descriptionText2}>B팀</p>
                <div className = {styles.stack3}>
                  <p className = {styles.summaryText}>이준호</p>
                  <p className = {styles.summaryText}>최서연</p>
                </div>
              </div>
            </div>
          </div>

          <div className = {styles.footerActions}>
            <div className = {styles.contentBox}>
              <div className = {styles.mediaRow}>
                <AlertCircle className = {styles.alertCircleIcon} />
                <div className = {styles.smallText}>
                  <p className = {styles.summaryText2}>기존 결과</p>
                  <p className = {styles.paragraphText}>
                    A팀 승리 (21-19)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label className = {styles.labelIcon}>수정할 승리 팀 선택</Label>
              <div className = {styles.cardGrid2}>
                <Button variant = "outline" className = {styles.winnerButton(winner === 'A')} onClick = {() => setWinner('A')}
                >
                  A팀 승리
                </Button>
                <Button variant = "outline" className = {styles.winnerButton(winner === 'B')} onClick = {() => setWinner('B')}
                >
                  B팀 승리
                </Button>
              </div>
            </div>

            <div className = {styles.cardGrid}>
              <div className = {styles.stack3}>
                <Label htmlFor = "score-a">A팀 점수</Label>
                <Input id = "score-a" type = "number" defaultValue = "21" className = {styles.input}
                />
              </div>
              <div className = {styles.stack3}>
                <Label htmlFor = "score-b">B팀 점수</Label>
                <Input id = "score-b" type = "number" defaultValue = "19" className = {styles.input}
                />
              </div>
            </div>

            <div className = {styles.stack3}>
              <Label htmlFor = "reason">수정 사유</Label>
              <Textarea id = "reason" placeholder = "결과를 수정하는 이유를 간단히 입력해주세요" className = {styles.textareaIcon} rows = {3}
              />
              <p className = {styles.mutedText}>
                수정 사유는 참가자들에게 공유됩니다
              </p>
            </div>

            <div className = {styles.stack4}>
              <div className = {styles.row2}>
                <RotateCcw className = {styles.rotateCcwIcon} />
                <p className = {styles.summaryText}>기록 재계산</p>
              </div>
              <p className = {styles.mutedText}>
                승패, 점수, 복식·혼복 MMR, 개인 일일 기록, 월별 기록이 수정된 결과 기준으로 다시 반영됩니다.
              </p>
            </div>

            <div className = {styles.stack5}>
              <div className = {styles.row2}>
                <History className = {styles.rotateCcwIcon} />
                <p className = {styles.summaryText}>수정 이력</p>
              </div>
              {[
                '21:18 김민수 입력 · A팀 승리 21-19',
                '21:24 운영자 확인 · 점수 확인 완료',
              ].map((history) => (
                <div key = {history} className = {styles.summaryBox2}>
                  {history}
                </div>
              ))}
            </div>

            <div className = {styles.stack6}>
              {message && (
                <div className = {styles.contentBox2}>
                  {message}
                </div>
              )}
              <Button className = {styles.fullWidthButton} size = "lg" onClick = {() => showMessage(`${winner}팀 승리로 수정 저장했습니다.`)}>
                수정 저장
              </Button>
              <Button variant = "destructive" className = {styles.fullWidthButton} size = "lg" onClick = {() => showMessage('결과 입력을 취소했습니다.')}>
                결과 입력 취소
              </Button>
              <Link to = {`/sessions/${sessionId}/dashboard`}>
                <Button variant = "outline" className = {styles.fullWidthButton} size = "lg">
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

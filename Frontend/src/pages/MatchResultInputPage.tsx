import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Info } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './MatchResultInputPage.styles';

export default function MatchResultInputPage() {
  const { sessionId } = useParams();
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);
  const { message, showMessage } = useActionFeedback();

  return (
    <div className = {styles.page}>
      <div className = {styles.emptyState}>
        <Logo size = "sm" className = {styles.logoWrapper} />
      </div>

      <div className = {styles.content}>
        <Link to = {`/sessions/${sessionId}/current`} className = {styles.backLink}>
          <ArrowLeft className = {styles.arrowLeftIcon} />
          현재 경기로 돌아가기
        </Link>

        <div className = {styles.stack}>
          <h1 className = {styles.pageTitle}>경기 결과 입력</h1>
          <p className = {styles.descriptionText}>
            방금 종료된 경기의 결과를 입력하세요
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
            <div>
              <Label className = {styles.labelIcon}>승리 팀 선택</Label>
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

            <div className = {styles.stack4}>
              <div className = {styles.mediaRow}>
                <Info className = {styles.infoIcon} />
                <div className = {styles.stack5}>
                  <p className = {styles.summaryText}>점수 입력 (선택)</p>
                  <p className = {styles.descriptionText}>
                    점수를 입력하면 MMR이 더 세밀하게 계산됩니다
                  </p>
                </div>
              </div>

              <div className = {styles.cardGrid3}>
                <div className = {styles.stack3}>
                  <Label htmlFor = "score-a">A팀 점수</Label>
                  <Input id = "score-a" type = "number" placeholder = "21" className = {styles.input}
                  />
                </div>
                <div className = {styles.stack3}>
                  <Label htmlFor = "score-b">B팀 점수</Label>
                  <Input id = "score-b" type = "number" placeholder = "19" className = {styles.input}
                  />
                </div>
              </div>
            </div>

            <div className = {styles.stack6}>
              {message && (
                <div className = {styles.contentBox}>
                  {message}
                </div>
              )}
              <Button className = {styles.fullWidthButton} size = "lg" disabled = {!winner} onClick = {() => showMessage(`${winner}팀 승리로 저장했습니다.`)}
              >
                결과 저장
              </Button>
              <Link to = {`/sessions/${sessionId}/current`}>
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

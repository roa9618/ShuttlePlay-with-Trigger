import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './CurrentMatchesPage.styles';

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
    <div className = {styles.page}>
      <div className = {styles.header}>
        <div className = {styles.headerInner}>
          <div className = {styles.row}>
            <Link to = {`/sessions/${sessionId}/dashboard`} className = {styles.backLink}>
              <ArrowLeft className = {styles.arrowLeftIcon} />
              대시보드
            </Link>
            <Logo size = "sm" />
          </div>
        </div>
      </div>

      <div className = {styles.content}>
        <div className = {styles.sectionHeader}>
          <h1 className = {styles.pageTitle}>현재 경기</h1>
          <p className = {styles.descriptionText}>
            진행 중인 경기를 확인하고 결과를 입력하세요
          </p>
        </div>

        <div className = {styles.cardGrid}>
          {courts.map((court) => (
            <div key = {court.number} className = {styles.header2}>
              <div className = {styles.betweenRow}>
                <div className = {styles.row2}>
                  <Badge className = {styles.badge}>
                    {court.number}번 코트
                  </Badge>
                <div className = {styles.mutedText}>
                    {court.type} · {court.style}
                  </div>
                </div>
                {endedCourts.includes(court.number) && (
                  <Badge variant = "outline">종료됨</Badge>
                )}
                <Link to = {`/sessions/${sessionId}/result/new`}>
                  <Button size = "sm" className = {styles.roundButton}>
                    <CheckCircle className = {styles.arrowLeftIcon} />
                    결과 입력
                  </Button>
                </Link>
              </div>

              <div className = {styles.stack}>
                <div className = {styles.summaryBox}>
                  <p className = {styles.descriptionText2}>A팀</p>
                  <div className = {styles.stack2}>
                    {court.teamA.map((player, idx) => (
                      <div key = {idx} className = {styles.row2}>
                        <div className = {styles.row3}>
                          <span className = {styles.labelText}>
                            {player[0]}
                          </span>
                        </div>
                        <div>
                          <p className = {styles.summaryText}>{player}</p>
                          <p className = {styles.descriptionText3}>
                            {idx === 0 ? 'B · MMR 1450' : 'A · MMR 1520'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className = {styles.centeredBlock}>
                  <span className = {styles.mutedText2}>vs</span>
                </div>

                <div className = {styles.summaryBox}>
                  <p className = {styles.descriptionText2}>B팀</p>
                  <div className = {styles.stack2}>
                    {court.teamB.map((player, idx) => (
                      <div key = {idx} className = {styles.row2}>
                        <div className = {styles.row3}>
                          <span className = {styles.labelText}>
                            {player[0]}
                          </span>
                        </div>
                        <div>
                          <p className = {styles.summaryText}>{player}</p>
                          <p className = {styles.descriptionText3}>
                            {idx === 0 ? 'B · MMR 1480' : 'C · MMR 1410'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className = {styles.row4}>
                <Button variant = "outline" size = "sm" className = {styles.roundButton2} onClick = {() => {
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
          <div className = {styles.floatingNotice}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

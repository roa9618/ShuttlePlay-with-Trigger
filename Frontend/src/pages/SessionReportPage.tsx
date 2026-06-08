import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Download, Users, Play, Clock, Trophy } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './SessionReportPage.styles';

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
          <Button className = {styles.roundButton} onClick = {() => showMessage('PDF 다운로드를 준비했습니다.')}
          >
            <Download className = {styles.arrowLeftIcon} />
            PDF 다운로드
          </Button>
        </div>
      </div>
      {message && (
        <div className = {styles.header2}>
          {message}
        </div>
      )}

      <div className = {styles.content}>
        <div className = {styles.sectionHeader}>
          <h1 className = {styles.pageTitle}>오늘의 운동 리포트</h1>
          <p className = {styles.descriptionText}>
            6월 3일 (화) 운동 · 19:00 - 22:00
          </p>
        </div>

        <div className = {styles.grid}>
          <div className = {styles.header3}>
            <div className = {styles.row2}>
              <Users className = {styles.usersIcon} />
            </div>
            <p className = {styles.summaryText}>16</p>
            <p className = {styles.descriptionText2}>총 참가자</p>
          </div>

          <div className = {styles.header3}>
            <div className = {styles.row2}>
              <Play className = {styles.usersIcon} />
            </div>
            <p className = {styles.summaryText}>24</p>
            <p className = {styles.descriptionText2}>총 경기 수</p>
          </div>

          <div className = {styles.header3}>
            <div className = {styles.row2}>
              <Clock className = {styles.usersIcon} />
            </div>
            <p className = {styles.summaryText}>3.0</p>
            <p className = {styles.descriptionText2}>평균 경기 수</p>
          </div>

          <div className = {styles.header3}>
            <div className = {styles.row2}>
              <Trophy className = {styles.usersIcon} />
            </div>
            <p className = {styles.summaryText}>4</p>
            <p className = {styles.descriptionText2}>사용 코트</p>
          </div>

          <div className = {styles.header3}>
            <div className = {styles.row2}>
              <Clock className = {styles.usersIcon} />
            </div>
            <p className = {styles.summaryText}>2h 53m</p>
            <p className = {styles.descriptionText2}>총 운동 시간</p>
          </div>
        </div>

        <div className = {styles.header4}>
          <h2 className = {styles.sectionTitle}>참가자별 경기 수</h2>
          <div className = {styles.tableScroll}>
            <table className = {styles.table}>
              <thead className = {styles.tableHead}>
                <tr>
                  <th className = {styles.tableHeaderCell}>참가자</th>
                  <th className = {styles.tableHeaderCell2}>경기 수</th>
                  <th className = {styles.tableHeaderCell2}>승</th>
                  <th className = {styles.tableHeaderCell2}>패</th>
                  <th className = {styles.tableHeaderCell2}>득점</th>
                  <th className = {styles.tableHeaderCell2}>실점</th>
                  <th className = {styles.tableHeaderCell3}>승률</th>
                </tr>
              </thead>
              <tbody className = {styles.tableBody}>
                {participants.map((p, idx) => (
                  <tr key = {idx} className = {styles.tableRow}>
                    <td className = {styles.tableCell}>
                      <div className = {styles.row3}>
                        <div className = {styles.row4}>
                          <span className = {styles.labelText}>
                            {p.name[0]}
                          </span>
                        </div>
                        <span className = {styles.labelText2}>{p.name}</span>
                      </div>
                    </td>
                    <td className = {styles.tableCell2}>{p.matches}</td>
                    <td className = {styles.tableCell3}>{p.wins}</td>
                    <td className = {styles.tableCell3}>{p.losses}</td>
                    <td className = {styles.tableCell3}>{p.pointsFor}</td>
                    <td className = {styles.tableCell3}>{p.pointsAgainst}</td>
                    <td className = {styles.tableCell3}>
                      {Math.round((p.wins / p.matches) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className = {styles.cardGrid}>
          <div className = {styles.header5}>
            <h3 className = {styles.cardTitle}>경기 유형 분포</h3>
            <div className = {styles.stack}>
              <div className = {styles.betweenRow}>
                <span className = {styles.inlineText}>복식</span>
                <div className = {styles.row3}>
                  <div className = {styles.tablePanel}>
                    <div className = {styles.progressFill} style = {styles.matchTypeBar('62.5%')}></div>
                  </div>
                  <span className = {styles.labelText3}>15경기</span>
                </div>
              </div>
              <div className = {styles.betweenRow}>
                <span className = {styles.inlineText}>혼복</span>
                <div className = {styles.row3}>
                  <div className = {styles.tablePanel}>
                    <div className = {styles.progressFill} style = {styles.matchTypeBar('37.5%')}></div>
                  </div>
                  <span className = {styles.labelText3}>9경기</span>
                </div>
              </div>
            </div>
          </div>

          <div className = {styles.header5}>
            <h3 className = {styles.cardTitle}>운영 요약</h3>
            <div className = {styles.stack2}>
              <div className = {styles.betweenRow2}>
                <span className = {styles.descriptionText}>세션 시작</span>
                <span className = {styles.labelText2}>19:05</span>
              </div>
              <div className = {styles.betweenRow2}>
                <span className = {styles.descriptionText}>세션 종료</span>
                <span className = {styles.labelText2}>21:58</span>
              </div>
              <div className = {styles.betweenRow2}>
                <span className = {styles.descriptionText}>실제 운영 시간</span>
                <span className = {styles.labelText2}>2시간 53분</span>
              </div>
              <div className = {styles.betweenRow2}>
                <span className = {styles.descriptionText}>평균 경기 시간</span>
                <span className = {styles.labelText2}>약 7분</span>
              </div>
              <div className = {styles.betweenRow2}>
                <span className = {styles.descriptionText}>최다 경기자</span>
                <span className = {styles.labelText2}>김민수 · 이준호 5회</span>
              </div>
              <div className = {styles.betweenRow2}>
                <span className = {styles.descriptionText}>최장 휴식자</span>
                <span className = {styles.labelText2}>문별이 · 18분</span>
              </div>
            </div>
          </div>
        </div>

        <div className = {styles.contentBox}>
          <h3 className = {styles.cardTitle2}>결과 미입력 경기</h3>
          <p className = {styles.paragraphText}>
            아직 결과가 입력되지 않은 경기가 1개 있습니다
          </p>
          <Badge variant = "outline" className = {styles.badge}>
            3번 코트: 송민호, 윤서아 vs 장현우, 김나영
          </Badge>
        </div>
      </div>
    </div>
  );
}

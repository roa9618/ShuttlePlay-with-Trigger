import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft, CalendarCheck, Clock, Trophy, Users } from 'lucide-react';
import { styles } from './ParticipantSessionReportPage.styles';

const matches = [
  { partner: '박지영', opponents: '이준호 · 최서연', result: '승', score: '21-19', type: '혼합 복식' },
  { partner: '강수진', opponents: '정민재 · 오유진', result: '패', score: '18-21', type: '성별 무관' },
  { partner: '한지우', opponents: '송민호 · 윤서아', result: '승', score: '21-15', type: '남자 복식' },
  { partner: '최서연', opponents: '장현우 · 김나영', result: '승', score: '21-18', type: '혼합 복식' },
];

export default function ParticipantSessionReportPage() {
  const { sessionId } = useParams();

  return (
    <div className = {styles.page}>
      <div className = {styles.emptyState}>
        <Logo size = "sm" className = {styles.logoWrapper} />
      </div>

      <div className = {styles.content}>
        <Link to = {`/sessions/${sessionId}/status`} className = {styles.backLink}>
          <ArrowLeft className = {styles.arrowLeftIcon} />
          내 상태
        </Link>

        <div className = {styles.stack}>
          <h1 className = {styles.pageTitle}>오늘 내 운동 기록</h1>
          <p className = {styles.descriptionText}>6월 3일 화요일 · 19:00-22:00</p>
        </div>

        <div className = {styles.cardGrid}>
          {[
            ['총 경기', '4'],
            ['승 / 패', '3 / 1'],
            ['승률', '75%'],
            ['운동 시간', '2시간 53분'],
          ].map(([label, value]) => (
            <div key = {label} className = {styles.header}>
              <p className = {styles.summaryText}>{value}</p>
              <p className = {styles.descriptionText2}>{label}</p>
            </div>
          ))}
        </div>

        <div className = {styles.header2}>
          <div className = {styles.row}>
            <Trophy className = {styles.trophyIcon} />
            <h2 className = {styles.sectionTitle}>MMR 변화</h2>
          </div>
          <div className = {styles.cardGrid2}>
            <div className = {styles.summaryBox}>
              <p className = {styles.descriptionText3}>복식 MMR</p>
              <p className = {styles.summaryText2}>1,450 <span className = {styles.paragraphText}>+8</span></p>
            </div>
            <div className = {styles.summaryBox}>
              <p className = {styles.descriptionText3}>혼복 MMR</p>
              <p className = {styles.summaryText2}>1,380 <span className = {styles.paragraphText}>+4</span></p>
            </div>
          </div>
        </div>

        <div className = {styles.header2}>
          <div className = {styles.row}>
            <Users className = {styles.trophyIcon} />
            <h2 className = {styles.sectionTitle}>파트너와 상대</h2>
          </div>
          <div className = {styles.statsGrid}>
            {[
              ['함께 뛴 파트너', '박지영, 강수진, 한지우, 최서연'],
              ['만난 상대', '이준호, 정민재, 오유진, 송민호 외'],
              ['득점 / 실점', '81 / 73'],
            ].map(([label, value]) => (
              <div key = {label} className = {styles.contentBox}>
                <p className = {styles.descriptionText4}>{label}</p>
                <p className = {styles.summaryText3}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className = {styles.header3}>
          <div className = {styles.row}>
            <CalendarCheck className = {styles.trophyIcon} />
            <h2 className = {styles.sectionTitle}>경기별 기록</h2>
          </div>
          <div className = {styles.stack2}>
            {matches.map((match, index) => (
              <div key = {index} className = {styles.summaryBox2}>
                <div className = {styles.betweenRow}>
                  <div className = {styles.row2}>
                    <Badge className = {styles.resultBadge(match.result === '승')} variant = {match.result === '승' ? 'default' : 'outline'}>
                      {match.result}
                    </Badge>
                    <span className = {styles.descriptionText3}>{match.type}</span>
                  </div>
                  <span className = {styles.summaryText3}>{match.score}</span>
                </div>
                <p className = {styles.paragraphText2}><span className = {styles.summaryText3}>파트너</span> {match.partner}</p>
                <p className = {styles.descriptionText3}><span>상대</span> {match.opponents}</p>
              </div>
            ))}
          </div>
        </div>

        <div className = {styles.header4}>
          <div className = {styles.row}>
            <Clock className = {styles.trophyIcon} />
            <div>
              <p className = {styles.summaryText3}>월별 기록에 반영됨</p>
              <p className = {styles.descriptionText3}>출석 횟수, 운동 시간, 승패, MMR 변화가 자동 누적됩니다.</p>
            </div>
          </div>
          <Link to = "/my-record">
            <Button variant = "outline" className = {styles.roundButton}>월별 기록 보기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

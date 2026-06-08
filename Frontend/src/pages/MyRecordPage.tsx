import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { styles } from './MyRecordPage.styles';

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
    <div className = {styles.page}>
      <div className = {styles.emptyState}>
        <Logo size = "sm" className = {styles.logoWrapper} />
      </div>

      <div className = {styles.content}>
        <Link to = "/" className = {styles.backLink}>
          <ArrowLeft className = {styles.arrowLeftIcon} />
          홈으로
        </Link>

        <div className = {styles.stack}>
          <div className = {styles.row}>
            <span className = {styles.labelText}>김</span>
          </div>
          <div>
            <h1 className = {styles.pageTitle}>김민수</h1>
            <Badge className = {styles.badge}>B</Badge>
          </div>
          <p className = {styles.descriptionText}>남성 · 30대 · 회원 · 복식 1,450 · 혼복 1,380</p>
        </div>

        <div className = {styles.cardGrid}>
          <div className = {styles.header}>
            <div className = {styles.row2}>
              <Trophy className = {styles.trophyIcon} />
              <span className = {styles.inlineText}>복식 MMR</span>
            </div>
            <p className = {styles.summaryText}>1,450</p>
            <div className = {styles.row3}>
              <TrendingUp className = {styles.trendingUpIcon} />
              <span className = {styles.inlineText2}>+25</span>
              <span className = {styles.mutedText}>이번 달</span>
            </div>
          </div>

          <div className = {styles.header}>
            <div className = {styles.row2}>
              <Trophy className = {styles.trophyIcon} />
              <span className = {styles.inlineText}>혼복 MMR</span>
            </div>
            <p className = {styles.summaryText}>1,380</p>
            <div className = {styles.row3}>
              <TrendingUp className = {styles.trendingUpIcon} />
              <span className = {styles.inlineText2}>+18</span>
              <span className = {styles.mutedText}>이번 달</span>
            </div>
          </div>
        </div>

        <div className = {styles.header2}>
          <div className = {styles.row4}>
            <Calendar className = {styles.calendarIcon} />
            <h2 className = {styles.sectionTitle}>오늘 경기 기록</h2>
          </div>

          <div className = {styles.statsGrid}>
            <div className = {styles.summaryBox}>
              <p className = {styles.summaryText2}>4</p>
              <p className = {styles.descriptionText}>총 경기</p>
            </div>
            <div className = {styles.summaryBox}>
              <p className = {styles.summaryText2}>3</p>
              <p className = {styles.descriptionText}>승</p>
            </div>
            <div className = {styles.summaryBox}>
              <p className = {styles.descriptionText2}>1</p>
              <p className = {styles.descriptionText}>패</p>
            </div>
          </div>

          <div className = {styles.mutedText2}>
            <p>승률 75% · 득점 81 · 실점 73 · 운동 시간 2시간 53분 · MMR +12</p>
          </div>
        </div>

        <div className = {styles.header2}>
          <h2 className = {styles.sectionTitle}>6월 월별 기록</h2>

          <div className = {styles.cardGrid2}>
            <div className = {styles.summaryBox}>
              <p className = {styles.summaryText3}>12</p>
              <p className = {styles.descriptionText}>총 경기</p>
            </div>
            <div className = {styles.summaryBox}>
              <p className = {styles.summaryText3}>8</p>
              <p className = {styles.descriptionText}>승</p>
            </div>
            <div className = {styles.summaryBox}>
              <p className = {styles.summaryText3}>4</p>
              <p className = {styles.descriptionText}>패</p>
            </div>
            <div className = {styles.summaryBox}>
              <p className = {styles.summaryText3}>67%</p>
              <p className = {styles.descriptionText}>승률</p>
            </div>
            <div className = {styles.summaryBox}>
              <p className = {styles.summaryText3}>13</p>
              <p className = {styles.descriptionText}>출석</p>
            </div>
            <div className = {styles.summaryBox}>
              <p className = {styles.summaryText3}>28h</p>
              <p className = {styles.descriptionText}>운동 시간</p>
            </div>
          </div>

          <div className = {styles.footerActions}>
            <h3 className = {styles.cardTitle}>운동한 날</h3>
            <div className = {styles.summaryBox2}>
              <div className = {styles.calendarGrid}>
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div key = {day} className = {styles.mutedText3}>
                    {day}
                  </div>
                ))}
              </div>
              <div className = {styles.stack2}>
                {calendarWeeks.map((week, weekIdx) => (
                  <div key = {weekIdx} className = {styles.calendarGrid2}>
                    {week.map((day, dayIdx) => (
                      <div key = {dayIdx} className = {styles.calendarDay(day, exerciseDates.includes(day ?? 0))}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p className = {styles.descriptionText3}>
                이번 달 {exerciseDates.length}일 운동했어요
              </p>
            </div>
          </div>
        </div>

        <div className = {styles.header3}>
          <h2 className = {styles.sectionTitle}>자주 함께한 사람</h2>
          <div className = {styles.cardGrid}>
            <div className = {styles.summaryBox3}>
              <p className = {styles.summaryText4}>파트너</p>
              <div className = {styles.stack3}>
                <p>박지영 5회 · 승률 80%</p>
                <p>최서연 3회 · 승률 67%</p>
                <p>오유진 2회 · 승률 50%</p>
              </div>
            </div>
            <div className = {styles.summaryBox3}>
              <p className = {styles.summaryText4}>상대</p>
              <div className = {styles.stack3}>
                <p>이준호 4회 · 상대 승률 50%</p>
                <p>정민재 3회 · 상대 승률 33%</p>
                <p>한지우 2회 · 상대 승률 50%</p>
              </div>
            </div>
          </div>
        </div>

        <div className = {styles.header3}>
          <h2 className = {styles.sectionTitle}>최근 경기</h2>

          <div className = {styles.stack4}>
            {(showAllRecords ? [...recentMatches, ...olderMatches] : recentMatches).map((match, idx) => (
              <div key = {idx} className = {styles.summaryBox4}
              >
                <div className = {styles.betweenRow}>
                  <div className = {styles.row5}>
                    <Badge variant = {match.result === 'win' ? 'default' : 'outline'} className = {styles.resultBadge(match.result === 'win')}>
                      {match.result === 'win' ? '승' : '패'}
                    </Badge>
                    <span className = {styles.descriptionText}>{match.date}</span>
                  </div>
                  <span className = {styles.labelText2}>{match.score}</span>
                </div>
                <div className = {styles.inlineText}>
                  <span className = {styles.labelText3}>파트너:</span> {match.partner}
                </div>
                <div className = {styles.descriptionText}>
                  <span>상대:</span> {match.opponents}
                </div>
              </div>
            ))}
          </div>

          <Button variant = "outline" className = {styles.fullWidthButton} onClick = {() => setShowAllRecords((show) => !show)}>
            {showAllRecords ? '최근 기록만 보기' : '전체 기록 보기'}
          </Button>
        </div>
      </div>
    </div>
  );
}

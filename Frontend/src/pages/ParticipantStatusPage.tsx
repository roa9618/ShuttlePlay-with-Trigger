import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Clock, UserCheck, Coffee, BarChart3 } from 'lucide-react';
import { styles } from './ParticipantStatusPage.styles';

type ViewStatus = 'waiting' | 'playing' | 'next' | 'resting';

function getMockStatus(): ViewStatus {
  return 'waiting';
}

export default function ParticipantStatusPage() {
  const { sessionId } = useParams();
  const [resting, setResting] = useState(false);
  // 실제로는 서버에서 받아올 데이터
  const myStatus = getMockStatus();
  const hasNextMatch = true;
  const nextMatch = {
    court: 2,
    partner: '박지영',
    opponents: ['이준호', '최서연'],
  };
  const todayStats = {
    games: 3,
    wins: 2,
    losses: 1,
  };

  return (
    <div className = {styles.page}>
      {/* Simple Header */}
      <div className = {styles.header}>
        <div className = {styles.emptyState}>
          <Logo size = "sm" className = {styles.logoWrapper} />
        </div>
      </div>

      <div className = {styles.stack}>
        {/* 1. 현재 상태 - 가장 크고 명확하게 */}
        {myStatus === 'waiting' && (
          <div className = {styles.panel}>
            <Clock className = {styles.clockIcon} />
            <p className = {styles.summaryText}>대기 중</p>
            <p className = {styles.descriptionText}>경기 배정을 기다리고 있습니다</p>
          </div>
        )}

        {myStatus === 'playing' && (
          <div className = {styles.contentBox}>
            <div className = {styles.row}>
              <span className = {styles.labelText}>2</span>
            </div>
            <p className = {styles.summaryText}>경기 중</p>
            <p className = {styles.descriptionText}>2번 코트</p>
          </div>
        )}

        {myStatus === 'resting' && (
          <div className = {styles.header2}>
            <Coffee className = {styles.coffeeIcon} />
            <p className = {styles.summaryText}>휴식 중</p>
            <p className = {styles.descriptionText}>잠시 쉬고 계십니다</p>
          </div>
        )}

        {/* 2. 다음 경기 (있는 경우 - 눈에 띄게) */}
        {hasNextMatch && (
          <div className = {styles.contentBox2}>
            <div className = {styles.row2}>
              <div className = {styles.row3}>
                <span className = {styles.labelText2}>{nextMatch.court}</span>
              </div>
              <div>
                <p className = {styles.paragraphText}>다음 경기</p>
                <p className = {styles.summaryText2}>{nextMatch.court}번 코트</p>
              </div>
            </div>

            <div className = {styles.stack2}>
              <div className = {styles.card}>
                <p className = {styles.descriptionText2}>파트너</p>
                <p className = {styles.summaryText3}>{nextMatch.partner}</p>
              </div>
              <div className = {styles.card}>
                <p className = {styles.descriptionText2}>상대</p>
                <p className = {styles.summaryText3}>{nextMatch.opponents.join(' · ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. 오늘 경기 기록 - 간단하게 */}
        <div>
          <p className = {styles.descriptionText3}>오늘 기록</p>
          <div className = {styles.statsGrid}>
            <div className = {styles.header3}>
              <p className = {styles.summaryText4}>{todayStats.games}</p>
              <p className = {styles.descriptionText4}>경기</p>
            </div>
            <div className = {styles.header3}>
              <p className = {styles.summaryText5}>{todayStats.wins}</p>
              <p className = {styles.descriptionText4}>승</p>
            </div>
            <div className = {styles.header3}>
              <p className = {styles.descriptionText5}>{todayStats.losses}</p>
              <p className = {styles.descriptionText4}>패</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 하단 고정 액션 버튼 - 한 손으로 쉽게 누를 수 있게 */}
      <div className = {styles.floatingNotice}>
        <div className = {styles.row4}>
          <Link to = {`/sessions/${sessionId}/attendance`} className = {styles.link}>
            <Button variant = "outline" className = {styles.fullWidthButton} size = "lg">
              <UserCheck className = {styles.userCheckIcon} />
              출석 체크
            </Button>
          </Link>
          <Link to = {`/sessions/${sessionId}/late`} className = {styles.link}>
            <Button variant = "outline" className = {styles.fullWidthButton} size = "lg">
              <Clock className = {styles.userCheckIcon} />
              지각 예정
            </Button>
          </Link>
        </div>
        <Button variant = "outline" className = {styles.restButton(resting)} size = "lg" onClick = {() => setResting((value) => !value)}
        >
          <Coffee className = {styles.userCheckIcon} />
          {resting ? '휴식 중' : '잠시 휴식'}
        </Button>
        <Link to = {`/sessions/${sessionId}/my-report`}>
          <Button className = {styles.fullWidthButton} size = "lg">
            <BarChart3 className = {styles.userCheckIcon} />
            오늘 기록 보기
          </Button>
        </Link>
      </div>
    </div>
  );
}

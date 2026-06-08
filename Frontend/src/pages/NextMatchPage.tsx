import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Bell, Users } from 'lucide-react';
import { styles } from './NextMatchPage.styles';

export default function NextMatchPage() {
  const { sessionId } = useParams();

  return (
    <div className = {styles.page}>
      <div className = {styles.emptyState}>
        <Logo size = "sm" className = {styles.logoWrapper} />
      </div>

      <div className = {styles.content}>
        <div className = {styles.stack}>
          <div className = {styles.row}>
            <Bell className = {styles.bellIcon} />
          </div>
          <div>
            <Badge className = {styles.badge}>
              다음 경기 예정
            </Badge>
            <h1 className = {styles.pageTitle}>2번 코트로 이동해주세요</h1>
            <p className = {styles.descriptionText}>
              잠시 후 경기가 시작됩니다
            </p>
          </div>
        </div>

        <div className = {styles.stack2}>
          <div className = {styles.centeredBlock}>
            <p className = {styles.descriptionText2}>코트 번호</p>
            <p className = {styles.summaryText}>2</p>
          </div>

          <div className = {styles.stack3}>
            <div>
              <div className = {styles.row2}>
                <Users className = {styles.usersIcon} />
                <h3 className = {styles.cardTitle}>파트너</h3>
              </div>
              <div className = {styles.summaryBox}>
                <p className = {styles.cardTitle}>김민수</p>
                <p className = {styles.descriptionText3}>B · 복식 MMR 1450</p>
              </div>
            </div>

            <div>
              <div className = {styles.row2}>
                <Users className = {styles.usersIcon2} />
                <h3 className = {styles.cardTitle}>상대팀</h3>
              </div>
              <div className = {styles.stack4}>
                <div className = {styles.summaryBox}>
                  <p className = {styles.cardTitle}>박지영</p>
                  <p className = {styles.descriptionText3}>A · 복식 MMR 1520</p>
                </div>
                <div className = {styles.summaryBox}>
                  <p className = {styles.cardTitle}>이준호</p>
                  <p className = {styles.descriptionText3}>B · 복식 MMR 1480</p>
                </div>
              </div>
            </div>
          </div>

          <div className = {styles.footerActions}>
            <div className = {styles.betweenRow}>
              <span className = {styles.mutedText}>경기 유형</span>
              <span className = {styles.cardTitle}>복식</span>
            </div>
            <div className = {styles.betweenRow}>
              <span className = {styles.mutedText}>플레이 스타일</span>
              <span className = {styles.cardTitle}>경쟁 모드</span>
            </div>
          </div>

          <Link to = {`/sessions/${sessionId}/status`}>
            <Button className = {styles.fullWidthButton} size = "lg">
              확인했어요
            </Button>
          </Link>
        </div>

        <div className = {styles.contentBox}>
          <p className = {styles.paragraphText}>
            준비운동을 하고 2번 코트 옆에서 대기해주세요
          </p>
        </div>
      </div>
    </div>
  );
}

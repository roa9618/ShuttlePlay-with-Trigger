import { Link, useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Check, Clock, X, Calendar, Users, MapPin } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './AttendancePage.styles';

export default function AttendancePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { message, showMessage } = useActionFeedback();

  const handleCheckIn = () => {
    navigate(`/sessions/${sessionId}/status`);
  };

  return (
    <div className = {styles.page}>
      <div className = {styles.header}>
        <Logo size = "md" className = {styles.logoWrapper} />
      </div>

      <div className = {styles.content}>
        <div className = {styles.stack}>
          <div className = {styles.row}>
            <Check className = {styles.checkIcon} />
          </div>
          <div>
            <h1 className = {styles.pageTitle}>도착하셨나요?</h1>
            <p className = {styles.descriptionText}>
              현재 상태를 선택하세요.
            </p>
          </div>
        </div>

        <div className = {styles.header2}>
          <div className = {styles.sectionHeader}>
            <div className = {styles.mediaRow}>
              <div className = {styles.row2}>
                <Users className = {styles.usersIcon} />
              </div>
              <div className = {styles.row3}>
                <h2 className = {styles.sectionTitle}>6월 3일 (화) 운동</h2>
                <Badge variant = "outline">강남 배드민턴 클럽</Badge>
              </div>
            </div>

            <div className = {styles.statsGrid}>
              <div className = {styles.row4}>
                <Calendar className = {styles.calendarIcon} />
                <div className = {styles.textContent}>
                  <p className = {styles.descriptionText2}>날짜</p>
                  <p className = {styles.summaryText}>6월 3일 (화)</p>
                </div>
              </div>
              <div className = {styles.row4}>
                <Clock className = {styles.calendarIcon} />
                <div className = {styles.textContent}>
                  <p className = {styles.descriptionText2}>시간</p>
                  <p className = {styles.summaryText}>19:00 - 22:00</p>
                </div>
              </div>
              <div className = {styles.row4}>
                <MapPin className = {styles.calendarIcon} />
                <div className = {styles.textContent}>
                  <p className = {styles.descriptionText2}>장소</p>
                  <p className = {styles.summaryText}>강남구민회관</p>
                </div>
              </div>
            </div>
          </div>

          <div className = {styles.stack2}>
            <Button onClick = {handleCheckIn} className = {styles.fullWidthButton} size = "lg"
            >
              <div className = {styles.row5}>
                <div className = {styles.row6}>
                  <Check className = {styles.checkIcon2} />
                </div>
                <div className = {styles.row7}>
                  <p className = {styles.summaryText2}>도착했어요</p>
                  <p className = {styles.paragraphText}>경기에 참여할 수 있어요</p>
                </div>
              </div>
            </Button>

            <Link to = {`/sessions/${sessionId}/late`} className = {styles.cardLink}>
              <Button variant = "outline" className = {styles.fullWidthButton2} size = "lg"
              >
                <div className = {styles.row5}>
                  <div className = {styles.row8}>
                    <Clock className = {styles.clockIcon} />
                  </div>
                  <div className = {styles.row7}>
                    <p className = {styles.summaryText3}>조금 늦어요</p>
                    <p className = {styles.descriptionText3}>도착 예정 시간 등록</p>
                  </div>
                </div>
              </Button>
            </Link>

            <Button variant = "outline" className = {styles.fullWidthButton3} size = "lg" onClick = {() => {
                showMessage('불참 처리되었습니다.');
                window.setTimeout(() => navigate('/'), 500);
              }}
            >
              <div className = {styles.row5}>
                <div className = {styles.row9}>
                  <X className = {styles.xIcon} />
                </div>
                <div className = {styles.row7}>
                  <p className = {styles.summaryText4}>오늘 못 가요</p>
                  <p className = {styles.descriptionText3}>오늘 참여할 수 없어요</p>
                </div>
              </div>
            </Button>
          </div>
        </div>

        <div className = {styles.contentBox}>
          <div className = {styles.mediaRow2}>
            <div className = {styles.row10}>
              <span className = {styles.labelText}>!</span>
            </div>
            <div className = {styles.stack3}>
              <p className = {styles.summaryText5}>현재 상태</p>
              <p className = {styles.paragraphText2}>
                참여 등록 완료 · 아직 체육관에 도착하지 않음
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className = {styles.header3}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

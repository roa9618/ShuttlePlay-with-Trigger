import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Badge } from '../components/ui/badge';
import { MapPin, Calendar, Clock, QrCode, UserCheck, UserPlus } from 'lucide-react';
import { styles } from './JoinSessionPage.styles';

export default function JoinSessionPage() {
  const { sessionId } = useParams();

  return (
    <div className = {styles.page}>
      <div className = {styles.header}>
        <Logo size = "md" className = {styles.logoWrapper} />
      </div>

      <div className = {styles.row}>
        <div className = {styles.content}>
          <div className = {styles.stack}>
            <div className = {styles.row2}>
              <QrCode className = {styles.qrCodeIcon} />
            </div>
            <div>
              <h1 className = {styles.pageTitle}>오늘 운동 참여</h1>
              <p className = {styles.descriptionText}>강남 배드민턴 클럽</p>
            </div>
          </div>

          <div className = {styles.header2}>
            <div className = {styles.grid}>
              <div className = {styles.row3}>
                <Calendar className = {styles.calendarIcon} />
                <div className = {styles.textContent}>
                  <p className = {styles.descriptionText2}>날짜</p>
                  <p className = {styles.summaryText}>6월 3일 (화)</p>
                </div>
              </div>
              <div className = {styles.row3}>
                <Clock className = {styles.calendarIcon} />
                <div className = {styles.textContent}>
                  <p className = {styles.descriptionText2}>시간</p>
                  <p className = {styles.summaryText}>19:00 - 22:00</p>
                </div>
              </div>
              <div className = {styles.row3}>
                <MapPin className = {styles.calendarIcon} />
                <div className = {styles.textContent}>
                  <p className = {styles.descriptionText2}>장소</p>
                  <p className = {styles.summaryText}>강남구민회관</p>
                </div>
              </div>
            </div>

            <div className = {styles.stack2}>
              <Link to = {`/sessions/${sessionId}/attendance`} className = {styles.cardLink}>
                <div className = {styles.contentBox}>
                  <div className = {styles.row4}>
                    <div className = {styles.row5}>
                      <UserCheck className = {styles.userCheckIcon} />
                    </div>
                    <div className = {styles.row6}>
                      <p className = {styles.summaryText2}>참여하기</p>
                      <p className = {styles.paragraphText}>회원이거나 이미 등록한 사람</p>
                    </div>
                    <Badge className = {styles.badge}>추천</Badge>
                  </div>
                </div>
              </Link>

              <Link to = {`/sessions/${sessionId}/guest-join`} className = {styles.cardLink}>
                <div className = {styles.header3}>
                  <div className = {styles.row4}>
                    <div className = {styles.row7}>
                      <UserPlus className = {styles.userPlusIcon} />
                    </div>
                    <div className = {styles.row6}>
                      <p className = {styles.summaryText3}>처음 왔어요</p>
                      <p className = {styles.descriptionText3}>이름과 급수를 먼저 입력</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className = {styles.centeredBlock}>
            <p className = {styles.descriptionText4}>
              이미 참여하셨나요?{' '}
              <Link to = {`/sessions/${sessionId}/status`} className = {styles.primaryLink}>
                출석 체크하기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { MapPin, Users, Calendar, Share2, Settings, ArrowLeft, QrCode } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './GroupDetailPage.styles';

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { message, showMessage } = useActionFeedback();

  const copyInviteLink = async () => {
    const link = `https://shuttleplay.app/groups/${groupId}/invite`;
    await navigator.clipboard?.writeText(link);
    showMessage('초대 링크를 복사했습니다.');
  };

  const recentSessions = [
    { date: '2026.06.01 (일)', time: '14:00-17:00', participants: 16 },
    { date: '2026.05.29 (목)', time: '19:00-22:00', participants: 12 },
    { date: '2026.05.25 (일)', time: '14:00-17:00', participants: 18 },
  ];

  const members = [
    { name: '김민수', level: 'B', sessions: 24 },
    { name: '박지영', level: 'A', sessions: 18 },
    { name: '이준호', level: 'D', sessions: 12 },
    { name: '최서연', level: 'B', sessions: 21 },
  ];

  return (
    <div className = {styles.page}>
      <div className = {styles.content}>
        <Link to = "/groups" className = {styles.backLink}>
          <ArrowLeft className = {styles.arrowLeftIcon} />
          모임 목록
        </Link>

        {/* Header Card */}
        <div className = {styles.contentBox}>
          <div className = {styles.betweenRow}>
            <div className = {styles.mediaRow}>
              <div className = {styles.row}>
                <Users className = {styles.usersIcon} />
              </div>
              <div className = {styles.stack}>
                <div>
                  <h1 className = {styles.pageTitle}>강남 배드민턴 클럽</h1>
                  <div className = {styles.stack2}>
                    <div className = {styles.row2}>
                      <MapPin className = {styles.arrowLeftIcon} />
                      <span>강남구민회관</span>
                    </div>
                    <div className = {styles.row2}>
                      <Users className = {styles.arrowLeftIcon} />
                      <span>멤버 24명</span>
                    </div>
                    <div className = {styles.row2}>
                      <Calendar className = {styles.arrowLeftIcon} />
                      <span>최근 운동 2일 전</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Link to = {`/groups/${groupId}/settings`}>
              <Button variant = "outline" size = "icon" className = {styles.roundButton}
              >
                <Settings className = {styles.arrowLeftIcon} />
              </Button>
            </Link>
          </div>

          <div className = {styles.cardGrid}>
            <Link to = {`/groups/${groupId}/create-session`} className = {styles.cardLink}>
              <Button className = {styles.fullWidthButton} size = "lg">
                <Calendar className = {styles.calendarIcon} />
                오늘 세션 만들기
              </Button>
            </Link>
            <Button variant = "outline" size = "lg" className = {styles.roundButton2} onClick = {copyInviteLink}
            >
              <Share2 className = {styles.share2Icon} />
              멤버 초대하기
            </Button>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className = {styles.header}>
          <div className = {styles.betweenRow2}>
            <h2 className = {styles.sectionTitle}>최근 운동 기록</h2>
            <Button variant = "ghost" size = "sm" className = {styles.actionButton} onClick = {() => navigate('/sessions/demo/report')}
            >
              전체 보기
            </Button>
          </div>
          <div className = {styles.grid}>
            {recentSessions.map((session, idx) => (
              <div key = {idx} onClick = {() => navigate('/sessions/demo/report')} className = {styles.contentBox2}
              >
                <div className = {styles.betweenRow2}>
                  <div className = {styles.row3}>
                    <div className = {styles.row4}>
                      <Calendar className = {styles.calendarIcon2} />
                    </div>
                    <div>
                      <p className = {styles.summaryText}>{session.date}</p>
                      <p className = {styles.descriptionText}>{session.time}</p>
                    </div>
                  </div>
                  <div className = {styles.row5}>
                    <div className = {styles.rightAlignedBlock}>
                      <p className = {styles.descriptionText}>참가 인원</p>
                      <p className = {styles.summaryText2}>{session.participants}명</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members */}
        <div className = {styles.header}>
          <div className = {styles.betweenRow2}>
            <h2 className = {styles.sectionTitle}>멤버 목록</h2>
            <Link to = {`/groups/${groupId}/members`}>
              <Button variant = "ghost" size = "sm" className = {styles.actionButton}
              >
                전체 보기
              </Button>
            </Link>
          </div>
          <div className = {styles.cardGrid2}>
            {members.map((member, idx) => (
              <div key = {idx} className = {styles.contentBox3}
              >
                <div className = {styles.row3}>
                  <div className = {styles.row6}>
                    <span className = {styles.summaryText2}>
                      {member.name[0]}
                    </span>
                  </div>
                  <div className = {styles.row7}>
                    <p className = {styles.summaryText3}>{member.name}</p>
                    <p className = {styles.descriptionText}>{member.level}</p>
                  </div>
                  <div className = {styles.rightAlignedBlock}>
                    <p className = {styles.descriptionText}>참여</p>
                    <p className = {styles.summaryText4}>{member.sessions}회</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite */}
        <div className = {styles.contentBox4}>
          <div className = {styles.mediaRow}>
            <div className = {styles.row8}>
              <QrCode className = {styles.qrCodeIcon} />
            </div>
            <div className = {styles.row7}>
              <h3 className = {styles.cardTitle}>새로운 멤버 초대하기</h3>
              <p className = {styles.descriptionText2}>
                QR 코드나 초대 링크를 공유하여 친구들을 모임에 초대하세요
              </p>
              <div className = {styles.row9}>
                <Button className = {styles.roundButton3} onClick = {() => showMessage('초대 QR 코드를 준비했습니다.')}
                >
                  <QrCode className = {styles.arrowLeftIcon} />
                  QR 코드 생성
                </Button>
                <Button variant = "outline" className = {styles.roundButton3} onClick = {copyInviteLink}
                >
                  <Share2 className = {styles.arrowLeftIcon} />
                  링크 복사
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {message && (
        <div className = {styles.floatingNotice}>
          {message}
        </div>
      )}
    </div>
  );
}
